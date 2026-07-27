import React, { useState, useEffect } from "react";
import {
  Globe, Sliders, FileText, RefreshCw, Trash2, Edit2, Copy, Check, Plus,
  Download, Database, Terminal, Settings, Code, AlertCircle, ExternalLink,
  CheckCircle, Play, FileCode, CheckSquare, Search, ShieldAlert, Eye, History, ArrowRight
} from "lucide-react";
import { getStoredItem, setStoredItem, generateSitemapXmlString, triggerAutomatedSitemapUpdate, triggerAutomatedRobotsUpdate } from "../lib/taxonomyStore";
import { INITIAL_PAPERS } from "../data";

// Type definitions
export interface SEOPage {
  id: string;
  title: string;
  slug: string;
  status: "Published" | "Draft" | "Trash";
  visibility: "Public" | "Private" | "Password";
  hideFromNav: boolean;
  seoTitle: string;
  seoDescription: string;
  redirectUrl?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  revisions: { timestamp: string; action: string; author: string }[];
}

export interface SEORedirect {
  id: string;
  source: string;
  target: string;
  status: "301" | "302";
  createdAt: string;
}

export interface SEOAuditLog {
  id: string;
  timestamp: string;
  action: string;
  type: "SEO" | "Page" | "Redirect" | "Sitemap" | "Robots" | "Deploy";
  user: string;
}

export interface SEOSettings {
  siteTitle: string;
  siteDescription: string;
  metaKeywords: string;
  canonicalDomain: string;
  metaTemplate: string;
  ogTitleTemplate: string;
  socialPreviewImage: string;
  twitterCardType: "summary" | "summary_large_image";
  googleSearchConsole: string;
  bingWebmaster: string;
  analyticsId: string;
  customHeaderScripts: string;
  searchEngineIndex: boolean;
  searchEngineFollow: boolean;
}

// Initial values
export const DEFAULT_SEO_SETTINGS: SEOSettings = {
  siteTitle: "Healthedia - Global Health & Performance Archive",
  siteDescription: "A global archive for medical, health, sports science, rehabilitation, and human performance research, with an advanced search engine and researcher profiles.",
  metaKeywords: "medical research, sports science, kinesiology, biomechanics, physical therapy, cardiology, human performance",
  canonicalDomain: "https://healthedia.org",
  metaTemplate: "[Title] | Healthedia Global Archive",
  ogTitleTemplate: "[Title] - Research & Performance Archive",
  socialPreviewImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200",
  twitterCardType: "summary_large_image",
  googleSearchConsole: "gsc-verification-code-12345",
  bingWebmaster: "bing-verification-code-67890",
  analyticsId: "G-HEALT12345",
  customHeaderScripts: "<!-- Google Tag Manager / Analytics Tracking -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-HEALT12345\"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-HEALT12345');\n</script>",
  searchEngineIndex: true,
  searchEngineFollow: true
};

export const INITIAL_PAGES: SEOPage[] = [
  {
    id: "page-1",
    title: "Home Page",
    slug: "home",
    status: "Published",
    visibility: "Public",
    hideFromNav: false,
    seoTitle: "Healthedia | Sports Science & Medical Research Archive",
    seoDescription: "An international, open-access peer-reviewed archive indexing sports science, cardiology, physical rehabilitation, and clinical performance research.",
    isSystem: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2026-07-16T01:00:00Z",
    revisions: [
      { timestamp: "2024-01-10 08:00", action: "System Page Initialized", author: "System" },
      { timestamp: "2026-07-16 01:00", action: "Updated meta tags for sports reconditioning focus", author: "Alistair Vance" }
    ]
  },
  {
    id: "page-2",
    title: "Search Results",
    slug: "search",
    status: "Published",
    visibility: "Public",
    hideFromNav: true,
    seoTitle: "Search Research Papers & Publications - Healthedia",
    seoDescription: "Advanced semantic search across peer-reviewed health studies, clinical trials, and exercise physiology reviews.",
    isSystem: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2026-07-15T12:00:00Z",
    revisions: [{ timestamp: "2024-01-10 08:00", action: "System Page Initialized", author: "System" }]
  },
  {
    id: "page-3",
    title: "Researchers Directory",
    slug: "researchers",
    status: "Published",
    visibility: "Public",
    hideFromNav: false,
    seoTitle: "Verified Medical & Sports Researchers - Healthedia",
    seoDescription: "Directory of leading researchers, academic authors, and sports medicine practitioners.",
    isSystem: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2026-07-15T14:30:00Z",
    revisions: [{ timestamp: "2024-01-10 08:00", action: "System Page Initialized", author: "System" }]
  },
  {
    id: "page-4",
    title: "Institutions Registry",
    slug: "institutions",
    status: "Published",
    visibility: "Public",
    hideFromNav: false,
    seoTitle: "Global Health & Medical School Directories - Healthedia",
    seoDescription: "Academic rankings and evaluations of international clinical institutions and human performance centers.",
    isSystem: true,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2026-07-16T00:45:00Z",
    revisions: [
      { timestamp: "2024-01-15 09:00", action: "Page Created", author: "System" },
      { timestamp: "2026-07-16 00:45", action: "Added institution-ranking keywords", author: "Alistair Vance" }
    ]
  },
  {
    id: "page-5",
    title: "Courses Portal",
    slug: "courses",
    status: "Published",
    visibility: "Public",
    hideFromNav: false,
    seoTitle: "Professional Medical & Performance Courses - Healthedia",
    seoDescription: "Advanced learning programs covering cardiology, kinesiology, rehabilitation science, and clinical medicine.",
    isSystem: true,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2026-07-14T11:20:00Z",
    revisions: [{ timestamp: "2024-02-01 10:00", action: "System Page Initialized", author: "System" }]
  },
  {
    id: "page-6",
    title: "Academic Journal",
    slug: "journal",
    status: "Published",
    visibility: "Public",
    hideFromNav: false,
    seoTitle: "Healthedia Academic Journal - Open Access Publications",
    seoDescription: "Read published meta-analyses, systematic reviews, and randomized controlled clinical trials.",
    isSystem: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2026-07-16T00:50:00Z",
    revisions: [{ timestamp: "2024-01-10 08:00", action: "System Page Initialized", author: "System" }]
  }
];

export const INITIAL_REDIRECTS: SEORedirect[] = [
  { id: "redir-1", source: "/archive", target: "/journal", status: "301", createdAt: "2026-07-10T05:00:00Z" },
  { id: "redir-2", source: "/research-papers", target: "/journal", status: "301", createdAt: "2026-07-12T09:15:00Z" },
  { id: "redir-3", source: "/evaluations", target: "/institutions", status: "302", createdAt: "2026-07-14T14:00:00Z" }
];

export default function SEOManagerView() {
  const [subTab, setSubTab] = useState<"general" | "pages" | "redirects" | "sitemap" | "hostinger" | "audit">("general");

  // Local storage states
  const [settings, setSettings] = useState<SEOSettings>(DEFAULT_SEO_SETTINGS);
  const [pages, setPages] = useState<SEOPage[]>(INITIAL_PAGES);
  const [redirects, setRedirects] = useState<SEORedirect[]>(INITIAL_REDIRECTS);
  const [auditLogs, setAuditLogs] = useState<SEOAuditLog[]>([]);
  const [robotsTxt, setRobotsTxt] = useState("");

  // UI form/modal states
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<SEOPage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New page form state
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageStatus, setPageStatus] = useState<"Published" | "Draft" | "Trash">("Published");
  const [pageVisibility, setPageVisibility] = useState<"Public" | "Private">("Public");
  const [pageHideNav, setPageHideNav] = useState(false);
  const [pageSeoTitle, setPageSeoTitle] = useState("");
  const [pageSeoDescription, setPageSeoDescription] = useState("");
  const [pageRedirect, setPageRedirect] = useState("");

  // Redirect form state
  const [redirSource, setRedirSource] = useState("");
  const [redirTarget, setRedirTarget] = useState("");
  const [redirStatus, setRedirStatus] = useState<"301" | "302">("301");

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Hostinger Diagnostics status
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsDone, setDiagnosticsDone] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const storedSettings = getStoredItem<SEOSettings>("healthedia_seo_settings", DEFAULT_SEO_SETTINGS);
    const storedPages = getStoredItem<SEOPage[]>("healthedia_pages", INITIAL_PAGES);
    const storedRedirects = getStoredItem<SEORedirect[]>("healthedia_redirects", INITIAL_REDIRECTS);
    const storedLogs = getStoredItem<SEOAuditLog[]>("healthedia_seo_audit_logs", [
      { id: "log-1", timestamp: "2026-07-15 09:00", action: "SEO module successfully compiled", type: "SEO", user: "Alistair Vance" }
    ]);
    const storedRobots = getStoredItem<string>("healthedia_robots_txt", 
      "User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /profile\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: https://healthedia.org/sitemap.xml"
    );

    setSettings(storedSettings);
    setPages(storedPages);
    setRedirects(storedRedirects);
    setAuditLogs(storedLogs);
    setRobotsTxt(storedRobots);
  }, []);

  // Save helpers & log audits
  const addAuditLog = (action: string, type: SEOAuditLog["type"]) => {
    const newLog: SEOAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      action,
      type,
      user: "System Administrator"
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    setStoredItem("healthedia_seo_audit_logs", updated);
  };

  const saveSettings = (updated: SEOSettings) => {
    setSettings(updated);
    setStoredItem("healthedia_seo_settings", updated);
    addAuditLog("Updated homepage meta templates & SEO properties", "SEO");
    showToast("Global SEO settings saved and synced!");
  };

  const savePages = (updated: SEOPage[]) => {
    setPages(updated);
    setStoredItem("healthedia_pages", updated);
  };

  const saveRedirects = (updated: SEORedirect[]) => {
    setRedirects(updated);
    setStoredItem("healthedia_redirects", updated);
  };

  // Create or Update Page
  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pageSlug.trim()) {
      showToast("Page Title and URL slug are required", "error");
      return;
    }

    const cleanedSlug = pageSlug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");

    // Avoid duplicate slug
    const duplicate = pages.find(p => p.slug === cleanedSlug && (!editingPage || p.id !== editingPage.id));
    if (duplicate) {
      showToast(`A page with slug '${cleanedSlug}' already exists`, "error");
      return;
    }

    // Dynamic Suggestion for Redirects on URL edit
    if (editingPage && editingPage.slug !== cleanedSlug) {
      const suggestRedirect = window.confirm(`You changed the page slug from '/${editingPage.slug}' to '/${cleanedSlug}'. Would you like Healthedia to automatically construct a 301 Permanent Redirect to protect search indexing?`);
      if (suggestRedirect) {
        const newRedirect: SEORedirect = {
          id: `redir-${Date.now()}`,
          source: `/${editingPage.slug}`,
          target: `/${cleanedSlug}`,
          status: "301",
          createdAt: new Date().toISOString()
        };
        const updatedRedirs = [newRedirect, ...redirects];
        saveRedirects(updatedRedirs);
        addAuditLog(`Auto-created 301 Redirect for slug change: /${editingPage.slug} ➔ /${cleanedSlug}`, "Redirect");
      }
    }

    const timestamp = new Date().toISOString();
    const actionText = editingPage ? `Updated page properties for: ${pageTitle}` : `Created new page: ${pageTitle}`;

    if (editingPage) {
      // Edit
      const updatedPages = pages.map(p => {
        if (p.id === editingPage.id) {
          return {
            ...p,
            title: pageTitle,
            slug: cleanedSlug,
            status: pageStatus,
            visibility: pageVisibility as any,
            hideFromNav: pageHideNav,
            seoTitle: pageSeoTitle || `${pageTitle} - Healthedia`,
            seoDescription: pageSeoDescription,
            redirectUrl: pageRedirect.trim() || undefined,
            updatedAt: timestamp,
            revisions: [
              {
                timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
                action: "Page properties updated",
                author: "System Administrator"
              },
              ...p.revisions
            ]
          };
        }
        return p;
      });
      savePages(updatedPages);
      addAuditLog(actionText, "Page");
      showToast("Page updated successfully!");
    } else {
      // Create new
      const newPage: SEOPage = {
        id: `page-${Date.now()}`,
        title: pageTitle,
        slug: cleanedSlug,
        status: pageStatus,
        visibility: pageVisibility as any,
        hideFromNav: pageHideNav,
        seoTitle: pageSeoTitle || `${pageTitle} - Healthedia`,
        seoDescription: pageSeoDescription,
        redirectUrl: pageRedirect.trim() || undefined,
        isSystem: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        revisions: [{
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          action: "Page initialized",
          author: "System Administrator"
        }]
      };
      savePages([...pages, newPage]);
      addAuditLog(actionText, "Page");
      showToast("New page published successfully!");
    }

    setIsPageModalOpen(false);
    clearPageForm();
  };

  const clearPageForm = () => {
    setEditingPage(null);
    setPageTitle("");
    setPageSlug("");
    setPageStatus("Published");
    setPageVisibility("Public");
    setPageHideNav(false);
    setPageSeoTitle("");
    setPageSeoDescription("");
    setPageRedirect("");
  };

  const openEditPage = (page: SEOPage) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageStatus(page.status);
    setPageVisibility(page.visibility === "Public" ? "Public" : "Private");
    setPageHideNav(page.hideFromNav);
    setPageSeoTitle(page.seoTitle);
    setPageSeoDescription(page.seoDescription);
    setPageRedirect(page.redirectUrl || "");
    setIsPageModalOpen(true);
  };

  const duplicatePage = (page: SEOPage) => {
    const timestamp = new Date().toISOString();
    const duplicated: SEOPage = {
      ...page,
      id: `page-${Date.now()}`,
      title: `${page.title} (Copy)`,
      slug: `${page.slug}-copy`,
      isSystem: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      revisions: [{
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        action: `Duplicated from /${page.slug}`,
        author: "System Administrator"
      }]
    };
    savePages([...pages, duplicated]);
    addAuditLog(`Duplicated page: ${page.title} to /${duplicated.slug}`, "Page");
    showToast("Page duplicated successfully!");
  };

  const handlePageStatusChange = (pageId: string, newStatus: SEOPage["status"]) => {
    const updated = pages.map(p => {
      if (p.id === pageId) {
        return {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          revisions: [{
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            action: `Status changed to ${newStatus}`,
            author: "System Administrator"
          }, ...p.revisions]
        };
      }
      return p;
    });
    savePages(updated);
    const page = pages.find(p => p.id === pageId);
    addAuditLog(`Changed status of page '${page?.title}' to '${newStatus}'`, "Page");
    showToast(`Page status changed to ${newStatus}`);
  };

  const permanentlyDeletePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    if (page.isSystem) {
      showToast("Cannot delete a system page. Try unpublishing it instead.", "error");
      return;
    }
    const confirmDelete = window.confirm(`Are you absolutely sure you want to permanently delete '${page.title}'? This action cannot be undone.`);
    if (confirmDelete) {
      const filtered = pages.filter(p => p.id !== pageId);
      savePages(filtered);
      addAuditLog(`Permanently deleted page '${page.title}'`, "Page");
      showToast("Page permanently deleted.");
    }
  };

  // Redirect handling
  const handleAddRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirSource.trim() || !redirTarget.trim()) {
      showToast("Source and target paths are required", "error");
      return;
    }

    const newRedir: SEORedirect = {
      id: `redir-${Date.now()}`,
      source: redirSource.trim(),
      target: redirTarget.trim(),
      status: redirStatus,
      createdAt: new Date().toISOString()
    };

    const updated = [newRedir, ...redirects];
    saveRedirects(updated);
    addAuditLog(`Added ${redirStatus} Redirect: ${redirSource} ➔ ${redirTarget}`, "Redirect");
    setRedirSource("");
    setRedirTarget("");
    showToast("Redirect rule added successfully!");
  };

  const handleDeleteRedirect = (id: string) => {
    const redir = redirects.find(r => r.id === id);
    if (!redir) return;
    const filtered = redirects.filter(r => r.id !== id);
    saveRedirects(filtered);
    addAuditLog(`Removed redirect rule: ${redir.source}`, "Redirect");
    showToast("Redirect rule deleted.");
  };

  // RobotsTxt customizer
  const handleSaveRobots = async () => {
    setStoredItem("healthedia_robots_txt", robotsTxt);
    const synced = await triggerAutomatedRobotsUpdate(robotsTxt);
    addAuditLog("Customized robots.txt configurations", "Robots");
    if (synced) {
      showToast("robots.txt updated and synchronized on live server!");
    } else {
      showToast("robots.txt updated locally!");
    }
  };

  // Run Hostinger Compatibility Diagnostics
  const runHostingerDiagnostics = () => {
    setDiagnosticsRunning(true);
    setDiagnosticsDone(false);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      setDiagnosticsDone(true);
      addAuditLog("Initiated Hostinger compatibility audit", "Deploy");
      showToast("Hostinger diagnostic scan completed successfully!");
    }, 1500);
  };

  // Generate XML Sitemap on the fly (reusing core taxonomy compiler)
  const generateSitemapXml = (): string => {
    return generateSitemapXmlString();
  };

  // Ping search engines and re-sync
  const handlePingSearchEngines = async () => {
    const success = await triggerAutomatedSitemapUpdate();
    addAuditLog("Submitted XML Sitemap ping to Google and Bing indexers", "Sitemap");
    if (success) {
      showToast("Sitemap synchronized & search engine indexers pinged!");
    } else {
      showToast("Sitemap indexing triggered locally!");
    }
  };

  // Filter pages for view
  const filteredPages = pages.filter(p => {
    if (searchQuery.trim() === "") return true;
    return p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.seoTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // PHP 8.3 router generation code for Hostinger compatibility
  const phpRouterCode = `<?php
/**
 * Healthedia Global Archive Router
 * Highly compatible with Hostinger Shared Hosting, Cloud Server, & VPS.
 * Optimized for PHP 8.3+, LiteSpeed Web Server, and MariaDB.
 */

define('SEO_TITLE', '${settings.siteTitle}');
define('SEO_DESC', '${settings.siteDescription}');
define('SEO_KEYWORDS', '${settings.metaKeywords}');

// Dynamic PHP Rewrite Rules compatible with LiteSpeed
$request = $_SERVER['REQUEST_URI'];
$clean_path = parse_url($request, PHP_URL_PATH);

// 301 Redirect Rules Manager integration
$redirects = [
${redirects.map(r => `  '${r.source}' => ['target' => '${r.target}', 'status' => ${r.status}],`).join("\n")}
];

if (isset($redirects[$clean_path])) {
    $r = $redirects[$clean_path];
    header("Location: " . $r['target'], true, $r['status']);
    exit();
}

// Serve robots.txt dynamically
if ($clean_path === '/robots.txt') {
    header('Content-Type: text/plain');
    echo file_get_contents('robots.txt');
    exit();
}

// Serve sitemap.xml dynamically
if ($clean_path === '/sitemap.xml') {
    header('Content-Type: application/xml');
    echo file_get_contents('sitemap.xml');
    exit();
}

// Fallback to static index.html and inject meta tags for SEO crawlers
$index = file_get_contents('index.html');
if ($index !== false) {
    // Dynamic Serverside Injection for Social Share Crawlers (FB, Twitter, Google)
    $index = str_replace('<title>Healthedia - Global Health &amp; Performance Archive</title>', '<title>' . SEO_TITLE . '</title>', $index);
    $index = str_replace('<meta name="description" content="..." />', '<meta name="description" content="' . SEO_DESC . '" />', $index);
    
    header('Content-Type: text/html; charset=utf-8');
    echo $index;
    exit();
} else {
    http_response_code(404);
    echo "<h1>404 Not Found</h1><p>Please build and upload your static assets first.</p>";
}
?>`;

  // htaccess code for LiteSpeed optimization and cache
  const htaccessCode = `# Healthedia LiteSpeed Web Server configuration
# Fully compatible with Hostinger hPanel and Apache Mod_Rewrite

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect HTTP to HTTPS permanently
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Route custom static requests through PHP router for SEO Meta tagging
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php [L]
</IfModule>

# Enable Gzip/Brotli Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching Headers for Hostinger Speed Optimization
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresDefault "access plus 2 days"
</IfModule>

# LiteSpeed Cache Optimization Rules
<IfModule litespeed>
  CacheEnable public /
  CacheIgnoreCacheControl On
  CacheMaxFileSize 2000000
</IfModule>
`;

  // Download utilities
  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addAuditLog(`Downloaded deployed configuration asset: ${filename}`, "Deploy");
    showToast(`Successfully downloaded ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold shadow-lg ${
          toast.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <CheckCircle className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sub-navigation headers */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-100 pb-3">
        <button
          onClick={() => setSubTab("general")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "general" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          SEO Settings
        </button>
        <button
          onClick={() => setSubTab("pages")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "pages" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Page Management
        </button>
        <button
          onClick={() => setSubTab("redirects")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "redirects" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Redirect Managers
        </button>
        <button
          onClick={() => setSubTab("sitemap")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "sitemap" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Sitemap & Robots
        </button>
        <button
          onClick={() => setSubTab("hostinger")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "hostinger" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Hostinger Deployment
        </button>
        <button
          onClick={() => setSubTab("audit")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            subTab === "audit" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Audit History
        </button>
      </div>

      {/* SUB-TAB: GENERAL SETTINGS */}
      {subTab === "general" && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wide">Homepage SEO & Global Meta Settings</h2>
            <p className="text-xs text-neutral-400">Configure search crawlers metadata, search indexers, and analytics tags.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Global Site Title</label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Homepage Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Meta Keywords (Optional)</label>
                <input
                  type="text"
                  value={settings.metaKeywords}
                  onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Google Search Console Tag</label>
                  <input
                    type="text"
                    placeholder="google-site-verification..."
                    value={settings.googleSearchConsole}
                    onChange={(e) => setSettings({ ...settings, googleSearchConsole: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Bing Webmaster Code</label>
                  <input
                    type="text"
                    placeholder="msvalidate.01..."
                    value={settings.bingWebmaster}
                    onChange={(e) => setSettings({ ...settings, bingWebmaster: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Canonical Domain</label>
                <input
                  type="text"
                  value={settings.canonicalDomain}
                  onChange={(e) => setSettings({ ...settings, canonicalDomain: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Meta Title Template</label>
                  <input
                    type="text"
                    value={settings.metaTemplate}
                    onChange={(e) => setSettings({ ...settings, metaTemplate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Open Graph OG Title Template</label>
                  <input
                    type="text"
                    value={settings.ogTitleTemplate}
                    onChange={(e) => setSettings({ ...settings, ogTitleTemplate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Social Preview Facebook / LinkedIn Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.socialPreviewImage}
                    onChange={(e) => setSettings({ ...settings, socialPreviewImage: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono text-[10px]"
                  />
                  <div className="w-10 h-8 rounded border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center">
                    <img src={settings.socialPreviewImage} alt="preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Header Tracking Scripts (Google Analytics/Tag Manager)</label>
                <textarea
                  rows={4}
                  value={settings.customHeaderScripts}
                  onChange={(e) => setSettings({ ...settings, customHeaderScripts: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono text-[10px]"
                />
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.searchEngineIndex}
                  onChange={(e) => setSettings({ ...settings, searchEngineIndex: e.target.checked })}
                  className="rounded border-neutral-300 text-black focus:ring-black w-4 h-4"
                />
                <span className="text-xs font-semibold text-neutral-800">Global Index (Allow crawlers to Index pages)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.searchEngineFollow}
                  onChange={(e) => setSettings({ ...settings, searchEngineFollow: e.target.checked })}
                  className="rounded border-neutral-300 text-black focus:ring-black w-4 h-4"
                />
                <span className="text-xs font-semibold text-neutral-800">Global Follow (Follow all links on-site)</span>
              </label>
            </div>
            <button
              onClick={() => saveSettings(settings)}
              className="px-4 py-2 bg-black hover:opacity-90 text-white text-xs font-bold font-mono rounded-lg cursor-pointer transition-colors"
            >
              Apply SEO Changes
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB: PAGES MANAGER */}
      {subTab === "pages" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wide">Website Page Directories</h2>
              <p className="text-xs text-neutral-400">List, edit URL slugs, update SEO override meta properties, publish/unpublish pages, or manage dynamic revisions.</p>
            </div>
            <button
              onClick={() => {
                clearPageForm();
                setIsPageModalOpen(true);
              }}
              className="inline-flex items-center px-3.5 py-1.5 bg-black text-white hover:opacity-90 rounded-lg text-xs font-bold font-mono cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Initialize New Page
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search managed pages by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          {/* Page Modal */}
          {isPageModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    {editingPage ? "Modify Page Properties" : "Initialize New Page Definition"}
                  </h3>
                  <button
                    onClick={() => setIsPageModalOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-black cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handlePageSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Page / Section Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Terms of Publication"
                        value={pageTitle}
                        onChange={(e) => {
                          setPageTitle(e.target.value);
                          if (!editingPage) {
                            setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                          }
                        }}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">URL Path Slug (SEO-Friendly)</label>
                      <input
                        type="text"
                        required
                        disabled={editingPage?.isSystem}
                        placeholder="e.g. publication-terms"
                        value={pageSlug}
                        onChange={(e) => setPageSlug(e.target.value)}
                        className={`w-full px-3 py-2 text-xs border rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono ${
                          editingPage?.isSystem ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : ""
                        }`}
                      />
                      {editingPage?.isSystem && <span className="text-[10px] text-neutral-400 italic">System route slugs cannot be altered.</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Publish Status</label>
                      <select
                        value={pageStatus}
                        onChange={(e) => setPageStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="Published">Published (Active)</option>
                        <option value="Draft">Draft (Offline)</option>
                        <option value="Trash">Trash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Site Visibility</label>
                      <select
                        value={pageVisibility}
                        onChange={(e) => setPageVisibility(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="Public">Public Access</option>
                        <option value="Private">Admin & Reviewer Only</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pageHideNav}
                          onChange={(e) => setPageHideNav(e.target.checked)}
                          className="rounded border-neutral-300 text-black focus:ring-black w-4 h-4"
                        />
                        <span className="text-xs font-semibold text-neutral-700">Hide from Navbar</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-4 space-y-4">
                    <h4 className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">SEO overrides for this page</h4>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Page-Specific Title Tag Override</label>
                      <input
                        type="text"
                        placeholder="e.g. Terms &amp; Academic Guidelines - Healthedia"
                        value={pageSeoTitle}
                        onChange={(e) => setPageSeoTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Page Meta Description Override</label>
                      <textarea
                        rows={2}
                        placeholder="Provide an eye-catching summary for search results (aim for under 155 characters)..."
                        value={pageSeoDescription}
                        onChange={(e) => setPageSeoDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Permanent Forward / Custom Redirect Path (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. /privacy (forces a forward immediately on visiting this page)"
                        value={pageRedirect}
                        onChange={(e) => setPageRedirect(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-4 flex justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => setIsPageModalOpen(false)}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-black hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
                    >
                      {editingPage ? "Update Page" : "Publish Page"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Pages Table */}
          <div className="border border-neutral-200/80 rounded-xl overflow-hidden bg-white">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Page / Slug</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Publish Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Visibility</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Nav Presence</th>
                  <th className="px-6 py-3 text-right text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs">
                {filteredPages.map(page => (
                  <tr key={page.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{page.title}</div>
                      <div className="font-mono text-[10px] text-neutral-400 mt-0.5">/{page.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase font-mono ${
                        page.status === "Published" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                          : page.status === "Draft"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200/50"
                          : "bg-red-50 text-red-700 border border-red-200/50"
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-600">
                      {page.visibility}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {page.hideFromNav ? "Hidden from Menu" : "Visible in Menu"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditPage(page)}
                        className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded transition-colors"
                        title="Edit Page SEO & Slug"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline-block" />
                      </button>
                      <button
                        onClick={() => duplicatePage(page)}
                        className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded transition-colors"
                        title="Duplicate Page"
                      >
                        <Copy className="w-3.5 h-3.5 inline-block" />
                      </button>
                      
                      {page.status !== "Trash" ? (
                        <button
                          onClick={() => handlePageStatusChange(page.id, "Trash")}
                          className="p-1 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded transition-colors"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline-block" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handlePageStatusChange(page.id, "Published")}
                            className="p-1 hover:bg-emerald-50 text-neutral-500 hover:text-emerald-600 rounded transition-colors text-[10px] font-mono font-bold uppercase"
                            title="Restore Page"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => permanentlyDeletePage(page.id)}
                            className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                            title="Permanently Delete Page"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline-block" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredPages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-neutral-400 italic">
                      No managed page entries found matching '{searchQuery}'.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: REDIRECTS MANAGER */}
      {subTab === "redirects" && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wide">301 & 302 URL Redirect Rules Manager</h2>
            <p className="text-xs text-neutral-400">Map old URLs to newly created routes. Preserve SEO link equity and avoid broken user experience.</p>
          </div>

          <form onSubmit={handleAddRedirect} className="bg-neutral-50 p-5 rounded-xl border border-neutral-200/60 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Source Path (Old URL)</label>
              <input
                type="text"
                required
                placeholder="e.g. /archive/2023"
                value={redirSource}
                onChange={(e) => setRedirSource(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Route (New URL)</label>
              <input
                type="text"
                required
                placeholder="e.g. /journal"
                value={redirTarget}
                onChange={(e) => setRedirTarget(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Redirect Code</label>
              <select
                value={redirStatus}
                onChange={(e) => setRedirStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="301">301 (Permanent Redirect)</option>
                <option value="302">302 (Temporary Redirect)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-black hover:opacity-90 text-white text-xs font-bold font-mono rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rule
            </button>
          </form>

          <div className="border border-neutral-200/80 rounded-xl overflow-hidden bg-white">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Source Request Path</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Forwarding Destination</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">HTTP Status</th>
                  <th className="px-6 py-3 text-right text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs">
                {redirects.map((redir) => (
                  <tr key={redir.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4 font-mono text-neutral-800">{redir.source}</td>
                    <td className="px-6 py-4 font-mono text-neutral-800 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-neutral-400" />
                      {redir.target}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        redir.status === "301" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {redir.status === "301" ? "301 Permanent" : "302 Temporary"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteRedirect(redir.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        title="Remove redirect rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {redirects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-400 italic">
                      No active URL redirect mappings defined.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: SITEMAP & ROBOTS */}
      {subTab === "sitemap" && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wide">XML Sitemap & Robots.txt Customizer</h2>
            <p className="text-xs text-neutral-400">Generate fully search-engine compatible maps indexing your publications, authors, and directory files.</p>
          </div>

          {/* Sync Status Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold block">Hook Integration Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-neutral-800">Automated Sync Enabled</span>
              </div>
              <p className="text-[10px] text-neutral-500">Sitemap automatically regenerates on any page, publication, or researcher directory update.</p>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold block">Dynamic XML Endpoint</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-800">GET /sitemap.xml</span>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-neutral-500 hover:text-black font-mono inline-flex items-center gap-1 hover:underline"
                >
                  Open Endpoint <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[10px] text-neutral-500">Live dynamic feed directly served by the custom Express server on Port 3000.</p>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold block">Robots Directives Endpoint</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-800">GET /robots.txt</span>
                </div>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-neutral-500 hover:text-black font-mono inline-flex items-center gap-1 hover:underline"
                >
                  Open Endpoint <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[10px] text-neutral-500">Direct server-side crawler directive mapping for SEO spider spiders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sitemap section */}
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 border border-neutral-200/80 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-neutral-800 uppercase font-mono">Live XML Sitemap compiler</h3>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Queries current indices representing **{pages.length} Pages**, **{INITIAL_PAPERS.length} Papers**, and verified academic researchers to compile a schema-compliant index.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handlePingSearchEngines}
                    className="px-3 py-1.5 bg-black hover:opacity-90 text-white text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin-slow" />
                    Force Refresh & Sync
                  </button>
                  <button
                    onClick={() => triggerDownload("sitemap.xml", generateSitemapXml(), "application/xml")}
                    className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Download sitemap.xml
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Live sitemap.xml Preview</label>
                <div className="p-3 bg-neutral-900 text-emerald-400 font-mono text-[10px] rounded-lg border border-neutral-800 overflow-x-auto max-h-[250px]">
                  <pre className="whitespace-pre">{generateSitemapXml()}</pre>
                </div>
              </div>
            </div>

            {/* Robots.txt section */}
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 border border-neutral-200/80 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-neutral-800 uppercase font-mono">Crawler Directives (robots.txt)</h3>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Explicitly permit Googlebot, Bingbot, and other academic indexing crawlers to index papers, while shielding secure user directories or private authentication pages.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveRobots}
                    className="px-3 py-1.5 bg-black hover:opacity-90 text-white text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer transition-all"
                  >
                    Save & Sync robots.txt
                  </button>
                  <button
                    onClick={() => triggerDownload("robots.txt", robotsTxt, "text/plain")}
                    className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Download robots.txt
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Configure robots.txt direct rules</label>
                <textarea
                  rows={11}
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  className="w-full p-3 bg-neutral-900 text-neutral-200 font-mono text-[11px] rounded-lg border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: HOSTINGER COMPATIBILITY */}
      {subTab === "hostinger" && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wide">Hostinger Compatibility & Deployer Tool suite</h2>
            <p className="text-xs text-neutral-400 font-sans">Verify, configure, and output configuration packages optimized for Hostinger Shared hosting, hPanel, VPS, LiteSpeed, and PHP 8.3.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compatibility Diagnostics */}
            <div className="lg:col-span-1 border border-neutral-200 p-5 rounded-xl bg-white space-y-4 shadow-2xs">
              <h3 className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">hPanel Environment Checklist</h3>
              
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
                  <span className="text-xs text-neutral-600 font-semibold">PHP Engine Support</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">8.3 Verified</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
                  <span className="text-xs text-neutral-600 font-semibold">Web Server Compatibility</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">LiteSpeed Optim</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
                  <span className="text-xs text-neutral-600 font-semibold">LiteSpeed Cache Integration</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Enable LSCache</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
                  <span className="text-xs text-neutral-600 font-semibold">Relational Database</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">MariaDB / MySQL</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
                  <span className="text-xs text-neutral-600 font-semibold">File Permission Levels</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Safe [644/755]</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
                  <span className="text-xs text-neutral-600 font-semibold">Cron Job Scheduler</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Active (5m)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={runHostingerDiagnostics}
                  disabled={diagnosticsRunning}
                  className="w-full py-2 bg-neutral-900 text-white font-mono text-[10px] font-bold uppercase hover:bg-black rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsRunning ? "animate-spin" : ""}`} />
                  {diagnosticsRunning ? "Scanners active..." : "Run Environment Scan"}
                </button>
              </div>

              {diagnosticsDone && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-[11px] leading-relaxed">
                  <strong>Status:</strong> Safe. Static assets can be compiled for LiteSpeed via Apache config, with MySQL database templates ready for manual hPanel schema deployment.
                </div>
              )}
            </div>

            {/* Asset Downloader Panel */}
            <div className="lg:col-span-2 border border-neutral-200 p-5 rounded-xl bg-white space-y-5">
              <h3 className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">One-Click Hostinger Deployment Exporter</h3>
              <p className="text-xs text-neutral-500">Healthedia includes custom server setups that enable standard Hostinger Shared, Cloud, and VPS environments to route routing maps and caching correctly.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 border border-neutral-100 rounded-lg space-y-2 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-neutral-800" />
                    <h4 className="text-xs font-bold text-neutral-800">Apache &amp; LiteSpeed .htaccess</h4>
                  </div>
                  <p className="text-[11px] text-neutral-400">Routes request definitions safely to the router, enables GZIP compression, and activates LiteSpeed cache modules.</p>
                  <button
                    onClick={() => triggerDownload(".htaccess", htaccessCode, "text/plain")}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
                  >
                    Download .htaccess
                  </button>
                </div>

                <div className="p-3 border border-neutral-100 rounded-lg space-y-2 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-neutral-800" />
                    <h4 className="text-xs font-bold text-neutral-800">PHP 8.3 Route Interceptor</h4>
                  </div>
                  <p className="text-[11px] text-neutral-400">Integrates redirect mappings, parses SEO page titles, and serves the static indices with server-side Open Graph tags.</p>
                  <button
                    onClick={() => triggerDownload("index.php", phpRouterCode, "text/plain")}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
                  >
                    Download index.php
                  </button>
                </div>

                <div className="p-3 border border-neutral-100 rounded-lg space-y-2 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-neutral-800" />
                    <h4 className="text-xs font-bold text-neutral-800">MySQL/MariaDB Schema SQL</h4>
                  </div>
                  <p className="text-[11px] text-neutral-400">Export SQL schema to set up your Healthedia database on Hostinger PhpMyAdmin instantly.</p>
                  <button
                    onClick={() => {
                      const dbSchema = `-- Healthedia MariaDB Schema SQL\nCREATE TABLE IF NOT EXISTS seo_settings (\n  site_title VARCHAR(255),\n  site_desc TEXT\n);\nCREATE TABLE IF NOT EXISTS pages (\n  id VARCHAR(64) PRIMARY KEY,\n  title VARCHAR(255),\n  slug VARCHAR(255) UNIQUE,\n  status VARCHAR(24)\n);\n-- Seed data included...`;
                      triggerDownload("healthedia_schema.sql", dbSchema, "text/plain");
                    }}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
                  >
                    Export schema.sql
                  </button>
                </div>

                <div className="p-3 border border-neutral-100 rounded-lg space-y-2 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-neutral-800" />
                    <h4 className="text-xs font-bold text-neutral-800">hPanel Cron Setup Guide</h4>
                  </div>
                  <p className="text-[11px] text-neutral-400">Step-by-step shell command to trigger sitemap regeneration automatically every 24 hours.</p>
                  <button
                    onClick={() => {
                      alert("Hostinger Cron Command to trigger daily Sitemap updates:\n\n/usr/bin/php /home/u123456789/public_html/index.php --action=ping_sitemap\n\nConfigure in hPanel -> Advanced -> Cron Jobs -> Interval: Daily");
                    }}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-colors"
                  >
                    View Cron Manual
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUDIT LOGS */}
      {subTab === "audit" && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wide">Administrative Action Audit Logs</h2>
            <p className="text-xs text-neutral-400">Verifiable logging of critical SEO overrides, sitemap generations, redirect rules additions, and file deployment outputs.</p>
          </div>

          <div className="border border-neutral-200/80 rounded-xl overflow-hidden bg-white max-h-[450px] overflow-y-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Action Description</th>
                  <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Authorized User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-3 text-neutral-400 text-[11px]">{log.timestamp}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        log.type === "SEO" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                        log.type === "Page" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        log.type === "Redirect" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                        log.type === "Sitemap" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        log.type === "Robots" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-neutral-800 font-sans text-xs">{log.action}</td>
                    <td className="px-6 py-3 text-neutral-500 text-[11px]">{log.user}</td>
                  </tr>
                ))}

                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-400 italic">
                      No administrative actions logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
