import os
from google import genai

def _client() -> genai.Client:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("Missing GEMINI_API_KEY")
    return genai.Client(api_key=key)

def _model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()

def generate_text(*, system: str, user: str, response_mime_type: str | None = None) -> str:
    client = _client()
    model = _model()

    # Works reliably across SDK versions: embed system + user with trust boundary
    prompt = f"""SYSTEM:
{system}

USER (untrusted):
\"\"\"{user}\"\"\"
""".strip()

    config = None
    if response_mime_type:
        config = {"response_mime_type": response_mime_type}

    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )
    return (getattr(resp, "text", None) or "").strip()