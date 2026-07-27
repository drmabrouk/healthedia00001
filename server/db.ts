import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "db.json");

// Define TypeScript structures for Database Store
export interface DatabaseStore {
  users: any[];
  professions: string[];
  taxonomies: Record<string, string[]>;
  manuscripts: any[];
  tickets: any[];
  appearance: any;
  institutions: any[];
  evaluations: any[];
  institutionConfig: any;
  projects: any[];
  activityLogs: any[];
  pages: any[];
  redirects: any[];
  seoSettings: any;
  published_papers: any[];
  systemSettings: any;
}

const DEFAULT_SYSTEM_SETTINGS = {
  websiteName: "Healthedia",
  websiteDescription: "A peer-reviewed, open-access academic resource indexing sports science, cardiology, physical therapy, biomechanics, and human physiology.",
  organizationName: "Healthedia Global Archive",
  organizationAddress: "91 Boulevard de l'Hôpital, 75013 Paris, France",
  contactEmail: "contact@healthedia.org",
  contactPhone: "+33 1 40 46 22 11",
  defaultLanguage: "en-US",
  timeZone: "UTC",
  dateTimeFormat: "YYYY-MM-DD HH:mm:ss",
  emailHost: "smtp.healthedia.org",
  emailPort: 587,
  emailUsername: "dispatch@healthedia.org",
  emailSenderName: "Healthedia Automated Dispatch",
  maxFileUploadSizeMB: 15,
  allowedFileTypes: ".pdf,.doc,.docx,.png,.jpg",
  storageProvider: "Local Disk Serialized Stream",
  cacheEnabled: true,
  cacheTTL: 3600,
  sessionTimeoutMin: 120,
  maintenanceMode: false,
  debugMode: false
};

// Default Professional categories
const DEFAULT_PROFESSIONS = [
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
const DEFAULT_TAXONOMIES = {
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
const DEMO_USERS = [
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

const INITIAL_MANUSCRIPTS = [
  {
    id: "ms-001",
    title: "Kinetic Profiles of Quadriceps Activation in Eccentric Leg Extensions: A High-Density EMG Study",
    abstract: "This study details the neuromuscular activation patterns of the vastus lateralis and rectus femoris during high-load eccentric extensions. We tested 20 resistance-trained males over a 6-week protocol. Surface electromyography revealed significant increases in localized high-frequency motor unit firing rates compared to standard concentric actions.",
    authors: ["Mabrouk Al-Sharif", "Dr. Marc Dubois"],
    authorEmail: "member@healthedia.org",
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

const INITIAL_TICKETS = [
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

const INITIAL_APPEARANCE = {
  themeName: "Classic Slate",
  colorAccent: "#171717",
  colorAccentLight: "#f5f5f5",
  colorBg: "#ffffff",
  fontFamily: "Inter & Space Grotesk",
  brandingText: "Healthedia",
  heroTitle: "The Global Health & Performance Archive",
  heroSubtitle: "A peer-reviewed, open-access academic resource indexing sports science, cardiology, physical therapy, biomechanics, and human physiology.",
  navStyle: "minimalist"
};

const DEFAULT_EVALUATION_CRITERIA = [
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

const DEFAULT_INSTITUTION_CONFIG = {
  institutionTypes: ["Medical School", "Research Institute", "Public Health Agency", "Sports Science Center", "Rehabilitation Clinic", "University Hospital"],
  medicalCategories: ["Cardiology", "Neurology", "Sports Medicine", "Human Performance", "Orthopedic Rehabilitation", "General Medicine", "Oncology", "Pediatrics", "Immunology"],
  evaluationCriteria: DEFAULT_EVALUATION_CRITERIA,
  evaluationWeight: 60,
  researchMetricsWeight: 40,
  duplicateExactName: true,
  duplicateWebsite: true,
  duplicateSameCityCountry: true,
  minEvaluatorRole: "Member",
  autoVerifyAffiliations: false
};

const INITIAL_INSTITUTIONS = [
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

const INITIAL_EVALUATIONS = [
  {
    id: "eval-001",
    institutionId: "harvard-medical-school",
    userEmail: "admin@healthedia.org",
    userName: "Prof. Dr. Alistair Vance",
    userRelationship: "Faculty",
    isVerified: true,
    submittedAt: "2024-02-15",
    scores: { edu_quality: 10, res_quality: 10, reputation: 10, clinical_train: 9, healthcare_serv: 9, faculty_qual: 10, scientific_out: 10, student_exp: 9, innovation: 10, int_collab: 10 },
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
    scores: { edu_quality: 9, res_quality: 10, reputation: 10, clinical_train: 10, healthcare_serv: 10, faculty_qual: 9, scientific_out: 10, student_exp: 8, innovation: 9, int_collab: 9 },
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
    scores: { edu_quality: 9, res_quality: 9, reputation: 9, clinical_train: 9, healthcare_serv: 8, faculty_qual: 9, scientific_out: 9, student_exp: 9, innovation: 8, int_collab: 9 },
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
    scores: { edu_quality: 9, res_quality: 10, reputation: 9, clinical_train: 8, healthcare_serv: 8, faculty_qual: 10, scientific_out: 10, student_exp: 8, innovation: 10, int_collab: 9 },
    comments: "The cellular and physiological physiology labs are world leaders. Access to cutting-edge iPS equipment makes Kyoto a premier research choice."
  }
];

const INITIAL_PROJECTS = [
  {
    id: "proj-101",
    title: "High-Altitude Hypoxia Adaptation in Elite Cyclists",
    status: "Draft",
    owner: "mabrouk@dr.com",
    createdAt: "2026-07-15 10:00",
    updatedAt: "2026-07-16 02:15",
    sections: {
      title: "Physiological Adaptation to High-Altitude Hypoxia in Elite Endurance Cyclists",
      authors: "Mabrouk A., Thorne E., Lopez S.",
      affiliations: "Department of Human Physiology, Sorbonne University Clinical Center",
      abstract: "High-altitude simulation has emerged as a key ergogenic aid. This study examines the adaptation profiles, specifically hemoglobin mass changes, red cell counts, and cardiac stroke indexes under hypoxic training camps. Elite athletes were monitored under simulated 3,000m altitude vs sea-level controls over a 21-day timeline.",
      keywords: "Hypoxia, Hemoglobin Mass, Elite Cycling, Erythropoiesis",
      introduction: "Endurance athletes continuously seek lawful, ethical means to augment oxygen transportation capacity. High-altitude exposure stimulates endogenic erythropoietin secretion, driving expansion of red blood cell counts [1]. However, the exact strain on cardiovascular compliance during high-intensity intervals remains controversial [2].",
      hypotheses: "We hypothesize that simulated exposure (14.2% FiO2) during active sleep phases increases reticulocyte count by over 12% compared to controls.",
      methodology: "A double-blind randomized clinical layout was implemented. 16 elite cyclists with VO2max > 72 mL/kg/min were allocated into hypoxia vs normoxia protocols.",
      participants: "Elite competitive cycling athletes aged 22-29 with no history of pulmonary abnormalities.",
      materials_methods: "Simulated hypoxic chambers using nitrogen-extraction filters. Hemoglobin mass quantified via carbon monoxide rebreathing techniques.",
      statistical_analysis: "Repeated measures ANOVA with alpha set at p < 0.05. Multi-factorial adjustments for room heat variables.",
      results: "Substantial statistical variance was observed. Reticulocytes rose from 1.1% to 1.38% (p=0.012). Hematocrit indexes expanded slightly, but cardiac output during maximal exertion remained equivalent.",
      discussion: "The elevation of hemoglobin concentration confirms erythropoietic signaling. However, training intensity must be moderated to prevent excessive central nervous fatigue during early acclimatization.",
      limitations: "Short cohort duration (21 days) prevents evaluation of long-term post-exposure adaptation decay.",
      conclusion: "Intermittent hypoxic sleeping combined with sea-level intensive training provides a safe, reproducible elevation of hematological profiles.",
      ethical_approval: "Approved by the Academic Ethical Panel of Sorbonne Medical Center (Ref: HS-2026-0922).",
      funding: "Supported by the Global Performance Grant Scheme (Ref: GP-109).",
      conflict_of_interest: "None declared.",
    },
    references: [
      {
        id: "ref-1",
        number: 1,
        title: "Erythropoietin Response and Erythrocyte Expansion in simulated altitude protocols",
        authors: "Levine B. D., Stray-Gundersen J.",
        journal: "Journal of Applied Physiology",
        year: 2021,
        doi: "10.1152/jappl.2021.042",
        url: "https://journals.physiology.org/doi/10.1152/jappl.2021.042"
      },
      {
        id: "ref-2",
        number: 2,
        title: "Cardio-vascular adaptations and compliance under simulated hypoxic exercise",
        authors: "Thorne E. R., Lopez S.",
        journal: "European Journal of Sports Medicine",
        year: 2024,
        doi: "10.1016/j.ejsp.2024.12.001",
        url: "https://ejsm.org/articles/cardio-hypoxia"
      }
    ],
    figures: [
      {
        id: "fig-1",
        number: 1,
        caption: "Hemoglobin mass changes (g) from baseline to Day 21.",
        imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600"
      }
    ],
    tables: [
      {
        id: "tab-1",
        number: 1,
        caption: "Physiological Metrics Baseline vs Post-Intervention",
        content: [
          ["Metric", "Hypoxic Group (Pre)", "Hypoxic Group (Post)", "Control Group (Pre)", "Control Group (Post)"],
          ["Hb Mass (g)", "840 \u00B1 12", "882 \u00B1 14*", "845 \u00B1 11", "848 \u00B1 12"],
          ["VO2max (mL/kg)", "74.2 \u00B1 2.1", "76.8 \u00B1 1.8", "73.9 \u00B1 1.9", "74.1 \u00B1 2.0"],
          ["Reticulocytes (%)", "1.12", "1.38*", "1.09", "1.11"]
        ]
      }
    ],
    collaborators: [
      { username: "evelyn-thorne", permission: "Edit" },
      { username: "clara_barton", permission: "View Only" }
    ],
    comments: [
      {
        id: "comm-1",
        sectionId: "abstract",
        selectedText: "athletes were monitored under simulated 3,000m altitude",
        author: "evelyn-thorne",
        content: "Can we clarify if the chambers matched high humidity, or if dry air was regulated?",
        timestamp: "2026-07-15 14:10",
        resolved: false,
        replies: [
          {
            id: "reply-1",
            author: "mabrouk@dr.com",
            content: "We regulated humidity strictly to 45% relative humidity to match standard baseline rooms. I will insert this in Materials & Methods.",
            timestamp: "2026-07-15 16:30"
          }
        ]
      }
    ],
    highlights: [
      {
        id: "high-1",
        sectionId: "introduction",
        text: "red blood cell counts [1]",
        type: "important_note",
        comment: "Classic reference; very reliable baseline data.",
        author: "evelyn-thorne",
        timestamp: "2026-07-15 14:15"
      },
      {
        id: "high-2",
        sectionId: "results",
        text: "Reticulocytes rose from 1.1% to 1.38% (p=0.012)",
        type: "approved_section",
        comment: "Excellent p-value indicator. Highly significant.",
        author: "evelyn-thorne",
        timestamp: "2026-07-15 14:20"
      }
    ],
    versionHistory: [
      {
        id: "v-1",
        versionName: "Initial Draft Outline",
        timestamp: "2026-07-15 10:15",
        author: "mabrouk@dr.com",
        sectionsSnapshot: { title: "Altitude Adaptations", abstract: "Under work." },
        referencesSnapshot: []
      },
      {
        id: "v-2",
        versionName: "Pre-Review Ready Draft",
        timestamp: "2026-07-15 18:00",
        author: "mabrouk@dr.com",
        sectionsSnapshot: { title: "Physiological Adaptation to High-Altitude Hypoxia", abstract: "Completed abstract text." },
        referencesSnapshot: [
          {
            id: "ref-1",
            number: 1,
            title: "Erythropoietin Response and Erythrocyte Expansion in simulated altitude protocols",
            authors: "Levine B. D., Stray-Gundersen J.",
            journal: "Journal of Applied Physiology",
            year: 2021,
            doi: "10.1152/jappl.2021.042",
            url: "https://journals.physiology.org/doi/10.1152/jappl.2021.042"
          }
        ]
      }
    ],
    exportHistory: [
      { id: "exp-1", format: "PDF", timestamp: "2026-07-16 01:10", fileName: "Sitemaps_PreCompilation_Hypoxia_Draft.pdf" }
    ]
  },
  {
    id: "proj-102",
    title: "Sarcopenia Interventions with Exogenous Essential Aminos",
    status: "Draft",
    owner: "mabrouk@dr.com",
    createdAt: "2026-07-12 11:30",
    updatedAt: "2026-07-14 16:22",
    sections: {
      title: "Resistance Exercise Coupled with Exogenous Essential Amino Acids to Ameliorate Muscle Mass Decline (Sarcopenia)",
      authors: "Mabrouk A., Henderson J.",
      affiliations: "Gait Science Unit, London Health Laboratory",
      abstract: "Age-associated muscle wasting (sarcopenia) accelerates functional dependency. Here we evaluated whether high-leucine free aminos combined with progressive hypertrophy protocols optimizes anabolic signaling pathways in cohorts over 70.",
      introduction: "Muscle atrophy with aging is characterized by progressive reduction of both type II fiber count and active myofibrillar synthetic responses.",
      methodology: "Double-blind interventional study comparing whey concentrate vs free-form crystalline amino cocktails.",
      results: "Total lean body mass increased by 1.4kg over 12 weeks in amino cohort vs 0.6kg in controls.",
      discussion: "Leucine saturation is paramount to trigger mTORC1 translation initiation.",
      conclusion: "Clinical application of leucine-enriched amino cocktails should be standardized as frontline medical nutrition therapy."
    },
    references: [],
    figures: [],
    tables: [],
    collaborators: [],
    comments: [],
    highlights: [],
    versionHistory: [],
    exportHistory: []
  }
];

const INITIAL_ACTIVITY_LOGS = [
  {
    id: "log-1",
    timestamp: "2026-07-16 01:22",
    userEmail: "mabrouk@dr.com",
    action: "Project Created",
    category: "Project",
    details: "Created manuscript draft 'High-Altitude Hypoxia Adaptation in Elite Cyclists'."
  }
];

const DEFAULT_SEO_SETTINGS = {
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

const INITIAL_PAGES = [
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
      { timestamp: "2024-01-10 08:00", action: "System Page Initialized", author: "System" }
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
  }
];

const INITIAL_REDIRECTS = [
  { id: "redir-1", source: "/archive", target: "/journal", status: "301", createdAt: "2026-07-10T05:00:00Z" }
];

const INITIAL_PAPERS = [
  {
    id: "paper-001",
    title: "Physiological Adaptations to High-Intensity Interval Training vs. Continuous Aerobic Training in Elite Athletes",
    authors: ["Dr. Evelyn Thorne", "Dr. Marc Dubois", "Prof. Kenji Takahashi"],
    journal: "Healthedia Global Journal of Performance Science",
    year: 2025,
    specialty: "Sports Science & Physiology",
    institution: "Institute of Human Performance, Tokyo",
    country: "Japan",
    language: "English",
    researchType: "Randomized Controlled Trial",
    doi: "10.1016/j.hgps.2025.04.012",
    abstract: "High-intensity interval training (HIIT) has emerged as an efficient strategy to improve cardiorespiratory fitness. This randomized controlled trial compared the physiological adaptations of 12 weeks of HIIT (4x4 min at 90% HRmax) versus traditional continuous aerobic training (30 min at 70% HRmax) in 45 elite endurance athletes. VO2max, stroke volume, and muscular mitochondrial density were measured pre- and post-intervention. Results demonstrated a significantly higher increase in VO2max (+8.2% vs +3.5%, p<0.01) and mitochondrial respiratory capacity in the HIIT group, suggesting superior central and peripheral adaptations.",
    keywords: ["HIIT", "VO2max", "Endurance Athletes", "Mitochondrial Density", "Cardiovascular Adaptation"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1016/j.hgps.2025.04.012"
  },
  {
    id: "paper-002",
    title: "Efficacy of Eccentric Overload Training on Achilles Tendinopathy Rehabilitation: A Multicenter Randomized Controlled Trial",
    authors: ["Dr. Marc Dubois", "Dr. Sarah Jenkins"],
    journal: "Journal of Musculoskeletal Rehabilitation",
    year: 2024,
    specialty: "Physical Therapy & Rehabilitation",
    institution: "Sorbonne University Clinical Center",
    country: "France",
    language: "English",
    researchType: "Randomized Controlled Trial",
    doi: "10.1007/s11926-024-0891-3",
    abstract: "Achilles tendinopathy is a common overuse injury causing chronic pain and disability. We investigated the clinical and structural effects of a 16-week eccentric overload training program versus standard concentric exercises in 120 patients with midportion Achilles tendinopathy. Pain and function were evaluated using the VISA-A questionnaire, and tendon thickness was assessed via high-resolution ultrasound. The eccentric group demonstrated significantly greater improvements in VISA-A scores (mean increase 24.5 vs 12.3 points, p<0.001) and a reduction in localized tendon swelling, indicating accelerated tissue restructuring.",
    keywords: ["Achilles Tendinopathy", "Eccentric Exercise", "Physical Therapy", "Tendon Ultrasonography", "Sports Medicine"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1007/s11926-024-0891-3"
  },
  {
    id: "paper-003",
    title: "Molecular Correlates of Sarcopenia: The Role of Myokines in Human Performance and Skeletal Muscle Aging",
    authors: ["Prof. Kenji Takahashi", "Dr. Evelyn Thorne"],
    journal: "Healthedia Global Journal of Performance Science",
    year: 2025,
    specialty: "Molecular Medicine & Endocrinology",
    institution: "Kyoto University School of Medicine",
    country: "Japan",
    language: "English",
    researchType: "Systematic Review",
    doi: "10.1111/j.rehab.2025.10.009",
    abstract: "Sarcopenia represents a progressive age-related loss of skeletal muscle mass and strength, predisposing older populations to frailty. This review synthesizes current evidence on skeletal muscle-derived secretome components, specifically myokines (such as Myostatin, IL-15, and Irisin), in regulating muscle homeostasis. Analysis of 58 clinical cohorts suggests that high resistance training downregulates circulating myostatin and upregulates irisin, thereby promoting cellular hypertrophy, reducing lipid accumulation, and mitigating age-related performance decline through autocrine and endocrine signaling pathways.",
    keywords: ["Sarcopenia", "Myokines", "Irisin", "Skeletal Muscle Aging", "Resistance Training"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1111/j.rehab.2025.10.009"
  },
  {
    id: "paper-004",
    title: "Biomechanical Analysis of Running Gait in Overuse Injuries: A Machine Learning-Based Classification Model",
    authors: ["Dr. Alistair Vance", "Prof. Kenji Takahashi"],
    journal: "Biomechanics & Human Kinetics",
    year: 2023,
    specialty: "Biomechanics & Kinesiology",
    institution: "University of Edinburgh",
    country: "United Kingdom",
    language: "English",
    researchType: "Cohort Study",
    doi: "10.2478/bhk-2023-0014",
    abstract: "Identifying risk factors for running overuse injuries remains a challenge in clinical sports medicine. This study gathered 3D kinematic and kinetic parameters of 250 runners (125 injured, 125 healthy controls) using a high-speed motion capture system and force plates. A random forest classifier was trained to identify gait deviations associated with patellofemoral pain syndrome. The model achieved 88.5% classification accuracy. Increased peak knee adduction, coupled with diminished pelvic drop and hip internal rotation velocity, were isolated as the most critical predictors of injury.",
    keywords: ["Biomechanics", "Running Gait", "Machine Learning", "Patellofemoral Pain Syndrome", "Kinematics"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.2478/bhk-2023-0014"
  }
];

// Helper to write to JSON safely
function saveStore(store: DatabaseStore) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("[DB Server] Error saving database file:", error);
  }
}

// In-Memory store instance loaded from JSON file
let inMemoryStore: DatabaseStore;

// Initialize Database connection & seed default records
export function initDB(): DatabaseStore {
  if (inMemoryStore) return inMemoryStore;

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

      if (fs.existsSync(DB_PATH)) {
      const fileData = fs.readFileSync(DB_PATH, "utf-8");
      inMemoryStore = JSON.parse(fileData);
      // Backwards-compatibility check for systemSettings
      if (!inMemoryStore.systemSettings) {
        inMemoryStore.systemSettings = { ...DEFAULT_SYSTEM_SETTINGS };
        saveStore(inMemoryStore);
      }
      console.log(`[DB Server] Database successfully loaded from ${DB_PATH} with ${inMemoryStore.users?.length || 0} user records.`);
    } else {
      console.log(`[DB Server] Database file not found. Seeding initial records at ${DB_PATH}...`);
      inMemoryStore = {
        users: DEMO_USERS,
        professions: DEFAULT_PROFESSIONS,
        taxonomies: DEFAULT_TAXONOMIES,
        manuscripts: INITIAL_MANUSCRIPTS,
        tickets: INITIAL_TICKETS,
        appearance: INITIAL_APPEARANCE,
        institutions: INITIAL_INSTITUTIONS,
        evaluations: INITIAL_EVALUATIONS,
        institutionConfig: DEFAULT_INSTITUTION_CONFIG,
        projects: INITIAL_PROJECTS,
        activityLogs: INITIAL_ACTIVITY_LOGS,
        pages: INITIAL_PAGES,
        redirects: INITIAL_REDIRECTS,
        seoSettings: DEFAULT_SEO_SETTINGS,
        published_papers: INITIAL_PAPERS,
        systemSettings: { ...DEFAULT_SYSTEM_SETTINGS }
      };
      saveStore(inMemoryStore);
    }
  } catch (error) {
    console.error("[DB Server] FAILED to initialize backend database, using static fallback:", error);
    inMemoryStore = {
      users: DEMO_USERS,
      professions: DEFAULT_PROFESSIONS,
      taxonomies: DEFAULT_TAXONOMIES,
      manuscripts: INITIAL_MANUSCRIPTS,
      tickets: INITIAL_TICKETS,
      appearance: INITIAL_APPEARANCE,
      institutions: INITIAL_INSTITUTIONS,
      evaluations: INITIAL_EVALUATIONS,
      institutionConfig: DEFAULT_INSTITUTION_CONFIG,
      projects: INITIAL_PROJECTS,
      activityLogs: INITIAL_ACTIVITY_LOGS,
      pages: INITIAL_PAGES,
      redirects: INITIAL_REDIRECTS,
      seoSettings: DEFAULT_SEO_SETTINGS,
      published_papers: INITIAL_PAPERS,
      systemSettings: { ...DEFAULT_SYSTEM_SETTINGS }
    };
  }

  return inMemoryStore;
}

// Database helper endpoints CRUD
export const dbOps = {
  getStore: (): DatabaseStore => {
    return initDB();
  },

  getCollection: (collection: keyof DatabaseStore): any[] => {
    const store = initDB();
    return (store[collection] as any[]) || [];
  },

  setCollection: (collection: keyof DatabaseStore, data: any): void => {
    const store = initDB();
    (store[collection] as any) = data;
    saveStore(store);
  },

  getItemById: (collection: keyof DatabaseStore, id: string): any => {
    const col = dbOps.getCollection(collection);
    return col.find((item: any) => item && (item.id === id || item.email === id || item.username === id));
  },

  insertItem: (collection: keyof DatabaseStore, item: any): any => {
    const col = dbOps.getCollection(collection);
    col.push(item);
    dbOps.setCollection(collection, col);
    return item;
  },

  updateItem: (collection: keyof DatabaseStore, id: string, updatedFields: any): any => {
    const col = dbOps.getCollection(collection);
    let matchedItem: any = null;
    const updatedCol = col.map((item: any) => {
      if (item && (item.id === id || item.email === id || item.username === id)) {
        matchedItem = { ...item, ...updatedFields };
        return matchedItem;
      }
      return item;
    });

    if (matchedItem) {
      dbOps.setCollection(collection, updatedCol);
    }
    return matchedItem;
  },

  deleteItem: (collection: keyof DatabaseStore, id: string): boolean => {
    const col = dbOps.getCollection(collection);
    const beforeLength = col.length;
    const filtered = col.filter((item: any) => !(item && (item.id === id || item.email === id || item.username === id)));
    dbOps.setCollection(collection, filtered);
    return filtered.length < beforeLength;
  }
};
