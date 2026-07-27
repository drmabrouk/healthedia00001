import { UserProfileData, Manuscript, SupportTicket, TaxonomyItem, Institution, InstitutionEvaluation, AdminInstitutionConfig, EvaluationCriterion } from "../types";
import { INITIAL_PAPERS } from "../data";
import { generateSitemap, generateSitemapXmlString as serviceGenerateSitemapXmlString } from "../services/sitemapService";

// Default professional categories requested by the user
export const DEFAULT_PROFESSIONS = [
  "Physician", "Surgeon", "Dermatologist", "Cardiologist", "Neurologist", "Orthopedic Surgeon",
  "Pediatrician", "Psychiatrist", "Dentist", "Pharmacist", "Nurse", "Physical Therapist",
  "Sports Physical Therapist", "Sports Rehabilitation Specialist", "Sports Medicine Physician",
  "Athletic Trainer", "Sports Scientist", "Exercise Physiologist", "Exercise Specialist",
  "Strength & Conditioning Coach", "Personal Trainer", "Sports Nutritionist", "Clinical Nutritionist",
  "Dietitian", "Public Health Specialist", "Occupational Therapist", "Speech Therapist",
  "Psychologist", "Sports Psychologist", "Biomechanist", "Kinesiologist", "Medical Researcher",
  "Clinical Researcher", "University Professor", "Lecturer", "Medical Student", "Physiotherapy Student",
  "Healthcare Professional"
];

// Initial taxonomies mapping
export const DEFAULT_TAXONOMIES: { [key: string]: string[] } = {
  medicalSpecialties: ["Cardiology", "Neurology", "Dermatology", "Orthopedic Surgery", "Pediatrics", "Psychiatry", "General Medicine"],
  sportsScienceDisciplines: ["Exercise Physiology", "Biomechanics", "Kinesiology", "Sports Nutrition", "Athletic Conditioning"],
  humanPerformanceFields: ["Endurance Kinetics", "Muscle Hypertrophy", "Sleep Optimization", "Recovery Kinetics"],
  researchCategories: ["Clinical Trials", "Meta-Analyses", "Systematic Reviews", "Observational Cohorts"],
  researchSubjects: ["Cardiorespiratory adaptations", "Eccentric Overload", "Sarcopenia prevention", "Running gait deviations"],
  journalCategories: ["Original Research", "Systematic Review", "Editorial Letter", "Case Report"],
  keywords: ["HIIT", "VO2max", "Sarcopenia", "Achilles Tendinopathy", "Melatonin", "Biomechanics"],
  institutions: ["Healthedia Institute", "Sorbonne University", "Kyoto University", "Sydney University", "Harvard Medical School"],
  countries: ["United Kingdom", "United States", "Japan", "France", "Australia", "Canada", "Germany", "Russian Federation"],
  academicDegrees: ["M.D.", "Ph.D.", "M.S.", "B.S.", "D.P.T.", "B.P.T."],
  publicationTypes: ["Journal Article", "Review Paper", "Conference Proceeding", "Consensus Guideline"],
  researchTypes: ["Randomized Controlled Trial", "Systematic Review", "Meta-Analysis", "Cohort Study", "Case Study"]
};

// Seed demo users representing the 4 levels of RBAC
export const DEMO_USERS: UserProfileData[] = [
  {
    email: "admin@healthedia.org",
    name: "Alistair Vance",
    username: "alistair-vance",
    role: "Admin",
    status: "Active",
    joinedAt: "2024-03-12",
    profession: "University Professor",
    title: "Prof. Dr.",
    specialty: "Biomechanics & Kinesiology",
    institution: "University of Edinburgh",
    country: "United Kingdom",
    degree: "Ph.D. in Biomechanics",
    orcid: "0000-0003-8822-1044",
    bio: "Chief System Administrator and Biomechanical section editor for the Healthedia Global Archive.",
    qualifications: ["Ph.D. in Computer Vision & Gait Analysis", "Postdoctoral fellowship at MIT Human Lab"],
    researchInterests: ["Biomechanics", "Running Gait", "Machine Learning"],
    publications: ["paper-004"],
    awards: ["Royal Academy Research Award (2023)"],
    certifications: ["Board Certified Biomechanist"],
    verified: true,
    verificationSubmitted: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  },
  {
    email: "reviewer@healthedia.org",
    name: "Elena Rostova",
    username: "elena-rostova",
    role: "Reviewer",
    status: "Active",
    joinedAt: "2024-05-18",
    profession: "Sports Medicine Physician",
    title: "Dr. med.",
    specialty: "Cardiology & Sports Medicine",
    institution: "Saint Petersburg State Research Institute",
    country: "Russian Federation",
    degree: "Doctor of Medicine (M.D.)",
    orcid: "0000-0002-4411-9034",
    bio: "Associate Editor and head of cardiac reconditioning reviews.",
    qualifications: ["Residency in Cardiology", "Fellowship in Elite Human Performance Sports Physiology"],
    researchInterests: ["Cardiology", "Sleep Architecture", "Post-viral recovery"],
    publications: ["paper-005", "paper-006"],
    awards: ["Outstanding Editor Commendation (2025)"],
    certifications: ["Advanced Cardiac Life Support Instructor"],
    verified: true,
    verificationSubmitted: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
  },
  {
    email: "researcher@healthedia.org",
    name: "Evelyn Thorne",
    username: "evelyn-thorne",
    role: "Researcher",
    status: "Active",
    joinedAt: "2024-08-01",
    profession: "Exercise Physiologist",
    title: "Dr.",
    specialty: "Sports Science & Physiology",
    institution: "Kyoto University School of Medicine",
    country: "Japan",
    degree: "Ph.D. in Cellular Physiology",
    orcid: "0000-0002-1204-9844",
    bio: "Senior health performance and clinical medicine researcher specialized in high-intensity interval training cardiovascular adaptations.",
    qualifications: ["Ph.D. in Kinesiology", "Board Certification in Sports Cardiology"],
    researchInterests: ["Endurance physiology", "Myocardial strain dynamics"],
    publications: ["paper-001", "paper-003", "paper-006"],
    awards: ["Fellowship of Sports Science Society (2025)"],
    certifications: ["ACLS Expert"],
    verified: true,
    verificationSubmitted: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
  },
  {
    email: "member@healthedia.org",
    name: "Mabrouk Al-Sharif",
    username: "mabrouk-al-sharif",
    role: "Member",
    status: "Active",
    joinedAt: "2026-07-15",
    profession: "Medical Student",
    title: "Mr.",
    specialty: "General Medicine",
    institution: "Cairo University Faculty of Medicine",
    country: "Egypt",
    degree: "M.B.B.S. Candidate",
    orcid: "",
    bio: "Aspiring clinical investigator focusing on orthopedic rehabilitation and sports medicine.",
    qualifications: [],
    researchInterests: ["Physical Therapy", "Kinesiology"],
    publications: [],
    awards: [],
    certifications: [],
    verified: false,
    verificationSubmitted: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  }
];

// Initial Manuscripts for review
export const INITIAL_MANUSCRIPTS: Manuscript[] = [
  {
    id: "ms-001",
    title: "Kinetic Profiles of Quadriceps Activation in Eccentric Leg Extensions: A High-Density EMG Study",
    abstract: "This study details the neuromuscular activation patterns of the vastus lateralis and rectus femoris during high-load eccentric extensions. We tested 20 resistance-trained males over a 6-week protocol. Surface electromyography revealed significant increases in localized high-frequency motor unit firing rates compared to standard concentric actions.",
    authors: ["Mabrouk Al-Sharif", "Dr. Marc Dubois"],
    authorEmail: "member@healthedia.org", // Belongs to a Member, approving this will trigger auto-promotion!
    journalCategory: "Original Research",
    researchType: "Randomized Controlled Trial",
    specialty: "Biomechanics & Kinesiology",
    institution: "Cairo University Faculty of Medicine",
    country: "Egypt",
    keywords: ["EMG", "Eccentric loading", "Vastus lateralis", "Neuromuscular adaptation"],
    submittedAt: "2026-07-12",
    status: "Under Review"
  },
  {
    id: "ms-002",
    title: "Mitigating Oxidative Stress via Nutritional Intervention: A Review of Exogenous Antioxidant Ingestion in Ultra-Marathon Runners",
    abstract: "Exogenous supplementation of high-dose vitamin C and E is commonplace in endurance athletes. This systematic analysis aggregates 14 trials to quantify biomarkers of skeletal muscle lipid peroxidation and serum inflammatory signaling. Evidence suggests high dose supplementation blunts beneficial hermetic adaptive responses.",
    authors: ["Jean-Luc Picard", "Dr. Evelyn Thorne"],
    authorEmail: "jeanluc@starfleet.org",
    journalCategory: "Systematic Review",
    researchType: "Systematic Review",
    specialty: "Sports Nutrition",
    institution: "Sorbonne University",
    country: "France",
    keywords: ["Oxidative Stress", "Antioxidants", "Ultra-endurance", "Hermesis"],
    submittedAt: "2026-07-14",
    status: "Under Review"
  }
];

// Initial Support Tickets
export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "ticket-101",
    category: "Publication Error",
    title: "Incorrect ORCID linking on paper-001",
    description: "My profile name matches the authors of paper-001, but the system is not linking my custom credentials correctly. Please review and update.",
    status: "Pending",
    createdAt: "2026-07-14T10:00:00Z",
    userEmail: "member@healthedia.org"
  },
  {
    id: "ticket-102",
    category: "Identity Vetting",
    title: "Verification status update request",
    description: "I submitted my state medical board license GMC #729103, but my profile still indicates unverified status. Please audit this soon as I have a paper to submit.",
    status: "In Progress",
    createdAt: "2026-07-13T14:30:00Z",
    userEmail: "reviewer@healthedia.org"
  }
];

export const INITIAL_APPEARANCE = {
  themeName: "Classic Slate",
  colorAccent: "#171717", // Neutral-900
  colorAccentLight: "#f5f5f5", // Neutral-100
  colorBg: "#ffffff",
  fontFamily: "Inter & Space Grotesk",
  brandingText: "Healthedia",
  heroTitle: "The Global Health & Performance Archive",
  heroSubtitle: "A peer-reviewed, open-access academic resource indexing sports science, cardiology, physical therapy, biomechanics, and human physiology.",
  navStyle: "minimalist"
};

export const DEFAULT_EVALUATION_CRITERIA: EvaluationCriterion[] = [
  { id: "edu_quality", name: "Education Quality", question: "How would you rate the academic standards, curriculum, and clinical mentorship?", weight: 15 },
  { id: "res_quality", name: "Research Quality", question: "Rate the research infrastructure, laboratory facilities, and access to funding.", weight: 15 },
  { id: "reputation", name: "Academic Reputation", question: "How well is the institution recognized globally in clinical and sports science circles?", weight: 10 },
  { id: "clinical_train", name: "Clinical Training", question: "Rate the hands-on patient care training and medical residency simulation standards.", weight: 10 },
  { id: "healthcare_serv", name: "Healthcare Services", question: "Rate the caliber of affiliated teaching hospitals and specialized patient clinics.", weight: 10 },
  { id: "faculty_qual", name: "Faculty Quality", question: "How would you rate the teaching credentials, research citations, and helpfulness of professors?", weight: 10 },
  { id: "scientific_out", name: "Scientific Output", question: "Rate the volume of high-impact peer-reviewed publications and clinical trials.", weight: 10 },
  { id: "student_exp", name: "Student Experience", question: "Rate the campus resources, student wellness support, and alumni networking opportunities.", weight: 5 },
  { id: "innovation", name: "Innovation & Patents", question: "How would you rate their medical device designs, therapeutic discoveries, and patents?", weight: 10 },
  { id: "int_collab", name: "International Collaboration", question: "How active are their collaborative frameworks with WHO and global research universities?", weight: 5 }
];

export const DEFAULT_INSTITUTION_CONFIG: AdminInstitutionConfig = {
  institutionTypes: ["Medical School", "Research Institute", "Public Health Agency", "Sports Science Center", "Rehabilitation Clinic", "University Hospital"],
  medicalCategories: ["Cardiology", "Neurology", "Sports Medicine", "Human Performance", "Orthopedic Rehabilitation", "General Medicine", "Oncology", "Pediatrics", "Immunology"],
  evaluationCriteria: DEFAULT_EVALUATION_CRITERIA,
  evaluationWeight: 60, // 60% evaluations, 40% research metrics
  researchMetricsWeight: 40,
  duplicateExactName: true,
  duplicateWebsite: true,
  duplicateSameCityCountry: true,
  minEvaluatorRole: "Member",
  autoVerifyAffiliations: false
};

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: "harvard-medical-school",
    name: "Harvard Medical School",
    officialName: "Harvard Medical School Faculty of Medicine",
    shortName: "HMS",
    country: "United States",
    city: "Boston",
    website: "https://hms.harvard.edu",
    logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=200",
    institutionType: "Medical School",
    description: "Harvard Medical School is the graduate medical school of Harvard University, renowned worldwide for premium education, scientific breakthroughs, and affiliated clinical systems like Mass General.",
    history: "Founded in 1782, HMS has shaped medical education for centuries. Breakthroughs include early anesthesia discovery, the first human organ transplant, and polio vaccine research.",
    faculties: ["Department of Cell Biology", "Department of Genetics", "Department of Neurobiology", "Department of Systems Biology"],
    specialties: ["Neurology", "Cardiology", "Oncology", "Pediatrics", "Gene Therapy", "General Medicine"],
    phone: "+1 617-432-1000",
    email: "admissions@hms.harvard.edu",
    address: "25 Shattuck St, Boston, MA 02115, USA",
    status: "Approved",
    submittedBy: "admin@healthedia.org",
    submittedAt: "2024-01-10",
    customStats: {
      publishedPapers: 420,
      verifiedResearchers: 12,
      activeProjects: 85,
      medicalPrograms: 18
    }
  },
  {
    id: "sorbonne-university-medicine",
    name: "Sorbonne University Faculty of Medicine",
    officialName: "Sorbonne Université Faculté de Médecine",
    shortName: "Sorbonne Medicine",
    country: "France",
    city: "Paris",
    website: "https://sante.sorbonne-universite.fr",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=200",
    institutionType: "Medical School",
    description: "One of the premier medical faculties in Europe, integrating fundamental bio-medical research with clinical practice alongside teaching hospitals like Pitié-Salpêtrière.",
    history: "Constructed on centuries of Parisian academic history, the modern faculty was consolidated to lead European clinical trials, sports science kinetics, and neuroscience projects.",
    faculties: ["Department of Sports Science", "Department of Cardiovascular Physiology", "Department of Immunology"],
    specialties: ["Sports Medicine", "Cardiology", "Neurology", "Immunology", "Orthopedic Rehabilitation"],
    phone: "+33 1 40 46 22 11",
    email: "contact@sorbonne.fr",
    address: "91 Boulevard de l'Hôpital, 75013 Paris, France",
    status: "Approved",
    submittedBy: "reviewer@healthedia.org",
    submittedAt: "2024-03-22",
    customStats: {
      publishedPapers: 280,
      verifiedResearchers: 8,
      activeProjects: 45,
      medicalPrograms: 12
    }
  },
  {
    id: "kyoto-university-medicine",
    name: "Kyoto University School of Medicine",
    officialName: "Kyoto University Graduate School of Medicine",
    shortName: "Kyoto Med",
    country: "Japan",
    city: "Kyoto",
    website: "https://www.med.kyoto-u.ac.jp",
    logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200",
    institutionType: "Research Institute",
    description: "A world-class research hub leading stem cell discoveries, cellular physiology, and surgical rehabilitation. Pioneer of induced pluripotent stem (iPS) cells.",
    history: "Founded in 1899, the medical center has trained Nobel laureates Tasuku Honjo (immunotherapy) and Shinya Yamanaka (reprogrammed stem cells).",
    faculties: ["Department of Physiology", "Center for iPS Cell Research", "Department of Orthopedic Surgery"],
    specialties: ["Human Performance", "Sports Science & Physiology", "Orthopedic Surgery", "Stem Cell Therapy"],
    phone: "+81 75-753-7531",
    email: "med-info@kyoto-u.ac.jp",
    address: "Yoshidakonoecho, Sakyo Ward, Kyoto, 606-8501, Japan",
    status: "Approved",
    submittedBy: "researcher@healthedia.org",
    submittedAt: "2024-05-14",
    customStats: {
      publishedPapers: 310,
      verifiedResearchers: 9,
      activeProjects: 55,
      medicalPrograms: 10
    }
  },
  {
    id: "cairo-university-medicine",
    name: "Cairo University Faculty of Medicine",
    officialName: "Cairo University Faculty of Medicine (Kasr Al-Ainy)",
    shortName: "Kasr Al-Ainy",
    country: "Egypt",
    city: "Cairo",
    website: "https://medicine.cu.edu.eg",
    logo: "https://images.unsplash.com/photo-1562774053-f5a02f6dab61?auto=format&fit=crop&q=80&w=200",
    institutionType: "Medical School",
    description: "The historical cornerstone of medical practice and clinical training in the Nile valley, recognized as the oldest and largest medical school in North Africa.",
    history: "Established in 1827 under the direction of French surgeon Antoine Clot Bey, Kasr Al-Ainy has served as Egypt's flagship hospital and medical researcher training facility.",
    faculties: ["Department of Orthopedic Rehabilitation", "Department of Sports Medicine", "Department of Clinical Anatomy"],
    specialties: ["General Medicine", "Physical Therapy", "Kinesiology", "Orthopedic Rehabilitation"],
    phone: "+20 2 23640000",
    email: "dean@kasralainy.edu.eg",
    address: "Al-Saray St, El-Manial, Cairo, Egypt",
    status: "Approved",
    submittedBy: "member@healthedia.org",
    submittedAt: "2024-06-01",
    customStats: {
      publishedPapers: 150,
      verifiedResearchers: 4,
      activeProjects: 20,
      medicalPrograms: 14
    }
  }
];

export const INITIAL_EVALUATIONS: InstitutionEvaluation[] = [
  {
    id: "eval-001",
    institutionId: "harvard-medical-school",
    userEmail: "admin@healthedia.org",
    userName: "Prof. Dr. Alistair Vance",
    userRelationship: "Faculty",
    isVerified: true,
    submittedAt: "2024-02-15",
    scores: {
      edu_quality: 10,
      res_quality: 10,
      reputation: 10,
      clinical_train: 9,
      healthcare_serv: 9,
      faculty_qual: 10,
      scientific_out: 10,
      student_exp: 9,
      innovation: 10,
      int_collab: 10
    },
    comments: "HMS provides unrivaled research systems and faculty collaboration. Peer networks are excellent, and the emphasis on cellular innovation is unparalleled."
  },
  {
    id: "eval-002",
    institutionId: "harvard-medical-school",
    userEmail: "reviewer@healthedia.org",
    userName: "Dr. Elena Rostova",
    userRelationship: "Affiliated Clinician",
    isVerified: true,
    submittedAt: "2024-04-01",
    scores: {
      edu_quality: 9,
      res_quality: 10,
      reputation: 10,
      clinical_train: 10,
      healthcare_serv: 10,
      faculty_qual: 9,
      scientific_out: 10,
      student_exp: 8,
      innovation: 9,
      int_collab: 9
    },
    comments: "Clinical training rotations across Mass General are outstanding. Heavy emphasis is placed on clinical research translational protocols."
  },
  {
    id: "eval-003",
    institutionId: "sorbonne-university-medicine",
    userEmail: "researcher@healthedia.org",
    userName: "Dr. Evelyn Thorne",
    userRelationship: "Researcher",
    isVerified: true,
    submittedAt: "2024-05-10",
    scores: {
      edu_quality: 9,
      res_quality: 9,
      reputation: 9,
      clinical_train: 9,
      healthcare_serv: 8,
      faculty_qual: 9,
      scientific_out: 9,
      student_exp: 9,
      innovation: 8,
      int_collab: 9
    },
    comments: "Superb research framework and a highly supportive team. Located in the heart of clinical medicine in France."
  },
  {
    id: "eval-004",
    institutionId: "kyoto-university-medicine",
    userEmail: "researcher@healthedia.org",
    userName: "Dr. Evelyn Thorne",
    userRelationship: "Researcher",
    isVerified: true,
    submittedAt: "2024-06-22",
    scores: {
      edu_quality: 9,
      res_quality: 10,
      reputation: 9,
      clinical_train: 8,
      healthcare_serv: 8,
      faculty_qual: 10,
      scientific_out: 10,
      student_exp: 8,
      innovation: 10,
      int_collab: 9
    },
    comments: "The cellular and physiological physiology labs are world leaders. Access to cutting-edge iPS equipment makes Kyoto a premier research choice."
  }
];

// Database key mapper to translate local storage keys to backend REST endpoint collections
const KEY_MAP: Record<string, string> = {
  "healthedia_users": "users",
  "healthedia_professions": "professions",
  "healthedia_taxonomies": "taxonomies",
  "healthedia_manuscripts": "manuscripts",
  "healthedia_tickets": "tickets",
  "healthedia_appearance": "appearance",
  "healthedia_institutions": "institutions",
  "healthedia_evaluations": "evaluations",
  "healthedia_institution_config": "institutionConfig",
  "healthedia_projects": "projects",
  "healthedia_activity_logs": "activityLogs",
  "healthedia_activitylogs": "activityLogs",
  "healthedia_pages": "pages",
  "healthedia_redirects": "redirects",
  "healthedia_seo_settings": "seoSettings",
  "healthedia_published_papers": "published_papers"
};

/**
 * Initializer for all local storage parameters
 */
export function initializeTaxonomyStore() {
  // Sync client-side cache from the server-side persistent database
  fetch("/api/db")
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error("Server offline");
    })
    .then((db) => {
      let isFirstBoot = false;
      for (const [localStorageKey, dbKey] of Object.entries(KEY_MAP)) {
        if (db[dbKey] !== undefined) {
          if (!localStorage.getItem(localStorageKey)) {
            isFirstBoot = true;
          }
          localStorage.setItem(localStorageKey, JSON.stringify(db[dbKey]));
        }
      }
      console.log("[DB Synchronized] Client cache successfully synchronized with persistent backend database.");
      if (isFirstBoot) {
        triggerAutomatedSitemapUpdate();
      }
    })
    .catch((err) => {
      console.warn("[DB Fallback] Express database is offline, running in offline-first cached mode:", err);
    });

  // Load fallback values if offline and completely unseeded
  if (!localStorage.getItem("healthedia_users")) {
    localStorage.setItem("healthedia_users", JSON.stringify(DEMO_USERS));
  }
  if (!localStorage.getItem("healthedia_professions")) {
    localStorage.setItem("healthedia_professions", JSON.stringify(DEFAULT_PROFESSIONS));
  }
  if (!localStorage.getItem("healthedia_taxonomies")) {
    localStorage.setItem("healthedia_taxonomies", JSON.stringify(DEFAULT_TAXONOMIES));
  }
  if (!localStorage.getItem("healthedia_manuscripts")) {
    localStorage.setItem("healthedia_manuscripts", JSON.stringify(INITIAL_MANUSCRIPTS));
  }
  if (!localStorage.getItem("healthedia_tickets")) {
    localStorage.setItem("healthedia_tickets", JSON.stringify(INITIAL_TICKETS));
  }
  if (!localStorage.getItem("healthedia_appearance")) {
    localStorage.setItem("healthedia_appearance", JSON.stringify(INITIAL_APPEARANCE));
  }
  if (!localStorage.getItem("healthedia_institutions")) {
    localStorage.setItem("healthedia_institutions", JSON.stringify(INITIAL_INSTITUTIONS));
  }
  if (!localStorage.getItem("healthedia_evaluations")) {
    localStorage.setItem("healthedia_evaluations", JSON.stringify(INITIAL_EVALUATIONS));
  }
  if (!localStorage.getItem("healthedia_institution_config")) {
    localStorage.setItem("healthedia_institution_config", JSON.stringify(DEFAULT_INSTITUTION_CONFIG));
  }
}

import { db } from "./db";

/**
 * Get item from local storage using centralized db service
 */
export function getStoredItem<T>(key: string, fallback: T): T {
  return db.read<T>(key, fallback);
}

/**
 * Set item in local storage using centralized db service
 */
export function setStoredItem<T>(key: string, data: T) {
  db.write<T>(key, data);
}

/**
 * Generates dynamic, fully compliant XML Sitemap representing all published system pages, 
 * research papers, verified researchers, approved institutions, and academic courses.
 * (Delegate calling core sitemapService module)
 */
export function generateSitemapXmlString(): string {
  return serviceGenerateSitemapXmlString();
}

/**
 * Sends the dynamic sitemap XML code to the server's backend api to instantly write to sitemap.xml.
 * (Delegate calling core sitemapService module)
 */
export async function triggerAutomatedSitemapUpdate(): Promise<boolean> {
  try {
    const xml = generateSitemap();
    const response = await fetch("/api/sitemap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml })
    });
    return response.ok;
  } catch (error) {
    console.error("[Sitemap Sync] Failed to post automated sitemap update to server:", error);
    return false;
  }
}

/**
 * Sends the updated robots.txt rules to the server's backend api to instantly write to robots.txt.
 */
export async function triggerAutomatedRobotsUpdate(robotsTxt: string): Promise<boolean> {
  try {
    const response = await fetch("/api/robots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ robots: robotsTxt })
    });
    
    if (response.ok) {
      console.log("[Robots Auto-Sync] Server robots.txt successfully synchronized.");
      return true;
    } else {
      console.warn("[Robots Auto-Sync] Server returned error status updating robots.txt:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("[Robots Auto-Sync] Failed to post automated robots update to server:", error);
    return false;
  }
}
