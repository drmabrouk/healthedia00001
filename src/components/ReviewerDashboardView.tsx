import React, { useState, useEffect } from "react";
import {
  ShieldCheck, FileText, CheckCircle, AlertCircle, X, MessageSquare, Search, BookOpen, Award,
  Clock, ShieldAlert, CheckSquare, Eye, RefreshCw, BarChart2, Check, ExternalLink, HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import { UserProfileData, Manuscript, SupportTicket } from "../types";
import { getStoredItem, setStoredItem } from "../lib/taxonomyStore";
import { INITIAL_PAPERS } from "../data";
import PublicationCertificate from "./PublicationCertificate";

interface ReviewerDashboardViewProps {
  currentUser: UserProfileData;
  setCurrentPage: (page: string) => void;
  onUpdateCurrentUser: (updated: UserProfileData) => void;
}

export default function ReviewerDashboardView({
  currentUser,
  setCurrentPage,
  onUpdateCurrentUser
}: ReviewerDashboardViewProps) {
  // Shared Store States
  const [users, setUsers] = useState<UserProfileData[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [publishedPapers, setPublishedPapers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // Active tab: reviews, support, analytics, applications
  const [activeTab, setActiveTab] = useState<"analytics" | "reviews" | "support" | "applications">("reviews");

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Certificate Modal State
  const [selectedPaperForCert, setSelectedPaperForCert] = useState<any | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const storedUsers = getStoredItem<UserProfileData[]>("healthedia_users", []);
    const storedManuscripts = getStoredItem<Manuscript[]>("healthedia_manuscripts", []);
    const storedTickets = getStoredItem<SupportTicket[]>("healthedia_tickets", []);
    const storedPapers = getStoredItem<any[]>("healthedia_published_papers", INITIAL_PAPERS);

    setUsers(storedUsers);
    setManuscripts(storedManuscripts);
    setTickets(storedTickets);
    setPublishedPapers(storedPapers);

    const storedAppsStr = localStorage.getItem("healthedia_researcher_applications") || "[]";
    try {
      setApplications(JSON.parse(storedAppsStr));
    } catch (e) {}
  }, []);

  // Save Helpers
  const saveManuscripts = (updated: Manuscript[]) => {
    setManuscripts(updated);
    setStoredItem("healthedia_manuscripts", updated);
  };

  const savePublishedPapers = (updated: any[]) => {
    setPublishedPapers(updated);
    setStoredItem("healthedia_published_papers", updated);
  };

  const saveUsers = (updated: UserProfileData[]) => {
    setUsers(updated);
    setStoredItem("healthedia_users", updated);
    // Sync current session if modified
    const currentInList = updated.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (currentInList) {
      onUpdateCurrentUser(currentInList);
    }
  };

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    setStoredItem("healthedia_tickets", updated);
  };

  // Peer Review States
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [manuscriptPromoAlert, setManuscriptPromoAlert] = useState<{ author: string; role: string } | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("All");

  const handleManuscriptAction = (msId: string, action: "Approved" | "Revision Requested" | "Rejected") => {
    let targetAuthorEmail = "";
    let targetAuthorName = "";
    let promoted = false;

    const updatedMs = manuscripts.map(ms => {
      if (ms.id === msId) {
        targetAuthorEmail = ms.authorEmail;
        targetAuthorName = ms.authors[0];
        return { ...ms, status: action, reviewerNotes };
      }
      return ms;
    });

    saveManuscripts(updatedMs);

    // If Approved, publish to scientific catalog
    if (action === "Approved") {
      const targetMs = manuscripts.find(m => m.id === msId);
      if (targetMs) {
        const newPaper = {
          id: `paper-pub-${Date.now()}`,
          title: targetMs.title,
          authors: targetMs.authors,
          journal: "Healthedia Global Journal of Performance Science",
          year: new Date().getFullYear(),
          specialty: targetMs.specialty,
          institution: targetMs.institution,
          country: targetMs.country,
          language: "English",
          researchType: targetMs.researchType || "Scholarly Paper",
          doi: `10.2813/healthedia.${Math.floor(1000 + Math.random() * 9000)}`,
          abstract: targetMs.abstract,
          keywords: targetMs.keywords || [],
          doiUrl: "#",
          date: new Date().toISOString().split("T")[0]
        };
        savePublishedPapers([newPaper, ...publishedPapers]);
      }

      // Promote Member to Researcher
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === targetAuthorEmail.toLowerCase() && (!u.role || u.role === "Member")) {
          promoted = true;
          return { ...u, role: "Researcher" as any, verified: true };
        }
        return u;
      });

      if (promoted) {
        saveUsers(updatedUsers);
        setManuscriptPromoAlert({ author: targetAuthorName, role: "Researcher" });
      }
    }

    setSelectedManuscript(null);
    setReviewerNotes("");
    showToast(`Manuscript marked as ${action.toUpperCase()}${promoted ? ". Author promoted to Researcher!" : "."}`, "success");
  };

  // Support Tickets State
  const [ticketStatusFilter, setTicketStatusFilter] = useState("All");

  const handleUpdateTicketStatus = (ticketId: string, status: "Pending" | "In Progress" | "Resolved") => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status };
      }
      return t;
    });
    saveTickets(updated);
    showToast(`Support Ticket status updated to ${status.toUpperCase()}.`, "success");
  };

  const handleApplicationDecision = (appId: string, email: string, action: "Approved" | "Rejected") => {
    const updatedApps = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status: action };
      }
      return app;
    });
    setApplications(updatedApps);
    localStorage.setItem("healthedia_researcher_applications", JSON.stringify(updatedApps));

    const appData = applications.find(a => a.id === appId);

    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const uStatus = action === "Approved" ? "Approved" as const : "Rejected" as const;
        const uRole = action === "Approved" ? "Researcher" as any : u.role;
        return {
          ...u,
          role: uRole,
          verified: action === "Approved" ? true : u.verified,
          researcherApplicationStatus: uStatus,
          title: appData?.title || u.title,
          specialty: appData?.specialty || u.specialty,
          institution: appData?.institution || u.institution,
          country: appData?.country || u.country,
          degree: appData?.degree || u.degree,
          orcid: appData?.orcid || u.orcid,
          bio: appData?.bio || u.bio
        };
      }
      return u;
    });

    saveUsers(updatedUsers);
    showToast(`Application has been ${action === "Approved" ? "Approved" : "Rejected"} successfully.`, "success");
  };

  // Analytics Computation
  const stats = {
    totalSubmissions: manuscripts.length,
    underReview: manuscripts.filter(m => m.status === "Under Review" || m.status === "Pending Verification").length,
    approvedCount: manuscripts.filter(m => m.status === "Approved").length,
    revisionsRequested: manuscripts.filter(m => m.status === "Revision Requested").length,
    unresolvedTickets: tickets.filter(t => t.status !== "Resolved").length
  };

  const reviewTypeData = [
    { name: "Journal Manuscript", value: manuscripts.filter(m => m.submissionType !== "Published").length, color: "#171717" },
    { name: "Archive Verification", value: manuscripts.filter(m => m.submissionType === "Published").length, color: "#a3a3a3" }
  ];

  const filteredManuscripts = manuscripts.filter(ms => {
    const matchesSearch = ms.title.toLowerCase().includes(reviewSearchQuery.toLowerCase()) || 
                          ms.authors.some(a => a.toLowerCase().includes(reviewSearchQuery.toLowerCase()));
    
    if (reviewStatusFilter === "All") return matchesSearch;
    return ms.status === reviewStatusFilter && matchesSearch;
  });

  return (
    <div className="flex-grow bg-white py-10 font-sans relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg border border-neutral-800 animate-slideUp max-w-sm">
          <CheckCircle className="w-5 h-5 text-neutral-200 shrink-0" />
          <span className="text-xs font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:text-neutral-400 cursor-pointer text-xs">✕</button>
        </div>
      )}

      {/* Role Promotion Alert Modal */}
      {manuscriptPromoAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black border border-neutral-200">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-black text-sm uppercase tracking-wider">Author Automatic Promotion</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                As a result of manuscript approval, the account of <strong className="text-black font-semibold">{manuscriptPromoAlert.author}</strong> has been promoted to a <strong className="text-black font-semibold">Verified Researcher</strong> with indexing rights!
              </p>
            </div>
            <button
              onClick={() => setManuscriptPromoAlert(null)}
              className="w-full bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs py-2 rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Acknowledge Promotion
            </button>
          </div>
        </div>
      )}

      {/* Certificate Viewer */}
      {selectedPaperForCert && (
        <PublicationCertificate
          paper={selectedPaperForCert}
          onClose={() => setSelectedPaperForCert(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Reviewer Board Banner */}
        <div className="border border-neutral-200 bg-neutral-50 p-6 sm:p-8 mb-10 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-[10px] font-mono bg-neutral-900 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Peer Review Board
              </span>
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest font-semibold">Level 2 Staff Account</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-sans font-bold text-black tracking-tight uppercase">Reviewer Moderation Workspace</h1>
            <p className="text-xs text-neutral-500 max-w-xl font-sans">
              Welcome, <strong className="text-black font-semibold">{currentUser.name}</strong>. You have restricted access to the double-blind manuscript moderation dashboard, peer-review channels, and client support logs.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage("journal")}
            className="text-xs font-mono font-bold uppercase tracking-wider py-2 px-4 bg-white border border-neutral-200 hover:border-black rounded-xl transition-colors cursor-pointer"
          >
            ← View Scientific Journal
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-1.5">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 px-3 mb-2">Reviewer Sections</p>
            {[
              { id: "reviews", label: "Peer-Review Pipeline", icon: FileText },
              { id: "applications", label: "Researcher Applications", icon: Award },
              { id: "support", label: "Support Desk", icon: MessageSquare },
              { id: "analytics", label: "Pipeline Analytics", icon: BarChart2 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all cursor-pointer border rounded-xl ${
                    activeTab === tab.id
                      ? "bg-black text-white border-black shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-black border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Panel Area */}
          <div className="lg:col-span-3 border border-neutral-200 p-6 sm:p-8 bg-white rounded-2xl shadow-sm min-h-[500px]">
            
            {/* 1. PEER REVIEW PIPELINE */}
            {activeTab === "reviews" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Review Pipeline</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Audit submitted manuscripts. Support for independent Dual Submission pathways is fully configured.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search submissions by title or investigator..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <select
                      value={reviewStatusFilter}
                      onChange={(e) => setReviewStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black font-sans cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Under Review">Under Review (Journal)</option>
                      <option value="Pending Verification">Pending Verification (Archive)</option>
                      <option value="Approved">Approved / Published</option>
                      <option value="Revision Requested">Revision Requested</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {selectedManuscript ? (
                  <div className="border border-neutral-200 p-5 rounded-xl bg-neutral-50/40 space-y-4">
                    <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-[8px] font-bold bg-neutral-900 text-white px-2 py-0.5 uppercase tracking-wider rounded">
                            {selectedManuscript.submissionType === "Published" ? "Published Research Pathway" : "Scientific Journal Submission"}
                          </span>
                          <span className="font-mono text-[8px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 uppercase tracking-wider rounded">
                            {selectedManuscript.researchType || "Article"}
                          </span>
                        </div>
                        <h3 className="text-sm font-sans font-bold text-black leading-tight">{selectedManuscript.title}</h3>
                        <p className="text-[11px] text-neutral-500 mt-1">Investigator: {selectedManuscript.authors.join(", ")} ({selectedManuscript.authorEmail})</p>
                      </div>
                      <button onClick={() => setSelectedManuscript(null)} className="text-neutral-400 hover:text-black">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Abstract Abstractum</p>
                      <p className="text-xs text-neutral-700 leading-relaxed font-sans font-light bg-white p-3 border border-neutral-150 rounded-xl">{selectedManuscript.abstract}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold">Institution</span>
                        <p className="font-semibold text-neutral-800">{selectedManuscript.institution}</p>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold">Country</span>
                        <p className="font-semibold text-neutral-800">{selectedManuscript.country}</p>
                      </div>
                    </div>

                    {/* Review Notes field */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-mono font-bold text-neutral-500 uppercase">Reviewer Annotation Notes</label>
                      <textarea
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        placeholder="Provide peer annotations, revisions instructions, or reasoning..."
                        rows={3}
                        className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-black font-sans font-light"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t border-neutral-200">
                      <button
                        onClick={() => handleManuscriptAction(selectedManuscript.id, "Rejected")}
                        className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Reject Submission
                      </button>
                      <button
                        onClick={() => handleManuscriptAction(selectedManuscript.id, "Revision Requested")}
                        className="px-3.5 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Request Revisions
                      </button>
                      <button
                        onClick={() => handleManuscriptAction(selectedManuscript.id, "Approved")}
                        className="px-5 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        {selectedManuscript.submissionType === "Published" ? "Approve & Index Paper" : "Approve & Publish Manuscript"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredManuscripts.length > 0 ? (
                      <div className="space-y-3">
                        {filteredManuscripts.map((ms) => (
                          <div
                            key={ms.id}
                            className="border border-neutral-200 p-4 hover:border-black rounded-xl bg-white transition-all flex flex-col sm:flex-row justify-between items-start gap-4 shadow-xs"
                          >
                            <div className="space-y-1.5 max-w-xl">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`font-mono text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  ms.status === "Approved" ? "bg-black text-white" :
                                  ms.status === "Rejected" ? "bg-red-100 text-red-700" :
                                  ms.status === "Revision Requested" ? "bg-amber-100 text-amber-800" :
                                  "bg-neutral-100 text-neutral-600"
                                }`}>
                                  {ms.status}
                                </span>
                                <span className="font-mono text-[8px] font-bold bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {ms.submissionType === "Published" ? "Published Research" : "Journal Submission"}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono">Submitted {ms.submittedAt}</span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-black font-sans leading-tight">{ms.title}</h4>
                              <p className="text-[11px] text-neutral-500 font-sans font-light">Author: {ms.authors[0]} ({ms.authorEmail}) • {ms.institution}</p>
                            </div>
                            <div className="flex gap-2 self-start sm:self-center">
                              {ms.status === "Approved" && (
                                <button
                                  onClick={() => setSelectedPaperForCert({
                                    id: ms.id,
                                    title: ms.title,
                                    authors: ms.authors,
                                    journal: ms.submissionType === "Published" ? undefined : "Healthedia Global Journal of Performance Science",
                                    doi: `10.2813/healthedia.${ms.id.split("-")[1] || Math.floor(1000 + Math.random() * 9000)}`,
                                    specialty: ms.specialty,
                                    institution: ms.institution,
                                    country: ms.country,
                                    submittedAt: ms.submittedAt
                                  })}
                                  className="px-3 py-1.5 border border-neutral-200 hover:border-black text-neutral-600 hover:text-black text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  Certificate
                                </button>
                              )}
                              {ms.status !== "Approved" && ms.status !== "Rejected" && (
                                <button
                                  onClick={() => {
                                    setSelectedManuscript(ms);
                                    setReviewerNotes(ms.reviewerNotes || "");
                                  }}
                                  className="px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-black border border-neutral-200 text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Conduct Audit
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center border border-neutral-150 rounded-2xl bg-neutral-50/50">
                        <Clock className="w-8 h-8 text-neutral-350 mx-auto stroke-[1.5] mb-2" />
                        <p className="text-xs text-neutral-500 font-bold font-mono uppercase mb-1">No pending review pipelines</p>
                        <p className="text-xs text-neutral-400 font-light">All submitted scholarly works matching criteria have been fully audited.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. SUPPORT DESK RESOLUTION */}
            {activeTab === "support" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Support Desk</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">Moderate customer claims and physiological account claim requests.</p>
                  </div>
                  <div className="w-36">
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-1.5 focus:outline-none focus:border-black font-sans cursor-pointer text-black"
                    >
                      <option value="All">All Tickets</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {tickets
                    .filter(t => ticketStatusFilter === "All" || t.status === ticketStatusFilter)
                    .map((ticket) => (
                      <div key={ticket.id} className="border border-neutral-200 p-4 rounded-xl bg-white space-y-3 shadow-xs">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-mono text-[9px] text-neutral-400 uppercase font-bold mr-2">{ticket.category}</span>
                            <span className="font-mono text-[9px] text-neutral-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            <h4 className="text-xs sm:text-sm font-sans font-bold text-black leading-tight mt-1">{ticket.title}</h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5 font-light">Submitted by: {ticket.userEmail}</p>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block font-mono text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                              ticket.status === "Pending" ? "bg-red-50 text-red-600" :
                              ticket.status === "In Progress" ? "bg-neutral-50 text-neutral-600 border border-neutral-300" :
                              "bg-black text-white"
                            }`}>
                              {ticket.status}
                            </span>
                            <select
                              value={ticket.status}
                              onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value as any)}
                              className="text-[10px] bg-neutral-50 border border-neutral-200 rounded-md p-1 cursor-pointer focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 border border-neutral-150 rounded-lg font-light">
                          {ticket.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 3. PIPELINE ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Review Pipeline Analytics</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Real-time counts, pipeline distribution metrics, and archival growth tracks.</p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 text-center sm:text-left">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">Total Submissions</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{stats.totalSubmissions}</p>
                  </div>
                  <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 text-center sm:text-left">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">Under Review</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{stats.underReview}</p>
                  </div>
                  <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 text-center sm:text-left">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">Approved Papers</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{stats.approvedCount}</p>
                  </div>
                  <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 text-center sm:text-left">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">Support Inquiries</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{stats.unresolvedTickets}</p>
                  </div>
                </div>

                {/* Distribution Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="border border-neutral-200 p-4 rounded-xl space-y-4">
                    <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Submission Channel Split</p>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reviewTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {reviewTypeData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-[10px] font-mono">
                      {reviewTypeData.map(r => (
                        <div key={r.name} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></span>
                          <span className="text-neutral-500">{r.name}: <strong className="text-black">{r.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-neutral-200 p-4 rounded-xl space-y-4">
                    <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Reviewer Activity Index</p>
                    <div className="h-44 flex items-center justify-center bg-neutral-50 rounded-xl text-center p-6 border border-neutral-100">
                      <div className="space-y-1">
                        <ShieldCheck className="w-8 h-8 text-neutral-400 mx-auto stroke-[1.5]" />
                        <p className="text-xs text-neutral-600 font-semibold font-mono">Double-Blind Check Active</p>
                        <p className="text-[10px] text-neutral-400 max-w-xs font-sans">Neither reviewers nor investigators are aware of each other's credentials during active evaluation loops.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. RESEARCHER APPLICATIONS */}
            {activeTab === "applications" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Become a Researcher Applications</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Evaluate professional credentials, biographical history, and ORCID registries to approve or deny Researcher status.</p>
                </div>

                {applications.length > 0 ? (
                  <div className="space-y-6">
                    {applications.map((app: any) => (
                      <div key={app.id} className="border border-neutral-200 rounded-2xl p-6 space-y-4 bg-neutral-50/20">
                        {/* Header status bar */}
                        <div className="flex flex-wrap items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-black">{app.name}</h3>
                            <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{app.email} • {app.timestamp}</p>
                          </div>
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              app.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              app.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </div>

                        {/* Credentials Details Block */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-[10px] font-mono uppercase font-semibold text-neutral-400">Title & Degree</p>
                            <p className="text-black font-medium mt-0.5">{app.title} ({app.degree})</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase font-semibold text-neutral-400">Specialty Field</p>
                            <p className="text-black font-medium mt-0.5">{app.specialty}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase font-semibold text-neutral-400">Institution & Country</p>
                            <p className="text-black font-medium mt-0.5">{app.institution} ({app.country})</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase font-semibold text-neutral-400">ORCID Registry ID</p>
                            <a
                              href={`https://orcid.org/${app.orcid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 hover:underline font-mono inline-flex items-center mt-0.5"
                            >
                              {app.orcid} <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>

                        {/* Biography display */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono uppercase font-semibold text-neutral-400">Professional Biography</p>
                          <p className="text-xs text-neutral-600 leading-relaxed bg-white border border-neutral-250 p-3 rounded-xl font-light">
                            {app.bio}
                          </p>
                        </div>

                        {/* Decision Actions (only if Pending) */}
                        {app.status === "Pending" && (
                          <div className="pt-2 flex justify-end gap-3 border-t border-neutral-100">
                            <button
                              onClick={() => handleApplicationDecision(app.id, app.email, "Rejected")}
                              className="px-4 py-2 border border-red-200 text-red-600 text-xs font-mono font-bold uppercase rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              Reject & Decline
                            </button>
                            <button
                              onClick={() => handleApplicationDecision(app.id, app.email, "Approved")}
                              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" /> Approve & Promote
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-neutral-200 p-12 text-center bg-neutral-50/40 rounded-2xl">
                    <p className="text-xs font-mono text-neutral-400 uppercase mb-2">No Active Applications</p>
                    <h3 className="text-base font-sans font-semibold text-black">All applications processed</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed font-light">
                      There are currently no pending Member-to-Researcher applications waiting for reviewer validation.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
