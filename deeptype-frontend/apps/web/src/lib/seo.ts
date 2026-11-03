export const SITE_URL = "https://deeptype.com";

// ponytail: one shared org entity, no fake person author.
export const ORG_JSON_LD = {
  "@type": "Organization",
  name: "DeepType",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/og-image.png`,
  },
} as const;

export function ldJsonScript(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export function blogPostingJsonLd(input: {
  title: string;
  description: string;
  path: string;
  date: string;
  dateModified?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: `${SITE_URL}${input.path}`,
    datePublished: input.date,
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author: { ...ORG_JSON_LD, "@type": "Organization" },
    publisher: ORG_JSON_LD,
  };
}

export function comparisonJsonLd(input: {
  title: string;
  description: string;
  path: string;
  date: string;
  competitor: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: `${SITE_URL}${input.path}`,
    datePublished: input.date,
    author: { ...ORG_JSON_LD, "@type": "Organization" },
    publisher: ORG_JSON_LD,
    about: [{ "@type": "SoftwareApplication", name: "DeepType" }, { "@type": "SoftwareApplication", name: input.competitor }],
  };
}

export function blogCollectionJsonLd(items: { title: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Notes on local dictation | DeepType",
    url: `${SITE_URL}/blog`,
    hasPart: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${item.path}`,
      name: item.title,
    })),
  };
}

export function pageHead(title: string, description: string, path: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}${path}` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}${path}` }],
  };
}
