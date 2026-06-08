#!/usr/bin/env bash
# Patches applied across all *.html pages on 2026-05-09:
#  1. Remove broken Cloudflare Web Analytics beacon (placeholder token caused CORS errors).
#  2. Remove web-vitals unpkg import (external dep, dev-only telemetry).
#  3. Switch canonical/og:url/JSON-LD URLs to the gardenstatecoon.com custom domain
#  4. Update sitemap entries last-mod.
# Idempotent: safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."

for f in *.html; do
  python3 scripts/patch_page.py "$f"
done

echo "Patched $(ls *.html | wc -l) pages."
