# Garden State Coon — Design Decisions

Brand constants and design decisions for the Garden State Coon Maine Coon cattery website.

## Brand Identity

| Item | Value |
|------|-------|
| Brand name | **Garden State Coon** |
| Domain | `https://gardenstatecoon.com` |
| Location | Edison, NJ 08817 |
| Email | `hello@gardenstatecoon.com` |
| Phone | `+1-XXX-XXX-XXXX` (placeholder — to be confirmed) |
| Nearest airport | EWR (Newark Liberty International) |
| Region | New Jersey (NJ), United States |

## Color Palette (CSS variables)

```css
--color-primary:   #1a2e1a;  /* deep garden green */
--color-secondary: #c9a96e;  /* warm gold accent */
--color-accent:    #4a7c59;  /* leaf green */
--color-bg:        #f7f9f5;  /* soft off-white background */
```

These are applied in `css/variables.css`. The PWA `theme_color` and the `<meta name="theme-color">` use `--color-primary` (`#1a2e1a`).

## Typography

Local fonts only (in `fonts/`). **No Google Fonts.**
- Headings: Cormorant Garamond
- Body: Jost

## Kittens (6)

| # | Asset | Name | Sex | Color | Status | Detail CTA |
|---|-------|------|-----|-------|--------|-----------|
| 1 | kitten-1 | Maple | F | Blue smoke | Available | Reserve Maple |
| 2 | kitten-2 | Cedar | M | Brown classic tabby | Available | Reserve Cedar |
| 3 | kitten-3 | Ridge | M | Silver shaded | **RESERVED** | **Join Waiting List** |
| 4 | kitten-4 | Pebble | F | Brown patched tabby | Available | Reserve Pebble |
| 5 | kitten-5 | Harbor | M | Black smoke | Available | Reserve Harbor |
| 6 | kitten-6 | Bayside | F | Red silver tabby | Available | Reserve Bayside |

- **Ridge is RESERVED**: its primary CTA is **"Join Waiting List"**, never "Reserve Ridge".

## Breeding Cats

| Asset | Name | Role | Color |
|-------|------|------|-------|
| parent-sire / cat-atlas | Hudson | Sire (king) | Brown classic tabby |
| parent-dam / cat-elara | Willow | Dam (queen) | Blue smoke |
| parent-dam2 | Juniper | Dam (queen) | Silver shaded |

## Pricing Rule

- Prices are shown **only** as the text **"Price available upon request"**.
- No numeric prices anywhere (no `$2,000`, no deposit amounts).

## Health & Registration Language (cautious)

Per user decision, use cautious, soft language:
- "registered lines" — not "TICA-registered"
- "health-screened breeding cats" / "health-focused breeding practices" — not "100% disease-free" / "100% guarantee"
- Avoid hard guarantees and absolute claims.

## Experience / Founding Language

Per user decision, **no specific years or year counts**: avoid "since 2020", "established 2020", "15+ years", etc. Use neutral phrasing: "established Maine Coon cattery", "dedicated breeding program".

## Technical Constraints (preserved)

- Hero images keep `fetchpriority="high"` and `loading="eager"` (never `lazy`).
- Below-the-fold images use `loading="lazy"`.
- `<picture>` with avif → webp → jpg and correct `srcset`/`sizes`.
- Speculation Rules, Service Worker, JSON-LD, and `view-transition` are preserved.
- Service worker cache namespace: `CACHE_NAME = 'garden-state-coon-v1'`.
- WCAG AA: descriptive alt text, ARIA labels, keyboard navigation, AA contrast with new palette.
