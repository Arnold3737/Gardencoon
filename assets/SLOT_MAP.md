# Image Slot Map — Garden State Coon

> Maps every image slot referenced in HTML to its source file, visual content, and production status.
> Updated: 2026-04-10

---

## Existing Files (11 WebP in assets/)

| File | Dimensions | Visual Content | Assigned Slot | Page(s) | Status |
|---|---|---|---|---|---|
| `logo.webp` | 1536×1024 | Gold cattery logo with leaping Maine Coon silhouette, "A" star emblem, text "GARDEN STATE COON" on black background | Logo (all pages) | All 16 HTML | NEEDS_AVIF |
| `hero-home.webp` | 1080×1341 | Silver tabby Maine Coon standing full-body on dark marble, fluffy tail raised, Garden State Coon watermark | Hero banner | index.html | NEEDS_AVIF |
| `hero-gallery.webp` | 1600×1073 | Two Maine Coon kittens playing on dark velvet — silver tabby and brown tabby, action shot | Hero banner | gallery.html | NEEDS_AVIF |
| `hero-kittens.webp` | 1080×1080 | Close-up portrait of silver tabby Maine Coon face, green-yellow eyes, dramatic studio lighting | Hero banner | kittens.html | NEEDS_AVIF |
| `gallery-1.webp` | 1600×893 | Brown classic tabby Maine Coon lying on dark marble slab, amber eyes, Garden State Coon logo top-left | Gallery thumbnail 1 | gallery.html | NEEDS_AVIF |
| `gallery-2.webp` | 1446×1080 | Brown tabby mother Maine Coon grooming kitten on burgundy velvet blanket, warm interior lighting | Gallery thumbnail 2 | gallery.html | NEEDS_AVIF |
| `gallery-3.webp` | 1080×1446 | Red/ginger Maine Coon sitting upright in dark leather armchair, portrait orientation, studio lighting | Gallery thumbnail 3 | gallery.html | NEEDS_AVIF |
| `gallery-4.webp` | 1600×893 | Brown classic tabby Maine Coon lying on dark marble slab (duplicate of gallery-1 source) | Gallery thumbnail 4 | gallery.html | NEEDS_AVIF |
| `cat-atlas.webp` | 1080×1080 | Black smoke Maine Coon full-body standing, yellow eyes, dramatic top spotlight on dark background | Cat profile — Hudson | our-cats.html | NEEDS_AVIF |
| `cat-elara.webp` | 1600×893 | Three Maine Coons sitting side by side on dark bench — silver tabby, brown tabby, black smoke | Cat profile — Willow (group shot) | our-cats.html | NEEDS_AVIF |
| `about-preview.webp` | 1080×1080 | Silver/white Maine Coon kitten close-up, blue eyes, soft focus, no watermark | About preview | about.html, index.html | NEEDS_AVIF |

---

## Missing Hero Images (NEEDS_GENERATION)

Each hero needs 7 responsive variants: `-640.avif`, `-1024.avif`, `-1920.avif`, `-640.webp`, `-1024.webp`, `-1920.webp`, `-1920.jpg`

| Slot | Page | Source Available | Status |
|---|---|---|---|
| `hero-home` | index.html | hero-home.webp (1080px — too small for 1920) | NEEDS_UPSCALE |
| `hero-gallery` | gallery.html | hero-gallery.webp (1600px) | NEEDS_AVIF |
| `hero-kittens` | kittens.html | hero-kittens.webp (1080px — too small for 1920) | NEEDS_UPSCALE |
| `hero-about` | about.html | No source | NEEDS_GENERATION |
| `hero-our-cats` | our-cats.html | No source | NEEDS_GENERATION |
| `hero-contact` | contact.html | No source | NEEDS_GENERATION |
| `hero-faq` | faq.html | No source | NEEDS_GENERATION |
| `hero-health-testing` | health-testing.html | No source | NEEDS_GENERATION |
| `hero-shipping` | shipping.html | No source | NEEDS_GENERATION |
| `hero-waiting-list` | waiting-list.html | No source | NEEDS_GENERATION |
| `hero-purchase-contract` | purchase-contract.html | No source | NEEDS_GENERATION |
| `hero-privacy-policy` | privacy-policy.html | No source | NEEDS_GENERATION |
| `hero-terms-of-sale` | terms-of-sale.html | No source | NEEDS_GENERATION |
| `hero-cookie-policy` | cookie-policy.html | No source | NEEDS_GENERATION |
| `hero-404` | 404.html | No source | NEEDS_GENERATION |

---

## Missing Gallery Images (NEEDS_GENERATION)

Each gallery image needs 7 responsive variants: `-640.avif`, `-1024.avif`, `-1920.avif`, `-640.webp`, `-1024.webp`, `-1920.webp`, `-1920.jpg`

| Slot | Source Available | Status |
|---|---|---|
| `gallery-1` | gallery-1.webp (1600px) | NEEDS_AVIF |
| `gallery-2` | gallery-2.webp (1446px) | NEEDS_AVIF |
| `gallery-3` | gallery-3.webp (1080px) | NEEDS_UPSCALE |
| `gallery-4` | gallery-4.webp (1600px, duplicate of gallery-1) | NEEDS_AVIF |
| `gallery-5` | No source | NEEDS_GENERATION |
| `gallery-6` | No source | NEEDS_GENERATION |
| `gallery-7` | No source | NEEDS_GENERATION |
| `gallery-8` | No source | NEEDS_GENERATION |
| `gallery-9` | No source | NEEDS_GENERATION |

---

## Missing Kitten Images (NEEDS_GENERATION)

Each needs 7 responsive variants.

| Slot | Page | Source Available | Status |
|---|---|---|---|
| `kitten-1` | kittens.html | No source | NEEDS_GENERATION |
| `kitten-2` | kittens.html | No source | NEEDS_GENERATION |
| `kitten-3` | kittens.html | No source | NEEDS_GENERATION |
| `kitten-4` | kittens.html | No source | NEEDS_GENERATION |
| `kitten-5` | kittens.html | No source | NEEDS_GENERATION |
| `kitten-6` | kittens.html | No source | NEEDS_GENERATION |

---

## Missing Kitten Preview Images (NEEDS_GENERATION)

Each needs 7 responsive variants.

| Slot | Page | Source Available | Status |
|---|---|---|---|
| `kitten-preview-1` | kittens.html | No source | NEEDS_GENERATION |
| `kitten-preview-2` | kittens.html | No source | NEEDS_GENERATION |
| `kitten-preview-3` | kittens.html | No source | NEEDS_GENERATION |

---

## Missing Kitten Detail Images (NEEDS_GENERATION)

Each needs 7 responsive variants.

| Slot | Page | Source Available | Status |
|---|---|---|---|
| `kitten-detail-main` | kitten-detail.html | No source | NEEDS_GENERATION |
| `kitten-detail-2` | kitten-detail.html | No source | NEEDS_GENERATION |
| `kitten-detail-3` | kitten-detail.html | No source | NEEDS_GENERATION |

---

## Missing Cat Profile Images (NEEDS_GENERATION)

Each needs 7 responsive variants.

| Slot | Page | Source Available | Status |
|---|---|---|---|
| `cat-1` | our-cats.html | No source (cat-atlas.webp may cover this) | NEEDS_GENERATION |
| `cat-2` | our-cats.html | No source | NEEDS_GENERATION |
| `cat-3` | our-cats.html | No source | NEEDS_GENERATION |
| `cat-4` | our-cats.html | No source | NEEDS_GENERATION |
| `parent-sire` | our-cats.html, kitten-detail.html | No source | NEEDS_GENERATION |
| `parent-dam` | our-cats.html, kitten-detail.html | No source | NEEDS_GENERATION |

> Note: `cat-atlas.webp` (1080×1080, black smoke MC, Hudson) and `cat-elara.webp` (1600×893, group of 3 MCs, Willow) exist but may not match the individual cat-1..4 slot naming convention. Confirm with cattery owner which cat maps to which slot.

---

## Missing About / Info Images (NEEDS_GENERATION)

Each needs 7 responsive variants.

| Slot | Page | Source Available | Status |
|---|---|---|---|
| `about-preview` | about.html, index.html | about-preview.webp (1080px) | NEEDS_AVIF |
| `about-story` | about.html | No source | NEEDS_GENERATION |
| `waiting-list-info` | waiting-list.html | No source | NEEDS_GENERATION |

---

## Missing OG Images (NEEDS_GENERATION)

Open Graph images — one per page, 1200×630 JPG recommended.

| Slot | Page | Status |
|---|---|---|
| `og-index.jpg` | index.html | NEEDS_GENERATION |
| `og-about.jpg` | about.html | NEEDS_GENERATION |
| `og-gallery.jpg` | gallery.html | NEEDS_GENERATION |
| `og-kittens.jpg` | kittens.html | NEEDS_GENERATION |
| `og-kitten-detail.jpg` | kitten-detail.html | NEEDS_GENERATION |
| `og-our-cats.jpg` | our-cats.html | NEEDS_GENERATION |
| `og-contact.jpg` | contact.html | NEEDS_GENERATION |
| `og-faq.jpg` | faq.html | NEEDS_GENERATION |
| `og-health-testing.jpg` | health-testing.html | NEEDS_GENERATION |
| `og-shipping.jpg` | shipping.html | NEEDS_GENERATION |
| `og-waiting-list.jpg` | waiting-list.html | NEEDS_GENERATION |
| `og-purchase-contract.jpg` | purchase-contract.html | NEEDS_GENERATION |
| `og-privacy-policy.jpg` | privacy-policy.html | NEEDS_GENERATION |
| `og-terms-of-sale.jpg` | terms-of-sale.html | NEEDS_GENERATION |
| `og-cookie-policy.jpg` | cookie-policy.html | NEEDS_GENERATION |
| `og-404.jpg` | 404.html | NEEDS_GENERATION |

---

## Missing PWA Icons

| Slot | Status |
|---|---|
| `icon-192.png` | READY (generated from logo.webp) |
| `icon-512.png` | READY (generated from logo.webp) |

---

## Status Legend

| Status | Meaning |
|---|---|
| **READY** | File exists and is production-ready |
| **NEEDS_AVIF** | Source WebP exists; needs AVIF/responsive variants generated |
| **NEEDS_UPSCALE** | Source exists but resolution too low for 1920px hero; upscale then generate variants |
| **NEEDS_GENERATION** | No source file exists; must be photographed or AI-generated |

---

## Summary

| Category | Ready | Needs AVIF/Upscale | Needs Generation | Total Slots |
|---|---|---|---|---|
| Logo | 0 | 1 | 0 | 1 |
| Hero banners | 0 | 3 | 12 | 15 |
| Gallery | 0 | 4 | 5 | 9 |
| Kittens | 0 | 0 | 6 | 6 |
| Kitten previews | 0 | 0 | 3 | 3 |
| Kitten details | 0 | 0 | 3 | 3 |
| Cat profiles | 0 | 0 | 6 | 6 |
| About / Info | 0 | 1 | 2 | 3 |
| OG images | 0 | 0 | 16 | 16 |
| PWA icons | 2 | 0 | 0 | 2 |
| **Total** | **2** | **9** | **53** | **64** |
