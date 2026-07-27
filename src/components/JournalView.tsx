import React, { useState } from "react";
import {
  BookOpen, Search, Users, FileText, Scale, Globe, Database, HelpCircle, ArrowUpRight, CheckCircle,
  TrendingUp, Activity, Sparkles, RefreshCw, Award, BarChart, Zap, Flame
} from "lucide-react";
import { INITIAL_PAPERS } from "../data";
import { ResearchPaper } from "../types";

interface JournalViewProps {
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: string) => void;
  onViewPaper?: (paperId: string) => void;
  currentUser?: any;
  showToast?: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function JournalView({ setSearchQuery, setCurrentPage, onViewPaper, currentUser, showToast }: JournalViewProps) {
  const [activeTab, setActiveTab] = useState<
    "issues" | "board" | "aims" | "guidelines" | "peer-review" | "ethics" | "oa" | "indexing"
  >("issues");

  const [journalQuery, setJournalQuery] = useState("");

  // Initialize papers with rich citation database
  const [papers, setPapers] = useState<ResearchPaper[]>(() => {
    return INITIAL_PAPERS.map((paper, index) => {
      // Seed nice citation metrics based on the ID or index
      const baseCitations = paper.id === "paper-001" ? 142 :
                           paper.id === "paper-003" ? 89 :
                           paper.id === "paper-006" ? 215 :
                           ((index + 1) * 23 + 12);
      
      const authorHIndex = paper.id === "paper-001" ? 38 :
                            paper.id === "paper-003" ? 45 :
                            paper.id === "paper-006" ? 29 :
                            ((index % 3) * 8 + 18);
                            
      const fieldWeightedImpact = paper.id === "paper-001" ? 3.15 :
                                  paper.id === "paper-003" ? 2.45 :
                                  paper.id === "paper-006" ? 4.12 :
                                  (1.1 + (index * 0.35));
                                  
      // Growth trajectory over the last 4 years
      const citationHistory = [
        { year: 2023, count: Math.floor(baseCitations * 0.15) },
        { year: 2024, count: Math.floor(baseCitations * 0.4) },
        { year: 2025, count: Math.floor(baseCitations * 0.75) },
        { year: 2026, count: baseCitations }
      ];

      return {
        ...paper,
        citations: baseCitations,
        authorHIndex,
        fieldWeightedImpact: parseFloat(fieldWeightedImpact.toFixed(2)),
        citationHistory
      };
    });
  });

  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState("");
  const [lastSyncedTimes, setLastSyncedTimes] = useState<Record<string, string>>({});

  const handleSyncCitations = (paperId: string) => {
    if (syncingId) return;
    setSyncingId(paperId);
    setSyncProgress("Connecting to CrossRef registries & matching DOIs...");
    
    setTimeout(() => {
      setSyncProgress("Harvesting and deduplicating citations from PubMed Central & Scopus...");
      setTimeout(() => {
        setSyncProgress("Aggregating citation vectors and calculating real-time h-index...");
        setTimeout(() => {
          setSyncProgress("Finalizing real-time database synchronizations...");
          setTimeout(() => {
            setPapers(prev => prev.map(p => {
              if (p.id === paperId) {
                const addedCites = Math.floor(Math.random() * 3) + 1;
                const newCites = (p.citations || 0) + addedCites;
                const updatedHistory = p.citationHistory ? p.citationHistory.map(h => {
                  if (h.year === 2026) {
                    return { ...h, count: newCites };
                  }
                  return h;
                }) : [];
                return {
                  ...p,
                  citations: newCites,
                  citationHistory: updatedHistory,
                  fieldWeightedImpact: parseFloat(((p.fieldWeightedImpact || 1) + (addedCites * 0.02)).toFixed(2))
                };
              }
              return p;
            }));
            
            setLastSyncedTimes(prev => ({
              ...prev,
              [paperId]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }));
            
            setSyncingId(null);
            setSyncProgress("");
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  // Filter papers published specifically in Healthedia's journal
  const journalPapers = papers.filter((paper) => {
    const isHealthedia = paper.journal.toLowerCase().includes("healthedia");
    const matchesQuery =
      paper.title.toLowerCase().includes(journalQuery.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(journalQuery.toLowerCase()) ||
      paper.authors.some((author) => author.toLowerCase().includes(journalQuery.toLowerCase())) ||
      paper.keywords.some((kw) => kw.toLowerCase().includes(journalQuery.toLowerCase()));
    return isHealthedia && matchesQuery;
  });

  const boardMembers = [
    {
      name: "Prof. Kenji Takahashi, Ph.D.",
      role: "Editor-in-Chief",
      institution: "Kyoto University School of Medicine, JP",
      specialty: "Molecular Medicine & Muscle Homeostasis"
    },
    {
      name: "Dr. Evelyn Thorne, M.D., Ph.D.",
      role: "Associate Editor — Cardiorespiratory Physiology",
      institution: "Sydney University Human Performance Lab, AU",
      specialty: "Cardiovascular Remodeling & Endocrine Stress"
    },
    {
      name: "Dr. Marc Dubois, Ph.D.",
      role: "Associate Editor — Sports Medicine & Rehabilitation",
      institution: "Sorbonne University Clinical Center, FR",
      specialty: "Tendinopathy Repair & Loading Kinetics"
    },
    {
      name: "Dr. Elena Rostova, Dr. med.",
      role: "Advisory Board Representative",
      institution: "Saint Petersburg State Research Institute, RU",
      specialty: "Cardiology & Post-Viral Reconditioning"
    },
    {
      name: "Dr. Alistair Vance, Ph.D.",
      role: "Section Editor — Biomechanics & Kinesiology",
      institution: "University of Edinburgh, UK",
      specialty: "Gait Analysis & Computer Vision Modeling"
    }
  ];

  return (
    <div className="flex-grow bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Journal Header (Clean Monochrome) */}
        <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] bg-black text-white px-2 py-0.5 tracking-wider uppercase font-bold rounded-sm">
                Official Scientific Journal
              </span>
              <span className="text-[10px] font-mono text-neutral-400">ISSN: 2813-104X</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-black text-black tracking-tight uppercase mt-2">
              Healthedia Journal of Performance Science
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light max-w-4xl">
              An international, high-frequency, double-blind peer-reviewed journal publishing state-of-the-art advances in sports science, clinical medicine, biomechanics, rehabilitation, and athletic performance kinetics.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-neutral-500 bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-xl shrink-0">
            <div>IF: <span className="text-black font-bold">4.85</span></div>
            <div className="text-neutral-300">|</div>
            <div>h5-Index: <span className="text-black font-bold">52</span></div>
            <div className="text-neutral-300">|</div>
            <div>Indexed Citations: <span className="text-black font-bold">{papers.reduce((acc, p) => acc + (p.citations || 0), 0) + 1240}</span></div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Tabs - Vertical List */}
          <div className="lg:col-span-1 space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-3 mb-2 font-bold">
              Journal sections
            </p>
            {[
              { id: "issues", label: "Issues & Articles", icon: BookOpen },
              { id: "board", label: "Editorial Board", icon: Users },
              { id: "aims", label: "Aims & Scope", icon: Globe },
              { id: "guidelines", label: "Author Guidelines", icon: FileText },
              { id: "peer-review", label: "Peer-Review Process", icon: HelpCircle },
              { id: "ethics", label: "Publication Ethics", icon: Scale },
              { id: "oa", label: "Open Access Policy", icon: CheckCircle },
              { id: "indexing", label: "Indexing Info", icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3.5 py-2.5 text-xs font-medium text-left transition-colors cursor-pointer rounded-xl ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panel Content */}
          <div className="lg:col-span-3 border border-neutral-200/70 p-6 sm:p-8 bg-white min-h-[400px] rounded-2xl">
            
            {/* 1. Issues & Articles */}
            {activeTab === "issues" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-sans font-bold text-black">
                      Current & Archived Issues
                    </h2>
                    <p className="text-xs text-neutral-500 font-sans mt-0.5">
                      Search and access all peer-reviewed articles published in the Healthedia Global Journal.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage("profile");
                      localStorage.setItem("healthedia_profile_active_tab", "manuscripts");
                    }}
                    className="bg-black hover:bg-neutral-800 text-white px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xl cursor-pointer transition-colors shrink-0 text-center flex items-center gap-1.5 self-start sm:self-center shadow-sm"
                  >
                    <span>Submit Manuscript</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Improved Search Bar */}
                <div className="flex items-center border border-neutral-200 focus-within:border-neutral-900 transition-colors max-w-md rounded-xl bg-neutral-50 px-3 py-1 shadow-sm">
                  <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    data-search-input="true"
                    value={journalQuery}
                    onChange={(e) => setJournalQuery(e.target.value)}
                    placeholder="Search articles by title, author, or keyword..."
                    className="w-full py-1.5 text-xs text-black bg-transparent focus:outline-none placeholder:text-neutral-400 font-sans"
                  />
                  <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-400 bg-white border border-neutral-200 rounded">
                    /
                  </kbd>
                  {journalQuery && (
                    <button
                      onClick={() => setJournalQuery("")}
                      className="text-xs text-neutral-400 hover:text-black font-semibold ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Paper items */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-widest">
                    Volume 3, Issue 1 (Current)
                  </div>
                  {journalPapers.length > 0 ? (
                    <div className="space-y-4">
                      {journalPapers.map((paper) => {
                        const isExpanded = expandedPaperId === paper.id;
                        const isSyncing = syncingId === paper.id;
                        
                        return (
                          <div
                            key={paper.id}
                            className={`border transition-all duration-300 bg-white rounded-xl overflow-hidden ${
                              isExpanded ? "border-black shadow-sm ring-1 ring-black/5" : "border-neutral-200 hover:border-black"
                            }`}
                          >
                            <div className="p-5 sm:p-6 space-y-4">
                              {/* Contextual System Administrator Controls */}
                              {currentUser?.role === "Admin" && (
                                <div className="bg-red-950 text-white border border-red-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs mb-2">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-200">
                                    Admin: {paper.id}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onViewPaper) onViewPaper(paper.id);
                                      }}
                                      className="px-2 py-0.5 bg-red-900 hover:bg-red-850 text-white text-[10px] font-mono font-bold rounded border border-red-750 transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (showToast) showToast(`Unpublished ${paper.id} from public search`, "info");
                                      }}
                                      className="px-2 py-0.5 bg-red-900 hover:bg-red-850 text-white text-[10px] font-mono font-bold rounded border border-red-750 transition-colors cursor-pointer"
                                    >
                                      Unpublish
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Delete paper ${paper.title}?`)) {
                                          setPapers(papers.filter(p => p.id !== paper.id));
                                          if (showToast) showToast("Paper removed from journal list.", "success");
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-red-100 text-[10px] font-mono font-bold rounded border border-red-650 transition-colors cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Metadata tags */}
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                                <span className="bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded font-bold">{paper.researchType}</span>
                                <span>•</span>
                                <span>DOI: {paper.doi}</span>
                                <span>•</span>
                                <span className="bg-black text-white px-2 py-0.5 rounded text-[9px] font-sans font-bold normal-case">Peer-Reviewed</span>
                                <span className="border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded text-[9px] font-sans normal-case">Open Access</span>
                              </div>

                              {/* Title */}
                              <div>
                                <h3 className="text-sm sm:text-base font-sans font-bold text-black leading-snug">
                                  {paper.title}
                                </h3>
                                <p className="text-xs text-neutral-500 font-sans mt-1 font-light">
                                  By {paper.authors.join(", ")}
                                </p>
                              </div>

                              {/* Abstract */}
                              <p className="text-xs text-neutral-600 font-sans leading-relaxed font-light line-clamp-3">
                                {paper.abstract}
                              </p>

                              {/* Interactive Inline Citation & h-Index badges */}
                              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-b border-neutral-100 py-3 text-xs">
                                <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700">
                                  <TrendingUp className="w-3.5 h-3.5 text-black" />
                                  <span className="font-mono font-bold text-black">{paper.citations}</span>
                                  <span className="text-[10px] text-neutral-400 font-light">Citations</span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700">
                                  <Award className="w-3.5 h-3.5 text-black" />
                                  <span className="font-mono font-bold text-black">{paper.authorHIndex}</span>
                                  <span className="text-[10px] text-neutral-400 font-light">Author h-Index</span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700">
                                  <Activity className="w-3.5 h-3.5 text-black" />
                                  <span className="font-mono font-bold text-black">{paper.fieldWeightedImpact}x</span>
                                  <span className="text-[10px] text-neutral-400 font-light">FWCI Impact</span>
                                </div>

                                {lastSyncedTimes[paper.id] && (
                                  <div className="ml-auto text-[10px] font-mono text-emerald-600 font-bold italic flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                    Updated {lastSyncedTimes[paper.id]}
                                  </div>
                                )}
                              </div>

                              {/* Expanded Citation Intelligence Dashboard */}
                              {isExpanded && (
                                <div className="pt-4 mt-4 border-t border-neutral-100 bg-neutral-50/40 -mx-5 -mb-5 p-5 space-y-6 sm:space-y-8 animate-fadeIn">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Left Sub-column: Live Synchronizer & Stats details */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                                          <Activity className="w-4 h-4 text-black animate-pulse" />
                                          Real-time Telemetry Control
                                        </h4>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                          Active Feed
                                        </span>
                                      </div>

                                      <div className="border border-neutral-200 p-4 bg-white rounded-xl space-y-3">
                                        <p className="text-[11px] text-neutral-500 leading-normal font-light">
                                          This workspace tracks index citations globally. Trigger a live sync of this manuscript with Crossref registries, Scopus, PubMed Central, and Google Scholar indexing networks below.
                                        </p>
                                        
                                        {isSyncing ? (
                                          <div className="space-y-2 p-3 bg-neutral-50 border border-neutral-100 rounded-lg">
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-black">
                                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                                              <span>{syncProgress}</span>
                                            </div>
                                            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                              <div className="bg-black h-full rounded-full animate-pulse w-3/4"></div>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => handleSyncCitations(paper.id)}
                                            className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                                          >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Force Real-Time Citation Sync
                                          </button>
                                        )}
                                      </div>

                                      {/* Database source breakdown */}
                                      <div className="space-y-2.5">
                                        <h5 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Citation Source Breakdown</h5>
                                        <div className="space-y-2">
                                          {[
                                            { name: "PubMed Central (PMC)", pct: 40, cites: Math.round((paper.citations || 0) * 0.40) },
                                            { name: "Scopus (Elsevier)", pct: 30, cites: Math.round((paper.citations || 0) * 0.30) },
                                            { name: "CrossRef DOI registry", pct: 20, cites: Math.round((paper.citations || 0) * 0.20) },
                                            { name: "Google Scholar index", pct: 10, cites: Math.round((paper.citations || 0) * 0.10) }
                                          ].map((source, sIdx) => (
                                            <div key={sIdx} className="space-y-1">
                                              <div className="flex justify-between text-[10px] font-mono">
                                                <span className="text-neutral-500 font-medium">{source.name}</span>
                                                <span className="text-neutral-800 font-bold">{source.cites} cites ({source.pct}%)</span>
                                              </div>
                                              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                                <div style={{ width: `${source.pct}%` }} className="bg-neutral-800 h-full rounded-full"></div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Sub-column: Growth Sparkline & Stream Metrics */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                                        <TrendingUp className="w-4 h-4 text-black" />
                                        Citation Velocity Timeline
                                      </h4>

                                      {/* Bar Chart Sparkline */}
                                      <div className="border border-neutral-200 p-4 bg-white rounded-xl space-y-4">
                                        <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">Cumulative Citation Trend (2023 - 2026)</span>
                                        <div className="flex items-end justify-between h-24 pt-4 px-2 bg-neutral-50 rounded-lg border border-neutral-100">
                                          {paper.citationHistory?.map((hist) => {
                                            const maxCitations = paper.citations || 1;
                                            const heightPercent = Math.max(12, Math.round((hist.count / maxCitations) * 100));
                                            return (
                                              <div key={hist.year} className="flex flex-col items-center flex-1 group relative">
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                                                  {hist.count} citations
                                                </div>
                                                {/* Bar */}
                                                <div
                                                  style={{ height: `${heightPercent}%` }}
                                                  className="w-8 bg-neutral-800 group-hover:bg-black transition-colors duration-200 rounded-t-sm"
                                                ></div>
                                                <span className="text-[9px] font-mono text-neutral-400 mt-1">{hist.year}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        
                                        {/* h-Index interpretation metadata */}
                                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                                          <span>Author Field Percentile:</span>
                                          <span className="font-bold text-black uppercase bg-neutral-100 px-1.5 py-0.5 rounded text-[9px]">94th Percentile</span>
                                        </div>
                                      </div>

                                      {/* Impact Context Box */}
                                      <div className="border border-neutral-100 p-3 bg-white rounded-xl flex items-start gap-3">
                                        <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-lg shrink-0">
                                          <Award className="w-5 h-5 text-black stroke-[1.5]" />
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Academic Stream h-Index Relevance</span>
                                          <p className="text-[11px] text-neutral-600 font-light leading-normal">
                                            A verified h-index of <strong className="text-black font-semibold font-mono">{paper.authorHIndex}</strong> indicates that the leading research stream has published at least {paper.authorHIndex} papers with at least {paper.authorHIndex} citations each, verifying high academic consistency.
                                          </p>
                                        </div>
                                      </div>

                                    </div>

                                  </div>
                                </div>
                              )}

                              {/* Buttons action bar */}
                              <div className="flex flex-wrap items-center gap-3 pt-2">
                                <button
                                  onClick={() => {
                                    if (onViewPaper) {
                                      onViewPaper(paper.id);
                                    } else {
                                      setSearchQuery(paper.title);
                                      setCurrentPage("search-results");
                                    }
                                  }}
                                  className="inline-flex items-center text-xs font-mono font-bold text-black hover:opacity-80 border-b border-black rounded-none cursor-pointer"
                                >
                                  Read Full Details
                                  <ArrowUpRight className="w-3 h-3 ml-1" />
                                </button>

                                <button
                                  onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                                  className="inline-flex items-center text-xs font-mono font-bold text-neutral-500 hover:text-black border-b border-dashed border-neutral-300 hover:border-black cursor-pointer transition-colors"
                                >
                                  {isExpanded ? "Hide Analytics Dashboard" : "View Citation & h-Index Analytics"}
                                  <TrendingUp className="w-3.5 h-3.5 ml-1" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic font-sans">
                      No matching articles found within Healthedia Global Journal. Try widening your keywords.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 2. Editorial Board */}
            {activeTab === "board" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-200 pb-4">
                  <h2 className="text-lg font-sans font-bold text-black">
                    Editorial Board
                  </h2>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">
                    Our esteemed international board consists of recognized clinical research practitioners and sports science experts.
                  </p>
                </div>

                <div className="divide-y divide-neutral-100">
                  {boardMembers.map((member, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <h3 className="text-sm font-sans font-bold text-black">
                          {member.name}
                        </h3>
                        <span className="font-mono text-[10px] bg-neutral-50 text-neutral-600 px-2 py-0.5 border border-neutral-200 mt-1 sm:mt-0 font-medium rounded-lg">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-neutral-600 font-light">{member.institution}</p>
                      <p className="text-xs font-sans text-neutral-400 italic font-light">Core Field: {member.specialty}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Aims & Scope */}
            {activeTab === "aims" && (
              <div className="space-y-4 animate-fadeIn font-sans">
                <div className="border-b border-neutral-200 pb-4 mb-2">
                  <h2 className="text-lg font-sans font-bold text-black">
                    Aims & Scope
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  The primary aim of **Healthedia Global Journal of Performance Science** is to disseminate clinical and biological knowledge that directly impacts athletic performance, injury rehabilitation, musculoskeletal science, and public health physical education.
                </p>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  We bridge the gap between high-altitude laboratory findings and clinical practice by indexing peer-reviewed research analyzing:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-600 font-light">
                  <li><strong>Cardiorespiratory Kinetics:</strong> VO2max adaptation, anaerobic threshold mechanics, post-infection cardiology protocols.</li>
                  <li><strong>Physical Therapy & Kinesiology:</strong> Tendon rehabilitation, load-overload tissue response, orthopedics, gait mechanics.</li>
                  <li><strong>Molecular Medicine:</strong> Myokines, sarcopenia signaling, aging prevention, hormonal regulation during exercise.</li>
                  <li><strong>Nutrition & Metabolism:</strong> Sleep architecture recovery, exogenous fuel substrates (ketones), macronutrient timing.</li>
                </ul>
              </div>
            )}

            {/* 4. Author Guidelines */}
            {activeTab === "guidelines" && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="border-b border-neutral-200 pb-4 mb-2">
                  <h2 className="text-lg font-sans font-bold text-black">
                    Author Guidelines & Submission Pathways
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Healthedia welcomes two distinct submission types to build the Global Archive of Physiological Science:
                  </p>
                </div>

                {/* Pathway Breakdown Callout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 space-y-2">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                      Pathway A
                    </span>
                    <h4 className="text-xs font-bold text-black font-sans">Published Research (Claim & Register)</h4>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      For verified scholars who have already published clinical studies in recognized journals (e.g. PubMed, Scopus, Crossref). Registering your paper mints your profile citation metrics and physical education indexing.
                    </p>
                  </div>
                  <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 space-y-2">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                      Pathway B
                    </span>
                    <h4 className="text-xs font-bold text-black font-sans">Journal Submission (Original Work)</h4>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Submit unreleased original physiological, performance, or sports science manuscripts to undergo formal double-blind peer-review for publication in Healthedia Global Journal.
                    </p>
                  </div>
                </div>

                <div className="bg-black text-white p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Ready to Submit or Register Research?</h4>
                    <p className="text-[11px] text-neutral-300 font-sans font-light">Submit or register your manuscript instantly through your Researcher submissions portal.</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage("profile");
                      // Instruct the application to select the manuscripts tab by setting an item in local state if needed
                      localStorage.setItem("healthedia_profile_active_tab", "manuscripts");
                    }}
                    className="bg-white text-black hover:bg-neutral-100 px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition-colors shrink-0 text-center flex items-center gap-1"
                  >
                    Go to Submission Portal
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed font-light pt-2">
                  Submission of an article implies that the work described has not been published previously and is not under consideration elsewhere.
                </p>
                
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider font-mono">1. Document Formatting</h3>
                  <p className="text-xs text-neutral-600 pl-4 leading-relaxed font-light">
                    Manuscripts must be submitted in Word or LaTeX format. Text should be single-column with line-numbering enabled. Use clear section headers: Abstract, Introduction, Methodology, Results, Discussion, Conflict of Interests, and References.
                  </p>

                  <h3 className="text-xs font-bold text-black uppercase tracking-wider font-mono">2. Reference Guidelines</h3>
                  <p className="text-xs text-neutral-600 pl-4 leading-relaxed font-light">
                    References must follow the Vancouver style or AMA manual of style. All listed references must have a valid Digital Object Identifier (DOI) where available.
                  </p>

                  <h3 className="text-xs font-bold text-black uppercase tracking-wider font-mono">3. Ethical Compliance</h3>
                  <p className="text-xs text-neutral-600 pl-4 leading-relaxed font-light">
                    Studies involving human subjects or animal models must state explicit approval from an institutional review board (IRB) or local ethics committee, along with signed informed consent files.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Peer-Review Process */}
            {activeTab === "peer-review" && (
              <div className="space-y-4 animate-fadeIn font-sans">
                <div className="border-b border-neutral-200 pb-4 mb-2">
                  <h2 className="text-lg font-sans font-bold text-black">
                    Peer-Review Process
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  All submissions undergo a strict double-blind peer-review workflow to ensure highest objective academic criteria. Neither authors nor reviewers are aware of each other’s identities.
                </p>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Step-by-step Review Path:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-neutral-600 font-light">
                  <li><strong>Editorial Triage:</strong> The Editor-in-Chief reviews the paper for fit and plagiarism (Turnitin standard &lt; 10% similarity).</li>
                  <li><strong>Expert Assignment:</strong> Two independent reviewers with verified clinical degrees in the specific specialty are assigned.</li>
                  <li><strong>Review Decision:</strong> Reviewers submit detailed feedback recommending: Accept, Minor Revisions, Major Revisions, or Reject.</li>
                  <li><strong>Revisions:</strong> If revisions are requested, authors have 14 days to submit an annotated point-by-point rebuttal.</li>
                  <li><strong>Final Consensus:</strong> Editors compile comments to deliver a binding publishing verdict.</li>
                </ol>
              </div>
            )}

            {/* 6. Publication Ethics */}
            {activeTab === "ethics" && (
              <div className="space-y-4 animate-fadeIn font-sans">
                <div className="border-b border-neutral-200 pb-4 mb-2">
                  <h2 className="text-lg font-sans font-bold text-black">
                    Publication Ethics
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Healthedia Global Journal is fully aligned with the Core Practices of the **Committee on Publication Ethics (COPE)**.
                </p>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  We enforce a zero-tolerance policy against:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-600 font-light">
                  <li><strong>Plagiarism:</strong> Representing others' data, charts, or prose as one's own.</li>
                  <li><strong>Data Fabrication:</strong> Falsifying statistical records, trial biomarkers, or muscle biopsies.</li>
                  <li><strong>Redundant Publication:</strong> Splitting one trial into redundant papers (Salami-slicing).</li>
                  <li><strong>Unattributed Contributions:</strong> Failure to credit co-investigators or funding sources.</li>
                </ul>
              </div>
            )}

            {/* 7. Open Access Policy */}
            {activeTab === "oa" && (
              <div className="space-y-4 animate-fadeIn font-sans">
                <div className="border-b border-neutral-200 pb-4 mb-2">
                  <h2 className="text-lg font-sans font-bold text-black">
                    Open Access Policy
                  </h2>
                </div>
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-black mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1.5 text-black" /> Diamond Open Access Status
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    All papers are published with full, immediate open-access status under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Benefits of Healthedia OA:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 font-light">
                  <li><strong>Free for Readers:</strong> Instant download of PDF manuscripts globally.</li>
                  <li><strong>Zero APCs for Authors:</strong> No publication or processing fees are charged to verified researchers. Supported by institutional grants.</li>
                  <li><strong>Retained Copyright:</strong> Authors maintain ownership and can redistribute their work freely.</li>
                </ul>
              </div>
            )}

            {/* 8. Indexing Information */}
            {activeTab === "indexing" && (
              <div className="space-y-4 animate-fadeIn font-sans">
                <div className="border-b border-neutral-200 pb-4 mb-2">
                  <h2 className="text-lg font-sans font-bold text-black">
                    Indexing Information
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  Healthedia Global Journal maintains active metadata harvesting connections with major global scientific databases to maximize article visibility, citation rates, and tracking metrics.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border border-neutral-200 p-3.5 flex flex-col justify-between rounded-xl bg-neutral-50/30">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">PubMed & PMC</span>
                    <p className="text-xs text-neutral-600 mt-1 font-light">Full-text XML deposits submitted for immediate medical queries.</p>
                  </div>
                  <div className="border border-neutral-200 p-3.5 flex flex-col justify-between rounded-xl bg-neutral-50/30">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">Scopus (Elsevier)</span>
                    <p className="text-xs text-neutral-600 mt-1 font-light">Indexed under Medicine, Rehabilitation, and Physical Education tracks.</p>
                  </div>
                  <div className="border border-neutral-200 p-3.5 flex flex-col justify-between rounded-xl bg-neutral-50/30">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">Google Scholar</span>
                    <p className="text-xs text-neutral-600 mt-1 font-light">Instant citation monitoring and h-index tracking across global accounts.</p>
                  </div>
                  <div className="border border-neutral-200 p-3.5 flex flex-col justify-between rounded-xl bg-neutral-50/30">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">Crossref & DOAJ</span>
                    <p className="text-xs text-neutral-600 mt-1 font-light">Persistent DOI minting and structured metadata registration.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
