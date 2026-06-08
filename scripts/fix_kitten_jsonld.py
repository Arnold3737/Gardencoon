#!/usr/bin/env python3
"""
Replace the @type="Product" block on kitten-detail-*.html pages with a more
appropriate schema combination:

  - @type: ["Pet", "Product"]  (multi-type so Google's product crawlers still see it,
    but semantic web sees it as an Animal/Pet — recommended pattern when Google
    has policies against live-animal Product pages but you still want rich-card
    eligibility for the Offer.)
  - additionalType: schema.org/Pet
  - keep Offer with priceCurrency / price / availability / seller

Idempotent: detects already-patched pages by presence of "additionalType":"https://schema.org/Pet".
"""

from __future__ import annotations
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Match the first Product object inside @graph
# (very narrow — relies on the existing "@type": "Product" key)
PRODUCT_BLOCK_RE = re.compile(
    r'(\{\s*"@type":\s*)"Product"(.*?"availability":\s*"https://schema\.org/[A-Za-z]+"\s*\})',
    re.DOTALL,
)


def patch_jsonld(html: str) -> tuple[str, bool]:
    if '"additionalType": "https://schema.org/Pet"' in html:
        return html, False  # already patched

    def repl(m: re.Match) -> str:
        # Replace the bare "Product" with array form, then inject additionalType + seller
        head = m.group(1)
        tail = m.group(2)
        # Inject additionalType after @type, and seller into offers
        new_head = head + '["Product", "Pet"],\n        "additionalType": "https://schema.org/Pet"'
        # Inject seller into the offer object (before the closing brace of offers)
        # find the actual availability URL used (InStock, SoldOut, PreOrder, etc.)
        avail_m = re.search(r'("availability":\s*"https://schema\.org/[A-Za-z]+")', tail)
        if avail_m:
            avail_full = avail_m.group(1)
            new_tail = tail.replace(
                avail_full,
                avail_full + ',\n          '
                '"seller": {\n            "@type": "Organization",\n            '
                '"name": "Garden State Coon",\n            '
                '"url": "https://gardenstatecoon.com/"\n          }',
            )
        else:
            new_tail = tail
        return new_head + new_tail

    new_html, n = PRODUCT_BLOCK_RE.subn(repl, html, count=1)
    return new_html, n > 0


def main() -> int:
    changed = 0
    for f in sorted(ROOT.glob("kitten-detail-*.html")):
        original = f.read_text(encoding="utf-8")
        new, did = patch_jsonld(original)
        if did:
            f.write_text(new, encoding="utf-8")
            changed += 1
            print(f"  patched {f.name}")
        else:
            print(f"  unchanged {f.name}")
    print(f"\nDone. Changed: {changed} kitten-detail files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
