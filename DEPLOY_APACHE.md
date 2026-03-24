# Apache Deploy Guide

## Why Full Replacement Matters

Vite fingerprints every JS and CSS file with a content hash
(e.g. `index-B2KHaIp-.js`). Each build produces **new** hash names.
The root `index.html` and every prerendered HTML file reference these
exact filenames. If the server still has files from a previous build,
the old hashes won't match the new HTML → the browser gets **404** for
the JS bundle → React never loads → the site appears as static HTML
with no interactivity.

**Never mix files from two different builds.** Always delete the
previous deployment before uploading.

---

## Build

```bash
npm run build
```

This runs: sitemap generation → Vite build → Puppeteer prerender.
Output lands in `dist/`.

---

## Pre-Deploy: Verify Build Locally

```bash
# Check all HTML asset references resolve to real files
node scripts/verify-assets.mjs

# Serve the build locally and test in a browser
npx serve -s dist -l 4000
```

Open `http://localhost:4000`, click between pages, and confirm:
- Page renders with styles
- Client-side navigation works (no full page reload)
- Browser DevTools Console shows no 404 errors
- Browser DevTools Network tab shows JS/CSS returning 200

---

## Deploy Checklist

### 1. Delete previous contents on the server

Remove **everything** in the document root, including hidden files:

```bash
# SSH example
rm -rf /var/www/html/*
rm -rf /var/www/html/.[!.]*
```

Or in your hosting file manager: select all → delete.

### 2. Upload the full `dist/` folder

Upload **all** contents of `dist/`, preserving the directory structure:

| Path               | What it contains                          |
|--------------------|-------------------------------------------|
| `.htaccess`        | Rewrite rules, caching, security headers  |
| `index.html`       | Root HTML (React entry point)             |
| `assets/`          | Hashed JS, CSS, fonts (242+ files)        |
| `images/`          | Static images                             |
| `sitemap.xml`      | Search-engine sitemap                     |
| `robots.txt`       | Crawler directives                        |
| `favicon.svg`      | Site favicon                              |
| `tools/*/`         | Prerendered tool pages                    |
| `guides/*/`        | Prerendered guide pages                   |
| `comparisons/*/`   | Prerendered comparison pages              |
| `community/*/`     | Prerendered community pages               |
| `about/`, etc.     | Other prerendered static pages            |

### 3. Verify file permissions

```bash
find /var/www/html -type f -exec chmod 644 {} \;
find /var/www/html -type d -exec chmod 755 {} \;
```

### 4. Purge CDN / hosting cache

If your hosting provider or Cloudflare adds a cache layer, purge it now.

### 5. Verify the deployment

Open the site in a **private/incognito** window:

1. **View page source** → confirm `<script>` src contains a hash
   like `/assets/index-XXXXXXXX.js`
2. **Open that JS URL directly** in a new tab → should show JavaScript
   code, NOT a 404 page or HTML
3. **DevTools → Network tab** → reload → filter `JS` → all assets
   should return **200** (not 304 from stale cache, not 404)
4. **DevTools → Console** → no red errors like
   `Failed to load module script`
5. **Click a link** (e.g. Home → Tools) → should navigate WITHOUT a
   full page reload (URL changes, no white flash)
6. **Hard refresh** (`Ctrl+Shift+R`) on an inner page like
   `/tools/pdf-compressor` → page should load with full styles and
   interactivity

---

## What This Project Expects

| Content              | Cache-Control                                   |
|----------------------|-------------------------------------------------|
| `*.html`             | `no-cache, no-store, must-revalidate`           |
| `/assets/*` (hashed) | `max-age=31536000, public, immutable`           |
| Other static files   | `max-age=604800, public`                        |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Page loads but no interactivity | JS bundle 404 | Re-upload `assets/` folder completely |
| Clicking links causes full reload | React not hydrated | Check JS 404 in DevTools Network |
| Blank white page | JS crash or missing bundle | Check DevTools Console for errors |
| Old content after deploy | Browser cache | Hard refresh or purge CDN |
| 404 on direct URL access | `.htaccess` missing or `mod_rewrite` off | Re-upload `.htaccess`, enable `mod_rewrite` |
| CSS missing / unstyled | CSS file 404 | Verify `assets/*.css` exists on server |