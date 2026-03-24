/**
 * Generate SVG brand tiles for /public/images/brands/.
 * Run with: node scripts/generate-brand-svgs.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images", "brands");

mkdirSync(OUT, { recursive: true });

const brands = [
  // Credit Cards (by issuer)
  { slug: "chase",            abbr: "CH", name: "Chase",             c1: "#0d62fe", c2: "#003087" },
  { slug: "citi",             abbr: "CI", name: "Citi",              c1: "#003B70", c2: "#002855" },
  { slug: "american-express", abbr: "AX", name: "American Express",  c1: "#006FCF", c2: "#004080" },
  { slug: "capital-one",      abbr: "C1", name: "Capital One",       c1: "#D03027", c2: "#A31E22" },
  { slug: "discover",         abbr: "DI", name: "Discover",          c1: "#FF6000", c2: "#D45000" },
  { slug: "wells-fargo",      abbr: "WF", name: "Wells Fargo",       c1: "#CD1409", c2: "#9E0A02" },
  // Savings
  { slug: "marcus",           abbr: "GS", name: "Marcus",            c1: "#6EAADC", c2: "#1E6BB8" },
  { slug: "sofi",             abbr: "SF", name: "SoFi",              c1: "#00C9A8", c2: "#00A386" },
  { slug: "ally",             abbr: "AL", name: "Ally Bank",         c1: "#7B2D8E", c2: "#5A1F6A" },
  { slug: "wealthfront",      abbr: "WF", name: "Wealthfront",       c1: "#472EC4", c2: "#341FA0" },
  { slug: "discover-savings", abbr: "DI", name: "Discover",          c1: "#FF6000", c2: "#D45000" },
  { slug: "barclays",         abbr: "BC", name: "Barclays",          c1: "#00AEEF", c2: "#0085BD" },
  { slug: "amex-savings",     abbr: "AX", name: "Amex Savings",      c1: "#006FCF", c2: "#004080" },
  { slug: "cit-bank",         abbr: "CT", name: "CIT Bank",          c1: "#592C82", c2: "#3D1D5A" },
  { slug: "capital-one-360",  abbr: "C1", name: "Capital One 360",   c1: "#D03027", c2: "#A31E22" },
  { slug: "synchrony",        abbr: "SY", name: "Synchrony",         c1: "#0060AF", c2: "#003E73" },
  // Budgeting
  { slug: "ynab",             abbr: "YN", name: "YNAB",              c1: "#85C3E9", c2: "#2B8FD4" },
  { slug: "monarch-money",    abbr: "MM", name: "Monarch Money",     c1: "#1E3A5F", c2: "#0F2440" },
  { slug: "goodbudget",       abbr: "GB", name: "Goodbudget",        c1: "#4CAF50", c2: "#2E7D32" },
  { slug: "pocketguard",      abbr: "PG", name: "PocketGuard",       c1: "#28BFA6", c2: "#1A9E8A" },
  { slug: "everydollar",      abbr: "ED", name: "EveryDollar",       c1: "#00B2A9", c2: "#008F88" },
  { slug: "simplifi",         abbr: "SQ", name: "Simplifi",          c1: "#E4572E", c2: "#C73D18" },
  { slug: "copilot-money",    abbr: "CP", name: "Copilot Money",     c1: "#6C63FF", c2: "#4F46E5" },
  { slug: "honeydue",         abbr: "HD", name: "Honeydue",          c1: "#F6B93B", c2: "#E09E18" },
  { slug: "wally",            abbr: "WA", name: "Wally",             c1: "#FF5252", c2: "#D43D3D" },
  { slug: "mint",             abbr: "MT", name: "Mint",              c1: "#3EB489", c2: "#2A8F6B" },
  // Investing
  { slug: "fidelity",         abbr: "FI", name: "Fidelity",          c1: "#4B8B3B", c2: "#356929" },
  { slug: "schwab",           abbr: "CS", name: "Charles Schwab",    c1: "#00A0DF", c2: "#007AB8" },
  { slug: "robinhood",        abbr: "RH", name: "Robinhood",         c1: "#00C805", c2: "#00A004" },
  { slug: "vanguard",         abbr: "VG", name: "Vanguard",          c1: "#822029", c2: "#5E161D" },
  { slug: "betterment",       abbr: "BT", name: "Betterment",        c1: "#1E88E5", c2: "#1565C0" },
  { slug: "webull",           abbr: "WB", name: "Webull",            c1: "#E5302F", c2: "#B8201F" },
  { slug: "etrade",           abbr: "ET", name: "E*TRADE",           c1: "#6633CC", c2: "#4A22A0" },
  { slug: "wealthfront-inv",  abbr: "WF", name: "Wealthfront",       c1: "#472EC4", c2: "#341FA0" },
  { slug: "sofi-invest",      abbr: "SF", name: "SoFi Invest",       c1: "#00C9A8", c2: "#00A386" },
  { slug: "acorns",           abbr: "AC", name: "Acorns",            c1: "#00B386", c2: "#008C6A" },
  // Resume Builders
  { slug: "teal",             abbr: "TL", name: "Teal",              c1: "#02B5A0", c2: "#018F7F" },
  { slug: "zety",             abbr: "ZE", name: "Zety",              c1: "#1A73E8", c2: "#1457B3" },
  { slug: "canva-resume",     abbr: "CA", name: "Canva",             c1: "#00C4CC", c2: "#009DA3" },
  { slug: "resume-io",        abbr: "RI", name: "Resume.io",         c1: "#3B5BDB", c2: "#2E4AAE" },
  { slug: "novoresume",       abbr: "NR", name: "Novoresume",        c1: "#343A40", c2: "#1D2328" },
  { slug: "kickresume",       abbr: "KR", name: "Kickresume",        c1: "#2ECC71", c2: "#22A75B" },
  { slug: "resumegenius",     abbr: "RG", name: "ResumeGenius",      c1: "#FF6B35", c2: "#D9521F" },
  { slug: "visualcv",         abbr: "VC", name: "VisualCV",          c1: "#4A90D9", c2: "#356DAE" },
  { slug: "enhancv",          abbr: "EN", name: "Enhancv",           c1: "#5C6BC0", c2: "#3F4FA5" },
  { slug: "indeed-resume",    abbr: "IN", name: "Indeed",            c1: "#2164F3", c2: "#1A4EC0" },
  // AI Writing
  { slug: "jasper",           abbr: "JA", name: "Jasper",            c1: "#FF6154", c2: "#D94A3E" },
  { slug: "grammarly",        abbr: "GR", name: "Grammarly",         c1: "#15C39A", c2: "#0FA37E" },
  { slug: "chatgpt",          abbr: "AI", name: "ChatGPT",           c1: "#10A37F", c2: "#0D8466" },
  { slug: "copy-ai",          abbr: "CP", name: "Copy.ai",           c1: "#7C3AED", c2: "#5B21B6" },
  { slug: "writesonic",       abbr: "WS", name: "Writesonic",        c1: "#6D28D9", c2: "#4C1D95" },
  { slug: "notion-ai",        abbr: "NA", name: "Notion AI",         c1: "#000000", c2: "#333333" },
  { slug: "rytr",             abbr: "RY", name: "Rytr",              c1: "#6C63FF", c2: "#4F46E5" },
  { slug: "wordtune",         abbr: "WT", name: "Wordtune",          c1: "#FF4B4B", c2: "#D93838" },
  { slug: "anyword",          abbr: "AW", name: "Anyword",           c1: "#0066FF", c2: "#004FCC" },
  { slug: "claude",           abbr: "CL", name: "Claude",            c1: "#D4A574", c2: "#B88A5A" },
  // AI BG Removers
  { slug: "removebg",         abbr: "BG", name: "remove.bg",         c1: "#2C6FED", c2: "#1A52C0" },
  { slug: "canva-bg",         abbr: "CA", name: "Canva",             c1: "#00C4CC", c2: "#009DA3" },
  { slug: "adobe-express",    abbr: "AE", name: "Adobe Express",     c1: "#FF0000", c2: "#CC0000" },
  { slug: "photoroom",        abbr: "PR", name: "PhotoRoom",         c1: "#5856D6", c2: "#4240AB" },
  { slug: "clipdrop",         abbr: "CD", name: "Clipdrop",          c1: "#FF6B6B", c2: "#D44B4B" },
  { slug: "fotor",            abbr: "FO", name: "Fotor",             c1: "#38B6FF", c2: "#2690D0" },
  { slug: "pixlr",            abbr: "PX", name: "Pixlr",             c1: "#15D6CE", c2: "#10ACA5" },
  { slug: "picsart",          abbr: "PA", name: "Picsart",           c1: "#7B2FF7", c2: "#5F1FCA" },
  { slug: "slazzer",          abbr: "SL", name: "Slazzer",           c1: "#00D084", c2: "#00A86B" },
  { slug: "removal-ai",       abbr: "RA", name: "Removal.AI",        c1: "#4F46E5", c2: "#3730A3" },
];

function svg({ slug, abbr, name, c1, c2 }) {
  const displayName = name.length > 18 ? name.slice(0, 16) + "…" : name;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="24" fill="url(#g)"/>
  <rect x="30" y="52" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
  <text x="100" y="112" text-anchor="middle" dominant-baseline="central" fill="white" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="56" letter-spacing="2">${abbr}</text>
  <text x="100" y="168" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui,-apple-system,sans-serif" font-weight="500" font-size="14" letter-spacing="0.5">${displayName}</text>
</svg>`;
}

let count = 0;
for (const b of brands) {
  writeFileSync(join(OUT, `${b.slug}.svg`), svg(b), "utf8");
  count++;
}
console.log(`✓ Generated ${count} brand SVGs in ${OUT}`);
