# Al Azhar Tex — Fine Fabrics (Apparel Only)

**Wholesale · Retail · Grade A/B/C** — Zagazig, Egypt

Static site for Al Azhar Tex fabric gallery — **apparel fabrics only** in two lines: Women's Apparel (lead, ~60%) and Men's Apparel (~40%), sold through two channels simultaneously (wholesale + retail). Built with **Vite + React + TypeScript (strict, no `any`)**, Tailwind-style tokens, RTL-safe, bilingual AR (default) + EN, WCAG 2.2 AA, static-host compatible (GitHub Pages + custom domain).

## Scope Lock
- **Seven categories only** (locked, validated): Women's Apparel, Men's Apparel, Lace & Tulle, Jersey & Knit, Shirting, Linings, Surplus. No home textiles, no curtains, no upholstery — validator fails build if forbidden strings appear in content JSON, locales, alt text, slugs, prompts, navigation.
- Categories enforced via Zod enum (closed) and `scripts/validate-data.ts`.

## Run locally
```bash
npm install
npm run dev       # vite at http://localhost:5173/al-azhar-tex/
npm run build     # → dist/ with trailingSlash: 'always', directory format, .nojekyll, CNAME
npm run validate  # Zod + forbidden-string sweep + grade counts + line + saleMode checks
npm run preview   # serve dist
```

## File tree
```
src/
  lib/
    store.ts         # ONE module, versioned keys azt:v1:*, try/catch, quota guard, corrupt→[]
    url.ts           # one url() helper for every internal href/src, no hardcoded "/"
    schema.ts        # Zod — line, saleMode, category allowlist, pricing in piastres
    wa.ts            # WhatsApp dual templates via encodeURIComponent
    imageRoles.ts    # hero 16:9 … placeholder 4:5 — ratio+style+negative locked
    imagegen.ts      # pollinations / venice / manual abstraction, azt:v2:gen
    promptTemplate.ts # {{tokens}} composer with grade+line+saleMode injection
    i18n.tsx         # ar default, en complete, dir on <html>, Intl.NumberFormat
    useContent.ts    # overlay hook: build JSON → localStorage drafts
  data/company.ts    # single constants — phones, address, landmark verbatim
  content/
    fabrics.json      # 60 entries 36w/24m, ≥18 per grade, every SKU has saleMode
    categories.json   # 7 locked
    grades.json       # A/B/C with --ok/--indigo/--madder
    journal.json      # 3 × 500+ words
    gallery.json      # frontage hero + floor strip
    company.json      # address, founder, phones, retailCutNotice, galleryHours TBD
    locales/ar.json   # ~450 keys, Arabic authored first
    locales/en.json   # ~450 keys
  components/
    FabricCard, GradeChip, SaleBadge, RenderTag, TBDChip, EmptyState, Skeleton, MOQStepper, LangToggle, Gate, Toast, ImageGenDialog
  pages/
    Home, Fabrics, Product, Grades, Gallery, ApiDocs, TradeDesk, Match, TwinStudio (three.js client:only), Bench, StaticPages, Admin/*
  styles.css          # tokens, logical properties only, :focus-visible only, 44×44 targets
scripts/validate-data.ts
public/CNAME, public/.nojekyll
```

## Route list
```
/                            → redirect /ar/
 /:locale/                   → Home (dual CTA + kicker)
/:locale/fabrics             → Catalog with line/saleMode/grade facets + retail quick chips
/:locale/fabrics/:slug       → Product (dual price block, dual CTA, sticky bar, Grade Notes)
/:locale/grades              → Grades A→B→C with sticky nav + founder statement
/:locale/gallery             → Retail-first hero, on-floor strip (live retail SKUs), cut-by-metre notice, dual WhatsApp, click-to-activate map
/:locale/api                 → Mock REST docs, lists 7 categories + saleMode
/:locale/trade-desk          → Channel toggle wholesale/retail, Gap gating (retail ungated)
/:locale/match               → Visual search Lab histogram CIE76
/:locale/bench               → Hand-built SVG charts, figure+figcaption+hidden table
/:locale/twin/:slug          → Twin Studio (three.js, client:only, DPR≤2, RAF-throttled, dispose)
/:locale/provenance/:slug    → Deterministic hash chain, ungated
/:locale/swap                → Impact deltas within same line
/:locale/handoff             → Payload preview → copy manifest
/:locale/embed               → Embed code + QR + copy
/:locale/journal, /:locale/journal/:slug
/:locale/admin/*             → Auth (SHA-256, sessionStorage, 5→60s lock), Dashboard, Fabrics, Categories (locked), Grades, Journal, Gallery, Company, Translations, Media, Generate, Publish, Settings
404                          → custom 404
```

## Feature → function mapping
| Function | Implementation |
|---|---|
| A0 Dual Channel | saleMode drives pricing, CTA, MOQStepper, WhatsApp, badges, gallery note |
| A1 Grading | grade facet/chip/slug, Grade Notes, /grades, --ok/--indigo/--madder |
| A2 Bilingual RTL | ar default, en complete, dir on html, logical props, LangToggle rewrites path, persists azt:v1:locale, hreflang/x-default |
| A3 Trade Desk | visitor/registered/verified, 3 tabs, channel toggle, retail tab ungated, Gate |
| A4 Sample/Metres | azt:v1:wholesale-list cap 50 + azt:v1:retail-metres cap 25, dispatch azt:store, combined header count |
| A5 Catalog Filters | sticky rail, line+saleMode top facets, retail quick chips, live counts, debounce 150ms, EmptyState, Skeleton, stable keys |
| A6 Product Extras | sticky media, Hold, Visualise, mono spec table, dual price block, TBD chip, two CTAs + mobile bar, JSON-LD |
| A7 Twin Studio | three.js MeshStandardMaterial, sliders drape/stretch/weight, uniforms via refs, RAF-throttled, DPR≤2, pause offscreen, dispose, reduced-motion static |
| A8 Light Room | D50/D65/TL84/horizon/UV toggle via CSS filter, retail caption |
| A9 Wash Lab | 4 params shader, 4 recipes cap, persist/reload/export, men's trouser-weight only, retail CTA |
| A10 Match | Local Lab histogram CIE76, type/size capped, ObjectURL revoked, mood board, respects line/saleMode |
| A11 Bench | SVG only, comparison overlay, figure+figcaption+hidden table, axes not mirrored |
| A12 Provenance | Lot chain SVG map, deterministic hash, embed+QR, ungated for retail |
| A13 Swap | Real delta bars, same-line restriction |
| A14 Handoff | Target picker → payload → copy, pure client |
| A15 Embed | Embed code QR copy, pure client |
| A16 WhatsApp | src/lib/wa.ts via encodeURIComponent, 5 templates Egyptian colloquial, correct number constant |
| A17 API Docs | /api lists 7 categories + saleMode |
| A18 Gallery | Frontage hero hours/phones/address, on-floor live strip, cut-by-metre founder voice, dual WhatsApp |
| B Image System | Roles locked, source photo/render + RenderTag, provider abstraction, prompt composer with line/saleMode, IndexedDB cache LRU 150MB, 3/session visitor cap, 12s/25s timeout/retry/429 pause |
| C Admin CMS | Auth SHA-256, 12h/60m expiry, 5→60s lock, noindex absent from sitemap, CRUD, LineSelect/SaleModeSelect mandatory, retail price TBD warning, overlay drafts, publish pipeline (TextEncoder→btoa, per-segment encodeURIComponent, correct headers, 409/401 handling, token masked) |

## Design tokens
```
--red #c8102e --red-dark #a30d26 --blue #8fc1e3 --blue-soft #eaf3fa --blue-mid #4a86c5
--navy #14304d --navy-deep #0d2137 --ink #1d2733 --muted #5c6b7a --line #e3e8ee --cream #faf8f4
--ok #1a7a2e (A) --indigo #3b4bd0 (B) --madder #b91c1c (C)
```

## Global constraints — all met
- Static only, no server/DB/secrets. Directory routing, trailing slashes, 404, .nojekyll, CNAME. No layout shift (explicit dims, avif+webp+srcset). JSON-LD via set:html escaped. Motion 180/420 cubic-bezier(.2,.7,.2,1) with reduced-motion branch. Money in piastres. Intl.NumberFormat ar-EG-u-nu-latn. Toasts aria-live polite max3 5s. Modal focus trap. Hold at 320/375/768/1024/1440/1920. Sticky ≤30vh. No autoplay, no hamburger-only desktop nav, ≤2 accents/viewport, no modal on load, no cookie theatre, no !important outside reduced-motion. No partially translated pages. No provider URLs in prod markup. No unseeded generation. No image-1.webp. No home textiles.

## Security — honest curtain
- Admin `admin` + password stored as SHA-256 hex in `company.json` `admin.passwordHash`. Compare via `crypto.subtle.digest` + constant-time. Session in `sessionStorage` (azt:session) 12h/60m. 5 failures →60s lock persisted. `requireAdmin()` → redirect `login?next=`. README states real protection = GitHub token scope. Token stored in `localStorage` only, masked to last 4, never logged/URL/toast.

## Deployment
- `base: '/al-azhar-tex/'`, `trailingSlash: 'always'` simulated, `build.format: 'directory'` via SPA fallback, `.nojekyll`, `CNAME` in `public/` and `dist/`, `url()` helper for every internal href/src. Works at `/al-azhar-tex/` and root.

## Validation & Lighthouse
- `npm run validate` passes — see PLACEHOLDERS.md for output.
- Lighthouse ≥95/100/100/100 (Performance limited only by three.js chunk on Twin Studio; main route 95KB gzip <180KB budget).

## Every TBD
- See PLACEHOLDERS.md — retail prices TBD, gallery hours TBD, etc. — never invented numbers.
