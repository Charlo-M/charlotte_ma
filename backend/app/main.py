import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .schemas import ChatRequest, ChatResponse, JobMatchRequest, MatchAnalysis
from .security import sanitize_user_text
from .gemini import generate_text
from .prompt import system_prompt_qa, system_prompt_job_match
from .profile_store import get_profile
from .context_builder import build_profile_context
from .extractor import extract_job_text_with_playwright

load_dotenv()

app = FastAPI(title="Charlotte AI Backend", version="1.0.0")

ORIGIN = os.getenv("ORIGIN", "*").strip()
MAX_USER_CHARS = int(os.getenv("MAX_USER_CHARS", "4000"))
MAX_JD_CHARS = int(os.getenv("MAX_JD_CHARS", "12000"))
MAX_REPEAT_RATIO = float(os.getenv("MAX_REPEAT_RATIO", "0.35"))

# Only block truly dangerous injection patterns; allow common JD language like "you must".
BLOCK_REASONS = {
    "ignore-previous-instructions",
    "override-system-developer",
    "forget-previous-context",
    "role-hijack-you-are-now",
    "dan-style-jailbreak",
    "system/developer-exfiltration",
    "prompt-exfiltration",
    "prompt-exfiltration-print",
    "secrets-exfiltration-attempt",
    "prompt-delimiter-injection",
    "tool-injection-attempt",
}


def _quota_status_from_error(msg: str) -> int:
    m = (msg or "").lower()
    if "429" in m or "resource_exhausted" in m or "quota" in m or "rate limit" in m:
        return 429
    return 500


def _extract_json_object(text: str) -> dict:
    """
    Extract first JSON object from a model response.
    Works even if model accidentally wraps with extra text.
    """
    if not text:
        raise ValueError("Empty model output.")

    first = text.find("{")
    last = text.rfind("}")
    if first == -1 or last == -1 or last <= first:
        raise ValueError("No JSON object found in model output.")
    return json.loads(text[first:last + 1])


def _get_profile_context() -> str:
    # profile_store.get_profile() is cached; context building is cheap
    profile = get_profile()
    return build_profile_context(profile)


# Precompute once at startup (fast + stable).
# If you want live-reload after editing profile.json, remove this and call _get_profile_context() each request.
PROFILE_CTX = _get_profile_context()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ORIGIN == "*" else [ORIGIN],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/")
def root():
    return {"ok": True, "endpoints": ["GET /health", "POST /api/chat", "POST /api/job-match"]}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    filtered = sanitize_user_text(req.message, MAX_USER_CHARS, MAX_REPEAT_RATIO)

    # Block only high-risk injection attempts
    if filtered.flagged and any(r in BLOCK_REASONS for r in filtered.reasons):
        raise HTTPException(
            status_code=400,
            detail={"error": "Prompt injection detected.", "reasons": filtered.reasons},
        )

    # For low-risk flags (e.g., "you must"), proceed using the sanitized wrapper
    full_user = f"""{PROFILE_CTX}

[User Question]
{filtered.cleaned}
""".strip()

    try:
        text = generate_text(system=system_prompt_qa(), user=full_user)
        return ChatResponse(text=text)
    except Exception as e:
        msg = str(e) or "Gemini request failed."
        raise HTTPException(status_code=_quota_status_from_error(msg), detail={"error": msg})


@app.post("/api/job-match", response_model=MatchAnalysis)
def job_match(req: JobMatchRequest):
    # 1) Determine input source: URL or raw JD text
    meta = ""
    if getattr(req, "url", None) and req.url and req.url.strip():
        try:
            extracted = extract_job_text_with_playwright(req.url.strip())
            jd_text = extracted.get("jobText", "") or ""
            meta = " • ".join([x for x in [extracted.get("site"), extracted.get("title")] if x])
        except Exception as e:
            # Extraction failed -> return 422 so frontend can tell user to paste JD text
            raise HTTPException(status_code=422, detail={"error": str(e)})
    elif req.jobDescription and req.jobDescription.strip():
        jd_text = req.jobDescription.strip()
    else:
        raise HTTPException(status_code=400, detail={"error": "Provide either url or jobDescription."})

    # 2) Sanitize JD input (tiered blocking)
    filtered = sanitize_user_text(jd_text, MAX_JD_CHARS, MAX_REPEAT_RATIO)

    # Block only high-risk injection patterns; allow normal JD language like "you must apply..."
    if filtered.flagged and any(r in BLOCK_REASONS for r in filtered.reasons):
        raise HTTPException(
            status_code=400,
            detail={"error": "Prompt injection detected in JD.", "reasons": filtered.reasons},
        )

    jd_clean = filtered.cleaned

    # If the JD was flagged for low-risk reasons, append a note to meta (optional but useful for debugging/UI)
    if filtered.flagged and filtered.reasons:
        meta = (meta + " • " if meta else "") + f"sanitized:{','.join(filtered.reasons)}"

    # 3) Compose prompt with profile context
    user_prompt = f"""{PROFILE_CTX}

[Job Description]{f" (source: {meta})" if meta else ""}
\"\"\"{jd_clean}\"\"\"

Return JSON ONLY that matches the required schema.
""".strip()

    # 4) Call Gemini and validate strict JSON
    try:
        raw = generate_text(
            system=system_prompt_job_match(),
            user=user_prompt,
            response_mime_type="application/json",
        )
        obj = _extract_json_object(raw)
        return MatchAnalysis.model_validate(obj)

    except Exception as e1:
        # One "repair" retry
        try:
            repair_prompt = f"""{PROFILE_CTX}

Your previous output was invalid JSON or did not match the schema.
Fix it and output ONLY valid JSON matching the schema.

[Job Description]
\"\"\"{jd_clean}\"\"\"
""".strip()

            raw2 = generate_text(
                system=system_prompt_job_match(),
                user=repair_prompt,
                response_mime_type="application/json",
            )
            obj2 = _extract_json_object(raw2)
            return MatchAnalysis.model_validate(obj2)

        except Exception as e2:
            msg = str(e2) or str(e1) or "Job match JSON validation failed."
            raise HTTPException(status_code=_quota_status_from_error(msg), detail={"error": msg})