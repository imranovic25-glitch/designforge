import { Helmet } from "react-helmet-async";

const SITE_NAME = "DesignForge360";
const SITE_URL = "https://designforge360.in";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const TWITTER_HANDLE = "@designforge360";

export type SchemaType =
  | "WebSite"
  | "WebApplication"
  | "SoftwareApplication"
  | "Article"
  | "HowTo"
  | "FAQPage"
  | "BreadcrumbList"
  | "ItemList"
  | "ProfilePage"
  | "CollectionPage";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface HowToStep {
  name: string;
  text: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ReviewItem {
  author: string;
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
}

interface SEOHeadProps {
  /** Page <title>. Will be appended with " | DesignForge360" unless noSuffix=true */
  title: string;
  /** Meta description — 150-160 characters ideal */
  description: string;
  /** Canonical path e.g. "/tools/pdf-compressor" — site URL is prepended automatically */
  canonical: string;
  /** Open Graph image URL. Defaults to site-wide OG image */
  ogImage?: string;
  /** og:type — defaults to "website" */
  ogType?: "website" | "article";
  /** Don't append site name to title */
  noSuffix?: boolean;
  /** Schema.org type to emit JSON-LD for */
  schema?: SchemaType;
  /** For WebApplication schema — the tool name */
  appName?: string;
  /** For WebApplication schema — short description */
  appDescription?: string;
  /** For Article / HowTo schema */
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  /** For HowTo schema */
  howToSteps?: HowToStep[];
  /** For FAQPage schema */
  faqItems?: FAQItem[];
  /** Breadcrumb trail */
  breadcrumbs?: BreadcrumbItem[];
  /** Set to "noindex, nofollow" for legal/private pages */
  robots?: string;
  /** For SoftwareApplication schema */
  memberCount?: number;
  /** For ProfilePage schema */
  profileName?: string;
  profileDescription?: string;
  /** For AggregateRating — emit SoftwareApplication + AggregateRating when provided */
  aggregateRating?: {
    appName: string;
    appUrl: string;
    ratingValue: number;
    ratingCount: number;
  };
  /** For Review schema — individual user reviews (use alongside aggregateRating) */
  reviewItems?: ReviewItem[];
  /** Review target name (app or tool being reviewed) */
  reviewTargetName?: string;
  reviewTargetUrl?: string;
}

function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Free online tools, financial calculators, expert comparison guides, and product reviews.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    },
  };
}

function buildWebAppSchema(
  name: string,
  description: string,
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

function buildArticleSchema(props: SEOHeadProps, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    url: canonicalUrl,
    datePublished: props.articlePublishedTime ?? "2026-01-01",
    dateModified: props.articleModifiedTime ?? props.articlePublishedTime ?? "2026-01-01",
    author: {
      "@type": "Organization",
      name: props.articleAuthor ?? `${SITE_NAME} Editorial`,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    image: props.ogImage ?? DEFAULT_OG_IMAGE,
    articleSection: props.articleSection ?? "Guides",
  };
}

function buildHowToSchema(props: SEOHeadProps, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: props.title,
    description: props.description,
    url: canonicalUrl,
    image: props.ogImage ?? DEFAULT_OG_IMAGE,
    step: (props.howToSteps ?? []).map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
    tool: {
      "@type": "HowToTool",
      name: SITE_NAME,
    },
  };
}

function buildFAQSchema(faqItems: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

function buildSoftwareApplicationSchema(canonicalUrl: string, memberCount?: number) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "App Testers Community",
    url: canonicalUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    description:
      "A free community platform where developers, indie hackers, and creators share their apps to get real feedback from beta testers worldwide.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Submit your app for beta testing",
      "Get real feedback from users",
      "Earn Repo Points for community contributions",
      "Pin, Boost, and Priority review power-ups",
      "Live online user presence",
      "Direct messaging between members",
    ],
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(memberCount ? { numberOfUsers: memberCount } : {}),
  };
}

function buildCommunityForumSchema(canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    url: canonicalUrl,
    name: "App Testers Community Forum",
    description:
      "Join thousands of developers and testers sharing apps, giving feedback, and earning community points on DesignForge360.",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

function buildAggregateRatingSchema(opts: {
  appName: string;
  appUrl: string;
  ratingValue: number;
  ratingCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.appName,
    url: opts.appUrl.startsWith("http") ? opts.appUrl : `${SITE_URL}${opts.appUrl}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: opts.ratingValue,
      ratingCount: opts.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

function buildProfilePageSchema(name: string, description: string, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name,
    description,
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function SEOHead(props: SEOHeadProps) {
  const {
    title,
    description,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    noSuffix = false,
    schema,
    robots = "index, follow",
    breadcrumbs,
    faqItems,
  } = props;

  const fullTitle = noSuffix ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${canonical}`;

  // Build JSON-LD schemas
  const schemas: object[] = [];

  if (schema === "WebSite") {
    schemas.push(buildWebSiteSchema());
  }
  if (schema === "WebApplication" && props.appName) {
    schemas.push(buildWebAppSchema(props.appName, props.appDescription ?? description, canonicalUrl));
  }
  if (schema === "SoftwareApplication") {
    schemas.push(buildSoftwareApplicationSchema(canonicalUrl, props.memberCount));
    schemas.push(buildCommunityForumSchema(canonicalUrl));
  }
  if (schema === "ProfilePage" && props.profileName) {
    schemas.push(buildProfilePageSchema(props.profileName, props.profileDescription ?? description, canonicalUrl));
  }
  if (schema === "Article") {
    schemas.push(buildArticleSchema(props, canonicalUrl));
  }
  if (schema === "HowTo") {
    schemas.push(buildHowToSchema(props, canonicalUrl));
    // HowTo pages also get Article schema for better indexing
    schemas.push(buildArticleSchema({ ...props, schema: "Article" }, canonicalUrl));
  }
  if (faqItems?.length) {
    schemas.push(buildFAQSchema(faqItems));
  }

  // Breadcrumbs always appended when provided
  if (breadcrumbs?.length) {
    schemas.push(buildBreadcrumbSchema(breadcrumbs));
  }

  // AggregateRating — emits SoftwareApplication + AggregateRating
  if (props.aggregateRating) {
    schemas.push(buildAggregateRatingSchema(props.aggregateRating));
  }

  return (
    <Helmet>
      {/* ── Core ──────────────────────────────────── */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph ────────────────────────────── */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter Card ──────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── Article-specific OG tags ──────────────── */}
      {ogType === "article" && props.articlePublishedTime && (
        <meta property="article:published_time" content={props.articlePublishedTime} />
      )}
      {ogType === "article" && props.articleModifiedTime && (
        <meta property="article:modified_time" content={props.articleModifiedTime} />
      )}
      {ogType === "article" && props.articleSection && (
        <meta property="article:section" content={props.articleSection} />
      )}

      {/* ── JSON-LD Structured Data ───────────────── */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s, null, 0)}
        </script>
      ))}
    </Helmet>
  );
}
