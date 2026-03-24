#!/usr/bin/env node
/**
 * verify-assets.mjs — Pre-deploy integrity check
 *
 * Scans every HTML file in dist/ and verifies that each referenced
 * asset (/assets/*.js, /assets/*.css) actually exists on disk.
 *
 * Exit code 0 = all references valid, safe to deploy.
 * Exit code 1 = missing assets found, do NOT deploy.
 *
 * Usage:   node scripts/verify-assets.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");

/* ── Collect all HTML files recursively ──────────────────────────── */
function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

/* ── Extract /assets/* references from HTML ──────────────────────── */
function extractAssetRefs(html) {
  const refs = new Set();
  // Match src="/assets/..." and href="/assets/..."
  const pattern = /(?:src|href)="(\/assets\/[^"]+)"/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    refs.add(match[1]);
  }
  return refs;
}

/* ── Main ────────────────────────────────────────────────────────── */
function main() {
  if (!fs.existsSync(DIST)) {
    console.error("❌  dist/ folder not found. Run `npm run build` first.");
    process.exit(1);
  }

  console.log("🔍  Scanning dist/ for HTML files …\n");
  const htmlFiles = collectHtmlFiles(DIST);
  console.log(`    Found ${htmlFiles.length} HTML files\n`);

  const allRefs = new Map(); // asset path → set of HTML files that reference it
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const refs = extractAssetRefs(html);
    for (const ref of refs) {
      if (!allRefs.has(ref)) allRefs.set(ref, new Set());
      allRefs.get(ref).add(path.relative(DIST, file));
    }
  }

  console.log(`    Found ${allRefs.size} unique asset references\n`);

  const missing = [];
  for (const [assetPath, referencedBy] of allRefs) {
    const diskPath = path.join(DIST, assetPath);
    if (!fs.existsSync(diskPath)) {
      missing.push({ assetPath, referencedBy: [...referencedBy] });
    }
  }

  if (missing.length === 0) {
    console.log("✅  All asset references resolve to files in dist/.");
    console.log("    Safe to deploy.\n");

    // Summary stats
    const jsCount = [...allRefs.keys()].filter((r) => r.endsWith(".js")).length;
    const cssCount = [...allRefs.keys()].filter((r) => r.endsWith(".css")).length;
    const otherCount = allRefs.size - jsCount - cssCount;
    console.log(`    JS: ${jsCount}  |  CSS: ${cssCount}  |  Other: ${otherCount}`);
    console.log(`    HTML files checked: ${htmlFiles.length}\n`);
    process.exit(0);
  } else {
    console.error(`❌  ${missing.length} asset(s) referenced in HTML but MISSING from dist/:\n`);
    for (const { assetPath, referencedBy } of missing) {
      console.error(`    ${assetPath}`);
      console.error(`      ← referenced by: ${referencedBy.slice(0, 3).join(", ")}${referencedBy.length > 3 ? ` (+${referencedBy.length - 3} more)` : ""}`);
    }
    console.error("\n    ⚠️  DO NOT DEPLOY. Rebuild with `npm run build` and try again.\n");
    process.exit(1);
  }
}

main();
