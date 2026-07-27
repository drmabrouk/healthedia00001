import React, { useState, useEffect } from "react";
import {
  FileText, ShieldCheck, Award, ArrowLeft, Lock, Download, ExternalLink,
  ChevronRight, Bookmark, Sparkles, Database, TrendingUp, Activity, FileLock2,
  Quote, Copy, Check, X
} from "lucide-react";
import { UserProfileData, ResearchPaper, Manuscript } from "../types";
import { INITIAL_PAPERS } from "../data";
import { getStoredItem } from "../lib/taxonomyStore";

// Citation Formatter Helpers
function parseAuthorName(name: string): { first: string; last: string; initial: string } {
  const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|PhD|MD)\s+/i, '').trim();
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map(s => s.trim());
    const last = parts[0];
    const first = parts[1] || '';
    return { last, first, initial: first ? `${first.charAt(0)}.` : '' };
  }
  const parts = cleaned.split(' ');
  if (parts.length === 1) {
    return { last: parts[0], first: '', initial: '' };
  }
  const last = parts[parts.length - 1];
  const first = parts.slice(0, parts.length - 1).join(' ');
  return { last, first, initial: first ? `${first.charAt(0)}.` : '' };
}

function generateApaCitation(paper: ResearchPaper): string {
  const parsedAuthors = paper.authors.map(parseAuthorName);
  let authorStr = "";
  if (parsedAuthors.length === 1) {
    authorStr = `${parsedAuthors[0].last}, ${parsedAuthors[0].initial}`;
  } else if (parsedAuthors.length === 2) {
    authorStr = `${parsedAuthors[0].last}, ${parsedAuthors[0].initial}, & ${parsedAuthors[1].last}, ${parsedAuthors[1].initial}`;
  } else if (parsedAuthors.length > 2) {
    const mainList = parsedAuthors.slice(0, -1).map(a => `${a.last}, ${a.initial}`).join(", ");
    const lastAuthor = parsedAuthors[parsedAuthors.length - 1];
    authorStr = `${mainList}, & ${lastAuthor.last}, ${lastAuthor.initial}`;
  } else {
    authorStr = "Healthedia Research Group";
  }

  const doiStr = paper.doi ? (paper.doi.startsWith("http") ? paper.doi : `https://doi.org/${paper.doi}`) : "";
  return `${authorStr} (${paper.year}). ${paper.title}. ${paper.journal}${doiStr ? `. ${doiStr}` : "."}`;
}

function generateBibtexCitation(paper: ResearchPaper): string {
  const parsedAuthors = paper.authors.map(parseAuthorName);
  const firstAuthorLast = (parsedAuthors[0]?.last || "author").toLowerCase().replace(/[^a-z0-9]/g, "");
  const firstWord = paper.title.split(/\s+/).find(w => w.length > 3)?.toLowerCase().replace(/[^a-z0-9]/g, "") || "paper";
  const citeKey = `${firstAuthorLast}${paper.year}${firstWord}`;

  const authorBib = parsedAuthors.map(a => `${a.last}, ${a.first || a.initial}`).join(" and ");
  const doiValue = paper.doi ? paper.doi.replace(/^https?:\/\/doi\.org\//, "") : "";

  return `@article{${citeKey},
  title={${paper.title}},
  author={${authorBib || paper.authors.join(" and ")}},
  journal={${paper.journal}},
  year={${paper.year}},
  specialty={${paper.specialty}},
  institution={${paper.institution}},
  doi={${doiValue}}
}`;
}

function generateMlaCitation(paper: ResearchPaper): string {
  const parsedAuthors = paper.authors.map(parseAuthorName);
  let authorStr = "";
  if (parsedAuthors.length === 1) {
    authorStr = `${parsedAuthors[0].last}, ${parsedAuthors[0].first || parsedAuthors[0].initial}.`;
  } else if (parsedAuthors.length === 2) {
    authorStr = `${parsedAuthors[0].last}, ${parsedAuthors[0].first || parsedAuthors[0].initial}, and ${parsedAuthors[1].first || parsedAuthors[1].initial} ${parsedAuthors[1].last}.`;
  } else if (parsedAuthors.length > 2) {
    authorStr = `${parsedAuthors[0].last}, ${parsedAuthors[0].first || parsedAuthors[0].initial}, et al.`;
  } else {
    authorStr = "Healthedia Research Group.";
  }

  const doiStr = paper.doi ? (paper.doi.startsWith("http") ? paper.doi : `https://doi.org/${paper.doi}`) : "";
  return `${authorStr} "${paper.title}." ${paper.journal}, ${paper.year}${doiStr ? `, ${doiStr}` : "."}`;
}

function generateChicagoCitation(paper: ResearchPaper): string {
  const parsedAuthors = paper.authors.map(parseAuthorName);
  let authorStr = "";
  if (parsedAuthors.length === 1) {
    authorStr = `${parsedAuthors[0].last}, ${parsedAuthors[0].first || parsedAuthors[0].initial}.`;
  } else if (parsedAuthors.length >= 2) {
    authorStr = `${parsedAuthors[0].last}, ${parsedAuthors[0].first || parsedAuthors[0].initial}, and ${parsedAuthors[1].first || parsedAuthors[1].initial} ${parsedAuthors[1].last}.`;
  } else {
    authorStr = "Healthedia Research Group.";
  }

  const doiStr = paper.doi ? (paper.doi.startsWith("http") ? paper.doi : `https://doi.org/${paper.doi}`) : "";
  return `${authorStr} "${paper.title}." ${paper.journal} (${paper.year})${doiStr ? `: ${doiStr}` : "."}`;
}

function generateRisCitation(paper: ResearchPaper): string {
  const parsedAuthors = paper.authors.map(parseAuthorName);
  const authorsRis = parsedAuthors.map(a => `AU  - ${a.last}, ${a.first || a.initial}`).join("\n");
  const doiValue = paper.doi ? paper.doi.replace(/^https?:\/\/doi\.org\//, "") : "";

  return `TY  - JOUR
TI  - ${paper.title}
${authorsRis}
JO  - ${paper.journal}
PY  - ${paper.year}
DO  - ${doiValue}
PB  - Healthedia Scholarly Network
ER  - `;
}

interface ResearchPaperViewProps {
  paperId: string;
  currentUser: UserProfileData | null;
  setCurrentPage: (page: string) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export default function ResearchPaperView({
  paperId,
  currentUser,
  setCurrentPage,
  showToast
}: ResearchPaperViewProps) {
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"apa" | "bibtex" | "mla" | "chicago" | "ris">("apa");
  const [copied, setCopied] = useState(false);

  // Admin Live Contextual State
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editJournal, setEditJournal] = useState("");

  useEffect(() => {
    // 1. Load initial papers
    const papersList = [...INITIAL_PAPERS].map((p, idx) => ({
      ...p,
      citations: p.id === "paper-001" ? 142 : p.id === "paper-003" ? 89 : p.id === "paper-006" ? 215 : ((idx + 1) * 23 + 12),
      authorHIndex: p.id === "paper-001" ? 38 : p.id === "paper-003" ? 45 : p.id === "paper-006" ? 29 : ((idx % 3) * 8 + 18),
      fieldWeightedImpact: p.id === "paper-001" ? 3.15 : p.id === "paper-003" ? 2.45 : p.id === "paper-006" ? 4.12 : parseFloat((1.1 + (idx * 0.35)).toFixed(2))
    }));

    // 2. Load approved custom manuscripts
    const customMs = getStoredItem<Manuscript[]>("healthedia_manuscripts", []);
    const approvedMs: ResearchPaper[] = customMs
      .filter(m => m.status === "Approved")
      .map(m => ({
        id: m.id,
        title: m.title,
        authors: m.authors,
        journal: m.submissionType === "Published" ? (m.originalJournalName || "External Journal") : "Healthedia Global Journal of Performance Science",
        year: parseInt(m.originalPublicationYear || m.submittedAt?.split("-")[0] || "2026"),
        specialty: m.specialty || "Human Performance",
        institution: m.institution || "Harvard Research Centre",
        country: m.country || "Global",
        language: "English",
        researchType: m.researchType || "Randomized Controlled Trial",
        doi: m.doi || `10.2813/healthedia.${m.id}`,
        abstract: m.abstract,
        keywords: m.keywords || [],
        citations: 12,
        authorHIndex: 18,
        fieldWeightedImpact: 1.2
      }));

    const combined = [...papersList, ...approvedMs];
    const match = combined.find(p => p.id === paperId);
    if (match) {
      setPaper(match);
    }
  }, [paperId]);

  // Determine if the user is a Researcher/Reviewer/Admin
  const hasFullAccess = currentUser && (
    currentUser.role === "Researcher" ||
    currentUser.role === "Reviewer" ||
    currentUser.role === "Admin"
  );

  const handleDownloadPdf = () => {
    if (!hasFullAccess) {
      showToast("Access Restricted: Full manuscript PDF downloads are locked for Member tier. Upgrade to Verified Researcher.", "error");
      return;
    }

    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      showToast("Scholarly PDF download started successfully!", "success");
    }, 1500);
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showToast(isBookmarked ? "Manuscript removed from saved shelf" : "Manuscript saved to your research shelf", "success");
  };

  const getCitationText = (fmt: string): string => {
    if (!paper) return "";
    switch (fmt) {
      case "bibtex":
        return generateBibtexCitation(paper);
      case "mla":
        return generateMlaCitation(paper);
      case "chicago":
        return generateChicagoCitation(paper);
      case "ris":
        return generateRisCitation(paper);
      case "apa":
      default:
        return generateApaCitation(paper);
    }
  };

  const handleCopyCitation = () => {
    if (!paper) return;
    const text = getCitationText(selectedFormat);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(`${selectedFormat.toUpperCase()} citation copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCitation = (fmt: string, content: string) => {
    if (!paper) return;
    const extMap: Record<string, string> = {
      bibtex: "bib",
      ris: "ris",
      apa: "txt",
      mla: "txt",
      chicago: "txt"
    };
    const mimeMap: Record<string, string> = {
      bibtex: "application/x-bibtex",
      ris: "application/x-research-info-systems",
      apa: "text/plain",
      mla: "text/plain",
      chicago: "text/plain"
    };

    const ext = extMap[fmt] || "txt";
    const mime = mimeMap[fmt] || "text/plain";
    const filename = `${paper.id}_citation.${ext}`;

    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${fmt.toUpperCase()} reference file (${filename})`, "success");
  };

  const handleAdminToggleFeature = () => {
    setIsFeatured(!isFeatured);
    showToast(!isFeatured ? "Manuscript marked as Featured Index Paper" : "Manuscript removed from Featured List", "success");
  };

  const handleAdminTogglePublish = () => {
    setIsPublished(!isPublished);
    showToast(!isPublished ? "Manuscript published live to Global Archive" : "Manuscript unpublished and hidden from public search", "success");
  };

  const handleAdminOpenEdit = () => {
    if (!paper) return;
    setEditTitle(paper.title);
    setEditSpecialty(paper.specialty);
    setEditJournal(paper.journal);
    setShowEditModal(true);
  };

  const handleAdminSaveEdit = () => {
    if (!paper) return;
    setPaper({
      ...paper,
      title: editTitle,
      specialty: editSpecialty,
      journal: editJournal
    });
    setShowEditModal(false);
    showToast("Paper metadata updated live by System Administrator.", "success");
  };

  const handleAdminDelete = () => {
    if (confirm("Are you sure you want to permanently delete this research paper from the Global Archive?")) {
      showToast("Manuscript permanently deleted from Healthedia registry.", "success");
      setCurrentPage("journal");
    }
  };

  if (!paper) {
    return (
      <div className="flex-grow bg-white py-16 text-center">
        <p className="text-sm font-mono text-neutral-400">LOADING METADATA REGISTRIES...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-white py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        
        {/* Contextual System Administrator Controls */}
        {currentUser?.role === "Admin" && (
          <div className="bg-red-950 text-white border border-red-800 rounded-2xl p-3.5 mb-2 flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-red-300 shrink-0 stroke-[2]" />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-100 block leading-none">
                  Administrator Contextual Controls
                </span>
                <span className="text-[10px] font-mono text-red-300">
                  Live Management • Article ID: {paper.id}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAdminToggleFeature}
                className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
              >
                {isFeatured ? "★ Featured" : "+ Feature"}
              </button>

              <button
                onClick={handleAdminTogglePublish}
                className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
              >
                {isPublished ? "Unpublish" : "Publish"}
              </button>

              <button
                onClick={handleAdminOpenEdit}
                className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
              >
                Edit Details
              </button>

              <button
                onClick={handleAdminDelete}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-red-100 text-[11px] font-mono font-bold rounded-xl border border-red-600 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Navigation back and save bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-4">
          <button
            onClick={() => setCurrentPage("journal")}
            className="inline-flex items-center text-xs font-mono font-bold text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Journal Directory
          </button>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCitationModal(true)}
              className="inline-flex items-center text-xs font-mono font-bold bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-200 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs hover:border-black"
            >
              <Quote className="w-3.5 h-3.5 mr-1.5 text-black stroke-[2]" />
              Export Citation
            </button>
            <button
              onClick={handleToggleBookmark}
              className={`inline-flex items-center text-xs font-mono font-bold border px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                isBookmarked 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-neutral-500 hover:text-black border-neutral-200"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${isBookmarked ? "fill-white" : ""}`} />
              {isBookmarked ? "Saved" : "Save Shelf"}
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center text-xs font-mono font-bold bg-black hover:bg-neutral-850 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {downloading ? "Downloading..." : "Open PDF (Full Text)"}
            </button>
          </div>
        </div>

        {/* PAPER HERO OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT/MID: MAIN PAPER DETAILS (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header tags and Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                <span className="bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded font-bold">{paper.researchType}</span>
                <span>•</span>
                <span>DOI: {paper.doi}</span>
                <span>•</span>
                <span className="bg-black text-white px-2 py-0.5 rounded text-[9px] font-sans font-bold normal-case">Peer-Reviewed</span>
                <span className="border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded text-[9px] font-sans normal-case">Open Access</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-black uppercase leading-tight">
                {paper.title}
              </h1>

              <div className="text-xs text-neutral-600 font-sans leading-relaxed">
                <span className="font-bold">Investigator Team:</span> {paper.authors.join(", ")}
                <span className="block text-neutral-400 mt-1 font-light italic">
                  Affiliated Institutions: {paper.institution} — {paper.country}
                </span>
              </div>
            </div>

            {/* DYNAMIC ACCESS LOCK BARS */}
            {!hasFullAccess && (
              <div className="bg-neutral-50 border border-black/10 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileLock2 className="w-5 h-5 text-black mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono">🔒 Restricted Academic Preview</h3>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-light mt-0.5">
                      You are logged in as a <strong>{currentUser ? currentUser.role : "Guest User"}</strong>. Full research downloads, clinical methodologies, and peer statistics are locked. Verification is required.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentPage("profile");
                    localStorage.setItem("healthedia_profile_active_tab", "requests");
                  }}
                  className="bg-black hover:bg-neutral-850 text-white text-[10px] font-mono font-bold uppercase tracking-wider py-2 px-3 rounded-xl shrink-0 cursor-pointer text-center"
                >
                  Verify Academic Status
                </button>
              </div>
            )}

            {/* PAPER BODY CONTENT */}
            <div className="space-y-6 pt-4 border-t border-neutral-100">
              
              {/* ABSTRACT (Always Visible) */}
              <div className="space-y-2">
                <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                  Structured Abstract
                </h2>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light font-sans text-justify">
                  {paper.abstract}
                </p>
              </div>

              {/* INTRODUCTION (Always Visible) */}
              <div className="space-y-2 pt-4 border-t border-neutral-100">
                <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                  1. Introduction
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed font-light font-sans">
                  The study of human muscular and cardiorespiratory physiological adaptions under controlled environments has generated widespread biomechanical attention. Recent developments in non-invasive biometric telemetry allow clinical practitioners to analyze micro-physiological responses directly during maximal anaerobic strain. This paper builds on established metabolic kinetics to evaluate adaptive responses in targeted peer demographics...
                </p>
              </div>

              {/* RESTRICTED METHODOLOGY, RESULTS, DISCUSSION & REFERENCES */}
              <div className="space-y-6 relative">
                
                {/* Visual Blurry Cover Layer for limited members */}
                {!hasFullAccess && (
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-8 text-center px-4">
                    <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xl max-w-md space-y-4 animate-fadeIn">
                      <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black">
                        <Lock className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-sans uppercase tracking-tight text-black">
                          Methodology & Results Locked
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-1 font-light leading-relaxed">
                          Upgrade to a <strong>Verified Researcher</strong> to unlock full-text access, clinical data tables, peer review protocols, and official PDFs.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentPage("profile");
                          localStorage.setItem("healthedia_profile_active_tab", "requests");
                        }}
                        className="w-full bg-black hover:bg-neutral-850 text-white text-[10px] font-mono font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Start Verification
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. METHODOLOGY (Full Access Only) */}
                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    2. Clinical Methodology
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light font-sans">
                    A randomized cohort design was adopted. Subjects (n=45) underwent repeated isometric exercises at 85% VO2max over a 30-day intervention timeframe. Muscle biopsy assays were taken pre- and post-test cycle, paired with real-time cardiorespiratory data points processed via gas exchange telemetry. Dynamic regression models were calculated using standard ANOVA formulations.
                  </p>
                </div>

                {/* 3. RESULTS (Full Access Only) */}
                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    3. Analysis & Key Results
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light font-sans">
                    The experimental cohort demonstrated a statistically significant increase in localized metabolic clearance metrics. Myokine upregulation was noted at +24% relative to base baseline data (p &lt; 0.01). Cross-correlative charts showed a high linear coefficient linking anaerobic peak loading to sustained hypertrophic repair factors.
                  </p>
                </div>

                {/* 4. CLINICAL SIGNIFICANCE & FUNDING */}
                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    4. Declarations & Conflict Disclosures
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light font-sans">
                    The researchers declare no commercial or corporate conflict of interests. This study was funded in part by national athletic physiology academic grants. Board ethical clearance was archived under registry protocol #2026-FPR.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR: CITATION MATRIX & SCHOLARLY STATS (lg:col-span-1) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Citation Analytics block */}
            <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-mono uppercase font-bold text-neutral-400 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-black" /> Citation Analytics
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-neutral-50 p-2.5 rounded-xl text-center border border-neutral-100">
                  <span className="text-lg font-mono font-bold text-black block">{paper.citations || 0}</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">Citations</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-xl text-center border border-neutral-100">
                  <span className="text-lg font-mono font-bold text-black block">{paper.authorHIndex || 12}</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">h-Index</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-xl text-center border border-neutral-100">
                  <span className="text-lg font-mono font-bold text-black block">{paper.fieldWeightedImpact || 1.0}x</span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">FWCI</span>
                </div>
              </div>

              {/* Sparkline cumulative metrics */}
              <div className="space-y-2 pt-2">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold block">Cumulative Citation Trajectory</span>
                <div className="h-16 flex items-end justify-between bg-neutral-50/50 rounded-xl p-2 border border-neutral-100">
                  <div className="w-full flex justify-between h-full items-end px-1">
                    {[20, 45, 70, 100].map((v, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div style={{ height: `${v}%` }} className="w-5 bg-black rounded-t-xs"></div>
                        <span className="text-[8px] font-mono text-neutral-400 mt-1">{2023 + i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Export CTA Button */}
              <button
                onClick={() => setShowCitationModal(true)}
                className="w-full inline-flex items-center justify-center text-xs font-mono font-bold bg-black hover:bg-neutral-850 text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer gap-2 mt-3 shadow-xs"
              >
                <Quote className="w-4 h-4 text-emerald-400 stroke-[2]" />
                <span>Export Citation Reference</span>
              </button>
            </div>

            {/* Journal Context Metadata block */}
            <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-sm space-y-3 text-xs">
              <h3 className="text-xs font-mono uppercase font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                Manuscript Index Registry
              </h3>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Indexed Journal:</span>
                  <span className="text-neutral-800 font-bold max-w-[150px] text-right truncate">{paper.journal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Published Year:</span>
                  <span className="text-neutral-800 font-bold">{paper.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subject Specialty:</span>
                  <span className="text-neutral-800 font-bold">{paper.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Language:</span>
                  <span className="text-neutral-800 font-bold">{paper.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Primary Domain:</span>
                  <span className="text-neutral-800 font-bold">{paper.institution}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* EXPORT CITATION MODAL DIALOG */}
      {showCitationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-neutral-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white p-5 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-800 rounded-2xl text-emerald-400 border border-neutral-700">
                  <Quote className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight font-sans text-white">Export Citation Reference</h3>
                  <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    Generate BibTeX, APA, MLA, Chicago, or RIS citations for reference managers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCitationModal(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Format Selection Tabs */}
            <div className="bg-neutral-50 px-5 pt-3 border-b border-neutral-200 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "apa", label: "APA (7th ed.)" },
                { id: "bibtex", label: "BibTeX (.bib)" },
                { id: "mla", label: "MLA (9th ed.)" },
                { id: "chicago", label: "Chicago" },
                { id: "ris", label: "RIS (Zotero/EndNote)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedFormat(tab.id as any);
                    setCopied(false);
                  }}
                  className={`px-3.5 py-2 text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                    selectedFormat === tab.id
                      ? "bg-white text-black border-t border-x border-neutral-200 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Formatted Text Preview */}
            <div className="p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">
                  Formatted Reference Output ({selectedFormat.toUpperCase()})
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  DOI: {paper.doi || "10.2813/healthedia"}
                </span>
              </div>

              <div className="relative">
                <pre className="p-4 bg-neutral-950 text-neutral-100 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-neutral-800 max-h-56 select-all font-light">
                  {getCitationText(selectedFormat)}
                </pre>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-neutral-600">
                <Sparkles className="w-4 h-4 text-black shrink-0" />
                <span className="text-[11px] font-sans">
                  Import directly into <strong>Zotero</strong>, <strong>Mendeley</strong>, <strong>EndNote</strong>, or <strong>LaTeX Overleaf</strong>.
                </span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setShowCitationModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleCopyCitation}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    copied
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-black"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Reference"}
                </button>

                <button
                  onClick={() => handleDownloadCitation(selectedFormat, getCitationText(selectedFormat))}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4.5 py-2 bg-black hover:bg-neutral-850 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .{selectedFormat === "bibtex" ? "bib" : selectedFormat === "ris" ? "ris" : "txt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ADMIN EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden">
            <div className="bg-black text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold font-sans uppercase tracking-tight">Edit Paper Metadata (System Admin)</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-600 uppercase mb-1">Paper Title</label>
                <textarea
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  rows={3}
                  className="w-full border border-neutral-300 rounded-xl p-3 text-xs font-sans text-black focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-600 uppercase mb-1">Specialty</label>
                  <input
                    type="text"
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl p-2.5 text-xs font-sans text-black focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-600 uppercase mb-1">Journal</label>
                  <input
                    type="text"
                    value={editJournal}
                    onChange={(e) => setEditJournal(e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl p-2.5 text-xs font-sans text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminSaveEdit}
                className="px-5 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                Save Metadata Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
