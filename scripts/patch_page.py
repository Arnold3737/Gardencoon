#!/usr/bin/env python3
"""Page patcher — see patch-pages.sh for changelog."""
import re, sys, pathlib

OLD_DOMAIN = "https://gardenstatecoon.com"
NEW_DOMAIN = "https://gardenstatecoon.com"

CF_BEACON_RE = re.compile(
    r'\n?<!-- Cloudflare Web Analytics -->\s*\n\s*<script[^>]*cloudflareinsights[^>]*>\s*</script>\s*',
    re.IGNORECASE,
)
WEB_VITALS_RE = re.compile(
    r'\s*<script type="module" defer>\s*\n\s*import \{onLCP[^}]+\} from \'https://unpkg\.com/web-vitals[^\']+\';\s*\n[^<]*?onTTFB\(report\);\s*\n\s*</script>',
    re.IGNORECASE,
)

def patch(path: pathlib.Path):
    text = path.read_text(encoding="utf-8")
    orig = text

    # 1. Strip broken Cloudflare beacon
    text = CF_BEACON_RE.sub("", text)
    # 2. Strip web-vitals unpkg import (dev-only)
    text = WEB_VITALS_RE.sub("", text)
    # 3. Rewrite domain on canonical/OG/JSON-LD/og:image to the live host
    text = text.replace(OLD_DOMAIN, NEW_DOMAIN)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(f"patched {path.name}")

if __name__ == "__main__":
    for arg in sys.argv[1:]:
        patch(pathlib.Path(arg))
