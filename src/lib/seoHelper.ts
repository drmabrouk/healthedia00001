import { SEOSettings, SEOPage } from "../components/SEOManagerView";

/**
 * Generates SEO-friendly URL slugs.
 */
export function getSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Dynamically injects SEO metadata into the browser <head> based on the active view.
 */
export function updateDocumentSEO({
  page,
  paper,
  researcher,
  institution,
  settings,
  currentPath
}: {
  page: SEOPage | null;
  paper: any | null;
  researcher: any | null;
  institution: any | null;
  settings: SEOSettings;
  currentPath: string;
}) {
  if (typeof document === "undefined") return;

  const domain = settings.canonicalDomain.replace(/\/$/, "");
  const canonicalUrl = `${domain}${currentPath}`;

  let title = settings.siteTitle;
  let description = settings.siteDescription;
  let ogType = "website";
  let structuredData: any = null;

  // Compute values based on active entity
  if (paper) {
    title = settings.metaTemplate
      ? settings.metaTemplate.replace("[Title]", paper.title)
      : `${paper.title} | Healthedia`;
    description = paper.abstract ? paper.abstract.substring(0, 160) + "..." : "";
    ogType = "article";
    
    // Schema.org ScholarlyArticle
    structuredData = {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": paper.title,
      "description": paper.abstract,
      "author": Array.isArray(paper.authors) 
        ? paper.authors.map((name: string) => ({ "@type": "Person", "name": name }))
        : [{ "@type": "Person", "name": paper.authors }],
      "publisher": {
        "@type": "Organization",
        "name": "Healthedia Administrative Council",
        "logo": {
          "@type": "ImageObject",
          "url": settings.socialPreviewImage
        }
      },
      "datePublished": paper.year ? `${paper.year}-01-01` : undefined,
      "about": paper.specialty,
      "identifier": paper.doi
    };
  } else if (researcher) {
    title = `${researcher.title || ""} ${researcher.name} - Healthedia Researcher Profile`;
    description = researcher.bio || `${researcher.name} is a verified clinical and academic researcher in ${researcher.specialty || "medicine"} at ${researcher.institution || "Healthedia"}.`;
    ogType = "profile";

    // Schema.org ProfilePage & Person
    structuredData = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": researcher.name,
        "jobTitle": researcher.profession,
        "worksFor": {
          "@type": "EducationalOrganization",
          "name": researcher.institution
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": researcher.country
        },
        "description": researcher.bio
      }
    };
  } else if (institution) {
    title = `${institution.name} - Healthedia Institutional Profile`;
    description = institution.description || `${institution.name} is an approved medical research and clinical performance institution.`;
    
    // Schema.org EducationalOrganization
    structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": institution.name,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": institution.country || "Global"
      }
    };
  } else if (page) {
    title = page.seoTitle || page.title;
    description = page.seoDescription || settings.siteDescription;
  }

  // Set document title
  document.title = title;

  // Helper to set/create meta tags
  const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
    const attribute = isProperty ? "property" : "name";
    let el = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attribute, nameOrProperty);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  };

  // Set standard SEO meta tags
  setMeta("description", description);
  setMeta("keywords", settings.metaKeywords);
  
  // Indexing controls (Robots)
  const shouldIndex = settings.searchEngineIndex && (!page || page.status === "Published" && page.visibility === "Public");
  const robotsVal = shouldIndex ? "index, follow" : "noindex, nofollow";
  setMeta("robots", robotsVal);

  // Set Open Graph metadata
  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  setMeta("og:type", ogType, true);
  setMeta("og:url", canonicalUrl, true);
  setMeta("og:image", settings.socialPreviewImage, true);
  setMeta("og:site_name", "Healthedia Archive", true);

  // Set Twitter Card metadata
  setMeta("twitter:card", settings.twitterCardType);
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", settings.socialPreviewImage);

  // Set Canonical URL
  let canonicalEl = document.querySelector("link[rel='canonical']");
  if (!canonicalEl) {
    canonicalEl = document.createElement("link");
    canonicalEl.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute("href", canonicalUrl);

  // Set Search Console Verification
  if (settings.googleSearchConsole) {
    setMeta("google-site-verification", settings.googleSearchConsole);
  }
  if (settings.bingWebmaster) {
    setMeta("msvalidate.01", settings.bingWebmaster);
  }

  // Set Structured Data (JSON-LD)
  let scriptEl = document.getElementById("healthedia-schema-ld") as HTMLScriptElement;
  if (scriptEl) {
    scriptEl.remove();
  }
  if (structuredData) {
    scriptEl = document.createElement("script");
    scriptEl.id = "healthedia-schema-ld";
    scriptEl.type = "application/ld+json";
    scriptEl.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(scriptEl);
  }
}
