import React, { useState } from "react";
import {
  User, ShieldCheck, Mail, FileText, Globe, GraduationCap, Building, Award, Settings, Key, Lock, Eye, CheckCircle, Upload, Plus, Trash, AlertCircle, X, Share2, Copy, ExternalLink, FileCode, Send, HelpCircle, RefreshCw,
  TrendingUp, BarChart2, Percent, Sparkles, Scale
} from "lucide-react";
import { UserProfileData, Manuscript, UserRole } from "../types";
import { getStoredItem, setStoredItem, DEFAULT_PROFESSIONS, INITIAL_MANUSCRIPTS, initializeTaxonomyStore } from "../lib/taxonomyStore";
import PublicationCertificate from "./PublicationCertificate";

interface UserProfileViewProps {
  currentUser: UserProfileData;
  onUpdateUser: (updatedData: UserProfileData) => void;
  initialTab?: "profile" | "settings" | "manuscripts" | "certificates" | "requests";
}

export default function UserProfileView({ currentUser, onUpdateUser, initialTab }: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "manuscripts" | "certificates" | "requests">(initialTab || "profile");

  React.useEffect(() => {
    const forceTab = localStorage.getItem("healthedia_profile_active_tab") as "profile" | "settings" | "manuscripts" | "certificates" | "requests" | null;
    if (forceTab) {
      setActiveTab(forceTab);
      localStorage.removeItem("healthedia_profile_active_tab");
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Custom premium notification toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/researcher/${currentUser.username || currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const shareData = {
      title: `${currentUser.name} - Healthedia Profile`,
      text: `Check out ${currentUser.name}'s professional health research and performance profile on Healthedia.`,
      url: profileUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast("Profile shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(profileUrl);
          showToast("Profile URL copied to clipboard!", "success");
        }
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      showToast("Profile URL copied to clipboard!", "success");
    }
  };

  // State to hold dynamic professions, journal categories, and research types
  const [professionsList, setProfessionsList] = useState<string[]>([]);
  const [journalCategories, setJournalCategories] = useState<string[]>([]);
  const [researchTypes, setResearchTypes] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load custom taxonomy on mount
  React.useEffect(() => {
    initializeTaxonomyStore();
    const storedProfs = getStoredItem<string[]>("healthedia_professions", DEFAULT_PROFESSIONS);
    setProfessionsList(storedProfs);
    
    // Fallbacks if taxonomies aren't fully configured
    const storedJournals = getStoredItem<any[]>("healthedia_taxonomy_journal_categories", []);
    const journalNames = storedJournals.length > 0 
      ? storedJournals.filter(x => x.enabled).map(x => x.name) 
      : ["Cardiology", "Neurology", "Sports Medicine", "Human Performance", "Orthopedic Rehabilitation"];
    setJournalCategories(journalNames);

    const storedTypes = getStoredItem<any[]>("healthedia_taxonomy_research_types", []);
    const typeNames = storedTypes.length > 0 
      ? storedTypes.filter(x => x.enabled).map(x => x.name) 
      : ["Randomized Controlled Trial", "Systematic Review", "Meta-Analysis", "Cohort Study", "Case Report"];
    setResearchTypes(typeNames);
  }, []);

  // Profile Edit fields State
  const [firstName, setFirstName] = useState(currentUser.firstName || currentUser.name.split(" ")[0] || "");
  const [lastName, setLastName] = useState(currentUser.lastName || currentUser.name.split(" ").slice(1).join(" ") || "");
  const [gender, setGender] = useState(currentUser.gender || "");
  const [nationality, setNationality] = useState(currentUser.nationality || "");
  const [countryOfResidence, setCountryOfResidence] = useState(currentUser.countryOfResidence || currentUser.country || "");
  const [primaryPhone, setPrimaryPhone] = useState(currentUser.primaryPhone || "");
  const [secondaryPhone, setSecondaryPhone] = useState(currentUser.secondaryPhone || "");
  const [emailState, setEmailState] = useState(currentUser.email || "");

  // Academic states
  const [academicTitle, setAcademicTitle] = useState(currentUser.academicTitle || currentUser.title || "");
  const [academicSpecialization, setAcademicSpecialization] = useState(currentUser.academicSpecialization || currentUser.specialty || "");
  const [professionalSpecialization, setProfessionalSpecialization] = useState(currentUser.professionalSpecialization || currentUser.profession || "");
  const [institutionalAffiliation, setInstitutionalAffiliation] = useState(currentUser.institutionalAffiliation || currentUser.institution || "");
  const [highestAcademicDegree, setHighestAcademicDegree] = useState(currentUser.highestAcademicDegree || currentUser.degree || "");
  const [yearOfGraduation, setYearOfGraduation] = useState(currentUser.yearOfGraduation || "");

  // Multi-degree sorting states
  const [degreesList, setDegreesList] = useState<{ degree: string; year: number }[]>(() => {
    if (currentUser.degreesList && currentUser.degreesList.length > 0) return currentUser.degreesList;
    const initialDeg = currentUser.highestAcademicDegree || currentUser.degree || "PhD in Physiology";
    const initialYr = Number(currentUser.yearOfGraduation) || 2021;
    return [{ degree: initialDeg, year: initialYr }];
  });
  const [newDegreeName, setNewDegreeName] = useState("");
  const [newDegreeYear, setNewDegreeYear] = useState("");

  // Professional states
  const [biographyEn, setBiographyEn] = useState(currentUser.biographyEn || currentUser.bio || "");
  const [biographyAr, setBiographyAr] = useState(currentUser.biographyAr || "");
  const [biographyFr, setBiographyFr] = useState(currentUser.biographyFr || "");
  const [biographyDe, setBiographyDe] = useState(currentUser.biographyDe || "");
  const [bioLang, setBioLang] = useState<"en" | "ar" | "fr" | "de">("en");
  const [spokenLanguage, setSpokenLanguage] = useState(currentUser.spokenLanguage || "English");
  const [secondLanguage, setSecondLanguage] = useState(currentUser.secondLanguage || "");

  // Awards list chronologically
  const [awardsList, setAwardsList] = useState<{ title: string; year: number }[]>(() => {
    if (currentUser.awardsList && currentUser.awardsList.length > 0) return currentUser.awardsList;
    if (currentUser.awards && currentUser.awards.length > 0) {
      return currentUser.awards.map(a => ({ title: a, year: 2025 }));
    }
    return [
      { title: "Healthedia Outstanding Muscle Physiology Award", year: 2025 },
      { title: "National Sports Science Leadership Prize", year: 2023 }
    ];
  });
  const [newAwardName, setNewAwardName] = useState("");
  const [newAwardYear, setNewAwardYear] = useState("");

  // Account Settings states
  const [usernameState, setUsernameState] = useState(currentUser.username || currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, "-"));
  const [privacyShowPhone, setPrivacyShowPhone] = useState(currentUser.privacyShowPhone ?? true);
  const [privacyShowEmail, setPrivacyShowEmail] = useState(currentUser.privacyShowEmail ?? true);
  const [privacyShowBio, setPrivacyShowBio] = useState(currentUser.privacyShowBio ?? true);
  const [privacyShowAwards, setPrivacyShowAwards] = useState(currentUser.privacyShowAwards ?? true);
  const [privacyShowInDirectory, setPrivacyShowInDirectory] = useState(currentUser.privacyShowInDirectory ?? true);

  // Legacy field variables mapped for backward compatibility / existing manuscript forms
  const name = `${firstName} ${lastName}`.trim();
  const title = academicTitle;
  const specialty = academicSpecialization;
  const institution = institutionalAffiliation;
  const country = countryOfResidence;
  const degree = highestAcademicDegree;
  const bio = biographyEn;
  const [orcid, setOrcid] = useState(currentUser.orcid || "");

  // Verification states
  const [passportFileName, setPassportFileName] = useState(currentUser.passportFileName || "");
  const [qualificationFileName, setQualificationFileName] = useState(currentUser.qualificationFileName || "");
  const [isPassportUploading, setIsPassportUploading] = useState(false);
  const [isQualUploading, setIsQualUploading] = useState(false);

  // Tag fields State
  const [qualifications, setQualifications] = useState<string[]>(currentUser.qualifications);
  const [newQual, setNewQual] = useState("");
  
  const [researchInterests, setResearchInterests] = useState<string[]>(currentUser.researchInterests);
  const [newInterest, setNewInterest] = useState("");

  const [publications, setPublications] = useState<string[]>(currentUser.publications);
  const [newPub, setNewPub] = useState("");

  const [awards, setAwards] = useState<string[]>(currentUser.awards);
  const [newAward, setNewAward] = useState("");

  const [certifications, setCertifications] = useState<string[]>(currentUser.certifications);
  const [newCert, setNewCert] = useState("");

  // External Portal links
  const [googleScholar, setGoogleScholar] = useState(currentUser.googleScholar || "");
  const [researchGate, setResearchGate] = useState(currentUser.researchGate || "");
  const [scopus, setScopus] = useState(currentUser.scopus || "");
  const [avatar, setAvatar] = useState(currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verification request fields
  const [verificationMethod, setVerificationMethod] = useState("orcid");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Manuscript Form State Variables
  const [msTitle, setMsTitle] = useState("");
  const [msAbstract, setMsAbstract] = useState("");
  const [msSpecialty, setMsSpecialty] = useState(currentUser.specialty || "");
  const [msJournalCategory, setMsJournalCategory] = useState("");
  const [msResearchType, setMsResearchType] = useState("");
  const [msInstitution, setMsInstitution] = useState(currentUser.institution || "");
  const [msCountry, setMsCountry] = useState(currentUser.country || "");
  const [msCoAuthors, setMsCoAuthors] = useState("");
  const [msKeywords, setMsKeywords] = useState("");

  // Dual Submission / Revision / Certificate state variables
  const [msSubmissionType, setMsSubmissionType] = useState<"Journal" | "Published">("Journal");
  const [originalJournalName, setOriginalJournalName] = useState("");
  const [originalPublicationYear, setOriginalPublicationYear] = useState("");
  const [msDoi, setMsDoi] = useState("");
  const [editingManuscriptId, setEditingManuscriptId] = useState<string | null>(null);
  const [selectedPaperForCert, setSelectedPaperForCert] = useState<any | null>(null);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState<any | null>(null);

  // Interactive submission checklist states
  const [ethicalChecked, setEthicalChecked] = useState(false);
  const [conflictChecked, setConflictChecked] = useState(false);
  const [fundingChecked, setFundingChecked] = useState(false);

  const [ethicalDetails, setEthicalDetails] = useState("");
  const [conflictDetails, setConflictDetails] = useState("");
  const [fundingDetails, setFundingDetails] = useState("");

  // Submitted Manuscripts list state
  const [myManuscripts, setMyManuscripts] = useState<Manuscript[]>([]);

  React.useEffect(() => {
    if (activeTab === "manuscripts") {
      const allMs = getStoredItem<Manuscript[]>("healthedia_manuscripts", INITIAL_MANUSCRIPTS);
      const filtered = allMs.filter(m => m.authorEmail.toLowerCase() === currentUser.email.toLowerCase());
      setMyManuscripts(filtered);
    }
  }, [activeTab, currentUser.email]);

  // Set default form choices when taxonomies load
  React.useEffect(() => {
    if (journalCategories.length > 0 && !msJournalCategory) {
      setMsJournalCategory(journalCategories[0]);
    }
    if (researchTypes.length > 0 && !msResearchType) {
      setMsResearchType(researchTypes[0]);
    }
    if (professionsList.length > 0 && !msSpecialty) {
      setMsSpecialty(professionsList[0]);
    }
  }, [journalCategories, researchTypes, professionsList]);

  // Derive citation impact metrics for logged-in user
  const userManuscripts = getStoredItem<Manuscript[]>("healthedia_manuscripts", INITIAL_MANUSCRIPTS)
    .filter(m => m.authorEmail.toLowerCase() === currentUser.email.toLowerCase());

  // Enriched papers with simulated citations
  const enrichedUserPapers = userManuscripts.map((m, idx) => {
    let citations = 0;
    if (m.id === "paper-001") citations = 142;
    else if (m.id === "paper-003") citations = 89;
    else if (m.id === "paper-006") citations = 215;
    else {
      const titleSum = m.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      citations = (titleSum % 120) + 10;
    }
    
    // Citation timeline history
    const citationHistory = [
      { year: 2023, count: Math.floor(citations * 0.15) },
      { year: 2024, count: Math.floor(citations * 0.4) },
      { year: 2025, count: Math.floor(citations * 0.75) },
      { year: 2026, count: citations }
    ];

    return {
      ...m,
      citations,
      citationHistory,
      fieldWeightedImpact: parseFloat((1.1 + (idx % 3) * 0.45).toFixed(2))
    };
  });

  const totalCitations = enrichedUserPapers.reduce((sum, p) => sum + p.citations, 0);

  // Calculate h-index dynamically
  const sortedCitations = enrichedUserPapers.map(p => p.citations).sort((a, b) => b - a);
  let calculatedHIndex = 0;
  while (calculatedHIndex < sortedCitations.length && sortedCitations[calculatedHIndex] >= calculatedHIndex + 1) {
    calculatedHIndex++;
  }

  const avgFWCI = enrichedUserPapers.length > 0
    ? parseFloat((enrichedUserPapers.reduce((sum, p) => sum + p.fieldWeightedImpact, 0) / enrichedUserPapers.length).toFixed(2))
    : 1.0;

  // Privacy options
  const [isPublic, setIsPublic] = useState(true);
  const [shareEmail, setShareEmail] = useState(false);

  // Simulated CV uploading
  const [cvFile, setCvFile] = useState<string | null>(currentUser.cvName || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      gender,
      nationality,
      countryOfResidence,
      primaryPhone,
      secondaryPhone,
      email: emailState,
      title: academicTitle,
      specialty: academicSpecialization,
      profession: professionalSpecialization,
      institution: institutionalAffiliation,
      country: countryOfResidence,
      degree: highestAcademicDegree,
      orcid,
      bio: biographyEn,
      biographyEn,
      biographyAr,
      biographyFr,
      biographyDe,
      spokenLanguage,
      secondLanguage,
      degreesList,
      awardsList,
      researchInterests,
      qualifications,
      publications,
      googleScholar,
      researchGate,
      scopus,
      avatar,
      cvName: cvFile || undefined,
    });
    showToast("Profile Refinement: Your personal, academic, and professional details have been successfully synchronized!", "success");
  };

  const handleAccountSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      username: usernameState,
      email: emailState,
      privacyShowPhone,
      privacyShowEmail,
      privacyShowBio,
      privacyShowAwards,
      privacyShowInDirectory,
    });
    showToast("Account Settings: Account credentials and privacy toggles synchronized!", "success");
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please populate all password parameters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not align.", "error");
      return;
    }
    showToast("Healthedia Security: Password successfully updated in local store.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      showToast("Please acknowledge and accept the Academic Integrity Agreement.", "error");
      return;
    }
    const mockId = currentUser.researcherId || `HRI-${Math.floor(100000 + Math.random() * 900000)}`;
    onUpdateUser({
      ...currentUser,
      verificationSubmitted: true,
      verificationMethod: verificationMethod,
      researcherId: mockId
    });
    showToast(`Healthedia Board: Verification submission via ${verificationMethod.toUpperCase()} has been received. Our compliance officers will audit these details.`, "success");
    setIsVerificationDialogOpen(false);
  };

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsPassportUploading(true);
      setTimeout(() => {
        setPassportFileName(file.name);
        setIsPassportUploading(false);
        onUpdateUser({
          ...currentUser,
          passportFileName: file.name
        });
        showToast(`Passport ID document "${file.name}" uploaded successfully.`, "success");
      }, 1200);
    }
  };

  const handleQualificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsQualUploading(true);
      setTimeout(() => {
        setQualificationFileName(file.name);
        setIsQualUploading(false);
        onUpdateUser({
          ...currentUser,
          qualificationFileName: file.name
        });
        showToast(`Academic qualification document "${file.name}" uploaded successfully.`, "success");
      }, 1200);
    }
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setTimeout(() => {
        setCvFile(file.name);
        setIsUploading(false);
        onUpdateUser({
          ...currentUser,
          cvName: file.name
        });
        showToast(`Curriculum Vitae "${file.name}" uploaded successfully.`, "success");
      }, 1000);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // List modifiers
  const addItem = (item: string, setter: React.Dispatch<React.SetStateAction<string[]>>, fieldSetter: (v: string) => void, list: string[]) => {
    if (item.trim()) {
      setter([...list, item.trim()]);
      fieldSetter("");
    }
  };

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => {
    setter(list.filter((_, idx) => idx !== index));
  };

  const handleSubmitManuscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle || !msAbstract) {
      showToast("Please provide at least a title and abstract.", "error");
      return;
    }

    if (!ethicalChecked || !conflictChecked || !fundingChecked) {
      showToast("Compliance Checklist: You must verify ethical approval, conflict of interest, and funding disclosures before submitting.", "error");
      return;
    }

    const initialStatus = msSubmissionType === "Published" ? "Pending Verification" : "Under Review";
    const allMs = getStoredItem<Manuscript[]>("healthedia_manuscripts", INITIAL_MANUSCRIPTS);

    if (editingManuscriptId) {
      // Re-submission / Revision flow
      const updatedMsList = allMs.map(ms => {
        if (ms.id === editingManuscriptId) {
          return {
            ...ms,
            title: msTitle,
            abstract: msAbstract,
            authors: [currentUser.name, ...msCoAuthors.split(",").map(s => s.trim()).filter(Boolean)],
            journalCategory: msJournalCategory || "General Health",
            researchType: msResearchType || "Observation Study",
            specialty: msSpecialty || currentUser.specialty || "Sports Science",
            institution: msInstitution || currentUser.institution || "Unassigned Academy",
            country: msCountry || currentUser.country || "Global",
            keywords: msKeywords.split(",").map(k => k.trim()).filter(Boolean),
            status: initialStatus,
            submissionType: msSubmissionType,
            originalJournalName: msSubmissionType === "Published" ? originalJournalName : undefined,
            originalPublicationYear: msSubmissionType === "Published" ? originalPublicationYear : undefined,
            doi: msSubmissionType === "Published" ? msDoi : undefined,
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
      setEditingManuscriptId(null);
    } else {
      // New submission flow
      const newMs: Manuscript = {
        id: `ms-${Date.now()}`,
        title: msTitle,
        abstract: msAbstract,
        authors: [currentUser.name, ...msCoAuthors.split(",").map(s => s.trim()).filter(Boolean)],
        authorEmail: currentUser.email,
        journalCategory: msJournalCategory || "General Health",
        researchType: msResearchType || "Observation Study",
        specialty: msSpecialty || currentUser.specialty || "Sports Science",
        institution: msInstitution || currentUser.institution || "Unassigned Academy",
        country: msCountry || currentUser.country || "Global",
        keywords: msKeywords.split(",").map(k => k.trim()).filter(Boolean),
        submittedAt: new Date().toISOString().split("T")[0],
        status: initialStatus,
        submissionType: msSubmissionType,
        originalJournalName: msSubmissionType === "Published" ? originalJournalName : undefined,
        originalPublicationYear: msSubmissionType === "Published" ? originalPublicationYear : undefined,
        doi: msSubmissionType === "Published" ? msDoi : `10.2813/healthedia.ms${Date.now().toString().slice(-4)}`,
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
    }

    // Reset fields
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
  };

  return (
    <div className="flex-grow bg-white py-10 font-sans animate-fadeIn relative">
      
      {/* Dynamic Toast Message Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg border border-neutral-800 animate-slideUp max-w-sm">
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-neutral-200 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-neutral-300 shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:text-neutral-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with Verification status */}
        <div className="border border-neutral-200 bg-neutral-50/80 p-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-cover border border-neutral-200 rounded-2xl bg-white"
              />
              <label className="absolute -bottom-1 -right-1 bg-black text-white p-1.5 rounded-xl border border-white cursor-pointer hover:bg-neutral-850 shadow-sm" title="Upload Photo">
                <Upload className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-sans font-bold text-black">{currentUser.name}</h1>
                {currentUser.verified && (
                  <span className="inline-flex items-center text-[10px] font-mono bg-black text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    ✓ Verified
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center border border-neutral-200/60 bg-white shadow-sm"
                  title="Share Profile"
                  id="header-share-button"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5 uppercase tracking-wider">
                {currentUser.orcid ? `ORCID ID: ${currentUser.orcid}` : "Institutional Account"}
              </p>
            </div>
          </div>

          {/* Verification Badge Status block */}
          <div className="bg-white border border-neutral-200 p-4 max-w-sm w-full md:w-auto rounded-xl shadow-sm">
            {currentUser.verified ? (
              <div className="flex items-center text-xs space-x-2.5">
                <CheckCircle className="w-5 h-5 text-black stroke-[1.5]" />
                <div>
                  <p className="font-bold text-black uppercase tracking-wider text-[10px] font-mono">Administrative Audit Passed</p>
                  <p className="text-neutral-500 mt-0.5">Your peer contributions carry verified credentials.</p>
                </div>
              </div>
            ) : currentUser.verificationSubmitted ? (
              <div className="flex items-center text-xs space-x-2.5">
                <Settings className="w-5 h-5 text-neutral-400 animate-spin" />
                <div>
                  <p className="font-bold text-neutral-600 uppercase tracking-wider text-[10px] font-mono">Verification Under Audit</p>
                  <p className="text-neutral-400 mt-0.5">Administrative board reviews pending. 24h ETA.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-xs space-x-2.5">
                <Lock className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] font-mono">Identity Unverified</p>
                  <p className="text-neutral-400 mt-0.5">Access matches basic accounts. Submit verification below.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Menu Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Settings Nav */}
          <div className="lg:col-span-1 space-y-1.5">
            {[
              { id: "profile", label: "Personal & Academic Profile", icon: User },
              { id: "manuscripts", label: "Saved Research / Manuscripts", icon: FileCode },
              { id: "certificates", label: "Academic Certificates", icon: Award },
              { id: "requests", label: "My Requests & Verification", icon: CheckCircle },
              { id: "settings", label: "Account Settings & Privacy", icon: Settings }
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

          {/* Settings Panel details */}
          <div className="lg:col-span-3 border border-neutral-200/85 p-6 sm:p-8 bg-white rounded-2xl shadow-sm">
            
            {/* TAB 1: PERSONAL, ACADEMIC & PROFESSIONAL PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSave} className="space-y-8 animate-fadeIn">
                
                {/* SEO Profile Sharing Block */}
                <div>
                  <h2 className="text-base font-bold font-sans text-black border-b border-neutral-100 pb-3 uppercase tracking-wider">
                    Scientific & Professional Registry
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 font-sans pb-3">
                    These parameters determine your listing and verified academic credentials inside the Healthedia registry index.
                  </p>

                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-2.5 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-black" />
                        Public Professional Profile Link (SEO-Friendly)
                      </span>
                      {currentUser.role && (
                        <span className="text-[9px] font-mono bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded uppercase font-bold">
                          {currentUser.role} Level
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/researcher/${currentUser.username || currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        className="bg-white border border-neutral-200 p-2 text-[11px] font-mono w-full rounded-lg text-neutral-600 focus:outline-none focus:border-neutral-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/researcher/${currentUser.username || currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          showToast("Profile share URL copied to clipboard!", "success");
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="bg-black text-white px-3 text-xs font-mono font-bold flex items-center gap-1 hover:bg-neutral-800 transition-colors cursor-pointer rounded-lg shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedLink ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 1: Personal Information */}
                <div className="bg-neutral-50/40 border border-neutral-200/60 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-neutral-100">
                    <User className="w-4 h-4 text-neutral-600" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-850">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. John"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Doe"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm h-[38px] cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Nationality</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="e.g. Swiss"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Country of Residence</label>
                      <input
                        type="text"
                        value={countryOfResidence}
                        onChange={(e) => setCountryOfResidence(e.target.value)}
                        placeholder="e.g. Switzerland"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Email Address</label>
                      <input
                        type="email"
                        required
                        value={emailState}
                        onChange={(e) => setEmailState(e.target.value)}
                        placeholder="e.g. john.doe@healthedia.org"
                        className="w-full text-xs border border-neutral-200 bg-neutral-100 py-2 px-3 text-neutral-500 focus:outline-none rounded-xl transition-colors shadow-sm cursor-not-allowed"
                        disabled
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Primary Phone Number</label>
                      <input
                        type="tel"
                        value={primaryPhone}
                        onChange={(e) => setPrimaryPhone(e.target.value)}
                        placeholder="e.g. +41 22 730 5111"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Secondary Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={secondaryPhone}
                        onChange={(e) => setSecondaryPhone(e.target.value)}
                        placeholder="e.g. +41 22 730 5112"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Academic Information */}
                <div className="bg-neutral-50/40 border border-neutral-200/60 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-neutral-100 gap-2">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-neutral-600" />
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-850">
                        Academic Information
                      </h3>
                    </div>
                    {/* Unique Researcher ID Display */}
                    <div className="bg-black text-white text-[10px] font-mono px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 self-start sm:self-center shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-100" />
                      <span>Healthedia Researcher ID: HRES-8492-91X</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Academic Title</label>
                      <select
                        value={academicTitle}
                        onChange={(e) => setAcademicTitle(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm h-[38px] cursor-pointer"
                      >
                        <option value="">Select Title</option>
                        <option value="Dr. med.">Dr. med.</option>
                        <option value="Dr. rer. nat.">Dr. rer. nat.</option>
                        <option value="Prof. Dr.">Prof. Dr.</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Senior Lecturer">Senior Lecturer</option>
                        <option value="PostDoc Researcher">PostDoc Researcher</option>
                        <option value="PhD Candidate">PhD Candidate</option>
                        <option value="Clinical Fellow">Clinical Fellow</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Academic Specialization</label>
                      <input
                        type="text"
                        value={academicSpecialization}
                        onChange={(e) => setAcademicSpecialization(e.target.value)}
                        placeholder="e.g. Cellular & Muscle Physiology"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Professional Specialization</label>
                      <input
                        type="text"
                        value={professionalSpecialization}
                        onChange={(e) => setProfessionalSpecialization(e.target.value)}
                        placeholder="e.g. Sports Medicine Specialist"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Institutional Affiliation</label>
                      <input
                        type="text"
                        value={institutionalAffiliation}
                        onChange={(e) => setInstitutionalAffiliation(e.target.value)}
                        placeholder="e.g. Swiss Federal Institute of Sport Magglingen"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Highest Academic Degree</label>
                      <input
                        type="text"
                        value={highestAcademicDegree}
                        onChange={(e) => setHighestAcademicDegree(e.target.value)}
                        placeholder="e.g. PhD in Sports Physiology"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Year of Graduation</label>
                      <input
                        type="number"
                        value={yearOfGraduation}
                        onChange={(e) => setYearOfGraduation(e.target.value)}
                        placeholder="e.g. 2021"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Sorted Multi-Degree Manager */}
                  <div className="mt-4 p-4 border border-neutral-200 bg-white rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                        Academic Degrees Registry (Auto-Sorted Lowest to Highest)
                      </label>
                      <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                        {degreesList.length} Registered
                      </span>
                    </div>

                    {/* Degree list display (Sorted lowest to highest) */}
                    <div className="space-y-2">
                      {(() => {
                        const getDegreeWeight = (degreeName: string): number => {
                          const d = degreeName.toLowerCase();
                          if (d.includes("bachelor") || d.includes("b.s") || d.includes("b.a") || d.includes("bsc") || d.includes("baccalaureate")) return 1;
                          if (d.includes("master") || d.includes("m.s") || d.includes("m.a") || d.includes("msc") || d.includes("mphil")) return 2;
                          if (d.includes("phd") || d.includes("ph.d") || d.includes("doctor") || d.includes("doctorate")) return 3;
                          if (d.includes("postdoc") || d.includes("post-doc") || d.includes("professor")) return 4;
                          return 0;
                        };

                        const sortedDegrees = [...degreesList].sort((a, b) => {
                          const wA = getDegreeWeight(a.degree);
                          const wB = getDegreeWeight(b.degree);
                          if (wA !== wB) return wA - wB;
                          return a.year - b.year;
                        });

                        if (sortedDegrees.length === 0) {
                          return <p className="text-[11px] text-neutral-400 italic">No degrees registered yet.</p>;
                        }

                        return (
                          <div className="grid grid-cols-1 gap-2">
                            {sortedDegrees.map((deg, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs bg-neutral-50 px-3.5 py-2 border border-neutral-150 rounded-xl hover:bg-neutral-100/50 transition-colors">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-semibold">
                                    Lvl {getDegreeWeight(deg.degree)}
                                  </span>
                                  <span className="font-semibold text-neutral-800">{deg.degree}</span>
                                  <span className="text-neutral-400">•</span>
                                  <span className="text-neutral-500 font-mono">Graduated {deg.year}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDegreesList(degreesList.filter((_, dIdx) => dIdx !== degreesList.indexOf(deg)));
                                  }}
                                  className="text-neutral-400 hover:text-black font-semibold p-1 cursor-pointer font-sans text-base"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Add Degree Form */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-neutral-100">
                      <input
                        type="text"
                        value={newDegreeName}
                        onChange={(e) => setNewDegreeName(e.target.value)}
                        placeholder="Degree name (e.g. Master of Science in Physiology)"
                        className="text-xs border border-neutral-200 bg-white py-1.5 px-3 text-black focus:outline-none focus:border-black rounded-xl flex-grow transition-colors"
                      />
                      <input
                        type="number"
                        value={newDegreeYear}
                        onChange={(e) => setNewDegreeYear(e.target.value)}
                        placeholder="Year (e.g. 2018)"
                        className="text-xs border border-neutral-200 bg-white py-1.5 px-3 text-black focus:outline-none focus:border-black rounded-xl sm:w-28 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newDegreeName || !newDegreeYear) {
                            showToast("Please enter both a degree name and a year.", "error");
                            return;
                          }
                          setDegreesList([...degreesList, { degree: newDegreeName, year: Number(newDegreeYear) }]);
                          setNewDegreeName("");
                          setNewDegreeYear("");
                          showToast("Degree added successfully! Sorted from lowest to highest.", "success");
                        }}
                        className="bg-black hover:bg-neutral-800 text-white px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-xl cursor-pointer transition-colors"
                      >
                        Add Degree
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Professional Information */}
                <div className="bg-neutral-50/40 border border-neutral-200/60 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-neutral-100">
                    <Award className="w-4 h-4 text-neutral-600" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-850">
                      Professional & Career Information
                    </h3>
                  </div>

                  {/* Biography with Translation & Live Character Counter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                          Biography / Clinical History (Translation Hub)
                        </label>
                      </div>
                      <div className="flex border border-neutral-200 rounded-lg overflow-hidden bg-white">
                        {(["en", "ar", "fr", "de"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setBioLang(lang)}
                            className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-all border-r last:border-r-0 ${
                              bioLang === lang
                                ? "bg-black text-white border-black"
                                : "text-neutral-500 bg-neutral-50 hover:bg-neutral-100 border-neutral-200"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      {bioLang === "en" && (
                        <textarea
                          value={biographyEn}
                          onChange={(e) => setBiographyEn(e.target.value.slice(0, 1000))}
                          maxLength={1000}
                          rows={4}
                          placeholder="Provide a description of your scientific history, clinical focus areas, or laboratory research agenda (English)..."
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black resize-y rounded-xl font-light transition-colors"
                        />
                      )}
                      {bioLang === "ar" && (
                        <textarea
                          value={biographyAr}
                          onChange={(e) => setBiographyAr(e.target.value.slice(0, 1000))}
                          maxLength={1000}
                          rows={4}
                          dir="rtl"
                          placeholder="أدخل سيرتك العلمية والمهنية هنا باللغة العربية..."
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black resize-y rounded-xl font-light transition-colors font-sans"
                        />
                      )}
                      {bioLang === "fr" && (
                        <textarea
                          value={biographyFr}
                          onChange={(e) => setBiographyFr(e.target.value.slice(0, 1000))}
                          maxLength={1000}
                          rows={4}
                          placeholder="Saisissez votre biographie scientifique et votre parcours clinique en français..."
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black resize-y rounded-xl font-light transition-colors"
                        />
                      )}
                      {bioLang === "de" && (
                        <textarea
                          value={biographyDe}
                          onChange={(e) => setBiographyDe(e.target.value.slice(0, 1000))}
                          maxLength={1000}
                          rows={4}
                          placeholder="Geben Sie hier Ihre wissenschaftliche Biografie und Ihren klinischen Werdegang auf Deutsch ein..."
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black resize-y rounded-xl font-light transition-colors"
                        />
                      )}
                      
                      {/* Character Count Bar */}
                      <div className="flex justify-end mt-1 text-[10px] font-mono text-neutral-400">
                        {(() => {
                          const text = bioLang === "en" ? biographyEn : bioLang === "ar" ? biographyAr : bioLang === "fr" ? biographyFr : biographyDe;
                          const chars = text.length;
                          return (
                            <span className={chars >= 950 ? "text-red-500 font-bold" : ""}>
                              {chars} / 1000 characters
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Languages Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Primary Language Spoken</label>
                      <input
                        type="text"
                        value={spokenLanguage}
                        onChange={(e) => setSpokenLanguage(e.target.value)}
                        placeholder="e.g. English"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Secondary Language (Optional)</label>
                      <input
                        type="text"
                        value={secondLanguage}
                        onChange={(e) => setSecondLanguage(e.target.value)}
                        placeholder="e.g. German"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Chronological Awards & Honors Registry */}
                  <div className="mt-4 p-4 border border-neutral-200 bg-white rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                        Academic Awards & Honors (Sorted Chronologically)
                      </label>
                      <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                        {awardsList.length} Registered
                      </span>
                    </div>

                    {/* Chronological Awards display */}
                    <div className="space-y-2">
                      {(() => {
                        const sortedAwards = [...awardsList].sort((a, b) => a.year - b.year);

                        if (sortedAwards.length === 0) {
                          return <p className="text-[11px] text-neutral-400 italic">No awards listed yet.</p>;
                        }

                        return (
                          <div className="grid grid-cols-1 gap-2">
                            {sortedAwards.map((aw, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs bg-neutral-50 px-3.5 py-2 border border-neutral-150 rounded-xl hover:bg-neutral-100/50 transition-colors">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">
                                    {aw.year}
                                  </span>
                                  <span className="font-semibold text-neutral-800">{aw.title}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAwardsList(awardsList.filter((_, aIdx) => aIdx !== awardsList.indexOf(aw)));
                                  }}
                                  className="text-neutral-400 hover:text-black font-semibold p-1 cursor-pointer font-sans text-base"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Add Award Form */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-neutral-100">
                      <input
                        type="text"
                        value={newAwardName}
                        onChange={(e) => setNewAwardName(e.target.value)}
                        placeholder="Honor / Award name (e.g. Outstanding Muscle Physiology Award)"
                        className="text-xs border border-neutral-200 bg-white py-1.5 px-3 text-black focus:outline-none focus:border-black rounded-xl flex-grow transition-colors"
                      />
                      <input
                        type="number"
                        value={newAwardYear}
                        onChange={(e) => setNewAwardYear(e.target.value)}
                        placeholder="Year (e.g. 2025)"
                        className="text-xs border border-neutral-200 bg-white py-1.5 px-3 text-black focus:outline-none focus:border-black rounded-xl sm:w-28 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAwardName || !newAwardYear) {
                            showToast("Please enter both an award name and a year.", "error");
                            return;
                          }
                          setAwardsList([...awardsList, { title: newAwardName, year: Number(newAwardYear) }]);
                          setNewAwardName("");
                          setNewAwardYear("");
                          showToast("Award registered! Sorted chronologically.", "success");
                        }}
                        className="bg-black hover:bg-neutral-800 text-white px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-xl cursor-pointer transition-colors"
                      >
                        Add Honor
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Academic Registries URLs */}
                <div className="bg-neutral-50/40 border border-neutral-200/60 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-neutral-100">
                    <Globe className="w-4 h-4 text-neutral-600" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-850">
                      Academic Registry Portals
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-400">ORCID iD Number</label>
                      <input
                        type="text"
                        value={orcid}
                        onChange={(e) => setOrcid(e.target.value)}
                        placeholder="e.g. 0000-0002-1823-9023"
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black font-mono focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-400">Google Scholar Profile URL</label>
                      <input
                        type="text"
                        value={googleScholar}
                        onChange={(e) => setGoogleScholar(e.target.value)}
                        placeholder="https://scholar.google.com/citations?..."
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-400">ResearchGate URL</label>
                      <input
                        type="text"
                        value={researchGate}
                        onChange={(e) => setResearchGate(e.target.value)}
                        placeholder="https://www.researchgate.com/profile/..."
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-400">Scopus ID URL</label>
                      <input
                        type="text"
                        value={scopus}
                        onChange={(e) => setScopus(e.target.value)}
                        placeholder="https://www.scopus.com/authid/detail..."
                        className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 5: Research Focus Tag Editors */}
                <div className="bg-neutral-50/40 border border-neutral-200/60 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-neutral-100">
                    <Plus className="w-4 h-4 text-neutral-600" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-850">
                      Scientific Tags & focus Areas
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Research Focus */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Research Focus Areas</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="e.g. Muscle Bioenergetics"
                          className="text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black max-w-xs w-full rounded-xl transition-colors shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => addItem(newInterest, setResearchInterests, setNewInterest, researchInterests)}
                          className="bg-black text-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {researchInterests.map((interest, idx) => (
                          <span key={idx} className="bg-neutral-50 text-neutral-700 border border-neutral-200 text-xs px-3 py-1 flex items-center gap-1.5 rounded-full shadow-sm">
                            {interest}
                            <button type="button" onClick={() => removeItem(idx, setResearchInterests, researchInterests)} className="text-neutral-400 hover:text-black font-semibold cursor-pointer">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button Footer */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-black hover:bg-neutral-850 text-white text-xs font-mono uppercase tracking-widest font-black py-3.5 px-8 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Save & Synchronize Academic Profile
                  </button>
                </div>
              </form>
            )}

            {/* TAB: ACADEMIC CERTIFICATES */}
            {activeTab === "certificates" && (
              <div className="space-y-8 animate-fadeIn font-sans">
                <div>
                  <h2 className="text-base font-bold font-sans text-black border-b border-neutral-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-5 h-5 text-black" />
                    Academic Certificates
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    View and verify your earned qualifications, indexed research achievements, and editorial designations.
                  </p>
                </div>

                {/* Certificate Categories */}
                {(() => {
                  const mockCertificates = [
                    {
                      id: "CERT-CRS-482",
                      title: "Advanced Clinical Musculoskeletal Physiology",
                      category: "Course",
                      issuedTo: `${firstName} ${lastName}`.trim() || currentUser.name,
                      issuedDate: "2025-06-12",
                      issuedBy: "Healthedia Educational Council",
                      verifierToken: "verify.healthedia.org/cert/crs-482",
                      description: "Successfully finalized the postgraduate lecture track with focus on neuromuscular excitability and mechanical strain dynamics.",
                      recipientTitle: academicTitle || "Dr."
                    },
                    {
                      id: "CERT-CRS-519",
                      title: "Advanced Cardiology & Myocardial Biomechanics",
                      category: "Course",
                      issuedTo: `${firstName} ${lastName}`.trim() || currentUser.name,
                      issuedDate: "2025-09-20",
                      issuedBy: "Healthedia Cardiology Academy",
                      verifierToken: "verify.healthedia.org/cert/crs-519",
                      description: "Attested completion of physical cardiac modeling and volumetric strain computation coursework.",
                      recipientTitle: academicTitle || "Dr."
                    },
                    {
                      id: "CERT-RES-911",
                      title: "Altitude Stress & Cardiorespiratory Performance",
                      category: "Research",
                      issuedTo: `${firstName} ${lastName}`.trim() || currentUser.name,
                      issuedDate: "2026-03-05",
                      issuedBy: "Healthedia Administrative Council",
                      verifierToken: "verify.healthedia.org/cert/res-911",
                      description: "Formally recognized for clinical indexing of physiological trials regarding metabolic homeostasis under hypobaric hypoxia.",
                      recipientTitle: academicTitle || "Dr."
                    },
                    {
                      id: "CERT-JNL-102",
                      title: "Outstanding Scientific Contributor Award",
                      category: "Journal",
                      issuedTo: `${firstName} ${lastName}`.trim() || currentUser.name,
                      issuedDate: "2026-01-15",
                      issuedBy: "Healthedia Editorial Board",
                      verifierToken: "verify.healthedia.org/cert/jnl-102",
                      description: "Awarded for exceptional manuscript submissions and high-impact indexing in the Global Journal of Performance Science.",
                      recipientTitle: academicTitle || "Dr."
                    },
                    {
                      id: "CERT-REV-304",
                      title: "Vetted Peer Reviewer & Journal Auditor",
                      category: "Reviewer",
                      issuedTo: `${firstName} ${lastName}`.trim() || currentUser.name,
                      issuedDate: "2025-11-10",
                      issuedBy: "Healthedia Editorial Council",
                      verifierToken: "verify.healthedia.org/cert/rev-304",
                      description: "Attested as an active panel reviewer, maintaining double-blind evaluation standards for human physiology and sports biomechanics.",
                      recipientTitle: academicTitle || "Dr."
                    }
                  ];

                  const categories = ["Course", "Research", "Journal", "Reviewer"] as const;

                  return (
                    <div className="space-y-10">
                      {categories.map((cat) => {
                        const filtered = mockCertificates.filter(c => c.category === cat);
                        return (
                          <div key={cat} className="space-y-4">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                                {cat} Certificates
                              </h3>
                              <span className="text-[10px] font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-500">
                                {filtered.length} Earned
                              </span>
                            </div>

                            {filtered.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">No certificates issued under this category yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filtered.map((cert) => (
                                  <div
                                    key={cert.id}
                                    className="border border-neutral-200 bg-white p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-black transition-all group hover:shadow"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between">
                                        <span className="text-[9px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                                          {cert.id}
                                        </span>
                                        <span className="text-[10px] text-neutral-400 font-mono">
                                          {cert.issuedDate}
                                        </span>
                                      </div>
                                      <h4 className="text-sm font-bold text-black group-hover:text-neutral-800 transition-colors">
                                        {cert.title}
                                      </h4>
                                      <p className="text-xs text-neutral-500 font-light leading-relaxed">
                                        {cert.description}
                                      </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                      <span className="text-[10px] text-neutral-400 font-mono italic">
                                        By {cert.issuedBy}
                                      </span>
                                      <button
                                        onClick={() => setSelectedCertificateModal(cert)}
                                        className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 hover:text-neutral-600 cursor-pointer"
                                      >
                                        View Certificate <ExternalLink className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* CERTIFICATE LIGHTBOX MODAL */}
                {selectedCertificateModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
                    <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]">
                      
                      {/* Modal Header Controls */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Healthedia Certified Attestation</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => window.print()}
                            className="text-xs text-neutral-600 hover:text-black font-mono font-bold uppercase flex items-center gap-1 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all"
                          >
                            Print / PDF
                          </button>
                          <button
                            onClick={() => setSelectedCertificateModal(null)}
                            className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Certificate Document Canvas */}
                      <div className="p-8 md:p-12 overflow-y-auto bg-neutral-50 flex-grow flex items-center justify-center">
                        <div className="bg-white border-8 border-double border-neutral-200 p-8 md:p-12 w-full max-w-xl shadow-lg relative text-center space-y-8 select-none">
                          
                          {/* Aesthetic Watermarks/Crests */}
                          <div className="absolute inset-0 opacity-[0.015] pointer-events-none flex items-center justify-center">
                            <Award className="w-96 h-96" />
                          </div>

                          {/* Certificate Header */}
                          <div className="space-y-2">
                            <div className="flex justify-center">
                              <div className="p-2.5 bg-black text-white rounded-full">
                                <Award className="w-8 h-8" />
                              </div>
                            </div>
                            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-400">
                              Certificate of Attestation
                            </h2>
                            <p className="text-[9px] font-mono text-neutral-400">ISSUED BY THE HEALTHEDIA ACADEMIC REGISTRY</p>
                          </div>

                          {/* Recipient Details */}
                          <div className="space-y-1">
                            <p className="text-xs text-neutral-400 italic">This document certifies that</p>
                            <h3 className="text-xl md:text-2xl font-bold text-black font-sans leading-tight tracking-wide border-b border-neutral-100 pb-3 max-w-xs mx-auto">
                              {selectedCertificateModal.recipientTitle} {selectedCertificateModal.issuedTo}
                            </h3>
                          </div>

                          {/* Statement */}
                          <div className="space-y-3 max-w-md mx-auto">
                            <p className="text-xs text-neutral-500 font-light leading-relaxed">
                              Has successfully satisfied all criteria, audits, and scientific peer evaluation standards required to earn and hold the credential of
                            </p>
                            <h4 className="text-base font-bold text-black tracking-tight font-sans">
                              {selectedCertificateModal.title}
                            </h4>
                            <p className="text-[11px] text-neutral-400 italic">
                              "{selectedCertificateModal.description}"
                            </p>
                          </div>

                          {/* Signatures & Seals */}
                          <div className="grid grid-cols-2 gap-8 pt-6 max-w-sm mx-auto">
                            <div className="text-center space-y-1">
                              <div className="h-8 flex items-end justify-center">
                                <span className="font-serif italic text-sm text-neutral-600 block border-b border-neutral-200 w-28 pb-1">Dr. Takahashi S.</span>
                              </div>
                              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">Registrar General</span>
                            </div>
                            <div className="text-center space-y-1">
                              <div className="h-8 flex items-end justify-center">
                                <span className="font-serif italic text-sm text-neutral-600 block border-b border-neutral-200 w-28 pb-1">H. Vance Alastair</span>
                              </div>
                              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">Editorial Director</span>
                            </div>
                          </div>

                          {/* Verifiability Details */}
                          <div className="pt-6 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-3 text-[9px] text-neutral-400 font-mono">
                            <span>ISSUE DATE: {selectedCertificateModal.issuedDate}</span>
                            <span>CERTIFICATE ID: {selectedCertificateModal.id}</span>
                            <span className="text-black font-bold hover:underline cursor-pointer">{selectedCertificateModal.verifierToken}</span>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MY REQUESTS & VERIFICATION */}
            {activeTab === "requests" && (
              <div className="space-y-8 animate-fadeIn font-sans">
                <div>
                  <h2 className="text-base font-bold font-sans text-black border-b border-neutral-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-black" />
                    My Requests & Verification
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    Track requests and manage academic status vetting. Submit credentials and legal identity documentation to join the official Researcher registry.
                  </p>
                </div>

                {/* VETTING STATUS BANNER */}
                {(() => {
                  const isVerified = currentUser.verified || currentUser.role === "Researcher" || currentUser.role === "Reviewer" || currentUser.role === "Admin";
                  const researcherId = currentUser.researcherId || `HRI-482-9118`;

                  if (isVerified) {
                    return (
                      <div className="p-5 border border-black rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="p-2 bg-black text-white rounded-full mt-0.5 shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 uppercase tracking-wider">
                              Vetted Researcher Active
                            </span>
                            <h4 className="text-base font-bold text-black mt-1">
                              Healthedia Researcher ID: {researcherId}
                            </h4>
                            <p className="text-xs text-neutral-500 font-light mt-0.5">
                              Your academic credentials, qualifications, and ORCID link have been certified by our administrative board.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(researcherId);
                              showToast("Researcher ID copied to clipboard!", "success");
                            }}
                            className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-black font-mono font-bold uppercase text-[10px] py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy ID
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (currentUser.verificationSubmitted) {
                    return (
                      <div className="p-5 border border-amber-200 bg-amber-50/25 rounded-2xl shadow-sm flex items-start gap-3.5">
                        <div className="p-2 bg-amber-100 text-amber-800 rounded-full mt-0.5 shrink-0 animate-pulse">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">
                            Identity Audit Pending
                          </span>
                          <h4 className="text-sm font-bold text-black mt-1">
                            Submission Received & Under Editorial Audit
                          </h4>
                          <p className="text-xs text-neutral-600 font-light mt-0.5 leading-relaxed">
                            Our compliance officers are verifying your professional uploads ({passportFileName || "Passport ID"} & {qualificationFileName || "Academic Diploma"}) against the {verificationMethod.toUpperCase()} registries. Typical vetting duration: 24-48 business hours.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-5 border border-neutral-200 bg-neutral-50/50 rounded-2xl shadow-sm flex items-start gap-3.5">
                      <div className="p-2 bg-neutral-100 text-neutral-500 rounded-full mt-0.5 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded uppercase tracking-wider">
                          Unverified Investigator Profile
                        </span>
                        <h4 className="text-sm font-bold text-black mt-1">
                          Apply for Formal Academic Vetting
                        </h4>
                        <p className="text-xs text-neutral-600 font-light mt-0.5 leading-relaxed">
                          Unverified accounts cannot claim or index academic papers, or review active manuscripts. Submit national ID and qualifications below to upgrade to a vetted Researcher.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* VETTING DOCUMENT UPLOAD & REGISTRATION TRIGGER */}
                {!currentUser.verified && !currentUser.verificationSubmitted && (
                  <div className="border border-neutral-200 rounded-2xl bg-neutral-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                        Start Professional Verification
                      </h3>
                      <p className="text-xs text-neutral-500 font-light max-w-xl leading-relaxed">
                        To unlock full peer reviews, publish manuscripts, download official research PDFs, and list your academic affiliations, please verify your academic status.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsVerificationDialogOpen(true)}
                      className="bg-black text-white hover:bg-neutral-850 text-xs font-mono font-bold uppercase tracking-wider py-3 px-6 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap text-center"
                    >
                      Begin Verification
                    </button>
                  </div>
                )}

                {/* VETTING PIPELINE & REQUESTS HISTORY */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-neutral-400">
                    Vetting Pipeline & Audit History
                  </h3>
                  
                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 font-mono text-[10px] text-neutral-400 uppercase font-bold">
                            <th className="p-3.5">Request Type</th>
                            <th className="p-3.5">Submission Date</th>
                            <th className="p-3.5">Vetting Method</th>
                            <th className="p-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          <tr className="hover:bg-neutral-50/50 transition-colors">
                            <td className="p-3.5">
                              <p className="font-bold text-black">Academic Identity & Board Vetting</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">Primary Researcher Access</p>
                            </td>
                            <td className="p-3.5 text-neutral-500 font-mono">
                              {currentUser.verified ? "2025-10-18" : currentUser.verificationSubmitted ? "2026-07-15" : "No active requests"}
                            </td>
                            <td className="p-3.5 text-neutral-600 font-mono uppercase">
                              {currentUser.verified ? "ORCID API Sync" : currentUser.verificationSubmitted ? verificationMethod : "—"}
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                                currentUser.verified 
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : currentUser.verificationSubmitted
                                    ? "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                                    : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                              }`}>
                                {currentUser.verified ? "Approved" : currentUser.verificationSubmitted ? "Under Review" : "Not Submitted"}
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-neutral-50/50 transition-colors">
                            <td className="p-3.5">
                              <p className="font-bold text-black">Clinical Affiliation Indexing</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">Vance & Takahashi Laboratories</p>
                            </td>
                            <td className="p-3.5 text-neutral-500 font-mono">2025-11-02</td>
                            <td className="p-3.5 text-neutral-600 font-mono uppercase">Liaison Letter</td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Approved
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-neutral-50/50 transition-colors">
                            <td className="p-3.5">
                              <p className="font-bold text-black">Peer Review Designation</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">Editorial Council Review Board</p>
                            </td>
                            <td className="p-3.5 text-neutral-500 font-mono">2025-11-10</td>
                            <td className="p-3.5 text-neutral-600 font-mono uppercase">Board Invitation</td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Approved
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACCOUNT SETTINGS & PRIVACY */}
            {activeTab === "settings" && (
              <div className="space-y-8 animate-fadeIn font-sans">
                <div>
                  <h2 className="text-base font-bold font-sans text-black border-b border-neutral-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-5 h-5 text-black" />
                    Account Settings & Privacy
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    Configure your researcher credentials, update password controls, and specify peer directory discoverability preferences.
                  </p>
                </div>

                {/* ID SETTINGS FORM */}
                <div className="border border-neutral-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-black" /> Account Credentials
                  </h3>
                  
                  <form onSubmit={handleAccountSettingsSave} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Username / SEO Handle</label>
                        <input
                          type="text"
                          value={usernameState}
                          onChange={(e) => setUsernameState(e.target.value)}
                          required
                          placeholder="e.g., alex-mercer"
                          className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors font-medium"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Registered Email Address</label>
                        <input
                          type="email"
                          value={emailState}
                          onChange={(e) => setEmailState(e.target.value)}
                          required
                          placeholder="e.g., alex.mercer@healthedia.org"
                          className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-black hover:bg-neutral-850 text-white text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer transition-colors"
                    >
                      Update Credentials
                    </button>
                  </form>
                </div>

                {/* PASSWORD MODIFICATION FORM */}
                <div className="border border-neutral-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-black" /> Update Account Password
                  </h3>

                  <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-2xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors font-mono"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Min. 8 characters"
                          className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Re-enter new password"
                          className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-black hover:bg-neutral-850 text-white text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* PRIVACY CONTROLS */}
                <div className="border border-neutral-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-black" /> Peer Directory Privacy Controls
                  </h3>

                  <div className="space-y-4 text-xs">
                    <label className="flex items-start cursor-pointer hover:text-black group">
                      <input
                        type="checkbox"
                        checked={privacyShowInDirectory}
                        onChange={(e) => setPrivacyShowInDirectory(e.target.checked)}
                        className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">Make profile discoverable inside directory</p>
                        <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">Allows other verified researchers, journals, and institutions to search for your qualifications and affiliations.</p>
                      </div>
                    </label>
 
                    <label className="flex items-start cursor-pointer hover:text-black group pt-2">
                      <input
                        type="checkbox"
                        checked={privacyShowEmail}
                        onChange={(e) => setPrivacyShowEmail(e.target.checked)}
                        className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">Expose my primary research email to verified physicians</p>
                        <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">Promotes clinical and physical physiological collaborations while safeguarding from unsolicited communications.</p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer hover:text-black group pt-2">
                      <input
                        type="checkbox"
                        checked={privacyShowPhone}
                        onChange={(e) => setPrivacyShowPhone(e.target.checked)}
                        className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">Make primary phone number visible to affiliate organizations</p>
                        <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">Ensures direct verification lines can be established by board auditors when evaluating manuscripts.</p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer hover:text-black group pt-2">
                      <input
                        type="checkbox"
                        checked={privacyShowAwards}
                        onChange={(e) => setPrivacyShowAwards(e.target.checked)}
                        className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">Display academic awards & honours on my public profile card</p>
                        <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">Publishes chronological prizes and scholarship notations alongside clinical and paper indexes.</p>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: MANUSCRIPT SUBMISSIONS PORTAL */}
            {activeTab === "manuscripts" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black border-b border-neutral-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-black" />
                    Manuscript Submission Portal
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    Submit, review, and register clinical, performance, or sports science manuscripts into Healthedia's peer-reviewed archive.
                  </p>
                </div>

                {/* ROLE CONSTRAINTS NOTICE */}
                {currentUser.role === "Member" ? (
                  <div className="bg-neutral-50 border border-black p-5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-black">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono">🌟 Member Automatic Promotion Rule</h3>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      You are currently an <strong>Archive Member</strong>. Submitting your first scientific manuscript initiates the automatic promotion track! Once your submitted paper is reviewed and approved by an Administrator or Editor, your account will instantly transition to a <strong>Verified Researcher</strong> with profile indexing, citation tracking, and independent publication privileges.
                    </p>
                  </div>
                ) : (
                  <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-neutral-800">
                      <ShieldCheck className="w-5 h-5 shrink-0 text-black" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Researcher Level Publication Rights</h3>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      As a verified <strong>{currentUser.role}</strong>, you have full publication privileges. Submitted papers will bypass verification limits and enter the review pipeline directly.
                    </p>
                  </div>
                )}

                {/* CURRENT SUBMISSIONS */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-neutral-400">Your Submitted Manuscripts ({myManuscripts.length})</h3>
                  {myManuscripts.length === 0 ? (
                    <div className="border border-dashed border-neutral-200 p-8 text-center rounded-2xl">
                      <p className="text-xs text-neutral-400 italic font-light">No manuscript records found under your account. Submit your first clinical study below.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myManuscripts.map((ms) => (
                        <div key={ms.id} className="border border-neutral-200 p-4 rounded-xl space-y-2 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                            <span className="text-[10px] font-mono font-bold text-neutral-400">ID: {ms.id}</span>
                            <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              ms.status === "Approved" ? "bg-black text-white" :
                              ms.status === "Rejected" ? "bg-red-50 text-red-600 border border-red-200" :
                              ms.status === "Revision Requested" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-neutral-100 text-neutral-700"
                            }`}>
                              {ms.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-black leading-snug">{ms.title}</h4>
                          <p className="text-xs text-neutral-500 font-light line-clamp-2 leading-relaxed">{ms.abstract}</p>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-neutral-400 border-t border-neutral-100">
                            <div>
                              <span className="block font-bold uppercase text-[8px]">Type</span>
                              <span className="text-neutral-600 truncate block">{ms.researchType}</span>
                            </div>
                            <div>
                              <span className="block font-bold uppercase text-[8px]">Subject</span>
                              <span className="text-neutral-600 truncate block">{ms.specialty}</span>
                            </div>
                            <div>
                              <span className="block font-bold uppercase text-[8px]">Category</span>
                              <span className="text-neutral-600 truncate block">{ms.journalCategory}</span>
                            </div>
                            <div>
                              <span className="block font-bold uppercase text-[8px]">Submitted</span>
                              <span className="text-neutral-600 truncate block">{ms.submittedAt}</span>
                            </div>
                          </div>

                          {ms.reviewerNotes && (
                            <div className="mt-3 p-3 bg-white border border-neutral-200 rounded-lg text-xs">
                              <p className="font-mono font-bold uppercase text-[8px] text-neutral-400">Board Auditor Feedback</p>
                              <p className="text-neutral-600 mt-1 italic font-light leading-relaxed">{ms.reviewerNotes}</p>
                            </div>
                          )}

                          {/* Action Buttons for Certificate and Revisions */}
                          <div className="flex gap-2 pt-2 border-t border-neutral-100 justify-end">
                            {ms.status === "Approved" && (
                              <button
                                onClick={() => setSelectedPaperForCert({
                                  id: ms.id,
                                  title: ms.title,
                                  authors: ms.authors,
                                  journal: ms.submissionType === "Published" ? undefined : "Healthedia Global Journal of Performance Science",
                                  doi: ms.doi || `10.2813/healthedia.${ms.id.split("-")[1] || "ms" + Date.now()}`,
                                  specialty: ms.specialty || "Sports Science & Musculoskeletal",
                                  institution: ms.institution || "Harvard Research Centre",
                                  country: ms.country || "United States",
                                  submittedAt: ms.submittedAt
                                })}
                                className="px-3 py-1 bg-black text-white hover:bg-neutral-850 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Award className="w-3 h-3" />
                                View Publication Certificate
                              </button>
                            )}
                            {ms.status === "Revision Requested" && (
                              <button
                                onClick={() => {
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
                                  setMsSubmissionType(ms.submissionType || "Journal");
                                  setOriginalJournalName(ms.originalJournalName || "");
                                  setOriginalPublicationYear(ms.originalPublicationYear || "");
                                  setMsDoi(ms.doi || "");
                                  setEthicalChecked(!!ms.ethicalApprovalChecked);
                                  setEthicalDetails(ms.ethicalApprovalDetails || "");
                                  setConflictChecked(!!ms.conflictOfInterestChecked);
                                  setConflictDetails(ms.conflictOfInterestDetails || "");
                                  setFundingChecked(!!ms.fundingDisclosuresChecked);
                                  setFundingDetails(ms.fundingDisclosuresDetails || "");
                                  
                                  document.getElementById("submission-form-container")?.scrollIntoView({ behavior: "smooth" });
                                  showToast("Revision setup completed. Modify the fields below and submit.", "success");
                                }}
                                className="px-3 py-1 bg-amber-600 text-white hover:bg-amber-700 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Revise & Resubmit
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* NEW SUBMISSION FORM */}
                <div id="submission-form-container">
                  <form onSubmit={handleSubmitManuscript} className="space-y-4 border-t border-neutral-100 pt-6">
                    {editingManuscriptId ? (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex justify-between items-center animate-fadeIn">
                        <div>
                          <h3 className="text-xs font-mono uppercase font-bold text-amber-800 flex items-center gap-1.5">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Revising Manuscript: ID {editingManuscriptId}
                          </h3>
                          <p className="text-[10px] text-amber-600 mt-0.5">Please modify any requested fields below and resubmit for evaluation.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingManuscriptId(null);
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
                            showToast("Form reset back to new submission mode.", "success");
                          }}
                          className="text-[10px] bg-white border border-amber-200 hover:bg-amber-100 px-3 py-1 text-amber-800 font-mono font-bold uppercase rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel Revision
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-xs font-mono uppercase font-bold text-neutral-400">Submit New Manuscript</h3>
                    )}

                    {/* Dual Submission Pathway Selector */}
                    <div className="space-y-1.5 bg-neutral-50 p-4 border border-neutral-200 rounded-xl">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500 block mb-1">Select Submission Pathway</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMsSubmissionType("Journal")}
                          className={`py-2 px-3 text-xs font-bold uppercase font-mono tracking-wider transition-all border rounded-xl cursor-pointer ${
                            msSubmissionType === "Journal" 
                              ? "bg-black text-white border-black" 
                              : "bg-white text-neutral-500 border-neutral-200 hover:text-black"
                          }`}
                        >
                          Journal Submission
                        </button>
                        <button
                          type="button"
                          onClick={() => setMsSubmissionType("Published")}
                          className={`py-2 px-3 text-xs font-bold uppercase font-mono tracking-wider transition-all border rounded-xl cursor-pointer ${
                            msSubmissionType === "Published" 
                              ? "bg-black text-white border-black" 
                              : "bg-white text-neutral-500 border-neutral-200 hover:text-black"
                          }`}
                        >
                          Published Research
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 font-sans">
                        {msSubmissionType === "Journal" 
                          ? "Submit a new original manuscript to enter Healthedia Scientific Journal double-blind peer-review workflow."
                          : "Claim and index a previously published paper in the Global Archive of Physiological Science (requires verification)."
                        }
                      </p>
                    </div>

                    {/* Published Research Specific Fields */}
                    {msSubmissionType === "Published" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50/50 p-4 border border-neutral-200 rounded-xl animate-fadeIn">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase font-bold text-neutral-500">Original Journal</label>
                          <input
                            type="text"
                            required
                            value={originalJournalName}
                            onChange={(e) => setOriginalJournalName(e.target.value)}
                            placeholder="e.g. Journal of Clinical Physiology"
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase font-bold text-neutral-500">Publication Year</label>
                          <input
                            type="number"
                            required
                            value={originalPublicationYear}
                            onChange={(e) => setOriginalPublicationYear(e.target.value)}
                            placeholder="e.g. 2024"
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase font-bold text-neutral-500">DOI Token (Digital Identifier)</label>
                          <input
                            type="text"
                            required
                            value={msDoi}
                            onChange={(e) => setMsDoi(e.target.value)}
                            placeholder="e.g. 10.1016/j.jphys.2024..."
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-xl font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Manuscript Title</label>
                    <input
                      type="text"
                      required
                      value={msTitle}
                      onChange={(e) => setMsTitle(e.target.value)}
                      placeholder="e.g. Cardiorespiratory Response and Myocardial Strain Under Altitude Stress"
                      className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-bold text-neutral-500">Abstract Description</label>
                    <textarea
                      required
                      rows={5}
                      value={msAbstract}
                      onChange={(e) => setMsAbstract(e.target.value)}
                      placeholder="Summarize the background, methodology, clinical discovery, results, and definitive human performance conclusions..."
                      className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl transition-colors resize-y font-light leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Research Specialty</label>
                      <select
                        value={msSpecialty}
                        onChange={(e) => setMsSpecialty(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl cursor-pointer"
                      >
                        {professionsList.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Journal Category</label>
                      <select
                        value={msJournalCategory}
                        onChange={(e) => setMsJournalCategory(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl cursor-pointer"
                      >
                        {journalCategories.map(jc => (
                          <option key={jc} value={jc}>{jc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Research Type</label>
                      <select
                        value={msResearchType}
                        onChange={(e) => setMsResearchType(e.target.value)}
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl cursor-pointer"
                      >
                        {researchTypes.map(rt => (
                          <option key={rt} value={rt}>{rt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Co-Authors (Comma-separated)</label>
                      <input
                        type="text"
                        value={msCoAuthors}
                        onChange={(e) => setMsCoAuthors(e.target.value)}
                        placeholder="e.g. Dr. Arthur Pendelton, Prof. Marcus Finch"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Keywords (Comma-separated)</label>
                      <input
                        type="text"
                        value={msKeywords}
                        onChange={(e) => setMsKeywords(e.target.value)}
                        placeholder="e.g. hypoxia, stroke volume, altitude"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Institutional Affiliation</label>
                      <input
                        type="text"
                        value={msInstitution}
                        onChange={(e) => setMsInstitution(e.target.value)}
                        placeholder="Harvard Research Centre"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-neutral-500">Country</label>
                      <input
                        type="text"
                        value={msCountry}
                        onChange={(e) => setMsCountry(e.target.value)}
                        placeholder="United Kingdom"
                        className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                      />
                    </div>
                  </div>

                  {/* MANDATORY SUBMISSION CHECKLIST */}
                  <div className="border border-neutral-200/80 bg-neutral-50/40 p-5 sm:p-6 rounded-2xl space-y-6">
                    <div className="border-b border-neutral-100 pb-3">
                      <h4 className="text-xs font-mono uppercase font-bold text-neutral-500 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-black" />
                        Mandatory Compliance & Disclosures Checklist
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                        Authors must review, discuss, and check each of the following ethics and disclosure statements. All three declarations are mandatory prior to finalizing the submission of this manuscript.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* 1. Ethical Approval */}
                      <div className={`p-4 rounded-xl border transition-all ${ethicalChecked ? "border-black bg-white" : "border-neutral-200 bg-neutral-50/20"}`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ethicalChecked}
                            onChange={(e) => setEthicalChecked(e.target.checked)}
                            className="mt-1 border-neutral-300 text-black focus:ring-black accent-black w-4.5 h-4.5 rounded cursor-pointer shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-black font-sans flex items-center gap-1.5">
                              1. Ethical Approval & Human Rights
                            </span>
                            <p className="text-xs text-neutral-500 font-light leading-relaxed">
                              I confirm that this research project has been formally approved by an Institutional Review Board (IRB) or local research ethics committee (or that such formal approval was waived with appropriate justification), and that signed informed consent was obtained from all participants.
                            </p>
                          </div>
                        </label>
                        {ethicalChecked && (
                          <div className="mt-3 pl-7.5 animate-fadeIn">
                            <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Ethical Approval Details / Protocol ID (Optional)</label>
                            <textarea
                              value={ethicalDetails}
                              onChange={(e) => setEthicalDetails(e.target.value)}
                              placeholder="e.g., Kyoto University IRB #2026-991A, informed consent obtained..."
                              rows={2}
                              className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* 2. Conflict of Interest */}
                      <div className={`p-4 rounded-xl border transition-all ${conflictChecked ? "border-black bg-white" : "border-neutral-200 bg-neutral-50/20"}`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={conflictChecked}
                            onChange={(e) => setConflictChecked(e.target.checked)}
                            className="mt-1 border-neutral-300 text-black focus:ring-black accent-black w-4.5 h-4.5 rounded cursor-pointer shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-black font-sans flex items-center gap-1.5">
                              2. Conflict of Interest Disclosure
                            </span>
                            <p className="text-xs text-neutral-500 font-light leading-relaxed">
                              I confirm that all financial, professional, or personal competing interests related to this research have been fully disclosed. If no competing interests exist, I declare so explicitly below.
                            </p>
                          </div>
                        </label>
                        {conflictChecked && (
                          <div className="mt-3 pl-7.5 animate-fadeIn">
                            <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Conflict of Interest Statement / Competing Interests Details</label>
                            <textarea
                              value={conflictDetails}
                              onChange={(e) => setConflictDetails(e.target.value)}
                              placeholder="e.g., The authors declare no competing interests, or list affiliations..."
                              rows={2}
                              className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* 3. Funding Disclosures */}
                      <div className={`p-4 rounded-xl border transition-all ${fundingChecked ? "border-black bg-white" : "border-neutral-200 bg-neutral-50/20"}`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fundingChecked}
                            onChange={(e) => setFundingChecked(e.target.checked)}
                            className="mt-1 border-neutral-300 text-black focus:ring-black accent-black w-4.5 h-4.5 rounded cursor-pointer shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-black font-sans flex items-center gap-1.5">
                              3. Funding & Financial Support Disclosures
                            </span>
                            <p className="text-xs text-neutral-500 font-light leading-relaxed">
                              I confirm that all sources of financial support, research grants, sponsoring agencies, and travel support for this study have been disclosed, and appropriate funding acknowledgments are included.
                            </p>
                          </div>
                        </label>
                        {fundingChecked && (
                          <div className="mt-3 pl-7.5 animate-fadeIn">
                            <label className="block text-[10px] font-mono uppercase font-bold text-neutral-400 mb-1">Grant Acknowledgments / Funding Agencies Details (Optional)</label>
                            <textarea
                              value={fundingDetails}
                              onChange={(e) => setFundingDetails(e.target.value)}
                              placeholder="e.g., Funded by National Science Foundation Grant #NSF-44219..."
                              rows={2}
                              className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 text-black focus:outline-none focus:border-black rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic validation warning */}
                    {(!ethicalChecked || !conflictChecked || !fundingChecked) ? (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Submission is locked. You must review and check all 3 mandatory ethical and disclosure items above.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>All declarations have been addressed. This manuscript is compliant and ready for final submission.</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`w-full text-white text-xs font-mono font-bold uppercase tracking-widest py-3 cursor-pointer transition-colors rounded-xl flex items-center justify-center gap-2 ${
                      editingManuscriptId ? "bg-amber-600 hover:bg-amber-700" : "bg-black hover:bg-neutral-850"
                    }`}
                  >
                    {editingManuscriptId ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Submit Manuscript Revision
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Scientific Manuscript to Board
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

            {/* TAB 4: RESEARCH IMPACT */}
            {activeTab === "impact" && (
              <div className="space-y-8 animate-fadeIn font-sans">
                <div>
                  <h2 className="text-base font-bold font-sans text-black border-b border-neutral-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-black" />
                    Research Impact Analytics
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    Track and audit your scholarly citations, h-index score, and comparative field impact metrics on Healthedia.
                  </p>
                </div>

                {/* Grid stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Citations */}
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Aggregate Citations</span>
                      <h4 className="text-3xl font-mono font-bold text-black">{totalCitations}</h4>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-3 font-light leading-normal">
                      Cumulative citations received across all published manuscripts on Healthedia.
                    </p>
                    <div className="absolute right-4 top-4 p-1.5 bg-neutral-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-black" />
                    </div>
                  </div>

                  {/* calculated platform h-Index */}
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Platform h-Index</span>
                      <h4 className="text-3xl font-mono font-bold text-black">{calculatedHIndex}</h4>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-3 font-light leading-normal">
                      Based on {enrichedUserPapers.length} paper{enrichedUserPapers.length !== 1 ? 's' : ''} with at least {calculatedHIndex} citation{calculatedHIndex !== 1 ? 's' : ''} each.
                    </p>
                    <div className="absolute right-4 top-4 p-1.5 bg-neutral-50 rounded-lg">
                      <Award className="w-4 h-4 text-black" />
                    </div>
                  </div>

                  {/* Avg Citations per Paper */}
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Avg Citations / Paper</span>
                      <h4 className="text-3xl font-mono font-bold text-black">
                        {enrichedUserPapers.length > 0 ? (totalCitations / enrichedUserPapers.length).toFixed(1) : "0.0"}
                      </h4>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-3 font-light leading-normal">
                      Mean citation density across index publications.
                    </p>
                    <div className="absolute right-4 top-4 p-1.5 bg-neutral-50 rounded-lg">
                      <BarChart2 className="w-4 h-4 text-black" />
                    </div>
                  </div>

                  {/* Field-Weighted Impact */}
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Mean FWCI Impact</span>
                      <h4 className="text-3xl font-mono font-bold text-black">{avgFWCI.toFixed(2)}x</h4>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-3 font-light leading-normal">
                      Compared to the global clinical baseline of 1.0x.
                    </p>
                    <div className="absolute right-4 top-4 p-1.5 bg-neutral-50 rounded-lg">
                      <Percent className="w-4 h-4 text-black" />
                    </div>
                  </div>
                </div>

                {/* Growth and Explanation grids */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Timeline bar chart */}
                  <div className="lg:col-span-2 border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <h4 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-black" />
                        <span>Citation velocity trend</span>
                      </h4>
                      <span className="text-[9px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-500 font-bold uppercase">Cumulative</span>
                    </div>

                    <div className="space-y-4">
                      {enrichedUserPapers.length > 0 ? (
                        <div className="flex items-end justify-between h-40 pt-6 px-4 bg-neutral-50 border border-neutral-100 rounded-xl relative">
                          {[2023, 2024, 2025, 2026].map((year) => {
                            const yearCount = enrichedUserPapers.reduce((sum, paper) => {
                              const entry = paper.citationHistory?.find(h => h.year === year);
                              return sum + (entry ? entry.count : 0);
                            }, 0);

                            const maxVal = Math.max(...[2023, 2024, 2025, 2026].map(y => 
                              enrichedUserPapers.reduce((sum, paper) => {
                                const entry = paper.citationHistory?.find(h => h.year === y);
                                return sum + (entry ? entry.count : 0);
                              }, 0)
                            )) || 1;

                            const percent = Math.max(12, Math.round((yearCount / maxVal) * 100));

                            return (
                              <div key={year} className="flex flex-col items-center flex-1 group relative">
                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10 shadow">
                                  {yearCount} Citations
                                </div>
                                <div
                                  style={{ height: `${percent}%` }}
                                  className="w-10 bg-neutral-800 hover:bg-black transition-all rounded-t-md shadow-sm flex items-end justify-center cursor-pointer"
                                ></div>
                                <span className="text-[9px] font-mono text-neutral-500 mt-1.5 font-bold">{year}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="border border-dashed border-neutral-200 p-8 text-center rounded-xl bg-neutral-50">
                          <p className="text-xs text-neutral-400 italic">No publications indexed to plot timeline graph.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm space-y-4">
                    <h4 className="font-mono text-xs uppercase tracking-widest font-extrabold text-neutral-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Registry standings</span>
                    </h4>

                    <div className="space-y-3 text-xs font-sans text-neutral-600 font-light leading-relaxed">
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-0.5">
                        <span className="font-mono text-[8px] text-neutral-400 uppercase font-bold block">Index status</span>
                        <p className="text-[10px] text-neutral-700 leading-normal">
                          Your platform h-index is <strong className="text-black font-mono">{calculatedHIndex}</strong>. This validates that you have {calculatedHIndex} paper{calculatedHIndex !== 1 ? 's' : ''} with at least {calculatedHIndex} citation{calculatedHIndex !== 1 ? 's' : ''} each.
                        </p>
                      </div>

                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-0.5">
                        <span className="font-mono text-[8px] text-neutral-400 uppercase font-bold block">Comparative standing</span>
                        <p className="text-[10px] text-neutral-700 leading-normal">
                          Your field-weighted citation average of <strong className="text-black font-mono">{avgFWCI.toFixed(2)}x</strong> indicates that your research impact ranks {((avgFWCI - 1) * 100).toFixed(0)}% higher than standard field benchmarks on Healthedia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publications Table */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-neutral-400">Indexed Publication Citations Breakdown</h3>
                  {enrichedUserPapers.length === 0 ? (
                    <div className="border border-dashed border-neutral-200 p-6 text-center rounded-xl">
                      <p className="text-xs text-neutral-400 italic">No approved or verified publications indexed yet.</p>
                    </div>
                  ) : (
                    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200 font-mono text-[10px] text-neutral-400 uppercase font-bold">
                              <th className="p-3">Paper Title & Source</th>
                              <th className="p-3">Year</th>
                              <th className="p-3">Subject</th>
                              <th className="p-3 text-right">Citations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {enrichedUserPapers.map((paper) => (
                              <tr key={paper.id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="p-3 min-w-[240px]">
                                  <p className="font-bold text-black leading-tight">{paper.title}</p>
                                  <p className="text-[10px] text-neutral-400 mt-0.5">{paper.journalCategory} • DOI: {paper.doi}</p>
                                </td>
                                <td className="p-3 text-neutral-600">{paper.submittedAt ? paper.submittedAt.split("-")[0] : "2026"}</td>
                                <td className="p-3 text-neutral-600">{paper.specialty}</td>
                                <td className="p-3 text-right font-mono font-bold text-black">{paper.citations}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certificate Rendering Modal */}
            {selectedPaperForCert && (
              <PublicationCertificate
                paper={selectedPaperForCert}
                onClose={() => setSelectedPaperForCert(null)}
              />
            )}

            {/* Professional Verification Dialog Modal */}
            {isVerificationDialogOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scaleUp font-sans">
                  <div className="p-6 border-b border-neutral-150 flex justify-between items-center bg-neutral-50/50">
                    <div>
                      <h3 className="text-sm font-sans font-black uppercase tracking-wider text-black flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-black shrink-0" /> Academic & Professional Verification
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                        Submit credentials to join Healthedia's registry of verified academic investigators.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsVerificationDialogOpen(false)}
                      className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-neutral-400 hover:text-black" />
                    </button>
                  </div>

                  <form onSubmit={handleVerificationSubmit} className="flex-grow flex flex-col">
                    <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                      {/* REQUIREMENTS SECTION */}
                      <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 space-y-2 text-xs">
                        <span className="text-[10px] font-mono uppercase font-black text-black">Verification Requirements</span>
                        <ul className="list-disc list-inside text-[11px] text-neutral-600 space-y-1.5 font-light">
                          <li>A valid national ID, Passport, or government credential file.</li>
                          <li>An official academic diploma, master's/PhD certificate, or clinical licensing license.</li>
                          <li>Authentic authorization matching either your ORCID ID or institutional email.</li>
                        </ul>
                      </div>

                      {/* FILE UPLOAD GRID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Passport ID Upload */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500 block">
                            Passport or National ID
                          </label>
                          <div className="border border-dashed border-neutral-200 hover:border-black rounded-xl p-4 bg-neutral-50/40 text-center relative transition-colors flex flex-col items-center justify-center h-28 cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={handlePassportUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {isPassportUploading ? (
                              <div className="flex flex-col items-center gap-1">
                                <RefreshCw className="w-5 h-5 text-neutral-400 animate-spin" />
                                <span className="text-[10px] font-mono text-neutral-400">Uploading File...</span>
                              </div>
                            ) : passportFileName ? (
                              <div className="space-y-1">
                                <div className="flex justify-center text-black"><CheckCircle className="w-5 h-5" /></div>
                                <span className="text-[11px] font-semibold text-black block truncate max-w-[180px]">{passportFileName}</span>
                                <span className="text-[9px] font-mono text-neutral-400 block">Click to replace</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-center text-neutral-400"><Upload className="w-5 h-5" /></div>
                                <span className="text-xs text-neutral-600 block font-light">Upload ID File</span>
                                <span className="text-[9px] font-mono text-neutral-400 block">PDF, PNG, JPG</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Diploma Upload */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500 block">
                            Academic Diploma / Certificate
                          </label>
                          <div className="border border-dashed border-neutral-200 hover:border-black rounded-xl p-4 bg-neutral-50/40 text-center relative transition-colors flex flex-col items-center justify-center h-28 cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={handleQualificationUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {isQualUploading ? (
                              <div className="flex flex-col items-center gap-1">
                                <RefreshCw className="w-5 h-5 text-neutral-400 animate-spin" />
                                <span className="text-[10px] font-mono text-neutral-400">Uploading File...</span>
                              </div>
                            ) : qualificationFileName ? (
                              <div className="space-y-1">
                                <div className="flex justify-center text-black"><CheckCircle className="w-5 h-5" /></div>
                                <span className="text-[11px] font-semibold text-black block truncate max-w-[180px]">{qualificationFileName}</span>
                                <span className="text-[9px] font-mono text-neutral-400 block">Click to replace</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-center text-neutral-400"><Upload className="w-5 h-5" /></div>
                                <span className="text-xs text-neutral-600 block font-light">Upload Diploma File</span>
                                <span className="text-[9px] font-mono text-neutral-400 block">PDF, PNG, JPG</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* VERIFICATION METHOD */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Validation Method</label>
                          <select
                            value={verificationMethod}
                            onChange={(e) => setVerificationMethod(e.target.value)}
                            className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl cursor-pointer transition-colors"
                          >
                            <option value="orcid">ORCID Academic Authorization</option>
                            <option value="institutional_email">Institutional Email Verification</option>
                            <option value="professional_license">State Medical / Professional License</option>
                          </select>
                        </div>

                        {verificationMethod === "orcid" && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">ORCID Number</label>
                            <input
                              type="text"
                              value={orcid}
                              onChange={(e) => setOrcid(e.target.value)}
                              required
                              placeholder="e.g., 0000-0002-1825-0097"
                              className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                            />
                          </div>
                        )}

                        {verificationMethod === "institutional_email" && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Institutional Email Address</label>
                            <input
                              type="email"
                              value={instEmail}
                              onChange={(e) => setInstEmail(e.target.value)}
                              required
                              placeholder="e.g., user@university.edu"
                              className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                            />
                          </div>
                        )}

                        {verificationMethod === "professional_license" && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">License Number & Registry</label>
                            <input
                              type="text"
                              value={licenseNumber}
                              onChange={(e) => setLicenseNumber(e.target.value)}
                              required
                              placeholder="e.g., GMC #729103 or State Board #9112"
                              className="w-full text-xs border border-neutral-200 bg-white py-2.5 px-3 text-black focus:outline-none focus:border-black rounded-xl"
                            />
                          </div>
                        )}
                      </div>

                      {/* TERMS & ACKNOWLEDGEMENT */}
                      <div className="pt-2">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                          />
                          <span className="text-[11px] text-neutral-500 font-light leading-normal">
                            I solemnly attest that the passport details match my physical identity and the academic diploma represents qualification coursework fully completed. I understand that false credentials will result in immediate exclusion from the registry.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
                      <button
                        type="button"
                        onClick={() => setIsVerificationDialogOpen(false)}
                        className="text-neutral-500 hover:text-black text-xs font-mono font-bold uppercase px-4 py-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!passportFileName || !qualificationFileName || !termsAccepted}
                        className={`text-xs font-mono font-bold uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-sm ${
                          passportFileName && qualificationFileName && termsAccepted
                            ? "bg-black text-white hover:bg-neutral-850 cursor-pointer"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                      >
                        Submit For Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
