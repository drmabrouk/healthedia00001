import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import SearchResultsView from "./components/SearchResultsView";
import ResearchersView from "./components/ResearchersView";
import InstitutionsView from "./components/InstitutionsView";
import JournalView from "./components/JournalView";
import UserProfileView from "./components/UserProfileView";
import AuthView from "./components/AuthView";
import SupportView from "./components/SupportView";
import LegalView from "./components/LegalView";
import AdminDashboardView from "./components/AdminDashboardView";
import ReviewerDashboardView from "./components/ReviewerDashboardView";
import CoursesView from "./components/CoursesView";
import ResearchPaperView from "./components/ResearchPaperView";
import ManuscriptSubmissionView from "./components/ManuscriptSubmissionView";
import PageNotFoundView from "./components/PageNotFoundView";
import ResearchWorkspaceView from "./components/ResearchWorkspaceView";
import CertificateVerificationView from "./components/CertificateVerificationView";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";
import { getSlug, updateDocumentSEO } from "./lib/seoHelper";
import { getStoredItem, DEMO_USERS } from "./lib/taxonomyStore";
import { SEOSettings, SEOPage, SEORedirect, DEFAULT_SEO_SETTINGS, INITIAL_PAGES, INITIAL_REDIRECTS } from "./components/SEOManagerView";
import { INITIAL_PAPERS } from "./data";
import { UserProfileData, NotificationItem } from "./types";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "verification_approved",
    title: "Account Verification Approved",
    description: "Your academic and clinical credentials have been verified. You now hold full indexing privileges.",
    timestamp: "2026-07-15 09:15",
    read: false,
    targetPage: "profile"
  },
  {
    id: "notif-2",
    type: "revision_requested",
    title: "Revision Requested",
    description: "The editorial board requested revisions on your manuscript: 'Myocardial Strain Dynamics in Endurance Runners'.",
    timestamp: "2026-07-15 08:30",
    read: false,
    targetPage: "journal"
  },
  {
    id: "notif-3",
    type: "institution_approved",
    title: "Institution Submission Approved",
    description: "Sorbonne University Clinical Center profile proposal approved and published to registries.",
    timestamp: "2026-07-14 16:45",
    read: false,
    targetPage: "institutions",
    targetDetails: { id: "sorbonne" }
  },
  {
    id: "notif-4",
    type: "security",
    title: "Security Alert: New Sign In",
    description: "A new sign-in was detected on your account from Safari on macOS (IP: 194.22.105.14).",
    timestamp: "2026-07-14 12:10",
    read: true,
    targetPage: "profile"
  },
  {
    id: "notif-5",
    type: "role_changed",
    title: "Account Role Elevated",
    description: "Your platform credentials have been elevated from Member to Researcher.",
    timestamp: "2026-07-13 10:22",
    read: true,
    targetPage: "profile"
  },
  {
    id: "notif-6",
    type: "research_approved",
    title: "Research Approved for Indexing",
    description: "Your paper on 'Sarcopenia Progression' has been assigned DOI: 10.1016/j.arch.2026.012.",
    timestamp: "2026-07-12 11:30",
    read: true,
    targetPage: "journal"
  },
  {
    id: "notif-7",
    type: "reviewer_comments",
    title: "New Reviewer Comments Dispatched",
    description: "Dr. Evelyn Thorne added clinical feedback comments on your altitude performance trial.",
    timestamp: "2026-07-11 15:20",
    read: true,
    targetPage: "journal"
  },
  {
    id: "notif-8",
    type: "support_update",
    title: "Support Ticket Resolved",
    description: "Ticket #2844 ('ORCID syncing credentials') has been resolved by engineering.",
    timestamp: "2026-07-11 09:05",
    read: true,
    targetPage: "support"
  },
  {
    id: "notif-9",
    type: "administrative",
    title: "Administrative Announcement",
    description: "System database indexes are undergoing optimization on Saturday at 03:00 UTC. Expect slight delays.",
    timestamp: "2026-07-10 14:00",
    read: true,
    targetPage: "home"
  },
  {
    id: "notif-10",
    type: "verification_rejected",
    title: "Verification Rejected",
    description: "Your initial institutional document was blurry. Please re-upload your current academic ID card.",
    timestamp: "2026-07-09 13:40",
    read: true,
    targetPage: "profile"
  },
  {
    id: "notif-11",
    type: "research_received",
    title: "Research Submission Received",
    description: "Manuscript 'Ketone Supplementation in Elite Cyclists' has been successfully logged.",
    timestamp: "2026-07-08 17:15",
    read: true,
    targetPage: "journal"
  },
  {
    id: "notif-12",
    type: "research_rejected",
    title: "Research Submission Rejected",
    description: "Your manuscript was rejected: doesn't meet double-blind physiological control standards.",
    timestamp: "2026-07-07 10:50",
    read: true,
    targetPage: "journal"
  },
  {
    id: "notif-13",
    type: "institution_rejected",
    title: "Institution Submission Rejected",
    description: "The submitted medical profile did not meet Healthedia registry requirements.",
    timestamp: "2026-07-06 14:15",
    read: true,
    targetPage: "institutions"
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(null);
  const [selectedResearcherUsername, setSelectedResearcherUsername] = useState<string | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<"profile" | "settings" | "manuscripts" | "requests" | "impact">("profile");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Global Keyboard Shortcuts Engine
  useEffect(() => {
    const handleOpenShortcuts = () => setShowShortcutsModal(true);
    window.addEventListener("healthedia:open-shortcuts", handleOpenShortcuts);
    return () => window.removeEventListener("healthedia:open-shortcuts", handleOpenShortcuts);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditing = 
        target && (
          target.tagName === "INPUT" || 
          target.tagName === "TEXTAREA" || 
          target.tagName === "SELECT" || 
          target.isContentEditable
        );

      // 1. Esc Key -> Close open dialogs/modals/drawers or blur search input
      if (e.key === "Escape" || e.key === "Esc") {
        window.dispatchEvent(new CustomEvent("healthedia:close-modals"));
        setShowShortcutsModal(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      // If user is actively typing in an input/textarea/select/editable field, ignore navigation shortcuts
      if (isEditing) return;

      // 2. '/' or 'Cmd+K' / 'Ctrl+K' -> Focus primary search input
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[data-search-input="true"], input[type="search"], input[placeholder*="Search" i], input[placeholder*="search" i]'
        ) || document.querySelector<HTMLInputElement>('input[type="text"]');

        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 3. '?' -> Toggle Keyboard Shortcuts Cheat Sheet Modal
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // 4. Alt + Key Navigation Shortcuts
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "h") { e.preventDefault(); setCurrentPage("home"); }
        else if (key === "j") { e.preventDefault(); setCurrentPage("journal"); }
        else if (key === "r") { e.preventDefault(); setCurrentPage("researchers"); }
        else if (key === "i") { e.preventDefault(); setCurrentPage("institutions"); }
        else if (key === "c") { e.preventDefault(); setCurrentPage("courses"); }
        else if (key === "w") { e.preventDefault(); setCurrentPage("research-workspace"); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll to top on page change, check redirects and update SEO tags dynamically
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    // 1. Check for redirects in healthedia_redirects matching /${currentPage}
    const storedRedirects = localStorage.getItem("healthedia_redirects");
    if (storedRedirects) {
      try {
        const redirectsList = JSON.parse(storedRedirects);
        const matched = redirectsList.find((r: any) => 
          r.source === `/${currentPage}` || r.source === currentPage
        );
        if (matched) {
          const targetClean = matched.target.replace(/^\//, "");
          setCurrentPage(targetClean || "home");
          showToast(`URL Redirected (${matched.status}): ${matched.source} ➔ ${matched.target}`, "info");
          return;
        }
      } catch (err) {
        console.error("Failed to parse redirects:", err);
      }
    }

    // 2. Fetch page list to customize document title and description dynamically
    const storedPages = localStorage.getItem("healthedia_pages");
    if (storedPages) {
      try {
        const pagesList = JSON.parse(storedPages);
        const matchedPage = pagesList.find((p: any) => p.slug === currentPage);
        if (matchedPage) {
          // Dynamic SEO Injection
          document.title = matchedPage.seoTitle || `${matchedPage.title} | Healthedia`;
          
          let metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute("content", matchedPage.seoDescription || "Healthedia - Global Health & Performance Archive");
          } else {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            metaDesc.setAttribute("content", matchedPage.seoDescription || "Healthedia - Global Health & Performance Archive");
            document.head.appendChild(metaDesc);
          }
        } else {
          // Default fallbacks for unmapped system routes
          const defaultTitles: Record<string, string> = {
            "home": "Healthedia | Sports Science & Medical Research Archive",
            "search-results": "Search Research Papers - Healthedia",
            "researchers": "Verified Academic Researchers Directory - Healthedia",
            "institutions": "Global Health & Clinical Institutions - Healthedia",
            "courses": "Professional Performance Courses - Healthedia",
            "journal": "Academic Journal - Healthedia",
            "dashboard": "System Administration Dashboard - Healthedia"
          };
          if (defaultTitles[currentPage]) {
            document.title = defaultTitles[currentPage];
          }
        }
      } catch (err) {
        console.error("Failed to update page SEO tags:", err);
      }
    }
  }, [currentPage]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load user session and notifications on mount
  useEffect(() => {
    const session = localStorage.getItem("healthedia_current_user");
    if (session) {
      setCurrentUser(JSON.parse(session));
    }

    const storedNotifs = localStorage.getItem("healthedia_notifications");
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
      localStorage.setItem("healthedia_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }, []);

  const handleNotificationClick = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("healthedia_notifications", JSON.stringify(updated));

    const clicked = notifications.find(n => n.id === id);
    if (clicked) {
      if (clicked.targetPage === "profile") {
        setProfileActiveTab("profile");
        setCurrentPage("profile");
      } else if (clicked.targetPage === "settings" || (clicked.targetPage === "profile" && clicked.type === "security")) {
        setProfileActiveTab("settings");
        setCurrentPage("profile");
      } else if (clicked.targetPage === "journal") {
        setCurrentPage("journal");
      } else if (clicked.targetPage === "institutions") {
        if (clicked.targetDetails?.id) {
          setSelectedInstitutionId(clicked.targetDetails.id);
        }
        setCurrentPage("institutions");
      } else if (clicked.targetPage === "support") {
        setCurrentPage("support");
      } else {
        setCurrentPage(clicked.targetPage || "home");
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("healthedia_notifications", JSON.stringify(updated));
    showToast("All notifications marked as read", "success");
  };


  // Advanced URL, Pathname & Backward Hash Router
  useEffect(() => {
    const syncUrlToState = () => {
      let pathname = window.location.pathname;
      const hash = window.location.hash;
      const papers = getStoredItem<any[]>("healthedia_published_papers", INITIAL_PAPERS);

      // Handle backwards compatibility with legacy hash routes - redirect to clean pathname
      if (hash && hash !== "#") {
        if (hash.startsWith("#researcher/") || hash.startsWith("#/researcher/")) {
          const username = hash.split("/").pop();
          if (username) {
            window.history.replaceState(null, "", `/researchers/${username}`);
            pathname = `/researchers/${username}`;
            window.location.hash = "";
          }
        } else if (hash.startsWith("#institutions/") || hash.startsWith("#/institutions/")) {
          const instId = hash.split("/").pop();
          if (instId) {
            window.history.replaceState(null, "", `/institutions/${instId}`);
            pathname = `/institutions/${instId}`;
            window.location.hash = "";
          }
        } else if (hash.startsWith("#paper/") || hash.startsWith("#/paper/")) {
          const paperId = hash.split("/").pop();
          if (paperId) {
            const paper = papers.find(p => p.id === paperId);
            const slug = paper ? getSlug(paper.title) : paperId;
            window.history.replaceState(null, "", `/research/${slug}`);
            pathname = `/research/${slug}`;
            window.location.hash = "";
          }
        } else {
          const cleanHash = hash.replace("#", "");
          const standardPages = ["home", "search-results", "researchers", "institutions", "courses", "journal", "profile", "dashboard", "login", "registration", "support", "terms", "privacy", "publication-policies", "paper", "research-workspace", "certificate-verification"];
          if (standardPages.includes(cleanHash)) {
            let targetPath = `/${cleanHash}`;
            if (cleanHash === "home") targetPath = "/";
            else if (cleanHash === "search-results") targetPath = "/research/search";
            else if (cleanHash === "terms") targetPath = "/terms-and-conditions";
            else if (cleanHash === "privacy") targetPath = "/privacy-policy";
            
            window.history.replaceState(null, "", targetPath);
            pathname = targetPath;
            window.location.hash = "";
          }
        }
      }

      // 301/302 Redirect Manager Rules
      const storedRedirects = getStoredItem<SEORedirect[]>("healthedia_redirects", INITIAL_REDIRECTS);
      const matchedRedirect = storedRedirects.find(r => r.source === pathname || r.source === pathname + "/");
      if (matchedRedirect) {
        console.log(`[Permanent 301/302 Redirect] Navigating from ${pathname} to ${matchedRedirect.target}`);
        window.history.replaceState(null, "", matchedRedirect.target);
        pathname = matchedRedirect.target;
      }

      // Custom Pages checking from Admin Page Manager
      const storedPages = getStoredItem<SEOPage[]>("healthedia_pages", INITIAL_PAGES);
      const matchedCustomPage = storedPages.find(p => `/${p.slug}` === pathname || p.slug === pathname);
      if (matchedCustomPage && matchedCustomPage.status === "Published") {
        if (matchedCustomPage.redirectUrl) {
          window.history.replaceState(null, "", matchedCustomPage.redirectUrl);
          pathname = matchedCustomPage.redirectUrl;
        } else {
          setCurrentPage(matchedCustomPage.slug);
          setSelectedPaperId(null);
          setSelectedResearcherUsername(null);
          setSelectedInstitutionId(null);
          return;
        }
      }

      // Root, Search, Profile, Courses, Journal matching
      if (pathname === "/" || pathname === "/home") {
        setCurrentPage("home");
        setSelectedPaperId(null);
        setSelectedResearcherUsername(null);
        setSelectedInstitutionId(null);
      } else if (pathname === "/research" || pathname === "/journal" || pathname === "/articles") {
        setCurrentPage("journal");
        setSelectedPaperId(null);
        setSelectedResearcherUsername(null);
        setSelectedInstitutionId(null);
      } else if (pathname === "/research/search") {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("query") || params.get("q") || "";
        if (q) setSearchQuery(q);
        setCurrentPage("search-results");
        setSelectedPaperId(null);
        setSelectedResearcherUsername(null);
        setSelectedInstitutionId(null);
      } else if (pathname.startsWith("/research/")) {
        const slugOrId = pathname.replace("/research/", "");
        const paper = papers.find(p => getSlug(p.title) === slugOrId || p.id === slugOrId);
        if (paper) {
          setSelectedPaperId(paper.id);
          setCurrentPage("paper");
        } else {
          setCurrentPage("404");
        }
      } else if (pathname.startsWith("/journal/")) {
        const slugOrId = pathname.replace("/journal/", "");
        const paper = papers.find(p => getSlug(p.title) === slugOrId || p.id === slugOrId);
        if (paper) {
          setSelectedPaperId(paper.id);
          setCurrentPage("paper");
        } else {
          setCurrentPage("404");
        }
      } else if (pathname.startsWith("/articles/")) {
        const slugOrId = pathname.replace("/articles/", "");
        const paper = papers.find(p => getSlug(p.title) === slugOrId || p.id === slugOrId);
        if (paper) {
          setSelectedPaperId(paper.id);
          setCurrentPage("paper");
        } else {
          setCurrentPage("404");
        }
      } else if (pathname === "/researchers") {
        setCurrentPage("researchers");
        setSelectedPaperId(null);
        setSelectedResearcherUsername(null);
        setSelectedInstitutionId(null);
      } else if (pathname.startsWith("/researchers/")) {
        const username = pathname.replace("/researchers/", "");
        setSelectedResearcherUsername(username);
        setCurrentPage("researcher-profile");
      } else if (pathname === "/institutions") {
        setCurrentPage("institutions");
        setSelectedPaperId(null);
        setSelectedResearcherUsername(null);
        setSelectedInstitutionId(null);
      } else if (pathname.startsWith("/institutions/")) {
        const instSlug = pathname.replace("/institutions/", "");
        const insts = getStoredItem<any[]>("healthedia_institutions", []);
        const inst = insts.find(i => getSlug(i.name) === instSlug || i.id === instSlug);
        if (inst) {
          setSelectedInstitutionId(inst.id);
          setCurrentPage("institutions");
        } else {
          setSelectedInstitutionId(instSlug);
          setCurrentPage("institutions");
        }
      } else if (pathname === "/courses") {
        setCurrentPage("courses");
      } else if (pathname === "/profile") {
        setCurrentPage("profile");
      } else if (pathname === "/dashboard") {
        setCurrentPage("dashboard");
      } else if (pathname === "/login") {
        setCurrentPage("login");
      } else if (pathname === "/registration" || pathname === "/register") {
        setCurrentPage("registration");
      } else if (pathname === "/support") {
        setCurrentPage("support");
      } else if (pathname === "/manuscript-submission") {
        setCurrentPage("submission-portal");
      } else if (pathname === "/certificate-verification") {
        setCurrentPage("certificate-verification");
        setSelectedPaperId(null);
      } else if (pathname.startsWith("/certificate-verification/")) {
        const code = pathname.replace("/certificate-verification/", "");
        setSelectedPaperId(code);
        setCurrentPage("certificate-verification");
      } else if (pathname === "/privacy-policy" || pathname === "/privacy") {
        setCurrentPage("privacy");
      } else if (pathname === "/terms-and-conditions" || pathname === "/terms") {
        setCurrentPage("terms");
      } else if (pathname === "/publication-policies") {
        setCurrentPage("publication-policies");
      } else if (pathname === "/research-workspace") {
        setCurrentPage("research-workspace");
      } else {
        setCurrentPage("404");
      }
    };

    window.addEventListener("popstate", syncUrlToState);
    syncUrlToState();

    return () => window.removeEventListener("popstate", syncUrlToState);
  }, []);

  // Sync internal React page states back to URL pathnames
  useEffect(() => {
    let targetPath = "/";
    const papers = getStoredItem<any[]>("healthedia_published_papers", INITIAL_PAPERS);

    if (currentPage === "home") {
      targetPath = "/";
    } else if (currentPage === "journal") {
      targetPath = "/journal";
    } else if (currentPage === "search-results") {
      targetPath = searchQuery ? `/research/search?query=${encodeURIComponent(searchQuery)}` : "/research/search";
    } else if (currentPage === "paper" && selectedPaperId) {
      const paper = papers.find(p => p.id === selectedPaperId);
      targetPath = paper ? `/research/${getSlug(paper.title)}` : `/research/${selectedPaperId}`;
    } else if (currentPage === "researchers") {
      targetPath = "/researchers";
    } else if (currentPage === "researcher-profile" && selectedResearcherUsername) {
      targetPath = `/researchers/${selectedResearcherUsername}`;
    } else if (currentPage === "institutions") {
      if (selectedInstitutionId) {
        const insts = getStoredItem<any[]>("healthedia_institutions", []);
        const inst = insts.find(i => i.id === selectedInstitutionId);
        targetPath = inst ? `/institutions/${getSlug(inst.name)}` : `/institutions/${selectedInstitutionId}`;
      } else {
        targetPath = "/institutions";
      }
    } else if (currentPage === "courses") {
      targetPath = "/courses";
    } else if (currentPage === "profile") {
      targetPath = "/profile";
    } else if (currentPage === "dashboard") {
      targetPath = "/dashboard";
    } else if (currentPage === "login") {
      targetPath = "/login";
    } else if (currentPage === "registration") {
      targetPath = "/registration";
    } else if (currentPage === "support") {
      targetPath = "/support";
    } else if (currentPage === "submission-portal") {
      targetPath = "/manuscript-submission";
    } else if (currentPage === "certificate-verification") {
      targetPath = selectedPaperId ? `/certificate-verification/${selectedPaperId}` : "/certificate-verification";
    } else if (currentPage === "privacy") {
      targetPath = "/privacy-policy";
    } else if (currentPage === "terms") {
      targetPath = "/terms-and-conditions";
    } else if (currentPage === "publication-policies") {
      targetPath = "/publication-policies";
    } else if (currentPage === "research-workspace") {
      targetPath = "/research-workspace";
    } else if (currentPage === "404") {
      targetPath = "/404-page";
    } else {
      const storedPages = getStoredItem<SEOPage[]>("healthedia_pages", INITIAL_PAGES);
      const customPage = storedPages.find(p => p.slug === currentPage);
      if (customPage) {
        targetPath = `/${customPage.slug}`;
      } else {
        return;
      }
    }

    const currentFull = window.location.pathname + window.location.search;
    if (currentFull !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  }, [currentPage, selectedPaperId, selectedResearcherUsername, selectedInstitutionId, searchQuery]);

  // Handle Dynamic SEO document head tags and JSON-LD structured data updates
  useEffect(() => {
    const settings = getStoredItem<SEOSettings>("healthedia_seo_settings", DEFAULT_SEO_SETTINGS);
    const pages = getStoredItem<SEOPage[]>("healthedia_pages", INITIAL_PAGES);
    const papers = getStoredItem<any[]>("healthedia_published_papers", INITIAL_PAPERS);
    const researchers = getStoredItem<any[]>("healthedia_users", DEMO_USERS);
    const insts = getStoredItem<any[]>("healthedia_institutions", []);

    const activePage = pages.find(p => p.slug === currentPage) || null;
    const activePaper = currentPage === "paper" ? papers.find(p => p.id === selectedPaperId) : null;
    const activeResearcher = currentPage === "researcher-profile" ? researchers.find(r => r.username === selectedResearcherUsername) : null;
    const activeInst = currentPage === "institutions" && selectedInstitutionId ? insts.find(i => i.id === selectedInstitutionId) : null;

    updateDocumentSEO({
      page: activePage,
      paper: activePaper,
      researcher: activeResearcher,
      institution: activeInst,
      settings,
      currentPath: window.location.pathname
    });
  }, [currentPage, selectedPaperId, selectedResearcherUsername, selectedInstitutionId]);

  // Handle successful login or registration
  const handleLoginSuccess = (user: UserProfileData) => {
    setCurrentUser(user);
    localStorage.setItem("healthedia_current_user", JSON.stringify(user));
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("healthedia_current_user");
    setCurrentPage("home");
  };

  // Handle profile updates
  const handleUpdateUser = (updatedData: UserProfileData) => {
    setCurrentUser(updatedData);
    localStorage.setItem("healthedia_current_user", JSON.stringify(updatedData));

    // Update inside registered users database in localStorage as well
    const storedUsers = localStorage.getItem("healthedia_users");
    if (storedUsers) {
      const parsed: UserProfileData[] = JSON.parse(storedUsers);
      const filtered = parsed.filter(u => u.email.toLowerCase() !== updatedData.email.toLowerCase());
      filtered.push(updatedData);
      localStorage.setItem("healthedia_users", JSON.stringify(filtered));
    }
  };

  // Helper to render the correct view based on page state
  const renderView = () => {
    // Check if the current page is set to a Draft or Trash in Page Management
    const storedPages = localStorage.getItem("healthedia_pages");
    if (storedPages) {
      try {
        const pagesList = JSON.parse(storedPages);
        const matchedPage = pagesList.find((p: any) => p.slug === currentPage);
        if (matchedPage && matchedPage.status !== "Published") {
          return (
            <PageNotFoundView
              setCurrentPage={setCurrentPage}
              setSearchQuery={setSearchQuery}
            />
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    switch (currentPage) {
      case "home":
        return (
          <HomeView
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
          />
        );
      case "search-results":
        return (
          <SearchResultsView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onViewPaper={(paperId) => {
              setSelectedPaperId(paperId);
              setCurrentPage("paper");
            }}
          />
        );
      case "researchers":
        return (
          <ResearchersView
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateUser}
          />
        );
      case "institutions":
        return (
          <InstitutionsView
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
            initialSelectedId={selectedInstitutionId}
            showToast={showToast}
          />
        );
      case "researcher-profile":
        return (
          <ResearchersView
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            initialResearcherUsername={selectedResearcherUsername}
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateUser}
          />
        );
      case "dashboard":
        if (!currentUser) {
          return (
            <AuthView
              initialMode="login"
              setCurrentPage={setCurrentPage}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }
        if (currentUser.role === "Admin") {
          return (
            <AdminDashboardView
              currentUser={currentUser}
              setCurrentPage={setCurrentPage}
              onUpdateCurrentUser={handleUpdateUser}
            />
          );
        }
        if (currentUser.role === "Reviewer") {
          return (
            <ReviewerDashboardView
              currentUser={currentUser}
              setCurrentPage={setCurrentPage}
              onUpdateCurrentUser={handleUpdateUser}
            />
          );
        }
        return (
          <AuthView
            initialMode="login"
            setCurrentPage={setCurrentPage}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "courses":
        return (
          <CoursesView
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
            showToast={showToast}
          />
        );
      case "journal":
        return (
          <JournalView
            setSearchQuery={setSearchQuery}
            setCurrentPage={setCurrentPage}
            currentUser={currentUser}
            showToast={showToast}
            onViewPaper={(paperId) => {
              setSelectedPaperId(paperId);
              setCurrentPage("paper");
            }}
          />
        );
      case "paper":
        return (
          <ResearchPaperView
            paperId={selectedPaperId || ""}
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
            showToast={showToast}
          />
        );
      case "submission-portal":
        if (!currentUser) {
          return (
            <AuthView
              initialMode="login"
              setCurrentPage={setCurrentPage}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }
        return (
          <ManuscriptSubmissionView
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
            showToast={showToast}
          />
        );
      case "research-workspace":
        if (!currentUser) {
          return (
            <AuthView
              initialMode="login"
              setCurrentPage={setCurrentPage}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }
        return (
          <ResearchWorkspaceView
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
          />
        );
      case "profile":
        return currentUser ? (
          <UserProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            initialTab={profileActiveTab}
          />
        ) : (
          <AuthView
            initialMode="login"
            setCurrentPage={setCurrentPage}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "login":
        return (
          <AuthView
            initialMode="login"
            setCurrentPage={setCurrentPage}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "registration":
        return (
          <AuthView
            initialMode="register"
            setCurrentPage={setCurrentPage}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "support":
        return <SupportView currentUser={currentUser} />;
      case "terms":
        return <LegalView initialSection="terms" />;
      case "privacy":
        return <LegalView initialSection="privacy" />;
      case "publication-policies":
        return <LegalView initialSection="publication-policies" />;
      case "certificate-verification":
        return (
          <CertificateVerificationView
            initialCode={selectedPaperId || ""}
          />
        );
      default:
        return (
          <PageNotFoundView
            setCurrentPage={setCurrentPage}
            setSearchQuery={setSearchQuery}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      {/* Navigation header */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        setProfileActiveTab={setProfileActiveTab}
      />

      {/* Primary content router block */}
      <main className="flex-grow flex flex-col bg-white">
        {renderView()}
      </main>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-800 text-xs font-mono flex items-center gap-3 animate-fadeIn">
          <span className={`w-2 h-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-rose-500" : "bg-blue-400"}`}></span>
          <span className="flex-grow">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-[10px] text-neutral-400 hover:text-white uppercase font-bold ml-2 shrink-0 cursor-pointer">✕</button>
        </div>
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
