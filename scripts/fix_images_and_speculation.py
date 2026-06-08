#!/usr/bin/env python3
"""
Idempotent batch patcher for gardenstatecoon site.

Operations:
1. Fix width=/height= attrs on every <img> under assets/* to match REAL pixel
   dimensions of the largest variant of that image. Eliminates CLS caused by
   wrong aspect-ratio hints.
2. Replace inline <script type="speculationrules"> with context-aware rules:
     - index.html       -> prerender /kittens.html, /about.html
     - kittens.html     -> prerender all /kitten-detail-N.html (1..6)
     - kitten-detail-*  -> prerender /kittens.html, /contact.html
     - all other pages  -> remove the rules entirely
3. Add <meta name="robots" content="noindex,follow"> to 404.html (idempotent).
"""

from __future__ import annotations
import os, re, sys, json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

# -- Build size table: filename -> (w, h) --
SIZES: dict[str, tuple[int, int]] = {}
assets_dir = ROOT / "assets"
for f in assets_dir.iterdir():
    if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}:
        try:
            with Image.open(f) as im:
                SIZES[f.name] = im.size
        except Exception as e:
            print(f"WARN: cannot read {f.name}: {e}", file=sys.stderr)

print(f"Indexed {len(SIZES)} image files")

# Speculation Rules per page-pattern
SPEC_RULES = {
    "index.html": {
        "prerender": [
            {"where": {"href_matches": "/kittens.html"}, "eagerness": "moderate"},
            {"where": {"href_matches": "/about.html"}, "eagerness": "moderate"},
        ]
    },
    "kittens.html": {
        "prerender": [
            {"where": {"href_matches": "/kitten-detail-*.html"}, "eagerness": "moderate"},
        ]
    },
    "kitten-detail": {  # match all kitten-detail-*.html
        "prerender": [
            {"where": {"href_matches": "/kittens.html"}, "eagerness": "moderate"},
            {"where": {"href_matches": "/contact.html"}, "eagerness": "moderate"},
        ]
    },
}


def speculation_block(rules: dict | None) -> str:
    if rules is None:
        return ""
    return (
        '  <script type="speculationrules">\n  '
        + json.dumps(rules, indent=2).replace("\n", "\n  ")
        + "\n  </script>"
    )


SPEC_RE = re.compile(
    r'\s*<script\s+type="speculationrules">.*?</script>',
    re.DOTALL,
)


def patch_speculation(html: str, fname: str) -> str:
    if fname == "index.html":
        rules = SPEC_RULES["index.html"]
    elif fname == "kittens.html":
        rules = SPEC_RULES["kittens.html"]
    elif fname.startswith("kitten-detail"):
        rules = SPEC_RULES["kitten-detail"]
    else:
        rules = None  # remove

    new_block = speculation_block(rules)
    # Strip every existing speculationrules script (idempotent)
    html = SPEC_RE.sub("", html)
    if new_block:
        # Insert before </head>
        html = html.replace("</head>", "\n" + new_block + "\n</head>", 1)
    return html


# Fix img width/height
IMG_RE = re.compile(r"<img\b([^>]*)>", re.IGNORECASE)
SRC_RE = re.compile(r'\bsrc="([^"]+)"', re.IGNORECASE)
W_RE = re.compile(r'\bwidth="([^"]+)"', re.IGNORECASE)
H_RE = re.compile(r'\bheight="([^"]+)"', re.IGNORECASE)


def patch_img(match: re.Match) -> str:
    attrs = match.group(1)
    src_m = SRC_RE.search(attrs)
    if not src_m:
        return match.group(0)
    src = src_m.group(1)
    base = os.path.basename(src)
    if base not in SIZES:
        return match.group(0)
    real_w, real_h = SIZES[base]

    new_attrs = attrs
    if W_RE.search(new_attrs):
        new_attrs = W_RE.sub(f'width="{real_w}"', new_attrs)
    else:
        new_attrs = new_attrs.rstrip() + f' width="{real_w}"'
    if H_RE.search(new_attrs):
        new_attrs = H_RE.sub(f'height="{real_h}"', new_attrs)
    else:
        new_attrs = new_attrs.rstrip() + f' height="{real_h}"'

    # ensure single space normalization
    new_attrs = re.sub(r"\s+", " ", new_attrs).strip()
    return f"<img {new_attrs}>"


def patch_images(html: str) -> str:
    return IMG_RE.sub(patch_img, html)


# Add noindex to 404
NOINDEX_TAG = '<meta name="robots" content="noindex,follow">'


def patch_404(html: str) -> str:
    if NOINDEX_TAG in html:
        return html
    # Insert right after <head>
    return re.sub(
        r"(<head[^>]*>)",
        rf"\1\n  {NOINDEX_TAG}",
        html,
        count=1,
    )


def main() -> int:
    changed = 0
    for f in sorted(ROOT.glob("*.html")):
        original = f.read_text(encoding="utf-8")
        out = original
        out = patch_speculation(out, f.name)
        out = patch_images(out)
        if f.name == "404.html":
            out = patch_404(out)
        if out != original:
            f.write_text(out, encoding="utf-8")
            changed += 1
            print(f"  patched {f.name}")
        else:
            print(f"  unchanged {f.name}")
    print(f"\nDone. Changed: {changed} files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
