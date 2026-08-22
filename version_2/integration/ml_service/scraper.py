"""
Lightweight, responsible scraper for INCIDecoder (https://incidecoder.com).

Used as a fallback source of supplementary ingredient facts for INCI names the
trained classifier (main.py / train.py) doesn't recognize.

--------------------------------------------------------------------------
IMPORTANT / DISCLOSURE
--------------------------------------------------------------------------
Scraping incidecoder.com is not covered by an API agreement and may violate
that site's Terms of Service. This is a deliberate, accepted risk for this
personal/educational project (CUTiS-IQ) -- the project owner has chosen to
proceed on the condition that scraping is done responsibly (identifying
User-Agent, rate limiting, short timeouts, defensive parsing/failure
handling) and that the risk is disclosed to end users in the app UI. See the
project README for more context.

As of the time this module was written, requests to https://incidecoder.com
are served with an HTTP 301 redirect to https://inkeedecoder.com (the same
backend, same cookies/CSP, same page markup -- this looks like a server-side
domain migration/rebrand rather than a hijack, but it was NOT part of the
original spec for this scraper and has not been independently confirmed as
the intended long-term home of the site). `requests` follows redirects by
default, so this module will transparently follow it and parse whatever page
comes back. Flagged here, and in the ml_service README, for the project
owner to confirm before relying on this in production. If the redirect
target ever changes to something clearly unrelated to INCIDecoder, this
module's defensive parsing should cause it to simply return None rather than
return garbage data -- but that is not a substitute for periodically
re-checking this by hand.

robots.txt for incidecoder.com (fetched directly) only disallows
`/auth/` and `/products/recommend/`. The `/search` and `/ingredients/*`
paths used below are not disallowed.
--------------------------------------------------------------------------
"""

import time
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://incidecoder.com"
SEARCH_URL = BASE_URL + "/search?query={query}"
REQUEST_TIMEOUT = 5  # seconds
REQUEST_DELAY_SECONDS = 1  # be polite; avoid hammering the site

# Honest, identifying User-Agent. Deliberately NOT spoofing a real browser.
HEADERS = {
    "User-Agent": (
        "CUTiS-IQ-ingredient-lookup/1.0 "
        "(personal/educational project; no contact email available; "
        "identifies as a research/personal tool, not a browser)"
    ),
}


def _get(url: str) -> requests.Response:
    """Single point of control for outgoing requests: rate-limited, timed out."""
    time.sleep(REQUEST_DELAY_SECONDS)
    return requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)


def _find_detail_url(inci_name: str) -> str | None:
    """Search INCIDecoder for `inci_name` and return the first result's detail URL, or None."""
    search_url = SEARCH_URL.format(query=quote(inci_name))
    resp = _get(search_url)
    if resp.status_code != 200:
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # Observed structure (verified against a live page as of writing): result rows are
    # anchor tags like <a href="/ingredients/<slug>" class="...simpletextlistitem...">Name</a>
    link = soup.select_one('a[href^="/ingredients/"].simpletextlistitem')
    if link is None:
        # Fall back to any link into /ingredients/ on the page, in case the class name changes.
        link = soup.select_one('a[href^="/ingredients/"]')
    if link is None:
        return None

    href = link.get("href")
    if not href:
        return None

    return BASE_URL + href if href.startswith("/") else href


def _extract_itemprop_value(soup: BeautifulSoup, label_text: str) -> str | None:
    """
    INCIDecoder detail pages show several "label: value" rows, e.g.:
        <div class="itemprop">
            <span class="label ...">Irritancy: </span>
            <span class="value"> 0</span>
        </div>
    Find the row whose label contains `label_text` (case-insensitive) and return the
    value text, stripped. Defensive against markup/class changes since we search by
    visible label text rather than relying solely on CSS classes.
    """
    for label_span in soup.find_all("span"):
        text = label_span.get_text(strip=True)
        if text and label_text.lower() in text.lower():
            value_span = label_span.find_next_sibling("span")
            if value_span is not None:
                return value_span.get_text(strip=True)
    return None


def _extract_functions(soup: BeautifulSoup) -> list[str]:
    """Extract the 'What-it-does' function/category tags, if present."""
    functions: list[str] = []
    for label_span in soup.find_all("span"):
        text = label_span.get_text(strip=True)
        if text and "what-it-does" in text.lower():
            value_span = label_span.find_next_sibling("span")
            if value_span is not None:
                functions = [a.get_text(strip=True) for a in value_span.find_all("a") if a.get_text(strip=True)]
            break
    return functions


def _extract_description(soup: BeautifulSoup) -> str | None:
    """Extract a plain-language description from the details 'showmore' section, if present."""
    details_section = soup.select_one("#showmore-section-details .content")
    if details_section is None:
        # Fall back to any showmore-section content block.
        details_section = soup.select_one(".showmore-section .content")
    if details_section is None:
        return None

    paragraphs = details_section.find_all("p")
    if paragraphs:
        text = " ".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
    else:
        text = details_section.get_text(strip=True)

    return text if text else None


def _extract_our_take(soup: BeautifulSoup) -> str | None:
    """Extract INCIDecoder's own qualitative 'our take' rating (e.g. 'superstar'), if present."""
    tag = soup.select_one(".ourtake")
    if tag is None:
        return None
    text = tag.get_text(strip=True)
    return text if text else None


def fetch_ingredient_facts(inci_name: str) -> dict | None:
    """
    Look up `inci_name` on INCIDecoder and return a dict of structured facts, or None
    if the ingredient can't be found or anything goes wrong.

    On success, the dict contains whatever of the following could be extracted
    (missing fields are omitted or set to None, never fabricated):
        {
            "inci_name": str,          # the name as looked up
            "page_title": str | None,  # the detail page's <title> text
            "functions": [str],        # "what it does" tags, e.g. ["moisturizer/humectant"]
            "irritancy": str | None,   # raw text of the irritancy rating (e.g. "0")
            "comedogenicity": str | None,  # raw text of the comedogenicity rating
            "our_take": str | None,    # INCIDecoder's own qualitative rating, e.g. "superstar"
            "description": str | None, # plain-language description text
            "source_url": str,         # the detail page URL this was scraped from
        }

    This function never raises -- any exception (network error, timeout, unexpected
    page structure, etc.) is caught and results in a None return.
    """
    if not inci_name or not inci_name.strip():
        return None

    name = inci_name.strip()

    try:
        detail_url = _find_detail_url(name)
        if detail_url is None:
            return None

        resp = _get(detail_url)
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, "html.parser")

        title_tag = soup.find("title")
        page_title = title_tag.get_text(strip=True) if title_tag is not None else None

        facts = {
            "inci_name": name,
            "page_title": page_title,
            "functions": _extract_functions(soup),
            "irritancy": _extract_itemprop_value(soup, "irritancy"),
            "comedogenicity": _extract_itemprop_value(soup, "comedogenicity"),
            "our_take": _extract_our_take(soup),
            "description": _extract_description(soup),
            "source_url": detail_url,
        }

        # If we got essentially nothing useful, treat it as a failed lookup rather than
        # returning a near-empty dict that downstream code might mistake for "verified".
        if not any([facts["functions"], facts["irritancy"], facts["comedogenicity"], facts["description"]]):
            return None

        return facts

    except Exception:
        # Never let a scraping failure (network error, timeout, unexpected HTML, etc.)
        # propagate -- the caller treats None as "no verified facts available".
        return None
