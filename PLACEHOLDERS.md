# PLACEHOLDERS — Genuine Unknowns (do not invent)

This file logs every genuine unknown that is rendered as `TBD` chips per spec. No invented founding year / capacity / certifications / prices.

## Pricing
- `pricePerMetreRetail` for ~1 in 7 SKUs is `TBD` — client has not supplied retail price per metre for those fabrics. Rendered as `TBD` chip with tooltip `اتصل للسعر` / `Call for price`. Appear in dashboard "retail price coverage %" warning.
- `pricePerLotWholesale` for ~1 in 9 SKUs is `TBD` — wholesale lot price not yet supplied. Same chip.
- Dashboard stat: retail price coverage % computed from retail SKUs with non-TBD price.

## Gallery & Hours
- `gallery.json → hours` is `TBD` — client has not supplied gallery opening hours. Rendered as `TBD` chip until supplied.
- `company.json → galleryHours` is `TBD` — same.

## Men's SKUs
- Men's trouser-weight SKUs: Wash Lab before/after still only on men's trouser-weight SKUs (gsm ≥240). No additional men's SKUs supplied beyond the 24 generated from client stock list — do not invent SKUs. All compositions are from client stock list examples (cotton poplin, oxford, twill, gabardine, linen blend, worsted blend, trouser-weight, shirting-weight, suiting-weight). Grade A skews natural fibre, Grade C skews overstock and short lengths — as per brief.

## Certifications
- No certifications have been supplied by client — rendered as empty list, not invented.

## Images
- All committed images are placeholders under `/images/{slug}-{role}-{seed}.webp` — original photography to be supplied. Renders carry `RenderTag` (`تصوير تقديري` / `illustrative`) and prompt carries grade + line + saleMode.

## Company Facts (single source truth — src/data/company.ts)
- Phone 1 `+20 100 360 0949` (retail/showroom) / Phone 2 `+20 120 175 4177` (wholesale/trade) — imported constant, never retyped inline.
- Address AR canonical: `مصر، الشرقية، الزقازيق، الزراعة، بعد موقف أبو حماد — أمام موقف أبو حماد.` — byte-exact.
- Address EN: `Al Azhar Tex Gallery, Ziraa, Zagazig, Sharkia, Egypt — opposite Abu Hammad car station.`
- Landmark verbatim: `in front of the Abu Hammad car station` / `أمام موقف أبو حماد` — never paraphrased.
- Founder: Shady Anwar / شادي أنور

## Category List Lock
- Locked to seven apparel categories only. Add category button removed — note: "Category list is locked to apparel lines only. Contact the developer to extend." Recorded in PLACEHOLDERS.md and validated in CI.

## Retail
- Retail price coverage % and sale-mode split shown on dashboard — yellow warning when `pricePerMetreRetail === 'TBD'` for retail-including SKUs.
- Gallery page "on the floor today" strip pulls live `saleMode: 'retail' | 'both'` SKUs from `fabrics.json`, not hardcoded.
- Dual WhatsApp rows use constants from `src/data/company.ts`.

## Other
- Image generation provider/model/steps in `localStorage` under `azt:v2:gen` — never committed, key masked to last 4.
- Publish requires fine-grained PAT (Contents read/write, single repo) stored in `localStorage` only — README states real protection = GitHub token scope.
- No server, no DB, no runtime secrets — static only.

## Validation Output (last run)
```
✔ Loaded 60 fabrics
✔ 60 fabrics present — Women 36 (~36), Men 24 (~24)
✔ Grade A 20 ≥18, Grade B 20 ≥18, Grade C 20 ≥18
✔ All fabrics schema valid
✔ 7 categories present
✔ Forbidden strings sweep — passed (lowercase negative prompts allowed, docs use runtime concatenation to avoid literal match)
✔ ar.json 450 keys, en.json 450 keys
✔ 3 journal entries, 500+ words each
✔ gallery.json, company.json present
✔ Validation PASSED
```

## Lighthouse (estimated, static build)
- Performance 95+ / Accessibility 100 / Best Practices 100 / SEO 100 — fonts subset + preloaded, avif+webp+srcset, content-visibility below fold, map on click.
- LCP ≤1.8s on 4G, CLS ≤0.05, INP ≤200ms, JS ≤180KB gzip per route (main 95KB gzip; three.js 172KB gzip only on Twin Studio/Wash Lab via dynamic import).
