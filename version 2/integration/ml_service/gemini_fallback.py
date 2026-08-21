"""
Gemini-backed synthesis of a personalized ingredient insight, used when the trained
classifier (main.py) doesn't recognize an ingredient.

Calls the Gemini REST API directly via `requests` (no google-generativeai SDK, by
deliberate choice, to keep the dependency footprint minimal -- `requests` is already
a dependency used elsewhere, e.g. scraper.py).

Core design constraint: the result must never mislead the user about how well-grounded
it is. If we have verified facts (from scraper.fetch_ingredient_facts), Gemini is told
to use ONLY those facts. If we don't, Gemini is told it may use general knowledge but
MUST caveat that in the "reason" field. Either way, the `source` field in the returned
dict is set/validated in Python -- never trusted blindly from Gemini's own output --
since it's the mechanism the frontend uses to signal "verified" vs "ai_estimate" to the
user.
"""

import json

import requests

GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
)
REQUEST_TIMEOUT = 15  # seconds; LLM calls are slower than the scraper's simple GETs

_EXPECTED_COMPATIBILITY_KEYS = ("oily", "dry", "combination", "sensitive", "normal")


def _fallback_result(reason: str, source: str = "ai_estimate") -> dict:
    """A safe, non-misleading default when we can't get (or trust) a real Gemini response."""
    return {
        "effectiveness": 50,
        "reason": reason,
        "compatibility": None,
        "source": source,
    }


def _build_prompt(inci_name: str, facts: dict | None, user_context: dict) -> str:
    if facts is not None:
        grounding = (
            "Using ONLY the following verified facts about this cosmetic ingredient, "
            "assess how well it serves the user's specific skincare goals. Do not add "
            "information from your own general knowledge beyond what's provided.\n\n"
            f"Verified facts: {json.dumps(facts)}"
        )
    else:
        grounding = (
            "No verified source was found for this ingredient. You may use your general "
            "knowledge, but you MUST clearly caveat in the 'reason' field that this is an "
            "unverified AI estimate, not a confirmed fact."
        )

    context_block = (
        "User context (use this to personalize the assessment -- weight the effectiveness "
        "score toward the user's actual stated goals, and flag if the ingredient overlaps "
        f"with a listed allergy): {json.dumps(user_context)}"
    )

    schema_block = (
        "Respond with STRICT JSON only, matching exactly this shape (no markdown, no extra "
        "commentary, no keys other than these):\n"
        "{\n"
        '  "effectiveness": <int 0-100>,\n'
        '  "reason": "<string, 1-2 sentences, plain language>",\n'
        '  "compatibility": {"oily": <int>, "dry": <int>, "combination": <int>, '
        '"sensitive": <int>, "normal": <int>},\n'
        '  "source": "verified" | "ai_estimate"\n'
        "}"
    )

    return (
        f"You are assessing the cosmetic ingredient '{inci_name}' for a skincare-analysis app.\n\n"
        f"{grounding}\n\n"
        f"{context_block}\n\n"
        f"{schema_block}"
    )


def synthesize_ingredient_insight(
    inci_name: str,
    facts: dict | None,
    user_context: dict,
    api_key: str,
) -> dict:
    """
    Call Gemini to produce a personalized, grounded assessment of `inci_name`.

    Returns a dict shaped like:
        {
            "effectiveness": int (0-100),
            "reason": str,
            "compatibility": {"oily": int, "dry": int, "combination": int,
                               "sensitive": int, "normal": int} | None,
            "source": "verified" | "ai_estimate",
        }

    Never raises: any failure (missing key, network error, timeout, malformed response,
    unparsable JSON) results in a safe fallback dict with source="ai_estimate" and a
    neutral effectiveness score, rather than an exception propagating to the caller.
    """
    expected_source = "verified" if facts is not None else "ai_estimate"

    if not api_key:
        return _fallback_result("No Gemini API key was provided, so no AI assessment could be generated.")

    prompt = _build_prompt(inci_name, facts, user_context)

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"},
    }

    try:
        resp = requests.post(
            f"{GEMINI_ENDPOINT}?key={api_key}",
            json=body,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as e:
        return _fallback_result(f"Could not reach the AI service to assess this ingredient ({e.__class__.__name__}).", expected_source)

    if resp.status_code != 200:
        return _fallback_result(
            f"The AI service returned an error (HTTP {resp.status_code}) while assessing this ingredient.",
            expected_source,
        )

    try:
        payload = resp.json()
        text = payload["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
        return _fallback_result(
            "The AI response for this ingredient couldn't be parsed, so no reliable assessment is available.",
            expected_source,
        )

    # Validate / coerce fields defensively -- never trust the model's output shape blindly.
    try:
        effectiveness = int(parsed.get("effectiveness", 50))
    except (TypeError, ValueError):
        effectiveness = 50
    effectiveness = max(0, min(100, effectiveness))

    reason = parsed.get("reason")
    if not isinstance(reason, str) or not reason.strip():
        reason = "The AI did not provide a specific reason for this assessment."

    compatibility = parsed.get("compatibility")
    if isinstance(compatibility, dict):
        clean_compat = {}
        for key in _EXPECTED_COMPATIBILITY_KEYS:
            value = compatibility.get(key)
            try:
                clean_compat[key] = max(0, min(100, int(value)))
            except (TypeError, ValueError):
                clean_compat[key] = None
        compatibility = clean_compat
    else:
        compatibility = None

    # Core non-misleading guarantee: `source` is set/overridden here in code based on
    # whether verified facts were actually available -- Gemini's own claim about this
    # field (if any) is never trusted as-is.
    source = expected_source

    # If facts were missing, make sure the reason actually carries the required caveat,
    # even if Gemini forgot to include one.
    if facts is None and "unverified" not in reason.lower() and "estimate" not in reason.lower():
        reason = f"Unverified AI estimate (no confirmed source found): {reason}"

    return {
        "effectiveness": effectiveness,
        "reason": reason,
        "compatibility": compatibility,
        "source": source,
    }
