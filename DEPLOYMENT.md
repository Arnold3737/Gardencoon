# Deployment Notes

## GitHub Pages

Auto-deploys from `main` branch via GitHub Actions (`.github/workflows/pages.yml`).

Custom domain: `gardenstatecoon.com` (configured via `CNAME` file).

After first deploy, enable GitHub Pages in **Settings → Pages → Source: GitHub Actions**.

## Cloudflare Setup (after deploy)

1. Add site to Cloudflare → change nameservers at your registrar
2. Enable **HTTP/3 (QUIC)** in Speed → Optimization
3. Enable **Brotli compression** in Speed → Optimization
4. Enable **103 Early Hints** in Speed → Optimization
5. Add **HSTS Preload** in SSL/TLS → Edge Certificates
6. Set **Cache-Control** rules for static assets: `max-age=31536000`

## DNS Records

| Type  | Name | Content              |
|-------|------|----------------------|
| CNAME | @    | <your-github-username>.github.io |
| CNAME | www  | <your-github-username>.github.io |

## Formspree

Replace `XXXXXXXX` in `contact.html` and `waiting-list.html` form `action` URLs with your real Formspree endpoint ID from [formspree.io](https://formspree.io).

## Post-Deploy Checklist

- [ ] Verify HTTPS redirect works
- [ ] Run Lighthouse audit (target: 90+ all categories)
- [ ] Run axe DevTools: F12 → Extensions → axe DevTools → Analyze Page (target: 0 Critical/Serious)
- [ ] Submit sitemap to Google Search Console: `https://gardenstatecoon.com/sitemap.xml`
- [ ] Verify og:image renders on [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
