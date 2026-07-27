import React, { useState, useEffect } from "react";
import {
  FileCode, ShieldCheck, Award, RefreshCw, Plus, Trash, AlertCircle, X,
  ArrowUpRight, FileText, Upload, CheckCircle, HelpCircle, Lock, Mail
} from "lucide-react";
import { UserProfileData, Manuscript } from "../types";
import { getStoredItem, setStoredItem } from "../lib/taxonomyStore";
import PublicationCertificate from "./PublicationCertificate";

interface ManuscriptSubmissionViewProps {
  currentUser: UserProfileData;
  setCurrentPage: (page: string) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export default function ManuscriptSubmissionView({
  currentUser,
  setCurrentPage,
  showToast
}: ManuscriptSubmissionViewProps) {
  // Submission Pathway choice: null (choose first), "Journal" (Journal Submission), "Published" (Global Archive Submission)
  const [submissionPathway, setSubmissionPathway] = useState<"Journal" | "Published" | null>(null);

  const [myManuscripts, setMyManuscripts] = useState<Manuscript[]>([]);
  const [editingManuscriptId, setEditingManuscriptId] = useState<string | null>(null);

  // Form State Variables
  const [msTitle, setMsTitle] = useState("");
  const [msAbstract, setMsAbstract] = useState("");
  const [msSpecialty, setMsSpecialty] = useState(currentUser.specialty || "Sports Medicine");
  const [msJournalCategory, setMsJournalCategory] = useState("Sports Science & Human Performance");
  const [msResearchType, setMsResearchType] = useState("Randomized Controlled Trial");
  const [msInstitution, setMsInstitution] = useState(currentUser.institution || "Harvard Research Centre");
  const [msCountry, setMsCountry] = useState(currentUser.country || "Global");
  const [msCoAuthors, setMsCoAuthors] = useState("");
  const [msKeywords, setMsKeywords] = useState("");

  // Global Archive specific fields
  const [originalJournalName, setOriginalJournalName] = useState("");
  const [originalPublicationYear, setOriginalPublicationYear] = useState("");
  const [msDoi, setMsDoi] = useState("");

  // Journal Submission specific ethical checklist
  const [ethicalChecked, setEthicalChecked] = useState(false);
  const [conflictChecked, setConflictChecked] = useState(false);
  const [fundingChecked, setFundingChecked] = useState(false);

  const [ethicalDetails, setEthicalDetails] = useState("");
  const [conflictDetails, setConflictDetails] = useState("");
  const [fundingDetails, setFundingDetails] = useState("");

  // Certificate Modal state
  const [selectedPaperForCert, setSelectedPaperForCert] = useState<any | null>(null);

  // Load custom list on mount
  useEffect(() => {
    const INITIAL_MANUSCRIPTS: Manuscript[] = [];
    const allMs = getStoredItem<Manuscript[]>("healthedia_manuscripts", INITIAL_MANUSCRIPTS);
    const filtered = allMs.filter(m => m.authorEmail.toLowerCase() === currentUser.email.toLowerCase());
    setMyManuscripts(filtered);
  }, [currentUser.email]);

  const handleResetForm = () => {
    setMsTitle("");
    setMsAbstract("");
    setMsCoAuthors("");
    setMsKeywords("");
    setOriginalJournalName("");
    setOriginalPublicationYear("");
    setMsDoi("");
    setEthicalChecked(false);
    setEthicalDetails("");
    setConflictChecked(false);
    setConflictDetails("");
    setFundingChecked(false);
    setFundingDetails("");
    setEditingManuscriptId(null);
    setSubmissionPathway(null);
  };

  const handleSubmitManuscript = (e: React.FormEvent) => {
    e.preventDefault();

    if (!msTitle.trim() || !msAbstract.trim()) {
      showToast("Please enter a valid title and abstract.", "error");
      return;
    }

    if (submissionPathway === "Journal") {
      // Must check ethical agreements
      if (!ethicalChecked || !conflictChecked || !fundingChecked) {
        showToast("Compliance Checklist: You must verify ethical approval, conflict of interest, and funding disclosures before submitting.", "error");
        return;
      }
    } else if (submissionPathway === "Published") {
      // Must fill in journal info
      if (!originalJournalName.trim() || !originalPublicationYear.trim() || !msDoi.trim()) {
        showToast("Please provide the original journal name, publication year, and DOI.", "error");
        return;
      }
    } else {
      showToast("Please select a valid submission pathway first.", "error");
      return;
    }

    const initialStatus = submissionPathway === "Published" ? "Pending Verification" : "Under Review";
    const INITIAL_MANUSCRIPTS: Manuscript[] = [];
    const allMs = getStoredItem<Manuscript[]>("healthedia_manuscripts", INITIAL_MANUSCRIPTS);

    if (editingManuscriptId) {
      // Resubmission / Revision flow
      const updatedMsList = allMs.map(ms => {
        if (ms.id === editingManuscriptId) {
          return {
            ...ms,
            title: msTitle,
            abstract: msAbstract,
            authors: [currentUser.name, ...msCoAuthors.split(",").map(s => s.trim()).filter(Boolean)],
            journalCategory: msJournalCategory,
            researchType: msResearchType,
            specialty: msSpecialty,
            institution: msInstitution,
            country: msCountry,
            keywords: msKeywords.split(",").map(k => k.trim()).filter(Boolean),
            status: initialStatus,
            submissionType: submissionPathway,
            originalJournalName: submissionPathway === "Published" ? originalJournalName : undefined,
            originalPublicationYear: submissionPathway === "Published" ? originalPublicationYear : undefined,
            doi: submissionPathway === "Published" ? msDoi : ms.doi,
            reviewerNotes: ms.reviewerNotes ? `${ms.reviewerNotes} (Revision submitted on ${new Date().toISOString().split("T")[0]})` : undefined,
            ethicalApprovalChecked: ethicalChecked,
            ethicalApprovalDetails: ethicalDetails,
            conflictOfInterestChecked: conflictChecked,
            conflictOfInterestDetails: conflictDetails,
            fundingDisclosuresChecked: fundingChecked,
            fundingDisclosuresDetails: fundingDetails
          };
        }
        return ms;
      });

      setStoredItem("healthedia_manuscripts", updatedMsList);
      const filtered = updatedMsList.filter(m => m.authorEmail.toLowerCase() === currentUser.email.toLowerCase());
      setMyManuscripts(filtered);
      showToast("Manuscript revision successfully submitted to review pipeline!", "success");
      handleResetForm();
    } else {
      // New submission flow
      const newMs: Manuscript = {
        id: `ms-${Date.now()}`,
        title: msTitle,
        abstract: msAbstract,
        authors: [currentUser.name, ...msCoAuthors.split(",").map(s => s.trim()).filter(Boolean)],
        authorEmail: currentUser.email,
        journalCategory: msJournalCategory,
        researchType: msResearchType,
        specialty: msSpecialty,
        institution: msInstitution,
        country: msCountry,
        keywords: msKeywords.split(",").map(k => k.trim()).filter(Boolean),
        submittedAt: new Date().toISOString().split("T")[0],
        status: initialStatus,
        submissionType: submissionPathway,
        originalJournalName: submissionPathway === "Published" ? originalJournalName : undefined,
        originalPublicationYear: submissionPathway === "Published" ? originalPublicationYear : undefined,
        doi: submissionPathway === "Published" ? msDoi : `10.2813/healthedia.ms${Date.now().toString().slice(-4)}`,
        ethicalApprovalChecked: ethicalChecked,
        ethicalApprovalDetails: ethicalDetails,
        conflictOfInterestChecked: conflictChecked,
        conflictOfInterestDetails: conflictDetails,
        fundingDisclosuresChecked: fundingChecked,
        fundingDisclosuresDetails: fundingDetails
      };

      allMs.push(newMs);
      setStoredItem("healthedia_manuscripts", allMs);
      setMyManuscripts(prev => [...prev, newMs]);
      showToast("Scholarly research successfully submitted to Healthedia Review board!", "success");
      handleResetForm();
    }
  };

  const handleEditRevision = (ms: Manuscript) => {
    setEditingManuscriptId(ms.id);
    setMsTitle(ms.title);
    setMsAbstract(ms.abstract);
    setMsCoAuthors(ms.authors.slice(1).join(", "));
    setMsKeywords(ms.keywords ? ms.keywords.join(", ") : "");
    setMsSpecialty(ms.specialty);
    setMsJournalCategory(ms.journalCategory);
    setMsResearchType(ms.researchType);
    setMsInstitution(ms.institution);
    setMsCountry(ms.country);
    setSubmissionPathway(ms.submissionType as any || "Journal");
    setOriginalJournalName(ms.originalJournalName || "");
    setOriginalPublicationYear(ms.originalPublicationYear || "");
    setMsDoi(ms.doi || "");
    setEthicalChecked(!!ms.ethicalApprovalChecked);
    setEthicalDetails(ms.ethicalApprovalDetails || "");
    setConflictChecked(!!ms.conflictOfInterestChecked);
    setConflictDetails(ms.conflictOfInterestDetails || "");
    setFundingChecked(!!ms.fundingDisclosuresChecked);
    setFundingDetails(ms.fundingDisclosuresDetails || "");

    document.getElementById("submission-portal-header")?.scrollIntoView({ behavior: "smooth" });
    showToast("Setup for editing revision complete.", "info");
  };

  return (
    <div className="flex-grow bg-white py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div id="submission-portal-header" className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-black text-black tracking-tight uppercase">
              Manuscript Submission Portal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
              Submit new original manuscripts or register previously published scholarly research to Healthedia's peer-reviewed directory.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage("journal")}
            className="inline-flex items-center text-xs font-mono font-bold text-neutral-500 hover:text-black border-b border-neutral-300 hover:border-black py-0.5"
          >
            ← Back to Scientific Journal
          </button>
        </div>

        {/* ROLE CONSTRAINTS NOTICE */}
        {currentUser.role === "Member" ? (
          <div className="bg-neutral-50 border border-black p-5 rounded-2xl space-y-2 mb-8 animate-fadeIn">
            <div className="flex items-center gap-2 text-black">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">🌟 Member Automatic Promotion Track</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              You are currently an <strong>Archive Member</strong>. Submitting your first scientific manuscript initiates Healthedia's automated peer-promotion track! Once your submitted manuscript is verified and approved, your account will instantly level-up to a <strong>Verified Researcher</strong> with fully indexable citations.
            </p>
          </div>
        ) : (
          <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-2 mb-8 animate-fadeIn">
            <div className="flex items-center gap-2 text-neutral-800">
              <ShieldCheck className="w-5 h-5 shrink-0 text-black" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Researcher-Level Verification Status</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              As a verified <strong>{currentUser.role}</strong>, your submissions bypass trial queues and immediately enter the peer-review pipeline. Your profile indexes and publication statistics are maintained in real-time.
            </p>
          </div>
        )}

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: FORM SUBMISSION (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PATHWAY SELECTOR STEP */}
            {submissionPathway === null ? (
              <div className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm space-y-6 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase font-bold text-neutral-400">Choose Submission Type</h3>
                  <p className="text-xs text-neutral-500 font-light leading-relaxed">
                    Select the submission channel appropriate for your research material to load the targeted peer vetting forms.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Global Archive Card */}
                  <button
                    type="button"
                    onClick={() => setSubmissionPathway("Published")}
                    className="border border-neutral-200 hover:border-black rounded-2xl p-6 text-left hover:bg-neutral-50 transition-all duration-150 cursor-pointer space-y-4 group"
                  >
                    <div className="p-3 bg-neutral-100 rounded-xl max-w-max text-black group-hover:bg-black group-hover:text-white transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black font-sans uppercase tracking-tight">Global Archive Submission</h4>
                      <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                        For research that has already been published elsewhere and is intended for indexing in Healthedia's Global Health Archive.
                      </p>
                    </div>
                  </button>

                  {/* Healthedia Scientific Journal Card */}
                  <button
                    type="button"
                    onClick={() => setSubmissionPathway("Journal")}
                    className="border border-neutral-200 hover:border-black rounded-2xl p-6 text-left hover:bg-neutral-50 transition-all duration-150 cursor-pointer space-y-4 group"
                  >
                    <div className="p-3 bg-neutral-100 rounded-xl max-w-max text-black group-hover:bg-black group-hover:text-white transition-all">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black font-sans uppercase tracking-tight">Journal Submission</h4>
                      <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                        For original unpublished manuscripts intended for publication in the Healthedia Scientific Journal.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* DYNAMIC SUBMISSION FORM */
              <div className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                  <div>
                    <span className="font-mono text-[9px] uppercase bg-black text-white px-2.5 py-1 rounded-md font-bold tracking-wider">
                      {submissionPathway === "Published" ? "Global Archive Submission" : "Journal Manuscript Submission"}
                    </span>
                    <h3 className="text-base font-bold text-black font-sans mt-2">
                      {editingManuscriptId ? `Edit Revision: ${editingManuscriptId}` : "Prepare Submission Dossier"}
                    </h3>
                  </div>
                  <button
                    onClick={handleResetForm}
                    className="text-[10px] font-mono font-bold text-neutral-500 hover:text-black uppercase cursor-pointer"
                  >
                    Change Pathway
                  </button>
                </div>

                <form onSubmit={handleSubmitManuscript} className="space-y-6">
                  
                  {/* COMMON FIELDS: Title & Abstract */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Manuscript Title</label>
                      <input
                        type="text"
                        value={msTitle}
                        onChange={(e) => setMsTitle(e.target.value)}
                        required
                        placeholder="e.g., Continuous Continuous Muscle Regeneration adapted to high-frequency load"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Structured Abstract</label>
                      <textarea
                        value={msAbstract}
                        onChange={(e) => setMsAbstract(e.target.value)}
                        required
                        rows={6}
                        placeholder="Provide Introduction, Methods, Results, and Clinical Significance..."
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  {/* PATHWAY DYNAMIC FIELDS */}
                  {submissionPathway === "Published" ? (
                    /* Global Archive Submission specific fields */
                    <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Original Publisher / Journal</label>
                        <input
                          type="text"
                          value={originalJournalName}
                          onChange={(e) => setOriginalJournalName(e.target.value)}
                          required
                          placeholder="e.g., Lancet Physiology, Nature"
                          className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Publication Year</label>
                        <input
                          type="text"
                          value={originalPublicationYear}
                          onChange={(e) => setOriginalPublicationYear(e.target.value)}
                          required
                          placeholder="e.g., 2024"
                          className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Registered DOI Handle</label>
                        <input
                          type="text"
                          value={msDoi}
                          onChange={(e) => setMsDoi(e.target.value)}
                          required
                          placeholder="e.g., 10.1016/j.phys.2024"
                          className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Journal Submission specific ethical checklist */
                    <div className="space-y-4 bg-neutral-50 p-5 border border-neutral-200 rounded-xl animate-fadeIn text-xs">
                      <h4 className="text-[10px] font-mono uppercase font-bold text-neutral-500 border-b border-neutral-200 pb-2">
                        Mandatory Ethical Vetting & Clinical Disclosures
                      </h4>

                      <div className="space-y-4">
                        <label className="flex items-start cursor-pointer hover:text-black group">
                          <input
                            type="checkbox"
                            checked={ethicalChecked}
                            onChange={(e) => setEthicalChecked(e.target.checked)}
                            className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                          />
                          <div>
                            <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">1. Human/Animal Ethical Clearance Attestation</p>
                            <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">
                              I confirm this clinical research was cleared by an institutional ethics board or equivalent reviewing entity.
                            </p>
                          </div>
                        </label>

                        {ethicalChecked && (
                          <input
                            type="text"
                            value={ethicalDetails}
                            onChange={(e) => setEthicalDetails(e.target.value)}
                            required
                            placeholder="Enter board name, protocol identifier or citation code..."
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg focus:outline-none focus:border-black transition-colors animate-fadeIn"
                          />
                        )}

                        <label className="flex items-start cursor-pointer hover:text-black group pt-2 border-t border-neutral-200/60">
                          <input
                            type="checkbox"
                            checked={conflictChecked}
                            onChange={(e) => setConflictChecked(e.target.checked)}
                            className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                          />
                          <div>
                            <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">2. Conflicts of Interest Disclosure</p>
                            <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">
                              I attest that any commercial, corporate, or dual-role financial affiliations are fully disclosed below.
                            </p>
                          </div>
                        </label>

                        {conflictChecked && (
                          <input
                            type="text"
                            value={conflictDetails}
                            onChange={(e) => setConflictDetails(e.target.value)}
                            required
                            placeholder="Describe any active commercial interest or type 'None disclosed'..."
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg focus:outline-none focus:border-black transition-colors animate-fadeIn"
                          />
                        )}

                        <label className="flex items-start cursor-pointer hover:text-black group pt-2 border-t border-neutral-200/60">
                          <input
                            type="checkbox"
                            checked={fundingChecked}
                            onChange={(e) => setFundingChecked(e.target.checked)}
                            className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                          />
                          <div>
                            <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">3. Funding Sources Disclosure</p>
                            <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">
                              I confirm that all financial aid, government, or academic grants used for this study have been disclosed.
                            </p>
                          </div>
                        </label>

                        {fundingChecked && (
                          <input
                            type="text"
                            value={fundingDetails}
                            onChange={(e) => setFundingDetails(e.target.value)}
                            required
                            placeholder="Specify grant bodies, grant numbers or study sponsorships..."
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg focus:outline-none focus:border-black transition-colors animate-fadeIn"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* COMMON COLLABORATIVE METADATA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Co-Author List (Names, Comma-Separated)</label>
                      <input
                        type="text"
                        value={msCoAuthors}
                        onChange={(e) => setMsCoAuthors(e.target.value)}
                        placeholder="e.g., Prof. Kenji Takahashi, Dr. Alistair Vance"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Index Keywords (Comma-Separated)</label>
                      <input
                        type="text"
                        value={msKeywords}
                        onChange={(e) => setMsKeywords(e.target.value)}
                        placeholder="e.g., Muscle adaptation, HIIT, sports therapy"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  {/* CORE CLASSIFICATION METADATA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Research Methodology Type</label>
                      <select
                        value={msResearchType}
                        onChange={(e) => setMsResearchType(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors cursor-pointer"
                      >
                        <option value="Randomized Controlled Trial">Randomized Controlled Trial</option>
                        <option value="Systematic Review">Systematic Review</option>
                        <option value="Meta-Analysis">Meta-Analysis</option>
                        <option value="Cohort Study">Cohort Study</option>
                        <option value="Clinical Case Study">Clinical Case Study</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Academic Subject Field</label>
                      <select
                        value={msSpecialty}
                        onChange={(e) => setMsSpecialty(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors cursor-pointer"
                      >
                        <option value="Sports Medicine">Sports Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Human Performance">Human Performance</option>
                        <option value="Sports Nutrition">Sports Nutrition</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Journal Indexing Category</label>
                      <select
                        value={msJournalCategory}
                        onChange={(e) => setMsJournalCategory(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors cursor-pointer"
                      >
                        <option value="Sports Science & Human Performance">Sports Science & Human Performance</option>
                        <option value="Clinical Sports Adaptations">Clinical Sports Adaptations</option>
                        <option value="Cardiorespiratory Physiology">Cardiorespiratory Physiology</option>
                        <option value="Rehabilitative Kinesiology">Rehabilitative Kinesiology</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Affiliated Research Institution</label>
                      <input
                        type="text"
                        value={msInstitution}
                        onChange={(e) => setMsInstitution(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Country of Affiliation</label>
                      <input
                        type="text"
                        value={msCountry}
                        onChange={(e) => setMsCountry(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 rounded-xl focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  {/* FORM ACTIONS */}
                  <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-xl transition-all cursor-pointer border border-transparent"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="bg-black hover:bg-neutral-850 text-white text-xs font-mono font-bold uppercase tracking-widest py-2.5 px-6 rounded-xl cursor-pointer transition-colors"
                    >
                      {editingManuscriptId ? "Resubmit Revised Manuscript" : "Publish Submission dossier"}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>

          {/* RIGHT: SUBMISSIONS SIDEBAR DIRECTORY (lg:col-span-1) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-neutral-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-mono uppercase font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                Your Submitted Records ({myManuscripts.length})
              </h3>

              {myManuscripts.length === 0 ? (
                <div className="border border-dashed border-neutral-200 p-8 text-center rounded-xl">
                  <p className="text-xs text-neutral-400 italic font-light">
                    No active manuscript records registered under your profile yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {myManuscripts.map((ms) => (
                    <div
                      key={ms.id}
                      className="border border-neutral-150 p-4 rounded-xl space-y-2.5 bg-neutral-50/30 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-neutral-400">ID: {ms.id}</span>
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          ms.status === "Approved" ? "bg-black text-white" :
                          ms.status === "Rejected" ? "bg-red-50 text-red-600 border border-red-200" :
                          ms.status === "Revision Requested" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-neutral-100 text-neutral-700"
                        }`}>
                          {ms.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-black leading-snug line-clamp-2">{ms.title}</h4>
                        <span className="text-[9px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                          {ms.submissionType === "Published" ? "Global Archive" : "Journal Study"}
                        </span>
                      </div>

                      {ms.reviewerNotes && (
                        <div className="p-2.5 bg-white border border-neutral-200 rounded-lg text-[10px] leading-relaxed">
                          <span className="font-mono font-bold uppercase text-[7px] text-neutral-400 block">Board Auditor Notes</span>
                          <p className="text-neutral-600 italic font-light mt-0.5">{ms.reviewerNotes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1 border-t border-neutral-100 justify-end">
                        {ms.status === "Approved" && (
                          <button
                            type="button"
                            onClick={() => setSelectedPaperForCert({
                              id: ms.id,
                              title: ms.title,
                              authors: ms.authors,
                              journal: ms.submissionType === "Published" ? undefined : "Healthedia Global Journal of Performance Science",
                              doi: ms.doi || `10.2813/healthedia.${ms.id.split("-")[1] || "ms" + Date.now()}`,
                              specialty: ms.specialty || "Sports Science",
                              institution: ms.institution || "Harvard Research Centre",
                              country: ms.country || "Global",
                              submittedAt: ms.submittedAt
                            })}
                            className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[9px] font-mono font-bold uppercase rounded-md flex items-center gap-1 cursor-pointer"
                          >
                            <Award className="w-2.5 h-2.5" /> Certificate
                          </button>
                        )}
                        {ms.status === "Revision Requested" && (
                          <button
                            type="button"
                            onClick={() => handleEditRevision(ms)}
                            className="px-2.5 py-1 bg-amber-600 text-white hover:bg-amber-750 text-[9px] font-mono font-bold uppercase rounded-md flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Revise
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Certificate Modal render */}
      {selectedPaperForCert && (
        <PublicationCertificate
          paper={selectedPaperForCert}
          onClose={() => setSelectedPaperForCert(null)}
        />
      )}

    </div>
  );
}
