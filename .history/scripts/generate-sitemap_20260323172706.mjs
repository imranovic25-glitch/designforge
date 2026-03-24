/**
 * generate-sitemap.mjs
 * ─────────────────────
 * Build-time sitemap generator.
 * Fetches live app submission IDs from Supabase and writes a complete
 * sitemap.xml to public/sitemap.xml.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *
 * Or hook into your build:
 *   "build": "node scripts/generate-sitemap.mjs && vite build"
 *
 * Requires a .env (or .env.local) file with:
 *   VITE_SUPABASE_URL=https://...supabase.co
 *   VITE_SUPABASE_ANON_KEY=...
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/* ─── Load env ────────────────────────────────────────────────────────── */
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const fp = path.join(ROOT, name);
    if (!fs.existsSync(fp)) continue;
    const raw = fs.readFileSync(fp, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = "https://designforge360.in";

/* ─── Fetch active submission IDs from Supabase REST ──────────────────── */
async function fetchActiveAppIds() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[sitemap] Missing Supabase credentials — skipping dynamic app pages.");
    return [];
  }

  let allIds = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/app_submissions?select=id,updated_at&status=eq.active&order=created_at.asc&offset=${from}&limit=${pageSize}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`[sitemap] Supabase query failed: ${res.status} ${res.statusText}`);
      break;
    }

    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;

    allIds.push(...rows.map((r) => ({ id: r.id, updated_at: r.updated_at ?? new Date().toISOString() })));
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  console.log(`[sitemap] Fetched ${allIds.length} active app submissions.`);
  return allIds;
}

/* ─── URL builder helpers ─────────────────────────────────────────────── */
function url(loc, changefreq, priority, lastmod) {
  const lastmodTag = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : "";
  return `<url><loc>${SITE_URL}${loc}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

/* ─── Static URL inventory ────────────────────────────────────────────── */
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_URLS = [
  /* Core */
  url("/", "weekly", "1.0", TODAY),
  url("/tools", "weekly", "0.9", TODAY),
  url("/comparisons", "weekly", "0.8", TODAY),
  url("/guides", "weekly", "0.8", TODAY),
  url("/finance", "weekly", "0.8", TODAY),
  url("/about", "monthly", "0.5", TODAY),
  url("/support", "monthly", "0.5", TODAY),
  /* Community */
  url("/community", "daily", "0.9", TODAY),
  /* Beta testing landing pages */
  url("/find-app-testers", "monthly", "0.9", TODAY),
  url("/get-beta-testers", "monthly", "0.9", TODAY),
  url("/test-my-app", "monthly", "0.9", TODAY),
  url("/free-app-testing", "monthly", "0.9", TODAY),
  /* Community category hubs */
  url("/community/category/productivity", "daily", "0.8", TODAY),
  url("/community/category/social", "daily", "0.8", TODAY),
  url("/community/category/finance", "daily", "0.8", TODAY),
  url("/community/category/games", "daily", "0.8", TODAY),
  url("/community/category/education", "daily", "0.8", TODAY),
  url("/community/category/health", "daily", "0.8", TODAY),
  url("/community/category/utility", "daily", "0.8", TODAY),
  url("/community/category/entertainment", "daily", "0.8", TODAY),
  url("/community/category/developer-tools", "daily", "0.8", TODAY),
  url("/community/category/other", "daily", "0.7", TODAY),
  /* Community platform hubs */
  url("/community/platform/android", "daily", "0.8", TODAY),
  url("/community/platform/ios", "daily", "0.8", TODAY),
  url("/community/platform/web", "daily", "0.8", TODAY),
  url("/community/platform/desktop", "daily", "0.7", TODAY),
  url("/community/platform/cross-platform", "daily", "0.7", TODAY),
  /* Blog */
  url("/blog", "weekly", "0.8", TODAY),
  url("/blog/how-to-get-beta-testers-for-your-app", "monthly", "0.8", TODAY),
  url("/blog/how-to-test-app-before-launch", "monthly", "0.8", TODAY),
  url("/blog/best-free-app-testing-platforms", "monthly", "0.8", TODAY),
  /* Tools */
  url("/tools/pdf-editor", "weekly", "0.9", TODAY),
  url("/tools/background-remover", "weekly", "0.9", TODAY),
  url("/tools/pdf-compressor", "weekly", "0.9", TODAY),
  url("/tools/pdf-merger", "weekly", "0.9", TODAY),
  url("/tools/pdf-to-word", "weekly", "0.9", TODAY),
  url("/tools/currency-converter", "weekly", "0.9", TODAY),
  url("/tools/compound-interest-calculator", "weekly", "0.9", TODAY),
  url("/tools/loan-emi-calculator", "weekly", "0.9", TODAY),
  url("/tools/resume-builder", "weekly", "0.9", TODAY),
  url("/tools/image-compressor", "weekly", "0.9", TODAY),
  url("/tools/image-converter", "weekly", "0.9", TODAY),
  url("/tools/image-resizer", "weekly", "0.9", TODAY),
  url("/tools/word-counter", "weekly", "0.9", TODAY),
  url("/tools/json-formatter", "weekly", "0.9", TODAY),
  url("/tools/clipboard-manager", "weekly", "0.9", TODAY),
  url("/tools/word-to-pdf", "weekly", "0.9", TODAY),
  url("/tools/markdown-preview", "weekly", "0.9", TODAY),
  url("/tools/qr-code-generator", "weekly", "0.9", TODAY),
  url("/tools/color-palette-generator", "weekly", "0.9", TODAY),
  url("/tools/svg-to-png", "weekly", "0.9", TODAY),
  url("/tools/password-generator", "weekly", "0.9", TODAY),
  url("/tools/mortgage-calculator", "weekly", "0.9", TODAY),
  url("/tools/seo-audit", "weekly", "0.9", TODAY),
  /* Programmatic — Image Resizer */
  url("/tools/resize-image-to-1080x1080", "monthly", "0.6", TODAY),
  url("/tools/resize-image-to-1920x1080", "monthly", "0.6", TODAY),
  url("/tools/resize-image-to-1200x628", "monthly", "0.6", TODAY),
  url("/tools/resize-image-for-instagram-post", "monthly", "0.6", TODAY),
  url("/tools/resize-image-for-instagram-story", "monthly", "0.6", TODAY),
  url("/tools/resize-image-for-youtube-thumbnail", "monthly", "0.6", TODAY),
  url("/tools/resize-image-for-facebook-cover", "monthly", "0.6", TODAY),
  url("/tools/resize-image-for-linkedin-banner", "monthly", "0.6", TODAY),
  url("/tools/resize-image-to-800x800", "monthly", "0.6", TODAY),
  url("/tools/resize-image-to-500x500", "monthly", "0.6", TODAY),
  /* Programmatic — PDF Compressor */
  url("/tools/compress-pdf-to-1mb", "monthly", "0.6", TODAY),
  url("/tools/compress-pdf-to-500kb", "monthly", "0.6", TODAY),
  url("/tools/compress-pdf-to-200kb", "monthly", "0.6", TODAY),
  url("/tools/compress-pdf-for-email", "monthly", "0.6", TODAY),
  url("/tools/compress-pdf-for-whatsapp", "monthly", "0.6", TODAY),
  url("/tools/compress-pdf-for-college-application", "monthly", "0.6", TODAY),
  url("/tools/compress-pdf-for-job-application", "monthly", "0.6", TODAY),
  /* Programmatic — EMI Calculator */
  url("/tools/emi-for-5-lakh-loan", "monthly", "0.6", TODAY),
  url("/tools/emi-for-10-lakh-loan", "monthly", "0.6", TODAY),
  url("/tools/emi-for-20-lakh-loan", "monthly", "0.6", TODAY),
  url("/tools/emi-for-50-lakh-loan", "monthly", "0.6", TODAY),
  url("/tools/emi-for-3-lakh-loan", "monthly", "0.6", TODAY),
  /* Programmatic — Compound Interest / SIP */
  url("/tools/compound-interest-on-1000-monthly", "monthly", "0.6", TODAY),
  url("/tools/compound-interest-on-5000-monthly", "monthly", "0.6", TODAY),
  url("/tools/compound-interest-on-10000-monthly", "monthly", "0.6", TODAY),
  url("/tools/sip-calculator-5000-per-month", "monthly", "0.6", TODAY),
  url("/tools/sip-calculator-10000-per-month", "monthly", "0.6", TODAY),
  /* Programmatic — Image Converter */
  url("/tools/convert-png-to-jpg", "monthly", "0.6", TODAY),
  url("/tools/convert-jpg-to-png", "monthly", "0.6", TODAY),
  url("/tools/convert-png-to-webp", "monthly", "0.6", TODAY),
  url("/tools/convert-webp-to-jpg", "monthly", "0.6", TODAY),
  url("/tools/convert-webp-to-png", "monthly", "0.6", TODAY),
  url("/tools/convert-jpg-to-webp", "monthly", "0.6", TODAY),
  /* Programmatic — Password Generator */
  url("/tools/generate-16-character-password", "monthly", "0.6", TODAY),
  url("/tools/generate-32-character-password", "monthly", "0.6", TODAY),
  url("/tools/generate-wifi-password", "monthly", "0.6", TODAY),
  url("/tools/generate-pin-code", "monthly", "0.6", TODAY),
  /* Comparisons */
  url("/comparisons/best-credit-cards", "weekly", "0.7", TODAY),
  url("/comparisons/best-budgeting-apps", "weekly", "0.7", TODAY),
  url("/comparisons/best-investing-apps", "weekly", "0.7", TODAY),
  url("/comparisons/best-savings-accounts", "weekly", "0.7", TODAY),
  url("/comparisons/best-resume-builders", "weekly", "0.7", TODAY),
  url("/comparisons/best-ai-writing-tools", "weekly", "0.7", TODAY),
  url("/comparisons/best-ai-background-remover-tools", "weekly", "0.7", TODAY),
  url("/comparisons/best-image-resizer-tools", "weekly", "0.7", TODAY),
  url("/comparisons/best-pdf-converters", "weekly", "0.7", TODAY),
  url("/comparisons/best-pdf-editors", "weekly", "0.7", TODAY),
  url("/comparisons/best-password-managers", "weekly", "0.7", TODAY),
  url("/comparisons/best-qr-code-generators", "weekly", "0.7", TODAY),
  url("/comparisons/best-color-palette-tools", "weekly", "0.7", TODAY),
  url("/comparisons/best-markdown-editors", "weekly", "0.7", TODAY),
  url("/comparisons/best-mortgage-calculators", "weekly", "0.7", TODAY),
  url("/comparisons/best-seo-audit-tools", "weekly", "0.7", TODAY),
  /* Guides */
  url("/guides/how-to-remove-image-background", "monthly", "0.8", TODAY),
  url("/guides/how-to-compress-pdf", "monthly", "0.8", TODAY),
  url("/guides/how-to-merge-pdf-files", "monthly", "0.8", TODAY),
  url("/guides/how-currency-conversion-works", "monthly", "0.8", TODAY),
  url("/guides/compound-interest-explained", "monthly", "0.8", TODAY),
  url("/guides/how-loan-emi-works", "monthly", "0.8", TODAY),
  url("/guides/how-to-compare-credit-cards", "monthly", "0.8", TODAY),
  url("/guides/how-to-choose-a-resume-builder", "monthly", "0.8", TODAY),
  url("/guides/how-to-choose-ai-writing-tools", "monthly", "0.8", TODAY),
  url("/guides/how-mortgage-calculators-work", "monthly", "0.8", TODAY),
  url("/guides/how-to-create-strong-passwords", "monthly", "0.8", TODAY),
  url("/guides/how-to-use-qr-codes-effectively", "monthly", "0.8", TODAY),
  url("/guides/how-to-choose-a-color-palette", "monthly", "0.8", TODAY),
  url("/guides/how-to-write-markdown", "monthly", "0.8", TODAY),
  url("/guides/how-to-use-seo-analyzer", "monthly", "0.8", TODAY),
];

/* ─── Main ────────────────────────────────────────────────────────────── */
async function main() {
  const appRows = await fetchActiveAppIds();

  const dynamicUrls = appRows.map(({ id, updated_at }) =>
    url(`/community/app/${id}`, "weekly", "0.7", updated_at),
  );

  const totalUrls = STATIC_URLS.length + dynamicUrls.length;

  // Sitemap index split: Google allows max 50,000 URLs per sitemap file.
  // If we exceed that, we'd need a sitemap index — for now single file is fine.
  const sitemapContent = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!-- Generated: ${new Date().toISOString()} | ${totalUrls} URLs -->`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...STATIC_URLS,
    `<!-- ═══ Dynamic: ${dynamicUrls.length} app detail pages ═══ -->`,
    ...dynamicUrls,
    `</urlset>`,
  ].join("\n");

  const outPath = path.join(ROOT, "public", "sitemap.xml");
  fs.writeFileSync(outPath, sitemapContent, "utf8");

  console.log(`[sitemap] ✓ Written to ${outPath}`);
  console.log(`[sitemap] ✓ ${STATIC_URLS.length} static URLs + ${dynamicUrls.length} dynamic app pages = ${totalUrls} total`);
}

main().catch((err) => {
  console.error("[sitemap] error:", err);
  process.exit(1);
});
