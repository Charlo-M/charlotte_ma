import json
from pathlib import Path
from functools import lru_cache
from typing import Any, Dict

PROFILE_PATH = Path(__file__).parent / "profile.json"


@lru_cache(maxsize=1)
def get_profile() -> Dict[str, Any]:
    """
    Loads profile.json once and caches it.
    Call get_profile() anywhere you need the canonical profile.
    """
    if not PROFILE_PATH.exists():
        raise FileNotFoundError(f"Missing profile.json at: {PROFILE_PATH}")

    return json.loads(PROFILE_PATH.read_text(encoding="utf-8"))