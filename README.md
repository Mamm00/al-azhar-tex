# Al Azhar Tex — Website

Static website + admin control center for **Al Azhar Tex**, an Egyptian
wholesale textile company (est. 2006, Cairo) specialising in women's fabrics:
Silk 180, Warsaw L, Pirlanta, Rotana 150/180, Lexus 150/180 and more.

## Run locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Any static file server works (GitHub Pages, Netlify, nginx, …).

## Pages

| File          | Purpose                                                        |
|---------------|----------------------------------------------------------------|
| `index.html`  | Public site (hero, about, fabric catalogue, wholesale, contact) |
| `admin.html`  | Admin Control Center (PIN protected)                           |

## Admin Control Center

- Open `/admin.html` — default PIN is **`2006`** (change it in Settings).
- Sections:
  - **Dashboard** — lead/fabric counts, maintenance-mode switch, 14-day
    leads chart, recent admin activity log, latest leads.
  - **Fabrics** — add, edit, delete, **reorder (↑/↓)** and **hide/show**
    individual fabrics (hidden lines stay in the catalogue but don't appear
    on the site).
  - **Site content** — hero eyebrow, headline, lead text, badge, catalogue
    note (limited HTML allowed: `span.text-red`, `a`, `br`), **SEO** (page
    title + meta description / Open Graph), and the **announcement bar**
    shown under the header.
  - **Brand** — **upload a custom logo** (auto-resized, applied to header,
    footer and the maintenance screen) and **re-theme the site colours**
    (primary, accent, navy).
  - **Contact & hours** — phone, email, address, working hours (updates the
    contact section, top bar and footer at once).
  - **Leads** — view, mark read, delete, **WhatsApp shortcut** per lead,
    and export (CSV) submissions from the public contact form.
  - **Settings** — change PIN, **export/import JSON snapshots** (backup &
    restore across devices), reset to defaults.
- **Maintenance mode** (dashboard): swaps the public site for a
  "we'll be back" screen while keeping the wholesale phone number visible.

### Important: how storage works

This is a **static site**: admin changes and leads are stored in the
browser's `localStorage` and therefore apply to the main site **in that same
browser**. To make changes visible to every visitor, either:

1. connect a backend/database and adapt `js/data.js`
   (see the `TODO` notes in `js/main.js` for form submission), or
2. use **Settings → Export data (JSON)** as a content snapshot and regenerate
   the HTML.

The PIN gate is a client-side convenience, not real access control — never
store sensitive information in the admin UI without a backend.

## Project structure

```
index.html          public site
admin.html          admin control center
css/style.css       public site styles
css/admin.css       admin styles (loaded after style.css)
js/data.js          shared data layer (defaults + localStorage)
js/main.js          public site interactions
js/admin.js         admin control center logic
assets/             logo + photography
```

## Owner

Shady Anwar — Founder & Owner, Al Azhar Tex (est. 2006, Cairo, Egypt).
