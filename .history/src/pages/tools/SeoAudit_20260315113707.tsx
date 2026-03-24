import { useState, useCallback, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Search, Copy, Check, RotateCcw, Download, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Info, Globe, FileText, Code2, BarChart3, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

/* ─── FAQ ─── */
const faqItems = [
  { question: "How does the SEO audit work?", answer: "We fetch your page HTML via a CORS proxy (or directly for localhost), then parse it in-browser to evaluate 40+ SEO factors across six categories: Technical SEO, On-Page SEO, Content SEO, Structured Data, Performance Signals, and Growth Readiness." },
  { question: "Does this tool work for localhost?", answer: "Yes. Enter http://localhost:3000 (or any port) and the tool will attempt a direct fetch. If your dev server allows it, the audit runs without a proxy." },
  { question: "Is my website data stored?", answer: "No. Everything runs in your browser. The HTML is fetched, analyzed in memory, and discarded when you close the tab. Nothing is sent to our servers." },
  { question: "Why might some checks fail?", answer: "If the site blocks CORS requests, some resources like robots.txt or sitemap.xml may be unreachable from the browser. The tool notes these as 'unable to verify' rather than failures." },
  { question: "How accurate is the score?", answer: "The score provides a practical estimate similar to professional tools like Ahrefs or SEMrush. It evaluates what's visible from the HTML source. For a deeper audit, consider server-side crawling tools." },
];

const relatedGuides: { title: string; path: string }[] = [];
const relatedComparisons: { title: string; path: string }[] = [];

/* ─── Types ─── */
interface CheckResult {
  name: string;
  passed: boolean;
  score: number;
  maxScore: number;
  detail: string;
  suggestion?: string;
}

interface CategoryResult {
  name: string;
  icon: typeof Globe;
  color: string;
  checks: CheckResult[];
  score: number;
  maxScore: number;
}

interface AuditReport {
  url: string;
  timestamp: string;
  categories: CategoryResult[];
  totalScore: number;
  summary: string;
  rankingReadiness: string;
  trafficPotential: string;
}

/* ─── Helpers ─── */
function isLocalhost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "::1";
  } catch { return false; }
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Excellent SEO", color: "#22c55e" };
  if (score >= 75) return { text: "Strong SEO", color: "#84cc16" };
  if (score >= 60) return { text: "Moderate SEO", color: "#eab308" };
  if (score >= 40) return { text: "Weak SEO", color: "#f97316" };
  return { text: "Critical Issues", color: "#ef4444" };
}

function catColor(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.85) return "#22c55e";
  if (pct >= 0.65) return "#eab308";
  return "#ef4444";
}

function catEmoji(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.85) return "🟢";
  if (pct >= 0.65) return "🟡";
  return "🔴";
}

/* ─── HTML Parser Helpers ─── */
function getTagContent(html: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function getMetaContent(html: string, nameOrProperty: string): string {
  const re = new RegExp(`<meta[^>]*(?:name|property)=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["']`, "i");
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProperty}["']`, "i");
  const m2 = html.match(re2);
  return m2 ? m2[1] : "";
}

function countTags(html: string, tag: string): number {
  const re = new RegExp(`<${tag}[\\s>]`, "gi");
  return (html.match(re) || []).length;
}

function getAllTags(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const results: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) results.push(m[1].trim());
  return results;
}

function getImgTags(html: string): { src: string; alt: string }[] {
  const re = /<img[^>]*>/gi;
  const imgs: { src: string; alt: string }[] = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const srcM = tag.match(/src=["']([^"']*?)["']/i);
    const altM = tag.match(/alt=["']([^"']*?)["']/i);
    imgs.push({ src: srcM ? srcM[1] : "", alt: altM ? altM[1] : "" });
  }
  return imgs;
}

function getInternalLinks(html: string, baseHost: string): string[] {
  const re = /href=["']([^"'#]*?)["']/gi;
  const links: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (href.startsWith("/") || href.includes(baseHost)) links.push(href);
  }
  return [...new Set(links)];
}

function getJsonLdScripts(html: string): string[] {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const results: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) results.push(m[1].trim());
  return results;
}

function getScriptTags(html: string): string[] {
  const re = /<script[^>]*src=["']([^"']*?)["'][^>]*>/gi;
  const results: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) results.push(m[1]);
  return results;
}

function getStylesheetTags(html: string): string[] {
  const re = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*?)["'][^>]*>/gi;
  const results: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) results.push(m[1]);
  return results;
}

function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/* ─── Fetch helpers ─── */
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

async function fetchPage(url: string): Promise<string> {
  // Try direct fetch first (works for localhost and CORS-enabled sites)
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) return await res.text();
  } catch { /* fall through to proxies */ }

  if (isLocalhost(url)) {
    throw new Error("Could not reach localhost. Make sure your dev server is running and allows cross-origin requests.");
  }

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(15000) });
      if (res.ok) return await res.text();
    } catch { /* try next */ }
  }
  throw new Error("Could not fetch the website. The site may block automated requests or all proxy services are unavailable.");
}

async function checkResourceExists(url: string, resourcePath: string): Promise<boolean> {
  const base = new URL(url);
  const resourceUrl = `${base.origin}${resourcePath}`;
  try {
    const res = await fetch(isLocalhost(url) ? resourceUrl : CORS_PROXIES[0](resourceUrl), { signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch { return false; }
}

async function fetchResourceText(url: string, resourcePath: string): Promise<string | null> {
  const base = new URL(url);
  const resourceUrl = `${base.origin}${resourcePath}`;
  try {
    const res = await fetch(isLocalhost(url) ? resourceUrl : CORS_PROXIES[0](resourceUrl), { signal: AbortSignal.timeout(8000) });
    if (res.ok) return await res.text();
    return null;
  } catch { return null; }
}

/* ─── Audit Engine ─── */
async function runAuditEngine(url: string, onProgress: (pct: number, msg: string) => void): Promise<AuditReport> {
  onProgress(5, "Fetching page HTML…");
  const html = await fetchPage(url);
  const host = new URL(url).hostname;

  onProgress(15, "Checking robots.txt & sitemap…");
  const robotsExists = await checkResourceExists(url, "/robots.txt");
  const robotsTxt = robotsExists ? await fetchResourceText(url, "/robots.txt") : null;
  const sitemapExists = await checkResourceExists(url, "/sitemap.xml");
  const sitemapTxt = sitemapExists ? await fetchResourceText(url, "/sitemap.xml") : null;

  onProgress(30, "Analyzing technical SEO…");

  /* ── 1. Technical SEO (25 pts) ── */
  const techChecks: CheckResult[] = [];
  
  techChecks.push({ name: "robots.txt exists", passed: robotsExists, score: robotsExists ? 2 : 0, maxScore: 2, detail: robotsExists ? "robots.txt found" : "No robots.txt detected", suggestion: robotsExists ? undefined : "Create a robots.txt file in your site root to guide search engine crawlers." });

  const robotsAllows = robotsTxt ? !robotsTxt.includes("Disallow: /\n") && !robotsTxt.includes("Disallow: / \n") : false;
  techChecks.push({ name: "Robots allows crawling", passed: robotsExists ? robotsAllows : false, score: (robotsExists && robotsAllows) ? 3 : 0, maxScore: 3, detail: !robotsExists ? "No robots.txt to evaluate" : robotsAllows ? "Crawling is allowed" : "robots.txt blocks crawling with 'Disallow: /'", suggestion: !robotsAllows ? "Ensure your robots.txt allows search engines to crawl important pages." : undefined });

  techChecks.push({ name: "sitemap.xml exists", passed: sitemapExists, score: sitemapExists ? 3 : 0, maxScore: 3, detail: sitemapExists ? "sitemap.xml found" : "No sitemap.xml detected", suggestion: sitemapExists ? undefined : "Add a sitemap.xml to help search engines discover all your pages." });

  const sitemapHasUrls = sitemapTxt ? (sitemapTxt.match(/<loc>/gi) || []).length > 0 : false;
  const sitemapUrlCount = sitemapTxt ? (sitemapTxt.match(/<loc>/gi) || []).length : 0;
  techChecks.push({ name: "Sitemap contains valid URLs", passed: sitemapHasUrls, score: sitemapHasUrls ? 3 : 0, maxScore: 3, detail: sitemapHasUrls ? `Sitemap contains ${sitemapUrlCount} URLs` : "Sitemap is empty or invalid", suggestion: !sitemapHasUrls ? "Ensure your sitemap lists all important pages with <loc> tags." : undefined });

  const isHttps = url.startsWith("https://") || isLocalhost(url);
  techChecks.push({ name: "HTTPS enabled", passed: isHttps, score: isHttps ? 3 : 0, maxScore: 3, detail: isHttps ? "Site uses HTTPS" : "Site is not using HTTPS", suggestion: !isHttps ? "Migrate to HTTPS. Google uses HTTPS as a ranking signal." : undefined });

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const hasCanonical = !!canonicalMatch;
  techChecks.push({ name: "Canonical tag exists", passed: hasCanonical, score: hasCanonical ? 3 : 0, maxScore: 3, detail: hasCanonical ? `Canonical: ${canonicalMatch![1]}` : "No canonical tag found", suggestion: !hasCanonical ? "Add a <link rel='canonical'> tag to prevent duplicate content issues." : undefined });

  const hasNoindex = /meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  techChecks.push({ name: "No noindex blocking", passed: !hasNoindex, score: !hasNoindex ? 3 : 0, maxScore: 3, detail: hasNoindex ? "Page has noindex directive — it won't be indexed" : "Page is indexable", suggestion: hasNoindex ? "Remove the noindex directive if you want this page to appear in search results." : undefined });

  const statusOk = html.length > 100;
  techChecks.push({ name: "Valid HTTP response", passed: statusOk, score: statusOk ? 2 : 0, maxScore: 2, detail: statusOk ? "Page returned valid HTML content" : "Page content appears empty or minimal", suggestion: !statusOk ? "Ensure the page returns a proper 200 response with content." : undefined });

  const brokenLinkCheck = getInternalLinks(html, host).length > 0;
  techChecks.push({ name: "Crawlable internal links", passed: brokenLinkCheck, score: brokenLinkCheck ? 3 : 0, maxScore: 3, detail: brokenLinkCheck ? `Found ${getInternalLinks(html, host).length} internal links` : "No internal links found", suggestion: !brokenLinkCheck ? "Add internal links to help search engines discover other pages on your site." : undefined });

  onProgress(45, "Analyzing on-page SEO…");

  /* ── 2. On-Page SEO (25 pts) ── */
  const onPageChecks: CheckResult[] = [];

  const title = getTagContent(html, "title");
  onPageChecks.push({ name: "Title tag exists", passed: !!title, score: title ? 4 : 0, maxScore: 4, detail: title ? `Title: "${title}"` : "No <title> tag found", suggestion: !title ? "Add a descriptive <title> tag. It's the most important on-page SEO element." : undefined });

  const titleLen = title.length;
  const titleOptimal = titleLen >= 30 && titleLen <= 65;
  onPageChecks.push({ name: "Title length optimized", passed: titleOptimal, score: titleOptimal ? 2 : (titleLen > 0 ? 1 : 0), maxScore: 2, detail: titleLen > 0 ? `Title length: ${titleLen} characters (optimal: 30–65)` : "No title to evaluate", suggestion: !titleOptimal && titleLen > 0 ? `Adjust your title length to 30–65 characters. Current: ${titleLen}.` : undefined });

  const metaDesc = getMetaContent(html, "description");
  onPageChecks.push({ name: "Meta description exists", passed: !!metaDesc, score: metaDesc ? 3 : 0, maxScore: 3, detail: metaDesc ? `Description: "${metaDesc.slice(0, 120)}${metaDesc.length > 120 ? "…" : ""}"` : "No meta description found", suggestion: !metaDesc ? "Add a <meta name='description'> tag with a compelling 120–160 character summary." : undefined });

  const descLen = metaDesc.length;
  const descOptimal = descLen >= 120 && descLen <= 160;
  onPageChecks.push({ name: "Meta description optimized", passed: descOptimal, score: descOptimal ? 2 : (descLen > 0 ? 1 : 0), maxScore: 2, detail: descLen > 0 ? `Description length: ${descLen} chars (optimal: 120–160)` : "No description to evaluate", suggestion: !descOptimal && descLen > 0 ? `Adjust description to 120–160 characters. Current: ${descLen}.` : undefined });

  const h1Count = countTags(html, "h1");
  onPageChecks.push({ name: "H1 tag present", passed: h1Count === 1, score: h1Count === 1 ? 3 : (h1Count > 0 ? 1 : 0), maxScore: 3, detail: h1Count === 0 ? "No H1 tag found" : h1Count === 1 ? `H1: "${getAllTags(html, "h1")[0]?.slice(0, 80)}"` : `${h1Count} H1 tags found (should be exactly 1)`, suggestion: h1Count === 0 ? "Add one H1 tag per page with your primary keyword." : h1Count > 1 ? "Use only one H1 tag per page." : undefined });

  const h2Count = countTags(html, "h2");
  const h3Count = countTags(html, "h3");
  const headingHierarchy = h1Count >= 1 && h2Count >= 1;
  onPageChecks.push({ name: "Heading hierarchy correct", passed: headingHierarchy, score: headingHierarchy ? 3 : (h1Count >= 1 ? 1 : 0), maxScore: 3, detail: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`, suggestion: !headingHierarchy ? "Use a proper heading hierarchy: one H1, followed by H2s and H3s to structure content." : undefined });

  const imgs = getImgTags(html);
  const imgsWithAlt = imgs.filter(i => i.alt.length > 0);
  const altPct = imgs.length > 0 ? imgsWithAlt.length / imgs.length : 1;
  onPageChecks.push({ name: "Image alt text present", passed: altPct >= 0.8, score: altPct >= 0.8 ? 3 : Math.round(altPct * 3), maxScore: 3, detail: imgs.length === 0 ? "No images found" : `${imgsWithAlt.length}/${imgs.length} images have alt text`, suggestion: altPct < 0.8 ? "Add descriptive alt text to all images for accessibility and SEO." : undefined });

  const ogTitle = getMetaContent(html, "og:title");
  const ogDesc = getMetaContent(html, "og:description");
  const ogImage = getMetaContent(html, "og:image");
  const hasOg = !!(ogTitle && ogDesc);
  onPageChecks.push({ name: "OpenGraph tags", passed: hasOg, score: hasOg ? 2 : (ogTitle ? 1 : 0), maxScore: 2, detail: hasOg ? `OG title, description${ogImage ? ", image" : ""} present` : "Missing OpenGraph metadata", suggestion: !hasOg ? "Add og:title, og:description, and og:image meta tags for social media sharing." : undefined });

  const twCard = getMetaContent(html, "twitter:card");
  onPageChecks.push({ name: "Twitter card metadata", passed: !!twCard, score: twCard ? 1 : 0, maxScore: 1, detail: twCard ? `Twitter card: ${twCard}` : "No Twitter card meta tag", suggestion: !twCard ? "Add <meta name='twitter:card'> for better Twitter/X previews." : undefined });

  const internalLinks = getInternalLinks(html, host);
  const hasInternalLinks = internalLinks.length >= 3;
  onPageChecks.push({ name: "Internal linking", passed: hasInternalLinks, score: hasInternalLinks ? 2 : (internalLinks.length > 0 ? 1 : 0), maxScore: 2, detail: `${internalLinks.length} internal links found`, suggestion: !hasInternalLinks ? "Add more internal links to help users and crawlers navigate your site." : undefined });

  onProgress(60, "Analyzing content…");

  /* ── 3. Content SEO (20 pts) ── */
  const contentChecks: CheckResult[] = [];
  const bodyText = stripHtml(html);
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  const goodLength = wordCount >= 300;
  contentChecks.push({ name: "Content length", passed: goodLength, score: goodLength ? 4 : (wordCount >= 100 ? 2 : 0), maxScore: 4, detail: `${wordCount} words (recommended: 300+)`, suggestion: !goodLength ? "Increase page content to at least 300 words for better ranking potential." : undefined });

  const titleLower = title.toLowerCase();
  const h1Text = getAllTags(html, "h1")[0]?.toLowerCase() || "";
  const descLower = metaDesc.toLowerCase();
  // Extract likely keywords from title (words > 3 chars)
  const titleWords = titleLower.split(/\W+/).filter(w => w.length > 3);
  const primaryKeyword = titleWords[0] || "";

  const kwInTitle = primaryKeyword ? titleLower.includes(primaryKeyword) : false;
  contentChecks.push({ name: "Keyword in title", passed: kwInTitle, score: kwInTitle ? 3 : 0, maxScore: 3, detail: primaryKeyword ? `Primary keyword "${primaryKeyword}" ${kwInTitle ? "found" : "not found"} in title` : "Could not determine primary keyword", suggestion: !kwInTitle ? "Include your target keyword in the page title." : undefined });

  const kwInDesc = primaryKeyword ? descLower.includes(primaryKeyword) : false;
  contentChecks.push({ name: "Keyword in description", passed: kwInDesc, score: kwInDesc ? 2 : 0, maxScore: 2, detail: primaryKeyword ? `Primary keyword "${primaryKeyword}" ${kwInDesc ? "found" : "not found"} in description` : "No keyword to check", suggestion: !kwInDesc ? "Include your target keyword in the meta description." : undefined });

  const kwInH1 = primaryKeyword ? h1Text.includes(primaryKeyword) : false;
  contentChecks.push({ name: "Keyword in H1", passed: kwInH1, score: kwInH1 ? 2 : 0, maxScore: 2, detail: primaryKeyword ? `Primary keyword "${primaryKeyword}" ${kwInH1 ? "found" : "not found"} in H1` : "No keyword or H1 to check", suggestion: !kwInH1 ? "Include your target keyword in the H1 heading." : undefined });

  const uniqueContent = wordCount > 50;
  contentChecks.push({ name: "Content uniqueness", passed: uniqueContent, score: uniqueContent ? 4 : (wordCount > 20 ? 2 : 0), maxScore: 4, detail: uniqueContent ? "Page has substantial unique content" : "Page has very little content — may be flagged as thin", suggestion: !uniqueContent ? "Add more original, valuable content to differentiate from other pages." : undefined });

  const hasFaqSection = /faq|frequently\s+asked|common\s+questions/i.test(html);
  contentChecks.push({ name: "FAQ or helpful sections", passed: hasFaqSection, score: hasFaqSection ? 3 : 0, maxScore: 3, detail: hasFaqSection ? "FAQ or helpful content section detected" : "No FAQ section found", suggestion: !hasFaqSection ? "Add a Frequently Asked Questions section to improve content depth and target featured snippets." : undefined });

  const allTitles = getAllTags(html, "title");
  const noDupTitles = allTitles.length <= 1;
  contentChecks.push({ name: "No duplicate titles", passed: noDupTitles, score: noDupTitles ? 2 : 0, maxScore: 2, detail: noDupTitles ? "No duplicate title tags" : `${allTitles.length} title tags found — potential duplicate`, suggestion: !noDupTitles ? "Ensure only one <title> tag exists per page." : undefined });

  onProgress(75, "Checking structured data…");

  /* ── 4. Structured Data (10 pts) ── */
  const structChecks: CheckResult[] = [];
  const jsonLds = getJsonLdScripts(html);
  const jsonLdText = jsonLds.join(" ");

  const schemas = [
    { name: "Organization", key: "Organization" },
    { name: "Breadcrumb", key: "BreadcrumbList" },
    { name: "Article / Tool schema", key: "Article|SoftwareApplication|WebApplication" },
    { name: "FAQ schema", key: "FAQPage" },
  ];

  for (const s of schemas) {
    const re = new RegExp(s.key, "i");
    const found = re.test(jsonLdText);
    structChecks.push({ name: `${s.name} schema`, passed: found, score: found ? 2 : 0, maxScore: 2, detail: found ? `${s.name} schema detected` : `No ${s.name} schema found`, suggestion: !found ? `Add ${s.name} structured data (JSON-LD) to improve rich search results.` : undefined });
  }

  let validJsonLd = true;
  for (const j of jsonLds) {
    try { JSON.parse(j); } catch { validJsonLd = false; break; }
  }
  const jsonLdValid = jsonLds.length > 0 && validJsonLd;
  structChecks.push({ name: "Valid JSON-LD syntax", passed: jsonLdValid, score: jsonLdValid ? 2 : (jsonLds.length > 0 ? 1 : 0), maxScore: 2, detail: jsonLds.length === 0 ? "No JSON-LD found" : jsonLdValid ? "All JSON-LD blocks are valid" : "JSON-LD syntax error detected", suggestion: !jsonLdValid ? "Ensure all <script type='application/ld+json'> blocks contain valid JSON." : undefined });

  onProgress(85, "Analyzing performance signals…");

  /* ── 5. Performance Signals (10 pts) ── */
  const perfChecks: CheckResult[] = [];

  const imgCount = imgs.length;
  const imgsOptimized = imgCount <= 15;
  perfChecks.push({ name: "Images optimized", passed: imgsOptimized, score: imgsOptimized ? 3 : (imgCount <= 30 ? 1 : 0), maxScore: 3, detail: `${imgCount} images on page (recommended: ≤15)`, suggestion: !imgsOptimized ? `Reduce image count or ensure all ${imgCount} images are compressed and lazy-loaded.` : undefined });

  const scripts = getScriptTags(html);
  const jsReasonable = scripts.length <= 10;
  perfChecks.push({ name: "JS bundle size reasonable", passed: jsReasonable, score: jsReasonable ? 2 : 1, maxScore: 2, detail: `${scripts.length} external scripts found`, suggestion: !jsReasonable ? "Reduce the number of external scripts to improve page load speed." : undefined });

  const hasLazyLoading = /loading=["']lazy["']/i.test(html);
  perfChecks.push({ name: "Lazy loading images", passed: hasLazyLoading, score: hasLazyLoading ? 2 : 0, maxScore: 2, detail: hasLazyLoading ? "Lazy loading detected on images" : "No lazy loading attributes found", suggestion: !hasLazyLoading ? "Add loading='lazy' to below-the-fold images to improve page speed." : undefined });

  const stylesheets = getStylesheetTags(html);
  const cssMinimal = stylesheets.length <= 5;
  perfChecks.push({ name: "CSS minimized", passed: cssMinimal, score: cssMinimal ? 1 : 0, maxScore: 1, detail: `${stylesheets.length} external stylesheets`, suggestion: !cssMinimal ? "Combine and minimize CSS files to reduce render-blocking resources." : undefined });

  const hasViewport = /meta[^>]*name=["']viewport["']/i.test(html);
  perfChecks.push({ name: "Mobile responsiveness", passed: hasViewport, score: hasViewport ? 2 : 0, maxScore: 2, detail: hasViewport ? "Viewport meta tag found" : "No viewport meta tag found", suggestion: !hasViewport ? "Add <meta name='viewport' content='width=device-width, initial-scale=1'> for mobile responsiveness." : undefined });

  onProgress(95, "Evaluating growth readiness…");

  /* ── 6. Growth / Authority (10 pts) ── */
  const growthChecks: CheckResult[] = [];

  const sitemapPageCount = sitemapUrlCount;
  const sufficientPages = sitemapPageCount >= 5;
  growthChecks.push({ name: "Sufficient number of pages", passed: sufficientPages, score: sufficientPages ? 2 : (sitemapPageCount > 0 ? 1 : 0), maxScore: 2, detail: sitemapPageCount > 0 ? `${sitemapPageCount} pages in sitemap` : "Could not determine page count", suggestion: !sufficientPages ? "Expand your site with more content pages to increase topical authority." : undefined });

  const linkDensity = internalLinks.length >= 10;
  growthChecks.push({ name: "Internal linking network", passed: linkDensity, score: linkDensity ? 2 : (internalLinks.length >= 3 ? 1 : 0), maxScore: 2, detail: `${internalLinks.length} internal links detected`, suggestion: !linkDensity ? "Build a stronger internal linking structure with 10+ links between pages." : undefined });

  const hasSeoContent = h2Count >= 2 && wordCount >= 200;
  growthChecks.push({ name: "SEO content sections", passed: hasSeoContent, score: hasSeoContent ? 2 : (h2Count >= 1 ? 1 : 0), maxScore: 2, detail: `${h2Count} content sections (H2), ${wordCount} words`, suggestion: !hasSeoContent ? "Add more content sections with H2 headings to improve topical coverage." : undefined });

  const toolLikeFeatures = /tool|calculator|converter|generator|builder|editor|analyzer/i.test(title + " " + bodyText.slice(0, 500));
  growthChecks.push({ name: "Tool usefulness", passed: toolLikeFeatures, score: toolLikeFeatures ? 2 : 0, maxScore: 2, detail: toolLikeFeatures ? "Page offers interactive tool functionality" : "No interactive tool features detected", suggestion: !toolLikeFeatures ? "Consider adding interactive tools or calculators to increase user engagement." : undefined });

  const hasSocial = /twitter|facebook|linkedin|instagram|youtube/i.test(html);
  growthChecks.push({ name: "Social signals present", passed: hasSocial, score: hasSocial ? 2 : 0, maxScore: 2, detail: hasSocial ? "Social media references detected" : "No social media signals found", suggestion: !hasSocial ? "Add social media links and sharing buttons to increase off-page signals." : undefined });

  onProgress(100, "Generating report…");

  /* ── Build report ── */
  const categories: CategoryResult[] = [
    { name: "Technical SEO", icon: Globe, color: "#3b82f6", checks: techChecks, score: techChecks.reduce((a, c) => a + c.score, 0), maxScore: 25 },
    { name: "On-Page SEO", icon: FileText, color: "#8b5cf6", checks: onPageChecks, score: onPageChecks.reduce((a, c) => a + c.score, 0), maxScore: 25 },
    { name: "Content SEO", icon: Code2, color: "#f59e0b", checks: contentChecks, score: contentChecks.reduce((a, c) => a + c.score, 0), maxScore: 20 },
    { name: "Structured Data", icon: BarChart3, color: "#ec4899", checks: structChecks, score: structChecks.reduce((a, c) => a + c.score, 0), maxScore: 10 },
    { name: "Performance Signals", icon: TrendingUp, color: "#14b8a6", checks: perfChecks, score: perfChecks.reduce((a, c) => a + c.score, 0), maxScore: 10 },
    { name: "Growth Readiness", icon: Shield, color: "#f97316", checks: growthChecks, score: growthChecks.reduce((a, c) => a + c.score, 0), maxScore: 10 },
  ];

  const totalScore = categories.reduce((a, c) => a + c.score, 0);
  const { text: rankingReadiness } = scoreLabel(totalScore);

  const failedChecks = categories.flatMap(c => c.checks).filter(c => !c.passed);
  const topIssues = failedChecks.slice(0, 3).map(c => c.name).join(", ");

  let summary = "";
  if (totalScore >= 90) {
    summary = `Excellent! Your website has outstanding SEO fundamentals. Keep maintaining your structured data and content freshness.`;
  } else if (totalScore >= 75) {
    summary = `Your website has strong SEO but there's room for improvement. Focus on: ${topIssues || "minor optimizations"}.`;
  } else if (totalScore >= 60) {
    summary = `Your website has moderate SEO. Key areas to improve: ${topIssues || "technical and content SEO"}. Fixing these issues could significantly improve search visibility.`;
  } else if (totalScore >= 40) {
    summary = `Your website has weak SEO with several critical issues: ${topIssues || "multiple factors"}. Addressing these should be a priority.`;
  } else {
    summary = `Your website has critical SEO issues that need immediate attention: ${topIssues || "most SEO factors"}. A comprehensive SEO overhaul is recommended.`;
  }

  let trafficPotential: string;
  if (totalScore >= 85) trafficPotential = "10k – 50k+ monthly visitors";
  else if (totalScore >= 70) trafficPotential = "5k – 20k monthly visitors";
  else if (totalScore >= 55) trafficPotential = "1k – 10k monthly visitors";
  else if (totalScore >= 40) trafficPotential = "100 – 1k monthly visitors";
  else trafficPotential = "< 100 monthly visitors";

  return {
    url,
    timestamp: new Date().toISOString(),
    categories,
    totalScore,
    summary,
    rankingReadiness,
    trafficPotential,
  };
}

/* ─── Score Ring Component ─── */
function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const { text, color } = scoreLabel(score);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${circ}`} strokeDashoffset={circ}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }} />
      </svg>
      <div className="text-center z-10">
        <motion.div className="text-5xl font-bold text-white" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          {score}
        </motion.div>
        <div className="text-xs text-white/40 mt-1">out of 100</div>
        <div className="text-sm font-medium mt-2" style={{ color }}>{text}</div>
      </div>
    </div>
  );
}

/* ─── Category Card ─── */
function CategoryCard({ category }: { category: CategoryResult }) {
  const [open, setOpen] = useState(false);
  const Icon = category.icon;
  const pct = Math.round((category.score / category.maxScore) * 100);
  const color = catColor(category.score, category.maxScore);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-6 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${category.color}15`, color: category.color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{catEmoji(category.score, category.maxScore)}</span>
            <h3 className="text-white font-medium text-base truncate">{category.name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <span className="text-sm font-medium shrink-0" style={{ color }}>{category.score}/{category.maxScore}</span>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-white/30 shrink-0" /> : <ChevronDown className="h-4 w-4 text-white/30 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="px-6 pb-6 space-y-3 border-t border-white/5 pt-4">
              {category.checks.map((check, i) => (
                <div key={i} className="flex items-start gap-3">
                  {check.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${check.passed ? "text-white/70" : "text-white"}`}>{check.name}</span>
                      <span className="text-xs text-white/30">{check.score}/{check.maxScore}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{check.detail}</p>
                    {check.suggestion && <p className="text-xs text-amber-400/70 mt-1 flex items-start gap-1"><Info className="h-3 w-3 shrink-0 mt-0.5" />{check.suggestion}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── PDF Export (pdf-lib) ─── */
async function generatePdfReport(report: AuditReport): Promise<void> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

  const doc = await PDFDocument.create();
  const fontR = await doc.embedFont(StandardFonts.Helvetica);
  const fontB = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28; // A4 width in points
  const H = 841.89; // A4 height
  const MARGIN = 50;
  const CONTENT_W = W - MARGIN * 2;
  let page = doc.addPage([W, H]);
  let y = H - MARGIN;

  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.85, 0.85, 0.85);
  const green = rgb(0.13, 0.77, 0.37);
  const red = rgb(0.94, 0.27, 0.27);
  const accent = rgb(0.33, 0.33, 0.93);

  // Strip non-WinAnsi characters (pdf-lib standard fonts only support WinAnsi)
  function safe(text: string): string {
    return text
      .replace(/[\u2713\u2714]/g, "[PASS]")
      .replace(/[\u2717\u2718\u2715\u2716]/g, "[FAIL]")
      .replace(/\u2192/g, "->")
      .replace(/\u2022/g, "-")
      .replace(/\u2014/g, "--")
      .replace(/\u2013/g, "-")
      .replace(/\u2018|\u2019/g, "'")
      .replace(/\u201C|\u201D/g, '"')
      .replace(/[^\x00-\xFF]/g, "");
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN + 20) {
      page = doc.addPage([W, H]);
      y = H - MARGIN;
    }
  }

  function wrapText(text: string, font: typeof fontR, size: number, maxWidth: number): string[] {
    const words = safe(text).split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [""];
  }

  function drawText(text: string, x: number, font: typeof fontR, size: number, color = black, maxWidth = CONTENT_W) {
    const lines = wrapText(text, font, size, maxWidth);
    for (const line of lines) {
      ensureSpace(size + 4);
      page.drawText(line, { x, y, size, font, color });
      y -= size + 4;
    }
  }

  function drawLine() {
    ensureSpace(12);
    page.drawLine({ start: { x: MARGIN, y }, end: { x: W - MARGIN, y }, thickness: 0.5, color: lightGray });
    y -= 12;
  }

  // -- Header --
  page.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: rgb(0.08, 0.08, 0.12) });
  page.drawText("SEO AUDIT REPORT", { x: MARGIN, y: H - 55, size: 22, font: fontB, color: rgb(1, 1, 1) });
  page.drawText("Generated by DesignForge360", { x: MARGIN, y: H - 75, size: 9, font: fontR, color: rgb(0.6, 0.6, 0.7) });
  y = H - 110;

  // -- Meta info --
  drawText(`Website:  ${report.url}`, MARGIN, fontR, 10, gray);
  const dateStr = new Date(report.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  drawText(`Date:  ${dateStr}`, MARGIN, fontR, 10, gray);
  y -= 6;

  // -- Score box --
  ensureSpace(70);
  const scoreBoxY = y - 55;
  page.drawRectangle({ x: MARGIN, y: scoreBoxY, width: CONTENT_W, height: 55, color: rgb(0.96, 0.96, 0.98), borderColor: lightGray, borderWidth: 0.5 });

  const scorePct = report.totalScore / 100;
  const scoreColor = scorePct >= 0.75 ? green : scorePct >= 0.5 ? rgb(0.92, 0.72, 0.05) : red;
  const scoreText = String(report.totalScore);
  page.drawText(scoreText, { x: MARGIN + 16, y: scoreBoxY + 18, size: 28, font: fontB, color: scoreColor });
  page.drawText("/ 100", { x: MARGIN + 16 + fontB.widthOfTextAtSize(scoreText, 28) + 4, y: scoreBoxY + 24, size: 12, font: fontR, color: gray });

  page.drawText(safe(report.rankingReadiness), { x: MARGIN + 130, y: scoreBoxY + 32, size: 11, font: fontB, color: black });
  page.drawText(safe(`Traffic Potential: ${report.trafficPotential}`), { x: MARGIN + 130, y: scoreBoxY + 16, size: 9, font: fontR, color: gray });
  y = scoreBoxY - 16;

  // -- Summary --
  drawText("Summary", MARGIN, fontB, 13, black);
  y -= 2;
  drawText(report.summary, MARGIN, fontR, 9.5, gray);
  y -= 8;
  drawLine();

  // -- Category breakdown --
  drawText("Score Breakdown", MARGIN, fontB, 13, black);
  y -= 6;

  for (const cat of report.categories) {
    ensureSpace(30);
    const pct = cat.maxScore > 0 ? cat.score / cat.maxScore : 0;
    const barColor = pct >= 0.85 ? green : pct >= 0.65 ? rgb(0.92, 0.72, 0.05) : red;

    page.drawText(safe(cat.name), { x: MARGIN, y, size: 11, font: fontB, color: black });
    const scoreStr = `${cat.score} / ${cat.maxScore}`;
    page.drawText(scoreStr, { x: W - MARGIN - fontB.widthOfTextAtSize(scoreStr, 11), y, size: 11, font: fontB, color: barColor });
    y -= 14;

    // Progress bar
    ensureSpace(12);
    const barW = CONTENT_W;
    const barH = 6;
    page.drawRectangle({ x: MARGIN, y: y - barH, width: barW, height: barH, color: rgb(0.92, 0.92, 0.92) });
    if (pct > 0) {
      page.drawRectangle({ x: MARGIN, y: y - barH, width: barW * pct, height: barH, color: barColor });
    }
    y -= barH + 10;

    for (const check of cat.checks) {
      ensureSpace(26);
      const icon = check.passed ? "[PASS]" : "[FAIL]";
      const iconColor = check.passed ? green : red;
      page.drawText(icon, { x: MARGIN + 4, y, size: 7, font: fontB, color: iconColor });
      page.drawText(safe(`${check.name}  (${check.score}/${check.maxScore})`), { x: MARGIN + 38, y, size: 9, font: fontR, color: black });
      y -= 13;

      const detailLines = wrapText(check.detail, fontR, 8, CONTENT_W - 44);
      for (const dl of detailLines) {
        ensureSpace(12);
        page.drawText(dl, { x: MARGIN + 38, y, size: 8, font: fontR, color: gray });
        y -= 11;
      }

      if (check.suggestion) {
        const suggLines = wrapText(`-> ${check.suggestion}`, fontR, 8, CONTENT_W - 44);
        for (const sl of suggLines) {
          ensureSpace(12);
          page.drawText(sl, { x: MARGIN + 38, y, size: 8, font: fontR, color: accent });
          y -= 11;
        }
      }
      y -= 3;
    }
    y -= 6;
  }

  // -- Improvement suggestions --
  drawLine();
  drawText("Improvement Suggestions", MARGIN, fontB, 13, black);
  y -= 4;

  const suggestions = report.categories.flatMap(c => c.checks).filter(c => c.suggestion);
  if (suggestions.length === 0) {
    drawText("No improvement suggestions -- your SEO looks great!", MARGIN, fontR, 9.5, green);
  } else {
    suggestions.forEach((s, i) => {
      drawText(`${i + 1}. ${s.suggestion!}`, MARGIN + 4, fontR, 9, black);
      y -= 2;
    });
  }

  // -- Footer --
  y -= 16;
  drawLine();
  drawText("Generated by DesignForge360 SEO Audit Tool  -  www.designforge360.com/tools/seo-audit", MARGIN, fontR, 8, gray);

  // -- Save & trigger download --
  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const domain = (() => { try { return new URL(report.url).hostname; } catch { return "site"; } })();
  a.download = `seo-audit-${domain}-${new Date().toISOString().slice(0, 10)}.pdf`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Delay cleanup so browser has time to start download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, 1000);
}

/* ─── Copy Suggestions ─── */
function getSuggestionsText(report: AuditReport): string {
  const suggestions = report.categories.flatMap(c => c.checks).filter(c => c.suggestion);
  if (suggestions.length === 0) return "No improvement suggestions — your SEO looks great!";
  return suggestions.map((s, i) => `${i + 1}. ${s.suggestion}`).join("\n");
}

/* ─── Main Component ─── */
export function SeoAudit() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAudit = useCallback(async () => {
    let finalUrl = url.trim();
    if (!finalUrl) return;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;

    try { new URL(finalUrl); } catch {
      setError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setProgress(0);
    setProgressMsg("Starting audit…");

    try {
      const result = await runAuditEngine(finalUrl, (pct, msg) => {
        setProgress(pct);
        setProgressMsg(msg);
      });
      setReport(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleReset = useCallback(() => {
    setReport(null);
    setUrl("");
    setError(null);
    setProgress(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleCopySuggestions = useCallback(() => {
    if (!report) return;
    navigator.clipboard.writeText(getSuggestionsText(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [report]);

  const passedCount = report ? report.categories.flatMap(c => c.checks).filter(c => c.passed).length : 0;
  const failedCount = report ? report.categories.flatMap(c => c.checks).filter(c => !c.passed).length : 0;
  const totalChecks = report ? report.categories.flatMap(c => c.checks).length : 0;

  return (
    <>
      <SEOHead
        title="Free SEO Audit Tool | Website SEO Analyzer | DesignForge360"
        description="Analyze your website SEO instantly. Check sitemap, robots.txt, meta tags, schema, and technical SEO issues with our free SEO audit tool."
        canonical="/tools/seo-audit"
        schema="WebApplication"
      />
      <ToolLayout
        title="SEO Audit & Website Analyzer"
        description="Enter any website URL to get a detailed SEO score and actionable improvement report. Works with live sites and localhost."
        icon={<Search className="h-7 w-7" />}
        faqItems={faqItems}
        relatedGuides={relatedGuides}
        relatedComparisons={relatedComparisons}
      >
        {/* URL Input */}
        {!report && (
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && handleAudit()}
                  placeholder="https://example.com or http://localhost:3000"
                  className="w-full h-14 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 pl-12 pr-4 text-base outline-none focus:border-white/20 focus:bg-white/[0.08] transition-colors"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <Button
                onClick={handleAudit}
                disabled={loading || !url.trim()}
                className="h-14 px-8 rounded-xl bg-white text-black font-medium hover:bg-white/90 disabled:opacity-40 text-base shrink-0"
              >
                {loading ? "Auditing…" : "Run Audit"}
              </Button>
            </div>

            {/* Progress */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/50">{progressMsg}</span>
                    <span className="text-sm font-medium text-white/70">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 text-sm font-medium">Audit Failed</p>
                  <p className="text-red-300/70 text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Report */}
        {report && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Score Header */}
            <div className="flex flex-col lg:flex-row items-center gap-10 mb-12">
              <ScoreRing score={report.totalScore} />
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl font-semibold text-white mb-2">SEO Audit Result</h2>
                <p className="text-white/40 text-sm mb-4 break-all">{report.url}</p>
                <p className="text-white/60 leading-relaxed mb-6">{report.summary}</p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="glass-panel rounded-xl px-4 py-2.5 text-center">
                    <div className="text-xs text-white/40 mb-1">Checks Passed</div>
                    <div className="text-lg font-bold text-emerald-400">{passedCount}/{totalChecks}</div>
                  </div>
                  <div className="glass-panel rounded-xl px-4 py-2.5 text-center">
                    <div className="text-xs text-white/40 mb-1">Issues Found</div>
                    <div className="text-lg font-bold text-red-400">{failedCount}</div>
                  </div>
                  <div className="glass-panel rounded-xl px-4 py-2.5 text-center">
                    <div className="text-xs text-white/40 mb-1">Ranking Readiness</div>
                    <div className="text-lg font-bold" style={{ color: scoreLabel(report.totalScore).color }}>{report.rankingReadiness}</div>
                  </div>
                  <div className="glass-panel rounded-xl px-4 py-2.5 text-center">
                    <div className="text-xs text-white/40 mb-1">Est. Traffic Potential</div>
                    <div className="text-lg font-bold text-blue-400">{report.trafficPotential}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {report.categories.map(cat => (
                <div key={cat.name}>
                  <CategoryCard category={cat} />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={handleCopySuggestions} variant="outline" className="rounded-xl border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06] gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Suggestions"}
              </Button>
              <Button onClick={() => generatePdfReport(report)} variant="outline" className="rounded-xl border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06] gap-2">
                <Download className="h-4 w-4" /> Download PDF Report
              </Button>
              <Button onClick={handleReset} variant="outline" className="rounded-xl border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06] gap-2">
                <RotateCcw className="h-4 w-4" /> Run New Audit
              </Button>
            </div>
          </motion.div>
        )}
      </ToolLayout>
    </>
  );
}
