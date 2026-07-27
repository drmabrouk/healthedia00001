import { INITIAL_PAPERS } from "../data";

/**
 * Interface definition for a simple Sitemap URL node.
 */
interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

/**
 * Safe local storage parser helper.
 */
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  const item = window.localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generates SEO-friendly URL slugs.
 */
function getSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Iterates through active collections within localStorage (managed pages,
 * published papers, verified researchers, and approved institutions) to generate a
 * highly compliant XML Sitemap following the Sitemap 0.9 standard.
 * Returns the XML string directly to be displayed or downloaded.
 */
export function generateSitemap(): string {
  const seoSettings = getLocalItem<any>("healthedia_seo_settings", null);
  const domain = (seoSettings?.canonicalDomain || "https://healthedia.org").replace(/\/$/, "");
  const todayStr = new Date().toISOString().substring(0, 10);

  // Retrieve active content arrays
  const pagesList = getLocalItem<any[]>("healthedia_pages", []);
  const papersList = getLocalItem<any[]>("healthedia_published_papers", INITIAL_PAPERS);
  const researchersList = getLocalItem<any[]>("healthedia_users", []).filter((u: any) => u.verified);
  const institutionsList = getLocalItem<any[]>("healthedia_institutions", []);

  const urls: SitemapUrl[] = [];

  // 1. Core Pages/Custom Section Routes
  if (pagesList.length > 0) {
    pagesList
      .filter((p: any) => p.status === "Published" && p.visibility === "Public")
      .forEach((page: any) => {
        urls.push({
          loc: `${domain}/${page.slug === "home" ? "" : page.slug}`,
          lastmod: page.updatedAt ? page.updatedAt.substring(0, 10) : todayStr,
          changefreq: page.slug === "home" ? "daily" : "weekly",
          priority: page.slug === "home" ? "1.0" : "0.8"
        });
      });
  } else {
    // Fallback default home route if pages are not loaded yet
    urls.push({
      loc: `${domain}/`,
      lastmod: todayStr,
      changefreq: "daily",
      priority: "1.0"
    });
  }

  // 2. Published Scientific Research Papers
  papersList.forEach((paper: any) => {
    urls.push({
      loc: `${domain}/research/${getSlug(paper.title)}`,
      lastmod: todayStr,
      changefreq: "monthly",
      priority: "0.9"
    });
  });

  // 3. Verified Clinical & Academic Researchers
  researchersList.forEach((res: any) => {
    const slug = res.username || getSlug(res.name);
    urls.push({
      loc: `${domain}/researchers/${slug}`,
      lastmod: todayStr,
      changefreq: "weekly",
      priority: "0.7"
    });
  });

  // 4. Approved Research Institutions
  institutionsList
    .filter((i: any) => i.status === "Approved")
    .forEach((inst: any) => {
      const slug = getSlug(inst.name);
      urls.push({
        loc: `${domain}/institutions/${slug}`,
        lastmod: todayStr,
        changefreq: "monthly",
        priority: "0.6"
      });
    });

  // 5. Standalone Professional Course sections
  const coursesList = ["courses"];
  coursesList.forEach((slug) => {
    urls.push({
      loc: `${domain}/${slug}`,
      lastmod: todayStr,
      changefreq: "monthly",
      priority: "0.6"
    });
  });

  // Construct the XML file structure
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach((url) => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  // Save dynamic XML file in localStorage for offline persistence/debugging
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("healthedia_xml_sitemap_rendered", xml);
    
    // Asynchronously update the backend server in the background
    fetch("/api/sitemap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml })
    }).catch((err) => {
      console.warn("[Sitemap Sync] Failed background fetch to server:", err);
    });
  }

  return xml;
}

/**
 * Escapes characters that are special in XML attributes/contents.
 */
function escapeXml(unsafeStr: string): string {
  return unsafeStr.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}

/**
 * Generates dynamic, fully compliant XML Sitemap representing all published system pages, 
 * research papers, verified researchers, approved institutions, and academic courses.
 * Clean, synchronous representation.
 */
export function generateSitemapXmlString(): string {
  return generateSitemap();
}
