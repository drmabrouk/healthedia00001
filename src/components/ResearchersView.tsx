import React, { useState, useEffect } from "react";
import {
  Search, ShieldCheck, Mail, Award, FileText, Globe, GraduationCap, Building, ExternalLink, ArrowLeft, ArrowUpRight, CheckCircle, Sliders, Briefcase, BookOpen, AlertCircle,
  TrendingUp, BarChart2, Percent, Sparkles, X, Share2, Settings
} from "lucide-react";
import { Researcher, ResearchPaper, Course, UserProfileData } from "../types";
import { searchResearchers } from "../searchEngine";
import { INITIAL_PAPERS, INITIAL_COURSES, RESEARCHER_TRANSLATIONS, RESEARCHER_EXPERIENCES, INITIAL_RESEARCHERS } from "../data";

// Helper to enrich researcher publications with consistent citations and timelines
const getEnrichedResearcherPapers = (name: string): ResearchPaper[] => {
  const rawPapers = INITIAL_PAPERS.filter((paper) =>
    paper.authors.some((author) => author.toLowerCase().includes(name.toLowerCase()))
  );

  return rawPapers.map((paper) => {
    const index = INITIAL_PAPERS.findIndex(p => p.id === paper.id);
    
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
};

interface ResearchersViewProps {
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: string) => void;
  initialResearcherUsername?: string | null;
  currentUser?: UserProfileData | null;
  onUpdateCurrentUser?: (updated: UserProfileData) => void;
}

export default function ResearchersView({
  setSearchQuery,
  setCurrentPage,
  initialResearcherUsername,
  currentUser,
  onUpdateCurrentUser
}: ResearchersViewProps) {
  const [query, setQuery] = useState("");
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);
  const [language, setLanguage] = useState<"en" | "ar" | "fr" | "de">("en");
  const [profileTab, setProfileTab] = useState<"portfolio" | "impact">("portfolio");

  // Advanced Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Become a Researcher Workflow states
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [appStep, setAppStep] = useState<1 | 2 | 3>(1);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form inputs
  const [appTitle, setAppTitle] = useState("");
  const [appSpecialty, setAppSpecialty] = useState("");
  const [appInstitution, setAppInstitution] = useState("");
  const [appCountry, setAppCountry] = useState("");
  const [appDegree, setAppDegree] = useState("");
  const [appOrcid, setAppOrcid] = useState("");
  const [appBio, setAppBio] = useState("");

  // Verification Documents
  const [appPassportFile, setAppPassportFile] = useState("");
  const [appQualificationFile, setAppQualificationFile] = useState("");
  const [isAppPassportUploading, setIsAppPassportUploading] = useState(false);
  const [isAppQualUploading, setIsAppQualUploading] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Admin Profile Editing State
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editOrcid, setEditOrcid] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleAppPassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAppPassportUploading(true);
      setTimeout(() => {
        setAppPassportFile(file.name);
        setIsAppPassportUploading(false);
        showToast(`Passport ID document "${file.name}" uploaded.`, "success");
      }, 1200);
    }
  };

  const handleAppQualificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAppQualUploading(true);
      setTimeout(() => {
        setAppQualificationFile(file.name);
        setIsAppQualUploading(false);
        showToast(`Academic Qualification document "${file.name}" uploaded.`, "success");
      }, 1200);
    }
  };

  // Merge static default data and registered users from localStorage
  useEffect(() => {
    const loadAllResearchers = () => {
      const allResearchers = [...INITIAL_RESEARCHERS];
      const storedUsers = localStorage.getItem("healthedia_users");
      if (storedUsers) {
        try {
          const parsed: UserProfileData[] = JSON.parse(storedUsers);
          parsed.forEach(u => {
            if (u.role === "Researcher" || u.role === "Admin" || u.role === "Reviewer") {
              const r: Researcher = {
                id: u.username || u.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                name: u.name,
                title: u.title || "Dr.",
                avatar: u.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
                specialty: u.specialty || "Sports Medicine",
                country: u.country || "Global",
                institution: u.institution || "Healthedia Institute",
                degree: u.degree || "M.D.",
                orcid: u.orcid || "",
                bio: u.bio || "",
                qualifications: u.qualifications || [],
                researchInterests: u.researchInterests || [],
                publications: u.publications || [],
                awards: u.awards || [],
                certifications: u.certifications || [],
                verified: true,
                email: u.email
              };
              
              if (!allResearchers.some(exist => exist.name.toLowerCase() === r.name.toLowerCase() || exist.id === r.id)) {
                allResearchers.push(r);
              }
            }
          });
        } catch (e) {
          console.error("Error parsing stored users", e);
        }
      }
      // Apply Admin edits
      const storedEdits = localStorage.getItem("healthedia_researcher_edits");
      let editedList = allResearchers;
      if (storedEdits) {
        try {
          const edits = JSON.parse(storedEdits);
          editedList = allResearchers.map(r => {
            if (edits[r.id]) {
              return { ...r, ...edits[r.id] };
            }
            return r;
          });
        } catch (e) {}
      }
      return editedList;
    };

    const list = loadAllResearchers();
    if (query.trim() === "") {
      setResearchers(list);
    } else {
      const q = query.toLowerCase();
      const filtered = list.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.orcid?.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.institution.toLowerCase().includes(q) ||
        r.degree.toLowerCase().includes(q)
      );
      setResearchers(filtered);
    }
  }, [query]);

  useEffect(() => {
    const handleClose = () => {
      setShowApplicationModal(false);
      setIsAdminEditing(false);
    };
    window.addEventListener("healthedia:close-modals", handleClose);
    return () => window.removeEventListener("healthedia:close-modals", handleClose);
  }, []);

  // Load researcher if provided via URL/username parameter
  useEffect(() => {
    if (initialResearcherUsername) {
      const allResearchers = [...INITIAL_RESEARCHERS];
      const storedUsers = localStorage.getItem("healthedia_users");
      if (storedUsers) {
        try {
          const parsed: UserProfileData[] = JSON.parse(storedUsers);
          parsed.forEach(u => {
            if (u.role === "Researcher" || u.role === "Admin" || u.role === "Reviewer") {
              const r: Researcher = {
                id: u.username || u.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                name: u.name,
                title: u.title || "Dr.",
                avatar: u.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
                specialty: u.specialty || "Sports Medicine",
                country: u.country || "Global",
                institution: u.institution || "Healthedia Institute",
                degree: u.degree || "M.D.",
                orcid: u.orcid || "",
                bio: u.bio || "",
                qualifications: u.qualifications || [],
                researchInterests: u.researchInterests || [],
                publications: u.publications || [],
                awards: u.awards || [],
                certifications: u.certifications || [],
                verified: true,
                email: u.email
              };
              
              if (!allResearchers.some(exist => exist.name.toLowerCase() === r.name.toLowerCase())) {
                allResearchers.push(r);
              }
            }
          });
        } catch (e) {
          console.error("Error parsing stored users", e);
        }
      }

      // Apply Admin edits
      let finalResearchers = allResearchers;
      const storedEdits = localStorage.getItem("healthedia_researcher_edits");
      if (storedEdits) {
        try {
          const edits = JSON.parse(storedEdits);
          finalResearchers = allResearchers.map(r => {
            if (edits[r.id]) {
              return { ...r, ...edits[r.id] };
            }
            return r;
          });
        } catch (e) {}
      }

      const found = finalResearchers.find(r => 
        r.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === initialResearcherUsername.toLowerCase() || 
        r.id.toLowerCase() === initialResearcherUsername.toLowerCase()
      );
      if (found) {
        setSelectedResearcher(found);
      }
    } else {
      setSelectedResearcher(null);
    }
  }, [initialResearcherUsername]);

  // Find papers authored by a researcher
  const getResearcherPapers = (name: string): ResearchPaper[] => {
    return INITIAL_PAPERS.filter((paper) =>
      paper.authors.some((author) => author.toLowerCase().includes(name.toLowerCase()))
    );
  };

  // Find courses instructed by a researcher
  const getResearcherCourses = (id: string): Course[] => {
    return INITIAL_COURSES.filter((course) => course.instructorId === id);
  };

  // Dynamic values based on selected profile language
  const t = (field: "title" | "specialty" | "institution" | "degree" | "bio"): string => {
    if (!selectedResearcher) return "";
    if (language === "en") return selectedResearcher[field];
    const trans = RESEARCHER_TRANSLATIONS[selectedResearcher.id]?.[language];
    return trans?.[field] || selectedResearcher[field];
  };

  const tArray = (field: "researchInterests" | "qualifications" | "awards" | "certifications" | "experience"): string[] => {
    if (!selectedResearcher) return [];
    if (language === "en") {
      if (field === "experience") {
        return RESEARCHER_EXPERIENCES[selectedResearcher.id] || [];
      }
      return selectedResearcher[field];
    }
    const trans = RESEARCHER_TRANSLATIONS[selectedResearcher.id]?.[language];
    return trans?.[field] || (field === "experience" ? RESEARCHER_EXPERIENCES[selectedResearcher.id] || [] : selectedResearcher[field]);
  };

  const isRtl = language === "ar";

  // Derive unique values for filters dynamically
  const [specialties, setSpecialties] = useState<string[]>(["All"]);
  const [countries, setCountries] = useState<string[]>(["All"]);

  useEffect(() => {
    const loadAllResearchers = () => {
      const allResearchers = [...INITIAL_RESEARCHERS];
      const storedUsers = localStorage.getItem("healthedia_users");
      if (storedUsers) {
        try {
          const parsed: UserProfileData[] = JSON.parse(storedUsers);
          parsed.forEach(u => {
            if (u.role === "Researcher" || u.role === "Admin" || u.role === "Reviewer") {
              const r: Researcher = {
                id: u.username || u.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                name: u.name,
                title: u.title || "Dr.",
                avatar: u.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
                specialty: u.specialty || "Sports Medicine",
                country: u.country || "Global",
                institution: u.institution || "Healthedia Institute",
                degree: u.degree || "M.D.",
                orcid: u.orcid || "",
                bio: u.bio || "",
                qualifications: u.qualifications || [],
                researchInterests: u.researchInterests || [],
                publications: u.publications || [],
                awards: u.awards || [],
                certifications: u.certifications || [],
                verified: true,
                email: u.email
              };
              if (!allResearchers.some(exist => exist.name.toLowerCase() === r.name.toLowerCase())) {
                allResearchers.push(r);
              }
            }
          });
        } catch (e) {}
      }
      return allResearchers;
    };

    const list = loadAllResearchers();
    const uniqueSpecs = new Set<string>();
    const uniqueCountries = new Set<string>();
    list.forEach(r => {
      if (r.specialty) uniqueSpecs.add(r.specialty);
      if (r.country) uniqueCountries.add(r.country);
    });

    setSpecialties(["All", ...Array.from(uniqueSpecs).sort()]);
    setCountries(["All", ...Array.from(uniqueCountries).sort()]);
  }, []);

  const handleBecomeResearcherSubmit = () => {
    if (!currentUser || !onUpdateCurrentUser) return;

    const mockId = currentUser.researcherId || `HRI-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the application object
    const newApplication = {
      id: "app_" + Date.now(),
      userId: currentUser.email,
      username: currentUser.username,
      name: currentUser.name,
      email: currentUser.email,
      title: appTitle,
      specialty: appSpecialty,
      institution: appInstitution,
      country: appCountry,
      degree: appDegree,
      orcid: appOrcid,
      bio: appBio,
      passportFileName: appPassportFile,
      qualificationFileName: appQualificationFile,
      researcherId: mockId,
      status: "Pending",
      timestamp: new Date().toLocaleString()
    };

    // Save to localStorage: healthedia_researcher_applications
    const existingAppsStr = localStorage.getItem("healthedia_researcher_applications") || "[]";
    let existingApps = [];
    try {
      existingApps = JSON.parse(existingAppsStr);
    } catch (e) {}

    existingApps.push(newApplication);
    localStorage.setItem("healthedia_researcher_applications", JSON.stringify(existingApps));

    // Update current user status in session
    const updatedUser: UserProfileData = {
      ...currentUser,
      verificationSubmitted: true,
      researcherApplicationStatus: "Pending",
      title: appTitle,
      specialty: appSpecialty,
      institution: appInstitution,
      country: appCountry,
      degree: appDegree,
      orcid: appOrcid,
      bio: appBio,
      passportFileName: appPassportFile,
      qualificationFileName: appQualificationFile,
      researcherId: mockId
    };

    onUpdateCurrentUser(updatedUser);

    // Update in users database
    const usersStr = localStorage.getItem("healthedia_users") || "[]";
    try {
      let users: UserProfileData[] = JSON.parse(usersStr);
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex > -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem("healthedia_users", JSON.stringify(users));
      }
    } catch (e) {}

    showToast("Application submitted successfully! Our Reviewers will evaluate your credentials shortly.", "success");
    setShowApplicationModal(false);
    setAppStep(1);
    setAppPassportFile("");
    setAppQualificationFile("");
  };

  // Filter researchers dynamically
  const filteredResearchers = researchers.filter((res) => {
    const matchesSpecialty =
      selectedSpecialty === "All" ||
      res.specialty.toLowerCase() === selectedSpecialty.toLowerCase() ||
      res.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesCountry =
      selectedCountry === "All" ||
      res.country.toLowerCase() === selectedCountry.toLowerCase() ||
      res.country.toLowerCase().includes(selectedCountry.toLowerCase());
    const matchesVerified = !verifiedOnly || res.verified;
    return matchesSpecialty && matchesCountry && matchesVerified;
  });

  // Dedicated Individual Public Profile View
  if (selectedResearcher) {
    const papers = getEnrichedResearcherPapers(selectedResearcher.name);
    const instructedCourses = getResearcherCourses(selectedResearcher.id);

    const totalCitations = papers.reduce((sum, p) => sum + (p.citations || 0), 0);
    
    // Calculate platform h-index dynamically
    const sortedCitations = papers.map(p => p.citations || 0).sort((a, b) => b - a);
    let calculatedHIndex = 0;
    while (calculatedHIndex < sortedCitations.length && sortedCitations[calculatedHIndex] >= calculatedHIndex + 1) {
      calculatedHIndex++;
    }
    
    // Average field weighted impact
    const avgFWCI = papers.length > 0 
      ? parseFloat((papers.reduce((sum, p) => sum + (p.fieldWeightedImpact || 1), 0) / papers.length).toFixed(2))
      : 1.0;

    return (
      <div className="flex-grow bg-white py-10 animate-fadeIn font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Bar: Navigation & Multilingual Switcher */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedResearcher(null);
                setLanguage("en");
                setProfileTab("portfolio");
                if (initialResearcherUsername) {
                  window.location.hash = "researchers";
                  setCurrentPage("researchers");
                }
              }}
              className="inline-flex items-center text-xs font-semibold text-neutral-500 hover:text-black transition-colors duration-150 cursor-pointer rounded-xl bg-neutral-50 hover:bg-neutral-100 px-3 py-2 border border-neutral-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Directory
            </button>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-neutral-50 p-1.5 border border-neutral-200/80 rounded-2xl">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase px-2">Profile Lang:</span>
              <button
                onClick={() => setLanguage("en")}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                  language === "en" ? "bg-black text-white shadow-sm" : "text-neutral-600 hover:text-black hover:bg-neutral-150"
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => setLanguage("ar")}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                  language === "ar" ? "bg-black text-white shadow-sm" : "text-neutral-600 hover:text-black hover:bg-neutral-150"
                }`}
              >
                🇸🇦 AR
              </button>
              <button
                onClick={() => setLanguage("fr")}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                  language === "fr" ? "bg-black text-white shadow-sm" : "text-neutral-600 hover:text-black hover:bg-neutral-150"
                }`}
              >
                🇫🇷 FR
              </button>
              <button
                onClick={() => setLanguage("de")}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                  language === "de" ? "bg-black text-white shadow-sm" : "text-neutral-600 hover:text-black hover:bg-neutral-150"
                }`}
              >
                🇩🇪 DE
              </button>
            </div>
          </div>

          {/* Contextual System Administrator Controls */}
          {currentUser?.role === "Admin" && (
            <div className="bg-red-950 text-white border border-red-800 rounded-2xl p-3.5 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-300 shrink-0 stroke-[2]" />
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-100 block leading-none">
                    Administrator Contextual Controls
                  </span>
                  <span className="text-[10px] font-mono text-red-300">
                    Live Management • Profile ID: {selectedResearcher.id}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResearcher({
                      ...selectedResearcher,
                      verified: !selectedResearcher.verified
                    });
                    showToast(selectedResearcher.verified ? "Researcher verification revoked." : "Researcher marked as Verified Specialist.", "success");
                  }}
                  className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
                >
                  {selectedResearcher.verified ? "Revoke Verification" : "Verify Specialist"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newName = prompt("Edit Researcher Name:", selectedResearcher.name);
                    if (newName) {
                      setSelectedResearcher({ ...selectedResearcher, name: newName });
                      showToast("Researcher details updated live.", "success");
                    }
                  }}
                  className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Account access restrictions updated for ${selectedResearcher.name}`, "success");
                  }}
                  className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
                >
                  Restrict Account
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete profile for ${selectedResearcher.name}?`)) {
                      setSelectedResearcher(null);
                      showToast("Researcher profile deleted.", "success");
                    }
                  }}
                  className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-red-100 text-[11px] font-mono font-bold rounded-xl border border-red-600 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Profile Header Grid Banner */}
          <div className="bg-neutral-50/80 border border-neutral-200/80 p-6 sm:p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 shadow-sm">
            {/* Left: Avatar with badge */}
            <div className="relative shrink-0">
              <img
                src={selectedResearcher.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                alt={selectedResearcher.name}
                referrerPolicy="no-referrer"
                className="w-32 h-32 sm:w-36 sm:h-36 object-cover border border-neutral-200 bg-white rounded-2xl shadow-inner"
              />
              {selectedResearcher.verified && (
                <div className="absolute -bottom-2 -right-2 bg-black text-white p-1.5 rounded-xl border-2 border-white shadow-md" title="Verified Professional Identity">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Right: Primary details */}
            <div className="flex-grow space-y-4 text-center md:text-left min-w-0">
              <div className="space-y-1.5">
                <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-sans font-extrabold text-black tracking-tight">
                    {t("title")} {selectedResearcher.name}
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/#researcher/${selectedResearcher.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `${selectedResearcher.title || "Dr."} ${selectedResearcher.name} - Healthedia Researcher Profile`,
                          text: `View verified scholarly works and publication metrics of ${selectedResearcher.name} on Healthedia.`,
                          url: shareUrl,
                        }).catch(err => console.log(err));
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        showToast("Profile link copied to clipboard!", "success");
                      }
                    }}
                    className="p-1.5 rounded-xl border border-neutral-200 text-neutral-500 hover:text-black hover:border-black transition-all cursor-pointer flex items-center justify-center shrink-0 self-center bg-white shadow-sm"
                    title="Share Profile"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  {selectedResearcher.verified && (
                    <span className="inline-flex items-center text-[9px] font-mono bg-black text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider self-center max-w-max shadow-sm">
                      ✓ VERIFIED SPECIALIST
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base font-sans font-semibold text-neutral-800">
                  {t("specialty")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-500 max-w-2xl">
                <p className="flex items-center justify-center md:justify-start min-w-0">
                  <Building className="w-4 h-4 mr-2 text-neutral-400 shrink-0" />
                  <span className="truncate">{t("institution")}</span>
                </p>
                <p className="flex items-center justify-center md:justify-start min-w-0">
                  <GraduationCap className="w-4 h-4 mr-2 text-neutral-400 shrink-0" />
                  <span className="truncate">{t("degree")}</span>
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <Globe className="w-4 h-4 mr-2 text-neutral-400 shrink-0" />
                  <span>Origin: {selectedResearcher.country}</span>
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <span className="font-mono text-[9px] text-neutral-400 uppercase font-bold mr-2">ORCID ID:</span>
                  <a
                    href={`https://orcid.org/${selectedResearcher.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-black hover:underline font-medium"
                  >
                    {selectedResearcher.orcid}
                  </a>
                </p>
              </div>

              {/* Email contact & Admin Controls */}
              <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                <a
                  href={`mailto:${selectedResearcher.email}`}
                  className="inline-flex items-center text-xs font-semibold px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl transition-all shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5 mr-2" />
                  Contact Affiliated Lab
                </a>

                {currentUser?.role === "Admin" && (
                  <button
                    onClick={() => {
                      setEditName(selectedResearcher.name);
                      setEditSpecialty(selectedResearcher.specialty);
                      setEditInstitution(selectedResearcher.institution);
                      setEditDegree(selectedResearcher.degree);
                      setEditCountry(selectedResearcher.country);
                      setEditOrcid(selectedResearcher.orcid);
                      setEditBio(selectedResearcher.bio || "");
                      setEditEmail(selectedResearcher.email);
                      setIsAdminEditing(true);
                    }}
                    className="inline-flex items-center text-xs font-semibold px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Admin: Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setProfileTab("portfolio")}
              className={`pb-4 px-6 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                profileTab === "portfolio"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              Overview & Academic Portfolio
            </button>
            <button
              onClick={() => setProfileTab("impact")}
              className={`pb-4 px-6 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                profileTab === "impact"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-black" />
              Research Impact
            </button>
          </div>

          {profileTab === "portfolio" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Columns: Primary Scientific & Training details (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Card 1: Biography */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-3" dir={isRtl ? "rtl" : "ltr"}>
                <h3 className={`font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2 ${isRtl ? "justify-end text-right" : ""}`}>
                  <FileText className="w-4 h-4 text-black shrink-0" />
                  <span>Biography</span>
                </h3>
                <p className={`text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans font-light ${isRtl ? "text-right" : ""}`}>
                  {t("bio")}
                </p>
              </div>

              {/* Card 3: Professional Experience */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                <h3 className={`font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2 ${isRtl ? "justify-end text-right" : ""}`}>
                  <Briefcase className="w-4 h-4 text-black shrink-0" />
                  <span>Professional Experience</span>
                </h3>
                <div className="space-y-4">
                  {tArray("experience").map((exp, idx) => (
                    <div key={idx} className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></div>
                      <p className="text-xs sm:text-sm text-neutral-700 font-sans font-light leading-relaxed">
                        {exp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5: Publications */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-black shrink-0" />
                  <span>Indexed Publications ({papers.length})</span>
                </h3>
                {papers.length > 0 ? (
                  <div className="space-y-4">
                    {papers.map((paper) => (
                      <div
                        key={paper.id}
                        className="border border-neutral-100 p-4 hover:border-black transition-colors bg-neutral-50/50 rounded-xl space-y-2.5"
                      >
                        <span className="inline-block font-mono text-[9px] bg-white border border-neutral-200 px-2 py-0.5 text-neutral-500 uppercase tracking-wider rounded-lg">
                          {paper.researchType}
                        </span>
                        <h4 className="text-xs sm:text-sm font-sans font-bold text-black leading-snug">
                          {paper.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 font-sans font-light">
                          {paper.journal}, {paper.year}
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery(paper.title);
                            setCurrentPage("search-results");
                          }}
                          className="inline-flex items-center text-xs font-mono font-bold text-black hover:opacity-80 rounded-xl hover:bg-neutral-100 px-3 py-1.5 border border-neutral-200 transition-all cursor-pointer"
                        >
                          Read Abstract & DOI
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-neutral-400" />
                    <p className="text-xs text-neutral-500 font-sans font-light">
                      No registered peer-reviewed papers cataloged in this repository yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Card 6: Courses Instructed */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-black shrink-0" />
                  <span>Courses Instructed</span>
                </h3>
                {instructedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {instructedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="border border-neutral-200 hover:border-black rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-video relative overflow-hidden bg-neutral-100">
                            <img
                              src={course.coverImage}
                              alt={course.title}
                              referrerPolicy="no-referrer"
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute top-2 left-2 flex gap-1">
                              <span className="text-[8px] font-mono font-bold bg-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                {course.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="p-4 space-y-1.5">
                            <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase">
                              {course.category}
                            </p>
                            <h4 className="font-sans font-bold text-xs sm:text-sm text-black leading-tight">
                              {course.title}
                            </h4>
                            <p className="text-[10px] text-neutral-500 font-light line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 pt-0">
                          <button
                            onClick={() => setCurrentPage("courses")}
                            className="w-full text-center py-1.5 bg-neutral-50 hover:bg-neutral-100 text-black border border-neutral-200 text-[10px] font-sans font-semibold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            View Course Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-neutral-400" />
                    <p className="text-xs text-neutral-500 font-sans font-light">
                      This researcher is not currently instructing active Healthedia Academy courses.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Accreditations, Interests, Portals (lg:col-span-1) */}
            <div className="space-y-8">
              
              {/* Card 2: Academic Information */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                <h3 className={`font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <GraduationCap className="w-4 h-4 text-black shrink-0" />
                  <span>Academic Credentials</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block">Affiliation</span>
                    <p className="text-xs font-semibold text-black">{t("institution")}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block">Degree Level</span>
                    <p className="text-xs font-semibold text-black">{t("degree")}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Academic Qualifications</span>
                    <ul className="text-xs text-neutral-600 space-y-1.5 list-disc pl-4 font-sans font-light">
                      {tArray("qualifications").map((q, idx) => (
                        <li key={idx} className={isRtl ? "text-right list-none pr-2" : ""}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 4: Research Interests */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                <h3 className={`font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Sliders className="w-4 h-4 text-black shrink-0" />
                  <span>Research Interests</span>
                </h3>
                <div className={`flex flex-wrap gap-1.5 ${isRtl ? "justify-start flex-row-reverse" : ""}`}>
                  {tArray("researchInterests").map((interest) => (
                    <span
                      key={interest}
                      className="text-xs font-sans px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-400 border border-neutral-200 text-neutral-700 rounded-xl transition-all"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 7: Awards & Certifications */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                <h3 className={`font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Award className="w-4 h-4 text-black shrink-0" />
                  <span>Honors & Certifications</span>
                </h3>
                
                {/* Certifications */}
                {tArray("certifications").length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Board Certifications</span>
                    {tArray("certifications").map((cert) => (
                      <div key={cert} className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <CheckCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-xs text-neutral-700 font-sans font-light">
                          {cert}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Awards */}
                {tArray("awards").length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Academic Honors</span>
                    {tArray("awards").map((award, idx) => (
                      <div key={idx} className={`flex items-start text-xs text-neutral-600 font-sans font-light gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <Award className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                        <span>{award}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 8: External Academic Profiles */}
              <div className="border border-neutral-200/95 p-6 rounded-2xl bg-white shadow-sm space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-black shrink-0" />
                  <span>Academic Portals</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {selectedResearcher.googleScholar && (
                    <a
                      href={selectedResearcher.googleScholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-neutral-200 hover:border-black transition-colors rounded-xl bg-white shadow-sm group"
                    >
                      <span className="font-sans font-medium text-neutral-700 group-hover:text-black">Google Scholar</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                    </a>
                  )}
                  {selectedResearcher.researchGate && (
                    <a
                      href={selectedResearcher.researchGate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-neutral-200 hover:border-black transition-colors rounded-xl bg-white shadow-sm group"
                    >
                      <span className="font-sans font-medium text-neutral-700 group-hover:text-black">ResearchGate</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                    </a>
                  )}
                  {selectedResearcher.scopus && (
                    <a
                      href={selectedResearcher.scopus}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-neutral-200 hover:border-black transition-colors rounded-xl bg-white shadow-sm group"
                    >
                      <span className="font-sans font-medium text-neutral-700 group-hover:text-black">Scopus Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                    </a>
                  )}
                  <a
                    href={`https://orcid.org/${selectedResearcher.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-neutral-200 hover:border-black transition-colors bg-neutral-50 rounded-xl group"
                  >
                    <span className="font-mono font-medium text-[10px] text-black">ORCID: {selectedResearcher.orcid}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                  </a>
                </div>
              </div>

            </div>

          </div>
          ) : (
            /* Research Impact Analytics Dashboard */
            <div className="space-y-8 animate-fadeIn font-sans pb-10">
              {/* Stats overview banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Aggregate Citations card */}
                <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-black transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Aggregate Citations</span>
                    <h4 className="text-3xl font-mono font-bold text-black">{totalCitations}</h4>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-3 font-light leading-normal">
                    Cumulative citations across all published platform manuscripts.
                  </p>
                  <div className="absolute right-4 top-4 p-2 bg-neutral-50 rounded-lg group-hover:bg-neutral-100 transition-colors">
                    <TrendingUp className="w-5 h-5 text-black" />
                  </div>
                </div>

                {/* Calculated platform h-Index card */}
                <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-black transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Platform h-Index</span>
                    <h4 className="text-3xl font-mono font-bold text-black">{calculatedHIndex}</h4>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-3 font-light leading-normal">
                    {calculatedHIndex} papers with at least {calculatedHIndex} citations each on Healthedia.
                  </p>
                  <div className="absolute right-4 top-4 p-2 bg-neutral-50 rounded-lg group-hover:bg-neutral-100 transition-colors">
                    <Award className="w-5 h-5 text-black" />
                  </div>
                </div>

                {/* Avg Citations per Paper card */}
                <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-black transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Avg Citations / Paper</span>
                    <h4 className="text-3xl font-mono font-bold text-black">
                      {papers.length > 0 ? (totalCitations / papers.length).toFixed(1) : "0.0"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-3 font-light leading-normal">
                    Mean citation rate per index publication.
                  </p>
                  <div className="absolute right-4 top-4 p-2 bg-neutral-50 rounded-lg group-hover:bg-neutral-100 transition-colors">
                    <BarChart2 className="w-5 h-5 text-black" />
                  </div>
                </div>

                {/* Mean Field-Weighted Citation Impact card */}
                <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-black transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Mean FWCI Impact</span>
                    <h4 className="text-3xl font-mono font-bold text-black">{avgFWCI}x</h4>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-3 font-light leading-normal">
                    Compared to global specialty baseline (1.0x).
                  </p>
                  <div className="absolute right-4 top-4 p-2 bg-neutral-50 rounded-lg group-hover:bg-neutral-100 transition-colors">
                    <Percent className="w-5 h-5 text-black" />
                  </div>
                </div>
              </div>

              {/* Middle Section: Growth History & Explanation */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline graph */}
                <div className="lg:col-span-2 border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-black shrink-0" />
                      <span>Citation Velocity Timeline (Aggregate)</span>
                    </h4>
                    <span className="text-[9px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-500 uppercase font-bold">
                      Cumulative Trend
                    </span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      This graph represents the cumulative citation progress across all platform publications. Hover over the bars to view detailed metrics.
                    </p>

                    <div className="flex items-end justify-between h-48 pt-8 px-6 bg-neutral-50 rounded-xl border border-neutral-100/80 relative">
                      {/* Visual grid indicators */}
                      <div className="absolute inset-x-0 top-1/4 border-t border-neutral-200/20 pointer-events-none"></div>
                      <div className="absolute inset-x-0 top-2/4 border-t border-neutral-200/20 pointer-events-none"></div>
                      <div className="absolute inset-x-0 top-3/4 border-t border-neutral-200/20 pointer-events-none"></div>

                      {[2023, 2024, 2025, 2026].map((year) => {
                        const aggregateYearCount = papers.reduce((sum, paper) => {
                          const historyEntry = paper.citationHistory?.find(h => h.year === year);
                          return sum + (historyEntry ? historyEntry.count : 0);
                        }, 0);

                        const maxYearCitations = Math.max(...[2023, 2024, 2025, 2026].map(y => 
                          papers.reduce((sum, paper) => {
                            const historyEntry = paper.citationHistory?.find(h => h.year === y);
                            return sum + (historyEntry ? historyEntry.count : 0);
                          }, 0)
                        )) || 1;

                        const heightPercent = Math.max(15, Math.round((aggregateYearCount / maxYearCitations) * 100));

                        return (
                          <div key={year} className="flex flex-col items-center flex-1 group relative z-10">
                            {/* Hover info tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-[10px] font-mono font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                              {aggregateYearCount} Total Citations
                            </div>
                            
                            {/* Bar segment */}
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-12 sm:w-16 bg-neutral-800 hover:bg-black transition-all duration-300 rounded-t-lg shadow-sm flex items-end justify-center cursor-pointer pb-2"
                            >
                              <span className="text-[9px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                {aggregateYearCount}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500 mt-2 font-bold uppercase">{year}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm space-y-4">
                  <h4 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black shrink-0" />
                    <span>Scientific Metrics Registry</span>
                  </h4>

                  <div className="space-y-4 text-xs font-sans text-neutral-600 font-light leading-relaxed">
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                      <span className="font-mono text-[9px] text-neutral-400 uppercase font-bold block">Understanding h-Index</span>
                      <p className="text-[11px] text-neutral-700 leading-normal font-light">
                        The <strong>h-index</strong> measures both scientific productivity and citation impact. A platform h-index of <strong className="text-black font-semibold font-mono">{calculatedHIndex}</strong> indicates that this researcher has authored at least {calculatedHIndex} papers on the platform with {calculatedHIndex}+ citations each.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                      <span className="font-mono text-[9px] text-neutral-400 uppercase font-bold block">Field-Weighted Citation Impact</span>
                      <p className="text-[11px] text-neutral-700 leading-normal font-light">
                        <strong>FWCI</strong> compares citations received with global averages for similar publications in sports physiology and clinical medicine. A value of <strong className="text-black font-semibold font-mono">{avgFWCI}x</strong> demonstrates an impact {((avgFWCI - 1) * 100).toFixed(0)}% higher than world averages.
                      </p>
                    </div>

                    <div className="pt-2 flex items-start gap-2.5">
                      <div className="p-1.5 bg-black text-white rounded-lg">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-neutral-400 uppercase font-bold block">Affiliate Standing</span>
                        <p className="text-[11px] text-neutral-800 font-medium mt-0.5">
                          Top-ranked researcher in {selectedResearcher.specialty} on Healthedia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publications Leaderboard with h-Core highlights */}
              <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-black shrink-0" />
                    <span>Manuscript Citation Impact & h-Core Contributions ({papers.length})</span>
                  </h4>
                  <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">
                    Sorted by Citations
                  </span>
                </div>

                <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-3xl">
                  The registry below details all manuscripts authored by this researcher. Highlighted publications with the <strong>h-index Core</strong> indicator are the key drivers of this researcher's scientific index.
                </p>

                {/* Table Layout */}
                <div className="border border-neutral-100 rounded-xl overflow-hidden">
                  <div className="hidden md:grid grid-cols-12 bg-neutral-50 border-b border-neutral-100 p-4 text-[10px] font-mono text-neutral-400 uppercase font-bold">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-6">Manuscript / Journal</div>
                    <div className="col-span-1 text-center">Year</div>
                    <div className="col-span-1 text-center">Citations</div>
                    <div className="col-span-1 text-center">FWCI</div>
                    <div className="col-span-2 text-center">h-Core Contribution</div>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {papers.sort((a, b) => (b.citations || 0) - (a.citations || 0)).map((paper, idx) => {
                      const isInHCore = (paper.citations || 0) >= calculatedHIndex && idx < calculatedHIndex;

                      return (
                        <div
                          key={paper.id}
                          className={`grid grid-cols-1 md:grid-cols-12 items-center p-4 gap-3 md:gap-0 ${
                            isInHCore ? "bg-neutral-50/40" : "bg-white"
                          }`}
                        >
                          {/* Rank */}
                          <div className="col-span-1 flex items-center gap-2 md:block">
                            <span className="md:hidden text-[9px] font-mono text-neutral-400 uppercase font-bold">Rank:</span>
                            <span className="font-mono text-sm font-bold text-black bg-neutral-100 md:bg-transparent w-6 h-6 md:w-auto md:h-auto rounded-full flex items-center justify-center md:inline-flex">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Manuscript Detail */}
                          <div className="col-span-11 md:col-span-6 space-y-1 pr-4">
                            <h5 className="font-sans font-bold text-xs sm:text-sm text-black leading-snug">
                              {paper.title}
                            </h5>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-neutral-400 uppercase">
                              <span className="text-black font-semibold">{paper.journal}</span>
                              <span>•</span>
                              <span>DOI: {paper.doi}</span>
                              <span>•</span>
                              <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.2 rounded font-bold">{paper.researchType}</span>
                            </div>
                          </div>

                          {/* Year */}
                          <div className="col-span-1 md:text-center flex items-center gap-2 md:block">
                            <span className="md:hidden text-[9px] font-mono text-neutral-400 uppercase font-bold">Year:</span>
                            <span className="text-xs font-mono text-neutral-700">{paper.year}</span>
                          </div>

                          {/* Citations */}
                          <div className="col-span-1 md:text-center flex items-center gap-2 md:block">
                            <span className="md:hidden text-[9px] font-mono text-neutral-400 uppercase font-bold">Citations:</span>
                            <span className="text-xs font-mono font-bold text-black bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-md">
                              {paper.citations}
                            </span>
                          </div>

                          {/* FWCI */}
                          <div className="col-span-1 md:text-center flex items-center gap-2 md:block">
                            <span className="md:hidden text-[9px] font-mono text-neutral-400 uppercase font-bold">FWCI:</span>
                            <span className="text-xs font-mono font-bold text-neutral-700">
                              {paper.fieldWeightedImpact}x
                            </span>
                          </div>

                          {/* h-Core Status badge */}
                          <div className="col-span-2 md:text-center flex items-center gap-2 md:block">
                            <span className="md:hidden text-[9px] font-mono text-neutral-400 uppercase font-bold">h-Core:</span>
                            {isInHCore ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-extrabold bg-black text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                <CheckCircle className="w-3 h-3 text-white" />
                                h-index Core
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-400 italic">
                                Sub-threshold
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  const handleAdminSave = () => {
    if (!selectedResearcher) return;

    const storedEditsStr = localStorage.getItem("healthedia_researcher_edits") || "{}";
    let edits: Record<string, any> = {};
    try {
      edits = JSON.parse(storedEditsStr);
    } catch (e) {}

    const updatedData = {
      name: editName,
      specialty: editSpecialty,
      institution: editInstitution,
      degree: editDegree,
      country: editCountry,
      orcid: editOrcid,
      bio: editBio,
      email: editEmail
    };

    edits[selectedResearcher.id] = updatedData;
    localStorage.setItem("healthedia_researcher_edits", JSON.stringify(edits));

    setSelectedResearcher({
      ...selectedResearcher,
      ...updatedData
    });

    setIsAdminEditing(false);
    showToast("Researcher profile updated successfully by System Administrator!", "success");

    // Force refresh search results
    setQuery(prev => prev + " ");
    setTimeout(() => setQuery(prev => prev.trim()), 50);
  };

  // Directory List Search Page
  return (
    <div className="flex-grow bg-white py-10 animate-fadeIn font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast Notification Container */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-fadeIn select-none">
            <div className="bg-black border border-neutral-800 text-white p-3.5 rounded-xl shadow-2xl flex items-center space-x-3 max-w-md">
              <CheckCircle className="w-4 h-4 shrink-0 text-white" />
              <p className="text-xs font-sans font-medium leading-normal">{toastMessage.text}</p>
            </div>
          </div>
        )}

        {/* Header Block */}
        <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-black text-black tracking-tight uppercase">
              Global Directory of Researchers
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
              An authoritative indexed archive of verified clinical specialists, biomechanical researchers, and academic authors.
            </p>
          </div>

          {/* Become a Researcher Workflow Trigger Button */}
          {currentUser && currentUser.role === "Member" && (
            <button
              onClick={() => {
                setShowApplicationModal(true);
                setAppStep(1);
              }}
              className="bg-black text-white text-xs font-mono font-bold uppercase px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer self-start shrink-0 shadow-sm"
            >
              <Award className="w-4 h-4" /> Become a Researcher
            </button>
          )}

          {currentUser && currentUser.researcherApplicationStatus === "Pending" && (
            <div className="bg-neutral-100 text-neutral-500 text-[10px] font-mono font-bold uppercase px-4 py-2.5 rounded-xl border border-neutral-200 flex items-center gap-1.5 self-start shrink-0 select-none">
              <AlertCircle className="w-4 h-4 text-neutral-400" /> Application Pending
            </div>
          )}
        </div>

        {/* Interactive Filters Panel (Consistent with Institutions search experience) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Search input */}
          <div className="flex border border-neutral-200 focus-within:border-black transition-colors rounded-xl overflow-hidden bg-white sm:col-span-1">
            <div className="flex items-center pl-3 text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              data-search-input="true"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, country or specialty..."
              className="w-full py-2.5 pl-2 pr-2 text-xs text-black focus:outline-none bg-white"
            />
            <div className="hidden sm:flex items-center mr-2 shrink-0 select-none">
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded">
                /
              </kbd>
            </div>
          </div>

          {/* Specialty selector */}
          <div className="flex border border-neutral-200 focus-within:border-black transition-colors rounded-xl bg-white px-3 py-1">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-white text-xs text-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Specialties</option>
              {specialties.filter(s => s !== "All").map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Country selector */}
          <div className="flex border border-neutral-200 focus-within:border-black transition-colors rounded-xl bg-white px-3 py-1">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-white text-xs text-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Countries</option>
              {countries.filter(c => c !== "All").map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Verification Checkbox & Results Info */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500 mb-6 px-1">
          <div className="flex items-center space-x-4">
            <span>Found <span className="font-bold text-black">{filteredResearchers.length}</span> verified academic specialists</span>
            <div className="flex items-center space-x-1.5 border-l border-neutral-200 pl-4">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-neutral-350 text-black focus:ring-black cursor-pointer"
              />
              <label htmlFor="verifiedOnly" className="cursor-pointer select-none font-medium">
                Verified Only
              </label>
            </div>
          </div>
          {(query || selectedSpecialty !== "All" || selectedCountry !== "All" || verifiedOnly) && (
            <button
              onClick={() => {
                setQuery("");
                setSelectedSpecialty("All");
                setSelectedCountry("All");
                setVerifiedOnly(false);
              }}
              className="text-black font-bold uppercase hover:underline cursor-pointer"
            >
              [Clear all filters]
            </button>
          )}
        </div>

        {/* Researcher Cards Directory Grid (Premium academic styling) */}
        {filteredResearchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResearchers.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  setSelectedResearcher(res);
                  setProfileTab("portfolio");
                }}
                className="border border-neutral-200/70 p-6 bg-white hover:border-black rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between group space-y-4 hover:shadow-sm animate-fadeIn"
              >
                <div className="space-y-4">
                  {/* Researcher Photo & Title Block */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={res.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                      alt={res.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover border border-neutral-100 shrink-0 bg-neutral-50 rounded-xl group-hover:scale-[1.02] transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-black text-sm group-hover:text-black leading-snug truncate">
                          {res.title} {res.name}
                        </h3>
                        {res.verified && (
                          <span className="inline-flex shrink-0 text-sky-600 bg-sky-50 p-0.5 rounded-full" title="Verified Researcher">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono uppercase text-neutral-400 mt-0.5">
                        {res.degree}
                      </p>
                      <p className="text-xs text-neutral-600 font-medium truncate mt-0.5">
                        {res.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Institution and Country Details */}
                  <div className="space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-[11px] text-neutral-500 font-sans">
                    <p className="truncate">
                      <span className="font-mono text-[9px] text-neutral-400 uppercase mr-2 font-bold">Institution:</span>
                      <span className="text-neutral-700 font-medium">{res.institution}</span>
                    </p>
                    <p className="truncate">
                      <span className="font-mono text-[9px] text-neutral-400 uppercase mr-2 font-bold">Country:</span>
                      <span className="text-neutral-700 font-medium">{res.country}</span>
                    </p>
                  </div>

                  {/* Short Biography Snippet */}
                  <p className="text-xs text-neutral-500 font-light line-clamp-3 leading-relaxed">
                    {res.bio || `${res.title} ${res.name} is an active verified researcher on Healthedia specializing in ${res.specialty}.`}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                    {getEnrichedResearcherPapers(res.name).length} Publications
                  </span>
                  <span className="text-black group-hover:translate-x-1 transition-transform font-bold inline-flex items-center uppercase text-[9px]">
                    View Profile <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-neutral-200 p-12 text-center bg-neutral-50/40 rounded-2xl">
            <p className="text-xs font-mono text-neutral-400 uppercase mb-2">No Profiles Matched</p>
            <h3 className="text-base font-sans font-semibold text-black">
              No registered researchers fit your parameters
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed font-light">
              Try adjusting the query parameters or selecting other filter values to discover related clinical and sports physiology specialists.
            </p>
          </div>
        )}

      </div>

      {/* Become a Researcher Workflow Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-black" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black">
                  Investigator Credentials & Verification Portal
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setAppStep(1);
                }}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-4 bg-neutral-50/30 border-b border-neutral-100 flex items-center justify-between text-xs font-mono select-none">
              <span className={`pb-1 border-b-2 font-bold ${appStep === 1 ? "border-black text-black" : "border-transparent text-neutral-400"}`}>
                1. Terms & Editorial Integrity
              </span>
              <span className={`pb-1 border-b-2 font-bold ${appStep === 2 ? "border-black text-black" : "border-transparent text-neutral-400"}`}>
                2. Academic & Identity Credentials
              </span>
              <span className={`pb-1 border-b-2 font-bold ${appStep === 3 ? "border-black text-black" : "border-transparent text-neutral-400"}`}>
                3. Attestation & Audit Submission
              </span>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-grow">
              {appStep === 1 && (
                <div className="space-y-4">
                  <div className="prose prose-neutral max-w-none text-xs leading-relaxed text-neutral-600 space-y-3">
                    <p className="font-bold text-black text-sm">
                      Terms of Research Integrity & Editorial Policy
                    </p>
                    <p>
                      As an authorized Researcher on the Healthedia Global Health Archive, you will have exclusive privileges to publish peer-reviewed papers, submit reviews, and manage certified clinical and sports science entries.
                    </p>
                    <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200/60 font-mono text-[10px] text-neutral-500 leading-normal space-y-3 max-h-56 overflow-y-auto">
                      <div>
                        <p className="font-bold text-black uppercase">1. Research Integrity & Fabrications</p>
                        <p className="mt-1">All submitted datasets, calculations, or experimental results must be authenticated. Falsification, plagiarism, or unauthorized duplicate publishing is strictly prohibited and results in immediate profile revocation and reporting to home institutions.</p>
                      </div>
                      
                      <div>
                        <p className="font-bold text-black uppercase">2. Conflict of Interest</p>
                        <p className="mt-1">Researchers must fully disclose any financial, personal, or corporate sponsorships associated with published medical or rehabilitation techniques. Failure to declare is a serious policy breach.</p>
                      </div>
                      
                      <div>
                        <p className="font-bold text-black uppercase">3. Peer Review Ethics</p>
                        <p className="mt-1">You agree to perform objective, constructive, and evidence-driven assessments of assigned manuscripts without bias or personal gain.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 pt-4 border-t border-neutral-100">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer mt-0.5 accent-black"
                    />
                    <label htmlFor="acceptTerms" className="text-xs text-neutral-600 cursor-pointer select-none leading-normal">
                      I have read, understood, and unconditionally accept the Terms & Conditions and Research Policies of the Global Health Archive.
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      disabled={!termsAccepted}
                      onClick={() => setAppStep(2)}
                      className="bg-black text-white text-xs font-mono font-bold uppercase px-6 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-45 disabled:hover:bg-black cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {appStep === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (appBio.length < 100) return;
                    setAppStep(3);
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column: Form Fields */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono uppercase font-bold text-black border-b border-neutral-100 pb-1">Academic Profile Details</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Title */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Professional Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dr., Prof."
                            value={appTitle}
                            onChange={(e) => setAppTitle(e.target.value)}
                            className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                          />
                        </div>

                        {/* Academic Degree */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Academic Degree</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ph.D., M.D."
                            value={appDegree}
                            onChange={(e) => setAppDegree(e.target.value)}
                            className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Specialty */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Specialty</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Cardiology, Biomechanics"
                            value={appSpecialty}
                            onChange={(e) => setAppSpecialty(e.target.value)}
                            className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                          />
                        </div>

                        {/* ORCID ID */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">ORCID ID (Mandatory)</label>
                          <input
                            type="text"
                            required
                            pattern="\d{4}-\d{4}-\d{4}-\d{3}[\dX]"
                            placeholder="0000-0002-1825-0097"
                            value={appOrcid}
                            onChange={(e) => setAppOrcid(e.target.value)}
                            className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Institution */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Institution / Academy</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mansoura University"
                            value={appInstitution}
                            onChange={(e) => setAppInstitution(e.target.value)}
                            className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                          />
                        </div>

                        {/* Country */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Country</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Egypt"
                            value={appCountry}
                            onChange={(e) => setAppCountry(e.target.value)}
                            className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Identity Verification Uploads & Biography */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono uppercase font-bold text-black border-b border-neutral-100 pb-1">Credential Auditing & Bio</h3>

                      {/* Document Verification Section */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Passport Upload */}
                        <div className="space-y-1.5">
                          <span className="block text-[10px] font-mono uppercase font-bold text-neutral-500">Civil ID / Passport</span>
                          <label className="relative flex flex-col items-center justify-center border border-dashed border-neutral-200 hover:border-black p-3 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 transition-all cursor-pointer h-24 text-center">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleAppPassportUpload}
                              className="hidden"
                            />
                            {isAppPassportUploading ? (
                              <div className="flex flex-col items-center space-y-1">
                                <span className="animate-spin text-neutral-400 text-xs">...</span>
                                <span className="text-[8px] font-mono text-neutral-400">Uploading</span>
                              </div>
                            ) : appPassportFile ? (
                              <div className="flex flex-col items-center space-y-1">
                                <span className="text-emerald-500 font-bold text-xs">✓</span>
                                <span className="text-[8px] text-neutral-600 font-mono font-medium truncate max-w-[120px]">{appPassportFile}</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-xs text-neutral-600 block">Click to Upload</span>
                                <span className="text-[8px] text-neutral-400 block">PDF or Image</span>
                              </div>
                            )}
                          </label>
                        </div>

                        {/* Diploma Upload */}
                        <div className="space-y-1.5">
                          <span className="block text-[10px] font-mono uppercase font-bold text-neutral-500">Academic Qualification</span>
                          <label className="relative flex flex-col items-center justify-center border border-dashed border-neutral-200 hover:border-black p-3 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 transition-all cursor-pointer h-24 text-center">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleAppQualificationUpload}
                              className="hidden"
                            />
                            {isAppQualUploading ? (
                              <div className="flex flex-col items-center space-y-1">
                                <span className="animate-spin text-neutral-400 text-xs">...</span>
                                <span className="text-[8px] font-mono text-neutral-400">Uploading</span>
                              </div>
                            ) : appQualificationFile ? (
                              <div className="flex flex-col items-center space-y-1">
                                <span className="text-emerald-500 font-bold text-xs">✓</span>
                                <span className="text-[8px] text-neutral-600 font-mono font-medium truncate max-w-[120px]">{appQualificationFile}</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="text-xs text-neutral-600 block">Click to Upload</span>
                                <span className="text-[8px] text-neutral-400 block">Degree / Certification</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Professional Biography</label>
                          <span className={`text-[9px] font-mono ${appBio.length >= 100 ? "text-emerald-600 font-bold" : "text-neutral-400"}`}>
                            {appBio.length} / 1000 characters
                          </span>
                        </div>
                        <textarea
                          required
                          maxLength={1000}
                          rows={3}
                          value={appBio}
                          onChange={(e) => setAppBio(e.target.value)}
                          placeholder="Ahmed Mabrouk is an expert in Sports Health Sciences specializing in knee and muscular rehabilitation..."
                          className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black resize-none"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setAppStep(1)}
                      className="text-neutral-500 hover:text-black text-xs font-mono font-bold uppercase py-2.5 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={appBio.length < 100}
                      className="bg-black text-white text-xs font-mono font-bold uppercase px-6 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-45 cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}

              {appStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-200/60 space-y-4 text-xs">
                    <h4 className="font-mono text-[10px] uppercase font-bold text-black border-b border-neutral-100 pb-1.5">
                      Confirm Academic Profile Data
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Full Name:</span> <span className="font-semibold text-black">{currentUser?.name}</span></p>
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Email Address:</span> <span className="text-black font-mono">{currentUser?.email}</span></p>
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Academic Title:</span> <span className="font-semibold text-black">{appTitle}</span></p>
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Academic Degree:</span> <span className="text-black">{appDegree}</span></p>
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Specialization:</span> <span className="text-black">{appSpecialty}</span></p>
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">ORCID iD:</span> <span className="font-mono text-black">{appOrcid}</span></p>
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Institution:</span> <span className="text-black">{appInstitution}</span></p>
                      <p><span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Country:</span> <span className="text-black">{appCountry}</span></p>
                    </div>

                    <div className="border-t border-neutral-200/60 pt-3 grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <p>
                        <span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Civil ID / Passport:</span> 
                        <span className={`font-mono text-[11px] ${appPassportFile ? "text-emerald-600 font-bold" : "text-neutral-400 font-light"}`}>
                          {appPassportFile ? `✓ ${appPassportFile}` : "Not uploaded (Self-Attested)"}
                        </span>
                      </p>
                      <p>
                        <span className="text-neutral-400 font-mono text-[10px] uppercase mr-2 font-bold">Academic Qualification:</span> 
                        <span className={`font-mono text-[11px] ${appQualificationFile ? "text-emerald-600 font-bold" : "text-neutral-400 font-light"}`}>
                          {appQualificationFile ? `✓ ${appQualificationFile}` : "Not uploaded (Self-Attested)"}
                        </span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-200/60">
                      <span className="text-neutral-400 font-mono text-[10px] uppercase block mb-1 font-bold">Biography:</span>
                      <p className="text-neutral-600 bg-white p-3 rounded-lg border border-neutral-150 leading-relaxed font-light">{appBio}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-normal text-center max-w-md mx-auto font-light">
                    Upon submission, your qualifications will be routed to Healthedia's Board of Reviewers for validation. You will be notified of their decision.
                  </p>

                  <div className="pt-4 border-t border-neutral-100 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setAppStep(2)}
                      className="text-neutral-500 hover:text-black text-xs font-mono font-bold uppercase py-2.5 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBecomeResearcherSubmit}
                      className="bg-black text-white text-xs font-mono font-bold uppercase px-6 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Editing Modal */}
      {isAdminEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scaleUp">
            <div className="p-6 border-b border-neutral-150 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h3 className="text-sm font-sans font-black uppercase tracking-wider text-black">
                  🛡️ Admin Control: Edit Public Profile
                </h3>
                <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                  Direct administrative modifications to verified researcher indexed registry.
                </p>
              </div>
              <button
                onClick={() => setIsAdminEditing(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-neutral-400 hover:text-black" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-xl focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Contact Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-xl focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Specialty</label>
                  <input
                    type="text"
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-xl focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Affiliated Institution</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-xl focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Academic Degree</label>
                  <input
                    type="text"
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-xl focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Country of Origin</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-xl focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">ORCID ID Link</label>
                  <input
                    type="text"
                    value={editOrcid}
                    onChange={(e) => setEditOrcid(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs font-mono rounded-xl focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Researcher Biography</label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-xl focus:outline-none focus:border-black leading-relaxed font-light"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
              <button
                onClick={() => setIsAdminEditing(false)}
                className="text-neutral-500 hover:text-black text-xs font-mono font-bold uppercase px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminSave}
                className="bg-black text-white text-xs font-mono font-bold uppercase px-6 py-2.5 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer shadow-sm"
              >
                Save Edits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
