from typing import Any, Dict, List


def _join_bullets(items: List[str], max_items: int = 6) -> str:
    items = [x.strip() for x in items if x and x.strip()]
    items = items[:max_items]
    return "\n".join([f"- {x}" for x in items])


def _flatten_skills(profile: Dict[str, Any], max_total: int = 80) -> str:
    cats = profile.get("skills", []) or []
    flat: List[str] = []
    for c in cats:
        for s in c.get("items", []) or []:
            if s not in flat:
                flat.append(s)
    return ", ".join(flat[:max_total])


def build_profile_context(profile: Dict[str, Any], *, max_exp: int = 5, max_projects: int = 4) -> str:
    """
    Produces a compact, LLM-friendly context block.
    Keep it short to reduce tokens.
    """
    pi = profile.get("personalInfo", {}) or {}
    name = pi.get("name", "")
    title = pi.get("title", "")
    location = pi.get("location", "")
    email = pi.get("email", "")
    linkedin = pi.get("linkedin", "")
    about = (pi.get("about", "") or "").strip()

    skills = _flatten_skills(profile)

    exp_all = profile.get("experience", []) or []
    work = [e for e in exp_all if e.get("type") == "work"]
    edu = [e for e in exp_all if e.get("type") == "education"]

    exp_lines: List[str] = []
    for e in (work[:max_exp] + edu[:2]):
        role = e.get("title", "")
        company = e.get("company", "")
        period = e.get("period", "")
        loc = e.get("location", "")
        highlights = _join_bullets(e.get("highlights", []) or [], max_items=5)
        used = e.get("skillsUsed", [])
        used_str = ", ".join(used[:12]) if used else "N/A"
        exp_lines.append(
            f"Role: {role} | Org: {company} | Period: {period} | Location: {loc}\n"
            f"Highlights:\n{highlights}\n"
            f"Skills Used: {used_str}"
        )

    # Projects
    proj_all = profile.get("projects", []) or []
    proj_lines: List[str] = []
    for p in proj_all[:max_projects]:
        pt = p.get("title", "")
        desc = p.get("description", "")
        stack = ", ".join((p.get("techStack", []) or [])[:12])
        link = p.get("link", "")
        proj_lines.append(
            f"Project: {pt}\nDescription: {desc}\nTech: {stack}\nLink: {link}"
        )

    policies = profile.get("policies", {}) or {}
    topic = policies.get("topicRestriction", "")
    refusal = policies.get("refusalStyle", "")
    tone = policies.get("tone", "")
    cta = policies.get("callToAction", "")

    return f"""
[Charlotte Profile]
Name: {name}
Title: {title}
Location: {location}
Email: {email}
LinkedIn: {linkedin}
Summary: {about}

[Skills]
{skills}

[Experience]
{"\n\n".join(exp_lines)}

[Projects]
{"\n\n".join(proj_lines)}

[Policies]
Topic Restriction: {topic}
Refusal Style: {refusal}
Tone: {tone}
Call To Action: {cta}
""".strip()