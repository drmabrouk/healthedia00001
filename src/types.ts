export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  specialty: string;
  institution: string;
  country: string;
  language: string;
  researchType: string; // e.g., "Randomized Controlled Trial", "Systematic Review", "Meta-Analysis", "Cohort Study"
  doi: string;
  abstract: string;
  keywords: string[];
  pdfUrl?: string;
  doiUrl?: string;
  citations?: number;
  authorHIndex?: number;
  citationHistory?: { year: number; count: number }[];
  fieldWeightedImpact?: number;
}

export interface Course {
  id: string;
  title: string;
  instructorId: string;
  instructorName: string;
  category: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  coverImage: string;
  description: string;
}

export interface Researcher {
  id: string;
  name: string;
  title: string; // e.g., "Dr.", "Prof.", "Researcher"
  avatar?: string;
  specialty: string;
  country: string;
  institution: string;
  degree: string;
  orcid: string;
  bio: string;
  qualifications: string[];
  researchInterests: string[];
  publications: string[]; // List of paper IDs or titles
  awards: string[];
  certifications: string[];
  googleScholar?: string;
  researchGate?: string;
  scopus?: string;
  verified: boolean;
  email: string;
}

export interface SupportTicket {
  id: string;
  category: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
  userEmail: string;
}

export type UserRole = "Admin" | "Reviewer" | "Researcher" | "Member";

export interface UserProfileData {
  email: string;
  name: string;
  username?: string; // SEO-friendly username, e.g. "evelyn-thorne"
  role?: UserRole;   // Admin, Reviewer, Researcher, Member
  status?: "Active" | "Suspended";
  joinedAt?: string;
  profession?: string; // Selected from customizable professional categories
  title: string;
  specialty: string;
  institution: string;
  country: string;
  degree: string;
  orcid: string;
  bio: string;
  qualifications: string[];
  researchInterests: string[];
  publications: string[];
  awards: string[];
  certifications: string[];
  googleScholar?: string;
  researchGate?: string;
  scopus?: string;
  verified: boolean;
  verificationSubmitted: boolean;
  verificationMethod?: string;
  avatar?: string;
  cvName?: string;
  researcherApplicationStatus?: "Pending" | "Approved" | "Rejected";

  // New Profile Details
  firstName?: string;
  lastName?: string;
  gender?: string;
  nationality?: string;
  countryOfResidence?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  academicTitle?: string;
  academicSpecialization?: string;
  professionalSpecialization?: string;
  institutionalAffiliation?: string;
  highestAcademicDegree?: string;
  yearOfGraduation?: string;
  degreesList?: { degree: string; year: number }[];
  researcherId?: string;

  // New Professional Details
  biographyEn?: string;
  biographyAr?: string;
  biographyFr?: string;
  biographyDe?: string;
  awardsList?: { title: string; year: number }[];
  spokenLanguage?: string;
  secondLanguage?: string;

  // Privacy Options
  privacyShowPhone?: boolean;
  privacyShowEmail?: boolean;
  privacyShowBio?: boolean;
  privacyShowAwards?: boolean;
  privacyShowInDirectory?: boolean;
  profileViews?: number;

  // Verification Documents
  passportFileName?: string;
  qualificationFileName?: string;
}

export interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  authorEmail: string; // To link for automatic promotion
  journalCategory: string;
  researchType: string;
  specialty: string;
  institution: string;
  country: string;
  keywords: string[];
  submittedAt: string;
  status: "Under Review" | "Revision Requested" | "Approved" | "Rejected" | "Pending Verification";
  reviewerNotes?: string;
  submissionType?: "Published" | "Journal";
  originalJournalName?: string;
  originalPublicationYear?: string;
  doi?: string;
  ethicalApprovalChecked?: boolean;
  ethicalApprovalDetails?: string;
  conflictOfInterestChecked?: boolean;
  conflictOfInterestDetails?: string;
  fundingDisclosuresChecked?: boolean;
  fundingDisclosuresDetails?: string;
}

export interface TaxonomyItem {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface TaxonomyMap {
  [categoryKey: string]: TaxonomyItem[];
}

export interface InstitutionEvaluation {
  id: string;
  institutionId: string;
  userEmail: string;
  userName: string;
  userRelationship: "Faculty" | "Researcher" | "Staff" | "Student" | "Alumni" | "Affiliated Clinician";
  isVerified: boolean;
  submittedAt: string;
  scores: {
    [criterionId: string]: number; // 0 to 10
  };
  comments?: string;
}

export interface Institution {
  id: string;
  name: string;
  officialName: string;
  shortName?: string;
  country: string;
  city: string;
  website: string;
  logo: string;
  institutionType: string;
  description: string;
  history: string;
  faculties: string[];
  specialties: string[];
  phone?: string;
  email?: string;
  address?: string;
  status: "Approved" | "Pending" | "Rejected" | "Revision Requested" | "Duplicate Flagged";
  submittedBy?: string;
  submittedAt: string;
  isDuplicate?: boolean;
  duplicateNotes?: string;
  reviewerNotes?: string;
  customStats?: {
    publishedPapers?: number;
    verifiedResearchers?: number;
    activeProjects?: number;
    medicalPrograms?: number;
  };
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  question: string;
  weight: number; // 0 to 100
}

export interface AdminInstitutionConfig {
  institutionTypes: string[];
  medicalCategories: string[];
  evaluationCriteria: EvaluationCriterion[];
  evaluationWeight: number; // percentage of overall score (e.g. 60)
  researchMetricsWeight: number; // percentage of overall score (e.g. 40)
  duplicateExactName: boolean;
  duplicateWebsite: boolean;
  duplicateSameCityCountry: boolean;
  minEvaluatorRole: "Member" | "Researcher" | "Reviewer" | "Admin";
  autoVerifyAffiliations: boolean;
}

export interface NotificationItem {
  id: string;
  type: "verification_approved" | "verification_rejected" | "role_changed" | "research_received" | "research_approved" | "research_rejected" | "revision_requested" | "reviewer_comments" | "institution_approved" | "institution_rejected" | "support_update" | "administrative" | "security";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetPage: string;
  targetDetails?: { id?: string; username?: string };
}

