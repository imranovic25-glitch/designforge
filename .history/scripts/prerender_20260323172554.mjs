#!/usr/bin/env node
/**
 * prerender.mjs — Post-build prerendering using Puppeteer
 *
 * Reads routes from the built dist/sitemap.xml, renders each in headless
 * Chrome, and writes full HTML (meta tags, JSON-LD, visible content) to
 * dist/{route}/index.html.
 *
 * Usage:   node scripts/prerender.mjs
 * Called:  automatically by  npm run build
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const PORT = 45678;
const ORIGIN = `http://localhost:${PORT}`;
const CONCURRENCY = 5;

/* Routes that should NOT be prerendered (auth-gated / private) */
const SKIP = new Set(["/signin", "/profile"]);
const SKIP_PREFIXES = [
  "/community/my-apps",
  "/community/chat",
  "/community/moderation",
];

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".webp": "image/webp",
  ".map": "application/json",
};

/* ── Extract routes from sitemap.xml ──────────────────────────────── */
function extractRoutes() {
  const sitemapPath = path.join(DIST, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    console.error("❌  dist/sitemap.xml not found. Run `vite build` first.");
    process.exit(1);
  }

  const xml = fs.readFileSync(sitemapPath, "utf8");
  const routes = new Set();

  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      routes.add(new URL(loc).pathname);
    } catch {
      /* skip malformed */
    }
  }

  return [...routes].filter(
    (r) => !SKIP.has(r) && !SKIP_PREFIXES.some((p) => r.startsWith(p))
  );
}

/* ── Static file server with SPA fallback ─────────────────────────── */
function startServer() {
  /* Read the ORIGINAL index.html before any prerendered files overwrite it */
  const indexHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, ORIGIN).pathname);
      let fp = path.join(DIST, urlPath);

      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) {
        fp = path.join(fp, "index.html");
      }

      if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
        const ext = path.extname(fp).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME[ext] || "application/octet-stream",
        });
        fs.createReadStream(fp).pipe(res);
      } else {
        /* SPA fallback — serve root index.html for any unknown path */
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(indexHtml);
      }
    });

    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

/* ── Render a single route ────────────────────────────────────────── */
async function renderRoute(browser, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  /* Block external resources — keep local assets + Supabase API */
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (url.startsWith(ORIGIN) || url.includes("supabase.co")) {
      req.continue();
    } else {
      req.abort();
    }
  });

  try {
    await page.goto(`${ORIGIN}${route}`, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    /* Wait for react-helmet-async to inject <title> */
    await page
      .waitForFunction(
        () => !!document.querySelector("title")?.textContent?.trim(),
        { timeout: 10_000 }
      )
      .catch(() => {});

    /* Small settle delay for final state updates */
    await new Promise((r) => setTimeout(r, 300));

    const html = await page.content();

    /* Write to dist/{route}/index.html */
    const outDir = route === "/" ? DIST : path.join(DIST, route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

    return true;
  } catch (err) {
    console.error(`  ✗ ${route}: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

/* ── Main ─────────────────────────────────────────────────────────── */
async function main() {
  console.log("\n🔍  Extracting routes from dist/sitemap.xml …");
  const routes = extractRoutes();
  console.log(`    Found ${routes.length} routes to prerender\n`);

  console.log("🖥️   Starting local server …");
  const server = await startServer();
  console.log(`    Serving dist/ on ${ORIGIN}\n`);

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  console.log("🚀  Prerendering …\n");
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < routes.length; i += CONCURRENCY) {
    const batch = routes.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((r) => renderRoute(browser, r))
    );

    results.forEach((success, j) => {
      if (success) {
        ok++;
        console.log(`  ✓ ${batch[j]}`);
      } else {
        fail++;
      }
    });

    const done = Math.min(i + CONCURRENCY, routes.length);
    if (done % 25 === 0 || done === routes.length) {
      console.log(
        `\n    Progress: ${done}/${routes.length} (${Math.round((done / routes.length) * 100)}%)\n`
      );
    }
  }

  await browser.close();
  server.close();

  console.log(`\n✅  Prerendering complete!`);
  console.log(`    ${ok} succeeded, ${fail} failed`);
  console.log(`    Output: ${DIST}/\n`);

  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
