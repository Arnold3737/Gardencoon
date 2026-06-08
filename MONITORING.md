# Performance Monitoring Targets

## Core Web Vitals (Field Data p75)

| Metric | Target  | Tool                        |
|--------|---------|-----------------------------|
| LCP    | ≤ 2.5s  | Google Search Console       |
| INP    | ≤ 200ms | DebugBear / SpeedCurve      |
| CLS    | ≤ 0.03  | GSC + Lighthouse            |
| TTFB   | ≤ 200ms | WebPageTest                 |

## Alert Thresholds

Alert if any metric degrades >10% over a rolling 7-day window.

## Tools

- **Google Search Console** → Core Web Vitals report
- **DebugBear**: [https://app.debugbear.com](https://app.debugbear.com)
- **PageSpeed Insights**: [https://pagespeed.web.dev](https://pagespeed.web.dev)
- **Security Headers**: [https://securityheaders.com](https://securityheaders.com) — target A+
- **Google Rich Results Test**: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)

## Post-Deploy Checklist

- [ ] PageSpeed Insights LCP ≤ 2.5s
- [ ] securityheaders.com A+
- [ ] Rich Results Test JSON-LD valid
- [ ] axe DevTools 0 critical violations
- [ ] 28 days: check CrUX in GSC
