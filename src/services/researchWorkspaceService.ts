import { 
  ResearchProject, 
  WorkspaceSettings, 
  CitationStyle, 
  DocumentTemplate, 
  ExportTemplate, 
  ActivityLog,
  ReferenceItem
} from "../types/researchWorkspace";

export const CITATION_STYLES: CitationStyle[] = [
  {
    id: "apa",
    name: "APA 7th Edition",
    format: "Author, A. A. (Year). Title. Journal Name, Volume(Issue), Page-Page.",
    description: "American Psychological Association standard, widely used in social and behavioral sciences."
  },
  {
    id: "vancouver",
    name: "Vancouver Style",
    format: "Author AA. Title. Journal Name. Year;Volume(Issue):Page-Page.",
    description: "Numeric system used primarily in medicine and biomedical sciences."
  },
  {
    id: "harvard",
    name: "Harvard Style",
    format: "Author, A.A., Year. Title. Journal Name, Volume(Issue), pp.Page-Page.",
    description: "Author-date system used in environmental and biological sciences."
  },
  {
    id: "mla",
    name: "MLA 9th Edition",
    format: "Author, First Name. \"Title.\" Journal Name, vol. Volume, no. Issue, Year, pp. Page-Page.",
    description: "Modern Language Association style, common in humanities and academic literature."
  }
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "clinical_trial",
    name: "Randomized Clinical Trial (RCT)",
    category: "Medical Sciences",
    description: "Guided framework compliant with CONSORT statement for clinical and performance trials.",
    defaultSections: [
      "title", "authors", "affiliations", "abstract", "keywords", 
      "introduction", "hypotheses", "methodology", "participants", 
      "materials_methods", "statistical_analysis", "results", 
      "discussion", "limitations", "conclusion", "ethical_approval", 
      "funding", "conflict_of_interest", "references"
    ]
  },
  {
    id: "systematic_review",
    name: "Systematic Review & Meta-Analysis",
    category: "General Research",
    description: "Compliant with PRISMA guidelines for reviewing and pooling literature studies.",
    defaultSections: [
      "title", "authors", "affiliations", "abstract", "keywords", 
      "introduction", "literature_review", "research_problem", "objectives", 
      "methodology", "results", "discussion", "limitations", 
      "conclusion", "recommendations", "references", "appendices"
    ]
  },
  {
    id: "short_report",
    name: "Short Communication / Note",
    category: "Rapid Publication",
    description: "Brief academic report for high-impact preliminary physiological findings.",
    defaultSections: [
      "title", "authors", "affiliations", "abstract", "keywords", 
      "introduction", "materials_methods", "results", "discussion", 
      "acknowledgements", "references"
    ]
  }
];

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  { id: "ieee", name: "IEEE Transaction Format", fileFormat: "PDF", hasCoverPage: false, margins: "Narrow" },
  { id: "nature", name: "Nature Science Layout", fileFormat: "PDF", hasCoverPage: true, margins: "Standard" },
  { id: "double_spaced", name: "Standard Editorial Double-Spaced", fileFormat: "DOCX", hasCoverPage: true, margins: "Wide" }
];

export const INITIAL_WORKSPACE_SETTINGS: WorkspaceSettings = {
  maxStorageLimitMb: 100,
  allowedStyles: ["apa", "vancouver", "harvard", "mla"],
  defaultStyle: "apa",
  allowExternalSharing: true,
  backupFrequency: "Daily",
  ethicalApprovalRequired: true
};

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "2026-07-16 01:22",
    userEmail: "mabrouk@dr.com",
    action: "Project Created",
    category: "Project",
    details: "Created manuscript draft 'High-Altitude Hypoxia Adaptation in Elite Cyclists'."
  },
  {
    id: "log-2",
    timestamp: "2026-07-15 18:45",
    userEmail: "evelyn@thorne.edu",
    action: "Collaboration Invited",
    category: "Collaboration",
    details: "Invited Dr. Evelyn Thorne to collaborate on 'Myocardial Strain Dynamics'."
  },
  {
    id: "log-3",
    timestamp: "2026-07-15 15:30",
    userEmail: "admin@healthedia.org",
    action: "Storage Cap Adjusted",
    category: "System",
    details: "Elevated default storage limits to 100MB per researcher."
  },
  {
    id: "log-4",
    timestamp: "2026-07-14 11:10",
    userEmail: "mabrouk@dr.com",
    action: "PDF Compilation",
    category: "Export",
    details: "Compiled and exported 'High-Altitude Hypoxia Adaptation' as APA 7th PDF."
  }
];

export const SECTION_LABELS: Record<string, string> = {
  title: "Title",
  authors: "Authors",
  affiliations: "Affiliations",
  abstract: "Abstract",
  keywords: "Keywords",
  introduction: "Introduction",
  literature_review: "Literature Review",
  research_problem: "Research Problem",
  objectives: "Objectives",
  hypotheses: "Hypotheses",
  methodology: "Methodology",
  participants: "Participants",
  materials_methods: "Materials & Methods",
  statistical_analysis: "Statistical Analysis",
  results: "Results",
  discussion: "Discussion",
  limitations: "Limitations",
  conclusion: "Conclusion",
  recommendations: "Recommendations",
  acknowledgements: "Acknowledgements",
  funding: "Funding",
  conflict_of_interest: "Conflict of Interest",
  ethical_approval: "Ethical Approval",
  references: "References & Bibliography",
  appendices: "Appendices"
};

export const INITIAL_PROJECTS: ResearchProject[] = [
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
          ["Hb Mass (g)", "840 ± 12", "882 ± 14*", "845 ± 11", "848 ± 12"],
          ["VO2max (mL/kg)", "74.2 ± 2.1", "76.8 ± 1.8", "73.9 ± 1.9", "74.1 ± 2.0"],
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
  },
  {
    id: "proj-103",
    title: "Biomechanical Efficiency of Carbon-Plated Running Shoes",
    status: "Archived",
    owner: "mabrouk@dr.com",
    createdAt: "2026-07-01 09:15",
    updatedAt: "2026-07-08 12:44",
    sections: {
      title: "Impact of Rigid Midsole Plating on Mechanical Work and Joint Stiffness in Trail Running Protocols",
      authors: "Mabrouk A.",
      abstract: "Carbon-plated footwear is proven on flat tracks. This study looks at eccentric strain indices in cross-country routes.",
      introduction: "Midsole plate bend resilience changes metatarsophalangeal energy storage cycles.",
      methodology: "A dynamic force plate and high-speed motion analysis trial was executed.",
      results: "Peak ground reaction forces were decreased, but ankle work rose on high elevation shifts.",
      discussion: "The stiffness curve provides optimal elastic energy on horizontal flats, but might increase joint fatigue on uneven trails.",
      conclusion: "Trail athletes should exercise caution when selecting footwear on grades over 12%."
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

/**
 * Validates a reference entry and returns any error messages.
 */
export function validateReference(ref: Partial<ReferenceItem>): string[] {
  const errors: string[] = [];
  if (!ref.title || ref.title.trim() === "") {
    errors.push("Title is a mandatory field.");
  }
  if (!ref.authors || ref.authors.trim() === "") {
    errors.push("Author(s) list is required.");
  }
  if (!ref.journal || ref.journal.trim() === "") {
    errors.push("Journal or publisher name is required.");
  }
  if (!ref.year) {
    errors.push("Year of publication is required.");
  } else {
    const y = Number(ref.year);
    if (isNaN(y) || y < 1500 || y > 2027) {
      errors.push("Please provide a valid publication year (between 1500 and 2027).");
    }
  }

  // Basic format validations
  if (ref.doi && ref.doi.trim() !== "") {
    // DOI should generally match standard patterns e.g. 10.xxxx/xxxx
    if (!ref.doi.includes(".") || !ref.doi.startsWith("10.")) {
      errors.push("Provided DOI format seems anomalous (standard is '10.xxxx/xxxx').");
    }
  }

  if (ref.url && ref.url.trim() !== "") {
    if (!ref.url.startsWith("http://") && !ref.url.startsWith("https://")) {
      errors.push("URL must begin with 'http://' or 'https://'.");
    }
  }

  return errors;
}

/**
 * Checks if a reference with the same title or DOI already exists in the list.
 */
export function detectDuplicateReference(list: ReferenceItem[], ref: Partial<ReferenceItem>): boolean {
  if (!ref.title) return false;
  const matchTitle = list.some(item => 
    item.title.toLowerCase().trim() === ref.title?.toLowerCase().trim()
  );
  if (matchTitle) return true;

  if (ref.doi && ref.doi.trim() !== "") {
    const matchDoi = list.some(item => 
      item.doi?.toLowerCase().trim() === ref.doi?.toLowerCase().trim()
    );
    if (matchDoi) return true;
  }
  return false;
}

/**
 * Formats a reference into a specific style.
 */
export function formatBibliographyItem(style: string, ref: ReferenceItem): string {
  const authorStr = ref.authors.trim();
  const titleStr = ref.title.trim().replace(/\.$/, "") + ".";
  const journalStr = ref.journal.trim().replace(/\.$/, "");
  const yearVal = ref.year;
  const doiStr = ref.doi ? ` doi: ${ref.doi}` : "";

  switch (style) {
    case "apa":
      // Author, A. A. (Year). Title. Journal, doi.
      return `${authorStr} (${yearVal}). ${titleStr} ${journalStr}.${doiStr}`;
    case "vancouver":
      // Author AA. Title. Journal. Year; doi.
      return `${authorStr.replace(/,/g, "")}. ${titleStr} ${journalStr}. ${yearVal};${doiStr}`;
    case "harvard":
      // Author, Year. Title. Journal. doi.
      return `${authorStr}, ${yearVal}. ${titleStr} ${journalStr}.${doiStr}`;
    case "mla":
      // Author. "Title." Journal, Year, doi.
      return `${authorStr}. "${titleStr}" ${journalStr}, ${yearVal}.${doiStr}`;
    default:
      return `${authorStr}. ${titleStr} ${journalStr}, ${yearVal}.${doiStr}`;
  }
}

/**
 * Renumbers citation items, ensuring sequential layout.
 */
export function renumberReferences(references: ReferenceItem[]): ReferenceItem[] {
  return references.map((ref, idx) => ({
    ...ref,
    number: idx + 1
  }));
}
