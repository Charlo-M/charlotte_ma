from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout


def is_valid_url(url: str) -> bool:
    try:
        u = urlparse(url)
        return u.scheme in ("http", "https") and bool(u.netloc)
    except Exception:
        return False


def extract_job_text_with_playwright(url: str) -> dict:
    """
    Returns: { jobText, title?, site? }
    Raises RuntimeError on failure.
    """
    if not is_valid_url(url):
        raise RuntimeError("Invalid URL.")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 720},
        )
        page = context.new_page()

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=45_000)
            page.wait_for_timeout(1200)
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except PWTimeout:
                pass

            final_url = page.url
            title = (page.title() or "").strip()

            # Remove noisy elements, then use innerText (more like what user sees)
            text = page.evaluate(
                """
() => {
  const removeAll = (sel) => document.querySelectorAll(sel).forEach(e => e.remove());
  removeAll("script");
  removeAll("style");
  removeAll("noscript");
  removeAll("svg");
  removeAll("nav");
  removeAll("footer");
  removeAll("header");
  removeAll("aside");

  const t = document.body ? (document.body.innerText || "") : "";
  return t;
}
"""
            )

        finally:
            try:
                context.close()
            except Exception:
                pass
            try:
                browser.close()
            except Exception:
                pass

    text = (text or "").replace("\r", "").strip()
    # Trim excessive newlines
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")

    if len(text) < 800:
        raise RuntimeError(
            "Failed to extract enough text from this page (site may block scraping). "
            "Please paste the full job description text instead."
        )

    job_text = text[:15000]

    site = ""
    try:
        site = urlparse(final_url).netloc
    except Exception:
        pass

    return {"jobText": job_text, "title": title or None, "site": site or None}