/**
 * Central brand registry — maps every brand used in comparison pages
 * to its official colours and a URL-safe slug.
 *
 * The slug is used to resolve the local SVG tile in /images/brands/{slug}.svg.
 */

export interface BrandEntry {
  /** URL-safe slug, used as filename: /images/brands/{slug}.svg */
  slug: string;
  /** Display name (used as alt text + fallback) */
  name: string;
  /** Short abbreviation (1–4 chars, used inside the visual tile) */
  abbr: string;
  /** Primary brand colour (hex) */
  color1: string;
  /** Secondary / gradient-end colour (hex) */
  color2: string;
}

/** Lookup a brand entry by its display name (case-insensitive). */
export function getBrand(name: string): BrandEntry {
  const key = name.toLowerCase().trim();
  return BRAND_MAP.get(key) ?? createFallback(name);
}

/** Build a fallback entry for unknown brands. */
function createFallback(name: string): BrandEntry {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const words = name.split(/[\s\-()®™]+/).filter(Boolean);
  const abbr =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  return { slug, name, abbr, color1: "#6366f1", color2: "#4f46e5" };
}

/* ════════════════════════════════════════════════════════════════════ */
/*  Brand database                                                     */
/* ════════════════════════════════════════════════════════════════════ */

const entries: BrandEntry[] = [
  // ── Credit Cards (by issuer) ──────────────────────────────────────
  { slug: "chase",            name: "Chase",            abbr: "CH",  color1: "#0d62fe", color2: "#003087" },
  { slug: "citi",             name: "Citi",             abbr: "CI",  color1: "#003B70", color2: "#002855" },
  { slug: "american-express", name: "American Express",  abbr: "AX",  color1: "#006FCF", color2: "#004080" },
  { slug: "capital-one",      name: "Capital One",       abbr: "C1",  color1: "#D03027", color2: "#A31E22" },
  { slug: "discover",         name: "Discover",          abbr: "DI",  color1: "#FF6000", color2: "#D45000" },
  { slug: "wells-fargo",      name: "Wells Fargo",       abbr: "WF",  color1: "#CD1409", color2: "#9E0A02" },

  // ── Savings Accounts ──────────────────────────────────────────────
  { slug: "marcus",           name: "Marcus by Goldman Sachs", abbr: "GS", color1: "#6EAADC", color2: "#1E6BB8" },
  { slug: "sofi",             name: "SoFi Checking & Savings", abbr: "SF", color1: "#00C9A8", color2: "#00A386" },
  { slug: "ally",             name: "Ally Bank Online Savings", abbr: "AL", color1: "#7B2D8E", color2: "#5A1F6A" },
  { slug: "wealthfront",      name: "Wealthfront Cash Account", abbr: "WF", color1: "#472EC4", color2: "#341FA0" },
  { slug: "discover-savings",name: "Discover Online Savings", abbr: "DI", color1: "#FF6000", color2: "#D45000" },
  { slug: "barclays",         name: "Barclays Online Savings", abbr: "BC", color1: "#00AEEF", color2: "#0085BD" },
  { slug: "amex-savings",     name: "American Express High Yield Savings", abbr: "AX", color1: "#006FCF", color2: "#004080" },
  { slug: "cit-bank",         name: "CIT Bank Platinum Savings", abbr: "CT", color1: "#592C82", color2: "#3D1D5A" },
  { slug: "capital-one-360",  name: "Capital One 360 Performance Savings", abbr: "C1", color1: "#D03027", color2: "#A31E22" },
  { slug: "synchrony",        name: "Synchrony High Yield Savings", abbr: "SY", color1: "#0060AF", color2: "#003E73" },

  // ── Budgeting Apps ────────────────────────────────────────────────
  { slug: "ynab",             name: "YNAB (You Need a Budget)", abbr: "YN", color1: "#85C3E9", color2: "#2B8FD4" },
  { slug: "monarch-money",    name: "Monarch Money",     abbr: "MM",  color1: "#1E3A5F", color2: "#0F2440" },
  { slug: "goodbudget",       name: "Goodbudget",         abbr: "GB",  color1: "#4CAF50", color2: "#2E7D32" },
  { slug: "pocketguard",      name: "PocketGuard",        abbr: "PG",  color1: "#28BFA6", color2: "#1A9E8A" },
  { slug: "everydollar",      name: "EveryDollar",        abbr: "ED",  color1: "#00B2A9", color2: "#008F88" },
  { slug: "simplifi",         name: "Simplifi by Quicken", abbr: "SQ", color1: "#E4572E", color2: "#C73D18" },
  { slug: "copilot-money",    name: "Copilot Money",      abbr: "CP",  color1: "#6C63FF", color2: "#4F46E5" },
  { slug: "honeydue",         name: "Honeydue",           abbr: "HD",  color1: "#F6B93B", color2: "#E09E18" },
  { slug: "wally",            name: "Wally",              abbr: "WA",  color1: "#FF5252", color2: "#D43D3D" },
  { slug: "mint",             name: "Mint (by Intuit)",   abbr: "MT",  color1: "#3EB489", color2: "#2A8F6B" },

  // ── Investing Apps ────────────────────────────────────────────────
  { slug: "fidelity",         name: "Fidelity Investments", abbr: "FI", color1: "#4B8B3B", color2: "#356929" },
  { slug: "schwab",           name: "Charles Schwab",     abbr: "CS",  color1: "#00A0DF", color2: "#007AB8" },
  { slug: "robinhood",        name: "Robinhood",          abbr: "RH",  color1: "#00C805", color2: "#00A004" },
  { slug: "vanguard",         name: "Vanguard",           abbr: "VG",  color1: "#822029", color2: "#5E161D" },
  { slug: "betterment",       name: "Betterment",         abbr: "BT",  color1: "#1E88E5", color2: "#1565C0" },
  { slug: "webull",           name: "Webull",             abbr: "WB",  color1: "#E5302F", color2: "#B8201F" },
  { slug: "etrade",           name: "E*TRADE (Morgan Stanley)", abbr: "ET", color1: "#6633CC", color2: "#4A22A0" },
  { slug: "wealthfront-inv",  name: "Wealthfront",        abbr: "WF",  color1: "#472EC4", color2: "#341FA0" },
  { slug: "sofi-invest",      name: "SoFi Invest",        abbr: "SF",  color1: "#00C9A8", color2: "#00A386" },
  { slug: "acorns",           name: "Acorns",             abbr: "AC",  color1: "#00B386", color2: "#008C6A" },

  // ── Resume Builders ───────────────────────────────────────────────
  { slug: "teal",             name: "Teal",               abbr: "TL",  color1: "#02B5A0", color2: "#018F7F" },
  { slug: "zety",             name: "Zety",               abbr: "ZE",  color1: "#1A73E8", color2: "#1457B3" },
  { slug: "canva-resume",     name: "Canva Resume Builder", abbr: "CA", color1: "#00C4CC", color2: "#009DA3" },
  { slug: "resume-io",        name: "Resume.io",          abbr: "RI",  color1: "#3B5BDB", color2: "#2E4AAE" },
  { slug: "novoresume",       name: "Novoresume",         abbr: "NR",  color1: "#343A40", color2: "#1D2328" },
  { slug: "kickresume",       name: "Kickresume",         abbr: "KR",  color1: "#2ECC71", color2: "#22A75B" },
  { slug: "resumegenius",     name: "ResumeGenius",       abbr: "RG",  color1: "#FF6B35", color2: "#D9521F" },
  { slug: "visualcv",         name: "VisualCV",           abbr: "VC",  color1: "#4A90D9", color2: "#356DAE" },
  { slug: "enhancv",          name: "Enhancv",            abbr: "EN",  color1: "#5C6BC0", color2: "#3F4FA5" },
  { slug: "indeed-resume",    name: "Indeed Resume Builder", abbr: "IN", color1: "#2164F3", color2: "#1A4EC0" },

  // ── AI Writing Tools ──────────────────────────────────────────────
  { slug: "jasper",           name: "Jasper",             abbr: "JA",  color1: "#FF6154", color2: "#D94A3E" },
  { slug: "grammarly",        name: "Grammarly",          abbr: "GR",  color1: "#15C39A", color2: "#0FA37E" },
  { slug: "chatgpt",          name: "ChatGPT (OpenAI)",   abbr: "AI",  color1: "#10A37F", color2: "#0D8466" },
  { slug: "copy-ai",          name: "Copy.ai",            abbr: "CP",  color1: "#7C3AED", color2: "#5B21B6" },
  { slug: "writesonic",       name: "Writesonic",         abbr: "WS",  color1: "#6D28D9", color2: "#4C1D95" },
  { slug: "notion-ai",        name: "Notion AI",          abbr: "NA",  color1: "#000000", color2: "#333333" },
  { slug: "rytr",             name: "Rytr",               abbr: "RY",  color1: "#6C63FF", color2: "#4F46E5" },
  { slug: "wordtune",         name: "Wordtune",           abbr: "WT",  color1: "#FF4B4B", color2: "#D93838" },
  { slug: "anyword",          name: "Anyword",            abbr: "AW",  color1: "#0066FF", color2: "#004FCC" },
  { slug: "claude",           name: "Claude (Anthropic)",  abbr: "CL",  color1: "#D4A574", color2: "#B88A5A" },

  // ── AI Background Removers ────────────────────────────────────────
  { slug: "removebg",         name: "remove.bg",          abbr: "BG",  color1: "#2C6FED", color2: "#1A52C0" },
  { slug: "canva-bg",         name: "Canva Background Remover", abbr: "CA", color1: "#00C4CC", color2: "#009DA3" },
  { slug: "adobe-express",    name: "Adobe Express Background Remover", abbr: "AE", color1: "#FF0000", color2: "#CC0000" },
  { slug: "photoroom",        name: "PhotoRoom",          abbr: "PR",  color1: "#5856D6", color2: "#4240AB" },
  { slug: "clipdrop",         name: "Clipdrop (by Stability AI)", abbr: "CD", color1: "#FF6B6B", color2: "#D44B4B" },
  { slug: "fotor",            name: "Fotor",              abbr: "FO",  color1: "#38B6FF", color2: "#2690D0" },
  { slug: "pixlr",            name: "Pixlr",              abbr: "PX",  color1: "#15D6CE", color2: "#10ACA5" },
  { slug: "picsart",          name: "Picsart",            abbr: "PA",  color1: "#7B2FF7", color2: "#5F1FCA" },
  { slug: "slazzer",          name: "Slazzer",            abbr: "SL",  color1: "#00D084", color2: "#00A86B" },
  { slug: "removal-ai",       name: "Removal.AI",         abbr: "RA",  color1: "#4F46E5", color2: "#3730A3" },
];

/** Fast lookup by lowercase name */
const BRAND_MAP = new Map<string, BrandEntry>();
for (const e of entries) {
  BRAND_MAP.set(e.name.toLowerCase().trim(), e);
}
