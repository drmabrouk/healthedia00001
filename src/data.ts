import { ResearchPaper, Researcher, Course } from "./types";

export const INITIAL_PAPERS: ResearchPaper[] = [
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
  },
  {
    id: "paper-005",
    title: "Sleep Optimization and Recovery Kinetics in Professional Athletes: Impact of Sleep Hygiene and Melatonin Supplementation",
    authors: ["Dr. Sarah Jenkins", "Dr. Elena Rostova"],
    journal: "Sleep Medicine & Performance",
    year: 2024,
    specialty: "Sleep Science & Sports Nutrition",
    institution: "Harvard Medical School",
    country: "United States",
    language: "English",
    researchType: "Randomized Controlled Trial",
    doi: "10.1016/j.sleep.2024.01.007",
    abstract: "Athletic success is closely tethered to sleep-mediated recovery. This double-blind randomized trial evaluated the recovery kinetics of 60 professional soccer players undergoing intensive training. Participants were split into sleep hygiene instruction only, sleep hygiene + 3mg melatonin, or a control placebo group. High-frequency actigraphy was used to monitor sleep architecture, and daily biomarkers (cortisol, creatine kinase, and subjective muscle soreness) were logged. Melatonin combined with sleep hygiene significantly improved deep sleep duration (+18.4%) and accelerated creatine kinase clearance by 22% within 24 hours.",
    keywords: ["Sleep Architecture", "Athletic Recovery", "Melatonin", "Creatine Kinase", "Cortisol"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1016/j.sleep.2024.01.007"
  },
  {
    id: "paper-006",
    title: "Cardiorespiratory Rehabilitation Protocols Following Viral Myocarditis in Elite Sports: A Comprehensive Consensus Guideline",
    authors: ["Dr. Elena Rostova", "Dr. Marc Dubois", "Dr. Evelyn Thorne"],
    journal: "Healthedia Global Journal of Performance Science",
    year: 2025,
    specialty: "Cardiology & Sports Medicine",
    institution: "Saint Petersburg State Research Institute",
    country: "Russia",
    language: "English",
    researchType: "Systematic Review",
    doi: "10.5114/hgps.2025.10024",
    abstract: "Subclinical myocarditis following viral infections poses a major risk of sudden cardiac death in elite athletes returning to competitive sports. This consensus paper compiles clinical registries and sports cardiology guidelines to provide a risk-stratification return-to-play algorithm. Key recommendations emphasize a minimum of 3-6 months restriction from training depending on the severity of ventricular dysfunction, followed by contrast-enhanced cardiac MRI and maximal exercise stress testing. Gradual reconditioning protocols must monitor telemetry and Holter EKG for high-risk ectopic beats.",
    keywords: ["Viral Myocarditis", "Sports Cardiology", "Return to Play", "Cardiac MRI", "Elite Athletes"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.5114/hgps.2025.10024"
  },
  {
    id: "paper-007",
    title: "The Impact of Chronic Low Energy Availability (LEA) on Bone Mineral Density and Endocrine Function in Male Endurance Runners",
    authors: ["Dr. Evelyn Thorne", "Dr. Sarah Jenkins"],
    journal: "Archives of Endocrine Performance",
    year: 2024,
    specialty: "Sports Nutrition & Endocrinology",
    institution: "Sydney University Human Nutrition Lab",
    country: "Australia",
    language: "English",
    researchType: "Cohort Study",
    doi: "10.1210/clinchem.2024.0903",
    abstract: "Low Energy Availability (LEA) represents the underlying etiology of the Female Athlete Triad and its male counterpart, Relative Energy Deficiency in Sports (REDs). This prospective 12-month cohort study monitored 80 male competitive distance runners. High-precision dietary logs and metabolic rate evaluations identified 32 athletes with persistent LEA (<30 kcal/kg FFM/day). These athletes exhibited a significant reduction in lumbar spine bone mineral density (DXA, p<0.05), lowered free testosterone levels, and down-regulated triiodothyronine (T3), indicating severe endocrine adaptations to energy restriction.",
    keywords: ["REDs", "Low Energy Availability", "Bone Mineral Density", "Testosterone", "Endocrine Suppression"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1210/clinchem.2024.0903"
  },
  {
    id: "paper-008",
    title: "Neuromuscular Control of Knee Stability in Female Athletes: An Electromyographic and Kinematic Comparison of Landing Mechanics",
    authors: ["Dr. Alistair Vance", "Dr. Marc Dubois"],
    journal: "Journal of Sports Biomechanics",
    year: 2023,
    specialty: "Biomechanics & Kinesiology",
    institution: "University of Edinburgh",
    country: "United Kingdom",
    language: "English",
    researchType: "Case-Control Study",
    doi: "10.1080/14763141.2023.22019",
    abstract: "Female athletes experience ACL injuries at a rate 4-6 times greater than males. This study analyzed surface electromyography (EMG) of the quadriceps, hamstrings, and gluteus medius alongside 3D pelvis and knee mechanics in 80 collegiate female basketball players during a drop-jump land task. Athletes displaying high knee valgus angles (at risk) demonstrated significantly delayed onset of biceps femoris activation (hamstrings) and lower gluteus medius EMG amplitude, leading to unmitigated frontal plane loading at the knee joint.",
    keywords: ["ACL Injury", "Landing Mechanics", "Kinematics", "Electromyography", "Neuromuscular Deficit"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1080/14763141.2023.22019"
  },
  {
    id: "paper-009",
    title: "Exogenous Ketone Monoester Supplementation and Cognitive Fatigue During High-Intensity Team Sport Drills: A Double-Blind Cross-Over Trial",
    authors: ["Dr. Sarah Jenkins", "Prof. Kenji Takahashi"],
    journal: "Journal of Clinical Performance Nutrition",
    year: 2025,
    specialty: "Sports Nutrition & Endocrinology",
    institution: "Harvard Medical School",
    country: "United States",
    language: "English",
    researchType: "Randomized Controlled Trial",
    doi: "10.1152/ajpendo.2025.1209",
    abstract: "Ketone bodies serve as alternative cerebral fuel during exhaustive exercise. We investigated whether oral ingestion of a ketone monoester (R-3-hydroxybutyl-R-3-hydroxybutyrate, 571 mg/kg) prevents decision-making decay under physiological fatigue in 24 skilled athletes. After a glycogen-depletion protocol, participants completed the Stroop task and dynamic soccer-specific decision drills. Ketone administration elevated blood beta-hydroxybutyrate to 2.8 mmol/L. Reaction accuracy was significantly preserved under fatigue (+12.4% accuracy vs. placebo, p<0.01), showing a profound neuro-protective benefit.",
    keywords: ["Ketone Monoester", "Cognitive Fatigue", "Sports Nutrition", "Beta-Hydroxybutyrate", "Decision Making"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1152/ajpendo.2025.1209"
  },
  {
    id: "paper-010",
    title: "Mitochondrial Dynamics in Cardiac Myocytes Post-Aerobic Conditioning: Microscopic and Biochemical Markers in Rodent Models",
    authors: ["Dr. Evelyn Thorne", "Dr. Elena Rostova"],
    journal: "Cardiovascular Science & Performance",
    year: 2024,
    specialty: "Cardiology & Sports Medicine",
    institution: "Saint Petersburg State Research Institute",
    country: "Russia",
    language: "English",
    researchType: "Laboratory Study",
    doi: "10.1093/cvr/cvy204",
    abstract: "Endurance training triggers profound cardiovascular tissue changes. This study investigated cardiac mitochondrial fusion and fission dynamics in training-adapted versus sedentary rodent cohorts. Using transmission electron microscopy and western blots for key fusion proteins (Opa1, Mfn1/2) and fission proteins (Drp1), we determined that 8 weeks of progressive treadmill running induced significant mitochondrial hyperfusion (+42%), which correlated with increased stroke volume and protection against hypoxia-induced ischemia.",
    keywords: ["Mitochondrial Fusion", "Mfn1", "Cardiomyocytes", "Aerobic Conditioning", "Stroke Volume"],
    pdfUrl: "#",
    doiUrl: "https://doi.org/10.1093/cvr/cvy204"
  }
];

export const INITIAL_RESEARCHERS: Researcher[] = [
  {
    id: "res-001",
    name: "Evelyn Thorne",
    title: "Dr. med.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    specialty: "Sports Science & Physiology",
    country: "Australia",
    institution: "Sydney University Human Performance Lab",
    degree: "Ph.D. in Exercise Physiology, M.D.",
    orcid: "0000-0002-1823-9023",
    bio: "Dr. Evelyn Thorne is a clinical physiologist specializing in cardiorespiratory adaptation in elite endurance athletes. Her clinical trials focus on energy utilization and endocrine responses under extreme physical strain.",
    qualifications: [
      "M.D. in Sports Medicine, Sydney University",
      "Ph.D. in Cellular Physiology, Australian National University",
      "Board Certification in Internal Medicine and Sports Endocrinology"
    ],
    researchInterests: [
      "Mitochondrial adaptation",
      "Endocrine suppression in elite sports (REDs)",
      "High-intensity conditioning mechanics"
    ],
    publications: [
      "Physiological Adaptations to High-Intensity Interval Training vs. Continuous Aerobic Training in Elite Athletes",
      "The Impact of Chronic Low Energy Availability (LEA) on Bone Mineral Density and Endocrine Function in Male Endurance Runners",
      "Mitochondrial Dynamics in Cardiac Myocytes Post-Aerobic Conditioning: Microscopic and Biochemical Markers in Rodent Models"
    ],
    awards: [
      "International Society of Sports Nutrition Excellence Award (2024)",
      "Australian Medical Research Fellowship (2022)"
    ],
    certifications: [
      "Fellow of the American College of Sports Medicine (FACSM)",
      "Certified Strength and Conditioning Specialist (CSCS)"
    ],
    googleScholar: "https://scholar.google.com/citations?user=ThorneEvelyn",
    researchGate: "https://www.researchgate.com/profile/Evelyn-Thorne",
    scopus: "https://www.scopus.com/authid/detail.uri?authorId=ThorneEvelyn90",
    verified: true,
    email: "evelyn.thorne@sydney.edu.au"
  },
  {
    id: "res-002",
    name: "Marc Dubois",
    title: "Dr.",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    specialty: "Physical Therapy & Rehabilitation",
    country: "France",
    institution: "Sorbonne University Clinical Center",
    degree: "Ph.D. in Kinesiology & Musculoskeletal Rehab",
    orcid: "0000-0001-9034-7711",
    bio: "Dr. Marc Dubois works at the intersection of clinical biomechanics and manual physical therapy. His research is globally recognized for developing heavy load tendon rehabilitation frameworks.",
    qualifications: [
      "Ph.D. in Rehabilitative Kinesiology, Sorbonne University",
      "M.S. in Physiotherapy, Université de Paris",
      "Clinical Fellowship in Musculoskeletal Injury, INSEP"
    ],
    researchInterests: [
      "Tendinopathy remodeling pathways",
      "Eccentric overloading paradigms",
      "Post-viral cardiorespiratory staging"
    ],
    publications: [
      "Physiological Adaptations to High-Intensity Interval Training vs. Continuous Aerobic Training in Elite Athletes",
      "Efficacy of Eccentric Overload Training on Achilles Tendinopathy Rehabilitation: A Multicenter Randomized Controlled Trial",
      "Cardiorespiratory Rehabilitation Protocols Following Viral Myocarditis in Elite Sports: A Comprehensive Consensus Guideline"
    ],
    awards: [
      "European Sports Physiotherapy Innovation Award (2023)",
      "Sorbonne Clinical Research Excellence Medal (2021)"
    ],
    certifications: [
      "Licensed Physical Therapist (France)",
      "Advanced Dry Needling Practitioner"
    ],
    googleScholar: "https://scholar.google.com/citations?user=MarcDuboisRehab",
    researchGate: "https://www.researchgate.com/profile/Marc-Dubois",
    verified: true,
    email: "m.dubois@sorbonne-universite.fr"
  },
  {
    id: "res-003",
    name: "Kenji Takahashi",
    title: "Prof.",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
    specialty: "Molecular Medicine & Endocrinology",
    country: "Japan",
    institution: "Kyoto University School of Medicine",
    degree: "Ph.D. in Molecular Pathology",
    orcid: "0000-0003-4412-8822",
    bio: "Professor Takahashi is a leading molecular biologist researching muscle tissue preservation. His laboratory isolates myokine biomarkers that predict muscle stem cell activity during dynamic age-associated decline.",
    qualifications: [
      "Ph.D. in Pathology, Kyoto University",
      "M.S. in Biochemistry, University of Tokyo"
    ],
    researchInterests: [
      "Sarcopenia genetics and therapy",
      "Myokine receptor transduction",
      "Ketone metabolic adaptation"
    ],
    publications: [
      "Physiological Adaptations to High-Intensity Interval Training vs. Continuous Aerobic Training in Elite Athletes",
      "Molecular Correlates of Sarcopenia: The Role of Myokines in Human Performance and Skeletal Muscle Aging",
      "Biomechanical Analysis of Running Gait in Overuse Injuries: A Machine Learning-Based Classification Model"
    ],
    awards: [
      "Japan Academy Prize for Medical Science (2025)",
      "Asia-Pacific Muscle Society Lifetime Achievement (2023)"
    ],
    certifications: [
      "Registered Biochemical Pathologist, JP"
    ],
    googleScholar: "https://scholar.google.com/citations?user=KenjiTakahashiKyoto",
    researchGate: "https://www.researchgate.com/profile/Kenji-Takahashi-Kyoto",
    scopus: "https://www.scopus.com/authid/detail.uri?authorId=TakahashiKenji54",
    verified: true,
    email: "k.takahashi@med.kyoto-u.ac.jp"
  },
  {
    id: "res-004",
    name: "Alistair Vance",
    title: "Dr.",
    avatar: "https://images.unsplash.com/photo-1582750433449-64c382817dea?auto=format&fit=crop&q=80&w=200",
    specialty: "Biomechanics & Kinesiology",
    country: "United Kingdom",
    institution: "University of Edinburgh",
    degree: "Ph.D. in Kinematics and Human Movement",
    orcid: "0000-0002-5561-1209",
    bio: "Dr. Vance is a biomechanical engineer specializing in gait mechanics and athletic movement. He implements computer vision and 3D kinematics to prevent ligament injuries in contact sports.",
    qualifications: [
      "Ph.D. in Mechanical Engineering, University of Edinburgh",
      "B.S. in Kinesiology, University of Glasgow"
    ],
    researchInterests: [
      "Computer vision gait monitoring",
      "Neuromuscular ACL ligament loading patterns",
      "Force plate vector diagnostics"
    ],
    publications: [
      "Biomechanical Analysis of Running Gait in Overuse Injuries: A Machine Learning-Based Classification Model",
      "Neuromuscular Control of Knee Stability in Female Athletes: An Electromyographic and Kinematic Comparison of Landing Mechanics"
    ],
    awards: [
      "UK Sports Science Young Investigator Award (2022)",
      "Royal Academy of Engineering Innovation Grant (2023)"
    ],
    certifications: [
      "Chartered Engineer (CENG - UK)",
      "Certified Gait Specialist"
    ],
    googleScholar: "https://scholar.google.com/citations?user=AlistairVanceGait",
    verified: true,
    email: "a.vance@ed.ac.uk"
  },
  {
    id: "res-005",
    name: "Sarah Jenkins",
    title: "Dr.",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=200",
    specialty: "Sleep Science & Sports Nutrition",
    country: "United States",
    institution: "Harvard Medical School",
    degree: "Ph.D. in Nutritional Biochemistry, Ed.D.",
    orcid: "0000-0001-6789-5432",
    bio: "Dr. Sarah Jenkins' clinical research addresses micro-nutrition interventions and sleep architecture. Her sleep laboratory provides recovery coaching for multiple national athletic programs.",
    qualifications: [
      "Ph.D. in Nutritional Sciences, Harvard University",
      "Master of Clinical Dietetics, Tufts University",
      "Board Certified Specialist in Sports Dietetics (CSSD)"
    ],
    researchInterests: [
      "Exogenous ketone monoesters",
      "Sleep-hygiene actigraphy tracking",
      "Anabolic signaling nutrition"
    ],
    publications: [
      "Efficacy of Eccentric Overload Training on Achilles Tendinopathy Rehabilitation: A Multicenter Randomized Controlled Trial",
      "Sleep Optimization and Recovery Kinetics in Professional Athletes: Impact of Sleep Hygiene and Melatonin Supplementation",
      "The Impact of Chronic Low Energy Availability (LEA) on Bone Mineral Density and Endocrine Function in Male Endurance Runners",
      "Exogenous Ketone Monoester Supplementation and Cognitive Fatigue During High-Intensity Team Sport Drills: A Double-Blind Cross-Over Trial"
    ],
    awards: [
      "Harvard Medical Alumni Clinical Research Award (2024)",
      "American Society for Nutrition Sports Nutritionist of the Year (2023)"
    ],
    certifications: [
      "Registered Dietitian (RD)",
      "Certified Sports Nutritionist (CISSN)"
    ],
    googleScholar: "https://scholar.google.com/citations?user=SarahJenkinsSleep",
    researchGate: "https://www.researchgate.com/profile/Sarah-Jenkins-Harvard",
    verified: true,
    email: "s_jenkins@hms.harvard.edu"
  },
  {
    id: "res-006",
    name: "Elena Rostova",
    title: "Dr.",
    avatar: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=200",
    specialty: "Cardiology & Sports Medicine",
    country: "Russia",
    institution: "Saint Petersburg State Research Institute",
    degree: "Dr. med. (Doctor of Medical Sciences)",
    orcid: "0000-0003-8891-2311",
    bio: "Dr. Elena Rostova is a research cardiologist specializing in cardiac tissue remodeling. Her team designs cardiac screening protocols for young athletes returning from acute viral infections.",
    qualifications: [
      "Doctor of Medical Sciences (Dr. med.), Saint Petersburg State University",
      "Postdoctoral Residency in Clinical Cardiology, Pavlov First Medical University"
    ],
    researchInterests: [
      "Post-viral myocarditis tracking",
      "High-resolution cardiac MRI biomarkers",
      "Mitochondrial fusion and survival"
    ],
    publications: [
      "Sleep Optimization and Recovery Kinetics in Professional Athletes: Impact of Sleep Hygiene and Melatonin Supplementation",
      "Cardiorespiratory Rehabilitation Protocols Following Viral Myocarditis in Elite Sports: A Comprehensive Consensus Guideline",
      "Mitochondrial Dynamics in Cardiac Myocytes Post-Aerobic Conditioning: Microscopic and Biochemical Markers in Rodent Models"
    ],
    awards: [
      "Russian Cardiology Association Young Scientist Medal (2023)"
    ],
    certifications: [
      "Board Certified Cardiologist (RU)",
      "Advanced Cardiac Life Support (ACLS)"
    ],
    googleScholar: "https://scholar.google.com/citations?user=ElenaRostovaCardio",
    verified: true,
    email: "e.rostova@spb-research.ru"
  },
  {
    id: "ahmed-mabrouk",
    name: "Ahmed Mabrouk",
    title: "Sports Injury & Rehabilitation Specialist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    specialty: "Sports Injury & Rehabilitation",
    country: "Egypt",
    institution: "Mansoura University / Capital University",
    degree: "M.Sc. in Sports Health Sciences",
    orcid: "0000-0002-4422-9011",
    bio: "Ahmed Mabrouk is a Sports Injury and Rehabilitation Specialist and a Ph.D. researcher specializing in sports injuries, rehabilitation sciences, and human performance. Born in November 1996, he is an Egyptian scholar working closely with clinical rehab networks and the Ministry of Education in the United Arab Emirates (UAE) to enhance student-athlete human performance standards.",
    qualifications: [
      "Ph.D. Researcher in Sports Injury and Rehabilitation Sciences",
      "M.Sc. in Sports Health Sciences, Mansoura University",
      "B.Sc. in Sports Medicine and Rehabilitation, Mansoura University",
      "Academic Advisor under Ministry of Education (UAE)"
    ],
    researchInterests: [
      "Sports Injury Mechanics",
      "Neuromuscular Rehabilitation Staging",
      "Human Performance Optimization",
      "Kinesiology & Movement Science"
    ],
    publications: [
      "Kinetic Profiles of Quadriceps Activation in Eccentric Leg Extensions: A High-Density EMG Study",
      "Cardiorespiratory Rehabilitation Protocols Following Viral Myocarditis in Elite Sports: A Comprehensive Consensus Guideline"
    ],
    awards: [
      "UAE Ministry of Education Research Fellowship",
      "Mansoura University Academic Excellence Honor"
    ],
    certifications: [
      "Board Certified Sports Rehabilitation Specialist",
      "Licensed Physical Performance Coach (UAE)"
    ],
    googleScholar: "https://scholar.google.com/citations?user=AhmedMabroukRehab",
    verified: true,
    email: "ahmed.mabrouk@capital.edu.ae"
  }
];

export const FAQ_DATA = [
  {
    category: "Search & Database",
    question: "How do I search for a DOI or standard record?",
    answer: "You can paste the complete digital object identifier (e.g., 10.1016/j.hgps.2025.04.012) directly into Healthedia's central search bar on Healthedia. The engine indexes DOIs globally to extract abstracts, author metadata, and download links instantly."
  },
  {
    category: "Professional Verification",
    question: "What are the requirements for a researcher verification badge?",
    answer: "Verification is conducted strictly through our administrative board. You must create an account, complete your profile, and upload a valid institutional email address, ORCID iD, or active professional license. Reviews generally take 24–48 hours to complete."
  },
  {
    category: "Scientific Journal",
    question: "Is the Healthedia Global Journal open-access?",
    answer: "Yes. All articles published under Healthedia follow the Diamond Open Access model. This ensures immediate, permanent, free online availability for readers and no article processing charges (APCs) for verified academic authors."
  },
  {
    category: "Support & CV Management",
    question: "How can I update my biography, publications, and CV?",
    answer: "Once authenticated, go to the 'User Profile' section. From there, click on 'Edit Profile' to add your ORCID credentials, upload your latest curriculum vitae (CV) in PDF format, and update your list of publications."
  },
  {
    category: "Publication Policies",
    question: "What is the peer-review timeline?",
    answer: "The journal employs a rigorous double-blind peer-review workflow. Initial editorial triage takes 5-7 days, followed by 3-4 weeks of expert evaluation by at least two board-selected specialists in sports physiology, cardiology, or kinesiology."
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-001",
    title: "Advanced Cardiorespiratory Physiology & HIIT Conditioning",
    instructorId: "res-001",
    instructorName: "Dr. Evelyn Thorne",
    category: "Sports Science & Physiology",
    duration: "6 weeks (32 hours)",
    difficulty: "Advanced",
    coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    description: "Explore cardiorespiratory physiology, exercise biology, and oxygen delivery mechanisms in elite endurance athletes. Covers HIIT protocols, mitochondrial adaptation, and clinical energy availability (REDs)."
  },
  {
    id: "course-002",
    title: "Clinical Tendinopathy Rehabilitation & Load Programming",
    instructorId: "res-002",
    instructorName: "Dr. Marc Dubois",
    category: "Physical Therapy & Rehabilitation",
    duration: "4 weeks (20 hours)",
    difficulty: "Advanced",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    description: "A comprehensive course on mechanical loading, heavy eccentric protocols, and tissue restructuring for midportion Achilles and patellar tendinopathy. Perfect for physiotherapists."
  },
  {
    id: "course-003",
    title: "Molecular Biomarkers of Sarcopenia & Aging Prevention",
    instructorId: "res-003",
    instructorName: "Prof. Kenji Takahashi",
    category: "Molecular Medicine & Endocrinology",
    duration: "8 weeks (45 hours)",
    difficulty: "Advanced",
    coverImage: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=600",
    description: "Dive deep into muscular pathology, cellular transcription pathways, and skeletal muscle age-related decay. Covers myokine receptor kinetics (IL-15, Myostatin, Irisin)."
  },
  {
    id: "course-004",
    title: "Machine Learning Applications in 3D Running Gait Analysis",
    instructorId: "res-004",
    instructorName: "Dr. Alistair Vance",
    category: "Biomechanics & Kinesiology",
    duration: "5 weeks (25 hours)",
    difficulty: "Intermediate",
    coverImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600",
    description: "Utilize Python, computer vision, and random forest models to process 3D kinematic and force vector datasets. Gain practical skills in classifying gait deviations and injury risks."
  },
  {
    id: "course-005",
    title: "Sleep Science, Actigraphy & Athletic Recovery Kinetics",
    instructorId: "res-005",
    instructorName: "Dr. Sarah Jenkins",
    category: "Sleep Science & Sports Nutrition",
    duration: "6 weeks (30 hours)",
    difficulty: "Intermediate",
    coverImage: "https://images.unsplash.com/photo-1511295742364-92767fa62d9f?auto=format&fit=crop&q=80&w=600",
    description: "Analyze sleep architecture, actigraphic reporting, and recovery biochemistry in team sports. Examines practical nutrition, sleep hygiene coaching, and exogenous ketone supplementation."
  },
  {
    id: "course-006",
    title: "Sports Cardiology Consensus & Return to Play Post-Myocarditis",
    instructorId: "res-006",
    instructorName: "Dr. Elena Rostova",
    category: "Cardiology & Sports Medicine",
    duration: "4 weeks (18 hours)",
    difficulty: "Advanced",
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600",
    description: "Critical cardiorespiratory staging protocols following viral myocarditis in competitive sports. Train on cardiac MRI analysis, maximal stress tests, and gradual return-to-play algorithms."
  }
];

export const RESEARCHER_EXPERIENCES: Record<string, string[]> = {
  "res-001": [
    "Senior Clinical Physiologist, Sydney Human Performance Lab (2020 - Present)",
    "Lead Researcher, Cardiorespiratory Adaptation Cohort (2016 - 2020)",
    "Consulting Endocrinologist, Australian Olympic Team (2015 - 2018)"
  ],
  "res-002": [
    "Chief Orthopedic Physical Therapist, Sorbonne University Clinical Center (2018 - Present)",
    "Clinical Biomechanics Fellowship Advisor, INSEP (2014 - 2018)",
    "Physical Rehabilitation Consultant, Paris Saint-Germain FC (2015 - 2021)"
  ],
  "res-003": [
    "Professor of Molecular Medicine, Kyoto University School of Medicine (2015 - Present)",
    "Director of Stem Cell & Muscular Pathology Lab, Kyoto (2010 - 2015)",
    "Visiting Scholar, Harvard Stem Cell Institute (2008 - 2010)"
  ],
  "res-004": [
    "Senior Biomechanical Engineer & Lecturer, University of Edinburgh (2021 - Present)",
    "Kinematics Lab Coordinator, Scottish Institute of Sport (2017 - 2021)",
    "Computer Vision Consultant, Motion Analysis Corp (2015 - 2017)"
  ],
  "res-005": [
    "Director of Sleep Architecture & Human Recovery Lab, Harvard Medical School (2019 - Present)",
    "Performance Nutritionist, USA Track & Field (2015 - 2019)",
    "Postdoctoral Fellow, Tufts Nutrition Research Center (2012 - 2015)"
  ],
  "res-006": [
    "Head of Sports Cardiology Division, Saint Petersburg Research Institute (2020 - Present)",
    "Consulting Cardiologist, Russian National Athletes Association (2016 - 2020)",
    "Clinical Cardiology Resident, Pavlov First Medical University (2011 - 2016)"
  ]
};

export const RESEARCHER_TRANSLATIONS: Record<string, Record<string, {
  title: string;
  specialty: string;
  institution: string;
  degree: string;
  bio: string;
  researchInterests: string[];
  qualifications: string[];
  awards: string[];
  certifications: string[];
  experience: string[];
}>> = {
  "res-001": {
    ar: {
      title: "د. دكتوراه في الطب",
      specialty: "علوم الرياضة ووظائف الأعضاء",
      institution: "مختبر الأداء البشري بجامعة سيدني",
      degree: "دكتوراه في فيزيولوجيا التمارين الرياضية، دكتوراه في الطب",
      bio: "الدكتورة إيفلين ثورن هي أخصائية فيزيولوجيا سريرية متخصصة في التكيف القلبي الرئوي لدى نخبة رياضيي التحمل. تركز تجاربها السريرية على استخدام الطاقة واستجابات الغدد الصماء تحت الضغط البدني الشديد.",
      researchInterests: ["التكيف الميتوكوندري", "تثبيط الغدد الصماء في رياضة النخبة (REDs)", "ميكانيكا التكييف عالي الكثافة"],
      qualifications: ["دكتوراه في الطب الرياضي، جامعة سيدني", "دكتوراه في علم وظائف الأعضاء الخلوي، الجامعة الوطنية الأسترالية", "شهادة البورد في الطب الباطني وعلم الغدد الصماء الرياضي"],
      awards: ["جائزة التميز من الجمعية الدولية للتغذية الرياضية (2024)", "زمالة البحوث الطبية الأسترالية (2022)"],
      certifications: ["زميل الكلية الأمريكية للطب الرياضي (FACSM)", "أخصائي معتمد في القوة والتكييف (CSCS)"],
      experience: ["أخصائي فيزيولوجيا سريرية أول، مختبر الأداء البشري بسيدني (2020 - الحالي)", "الباحث الرئيسي، مجموعة التكيف القلبي الرئوي (2016 - 2020)", "استشاري الغدد الصماء، الفريق الأولمبي الأسترالي (2015 - 2018)"]
    },
    fr: {
      title: "Dr. méd.",
      specialty: "Sciences du sport et physiologie",
      institution: "Laboratoire de performance humaine de l'Université de Sydney",
      degree: "Ph.D. en physiologie de l'exercice, M.D.",
      bio: "La Dre Evelyn Thorne est une physiologiste clinique spécialisée dans l'adaptation cardiorespiratoire chez les athlètes d'endurance d'élite. Ses essais cliniques portent sur l'utilisation de l'énergie et les réponses endocriniennes sous un effort physique extrême.",
      researchInterests: ["Adaptation mitochondriale", "Suppression endocrinienne dans les sports d'élite (REDs)", "Mécanique du conditionnement à haute intensité"],
      qualifications: ["M.D. en médecine du sport, Université de Sydney", "Ph.D. en physiologie cellulaire, Université nationale australienne", "Certification en médecine interne et endocrinologie du sport"],
      awards: ["Prix d'excellence de la Société internationale de nutrition sportive (2024)", "Bourse de recherche médicale australienne (2022)"],
      certifications: ["Membre de l'American College of Sports Medicine (FACSM)", "Spécialiste certifié en force et conditionnement (CSCS)"],
      experience: ["Physiologiste clinique principal, Laboratoire de performance humaine de Sydney (2020 - Présent)", "Chercheur principal, Cohorte d'adaptation cardiorespiratoire (2016 - 2020)", "Endocrinologue consultant, Équipe olympique australienne (2015 - 2018)"]
    },
    de: {
      title: "Dr. med.",
      specialty: "Sportwissenschaft & Physiologie",
      institution: "Human Performance Lab der Universität Sydney",
      degree: "Ph.D. in Leistungsphysiologie, M.D.",
      bio: "Dr. Evelyn Thorne ist eine klinische Physiologin, die sich auf die kardiorespiratorische Anpassung bei Elite-Ausdauersportlern spezialisiert hat. Ihre klinischen Studien konzentrieren sich auf den Energiehaushalt und endokrine Reaktionen bei extremer körperlicher Belastung.",
      researchInterests: ["Mitochondriale Anpassung", "Endokrine Suppression im Spitzensport (REDs)", "Mechanik des hochintensiven Trainings"],
      qualifications: ["M.D. in Sportmedizin, Universität Sydney", "Ph.D. in Zellphysiologie, Australian National University", "Facharztzulassung für Innere Medizin und Sportendokrinologie"],
      awards: ["Exzellenzpreis der International Society of Sports Nutrition (2024)", "Australisches Medizinisches Forschungsstipendium (2022)"],
      certifications: ["Fellow des American College of Sports Medicine (FACSM)", "Zertifizierter Kraft- und Konditionsspezialist (CSCS)"],
      experience: ["Senior Klinischer Physiologe, Sydney Human Performance Lab (2020 - heute)", "Leitender Forscher, Kohorte für kardiorespiratorische Anpassung (2016 - 2020)", "Beratender Endokrinologe, Australisches Olympiateam (2015 - 2018)"]
    }
  },
  "res-002": {
    ar: {
      title: "د.",
      specialty: "العلاج الطبيعي وإعادة التأهيل",
      institution: "المركز السريري لجامعة السوربون",
      degree: "دكتوراه في علم الحركة وإعادة تأهيل العضلات والعظام",
      bio: "يعمل الدكتور مارك دوبوا في تقاطع الميكانيكا الحيوية السريرية والعلاج الطبيعي اليدوي. أبحاثه معترف بها عالميًا لتطوير أطر إعادة تأهيل أوتار التحميل الثقيل.",
      researchInterests: ["مسارات إعادة تشكيل اعتلال الأوتار", "نماذج التحميل الزائد اللامركزي", "مراحل القلبي الرئوي بعد الإصابة بالفيروسات"],
      qualifications: ["دكتوراه في علم الحركة التأهيلي، جامعة السوربون", "ماجستير في العلاج الطبيعي، جامعة باريس", "زمالة سريرية في إصابات العضلات والعظام، INSEP"],
      awards: ["جائزة الابتكار الأوروبية للعلاج الطبيعي الرياضي (2023)", "ميدالية التميز البحثي السريري من السوربون (2021)"],
      certifications: ["أخصائي علاج طبيعي مرخص (فرنسا)", "ممارس متقدم في الوخز بالإبر الجافة"],
      experience: ["رئيس أخصائيي العلاج الطبيعي للعظام، المركز السريري بجامعة السوربون (2018 - الحالي)", "مستشار زمالة الميكانيكا الحيوية السريرية، INSEP (2014 - 2018)", "مستشار إعادة التأهيل البدني، نادي باريس سان جيرمان (2015 - 2021)"]
    },
    fr: {
      title: "Dr.",
      specialty: "Physiothérapie et réadaptation",
      institution: "Centre clinique de l'Université de la Sorbonne",
      degree: "Ph.D. en kinésiologie et réadaptation musculo-squelettique",
      bio: "Le Dr Marc Dubois travaille à l'intersection de la biomécanique clinique et de la thérapie physique manuelle. Ses recherches sont mondialement reconnues pour le développement de protocoles de rééducation des tendons par surcharge excentrique.",
      researchInterests: ["Voies de remodelage des tendinopathies", "Paradigmes de surcharge excentrique", "Évaluation cardiorespiratoire post-virale"],
      qualifications: ["Ph.D. en kinésiologie de réadaptation, Université de la Sorbonne", "M.S. en physiothérapie, Université de Paris", "Fellowship clinique en traumatologie musculo-squelettique, INSEP"],
      awards: ["Prix européen de l'innovation en physiothérapie sportive (2023)", "Médaille d'excellence de recherche clinique de la Sorbonne (2021)"],
      certifications: ["Kinésithérapeute agréé (France)", "Praticien avancé en aiguilletage à sec"],
      experience: ["Thérapeute physique orthopédique en chef, Centre clinique de la Sorbonne (2018 - Présent)", "Conseiller en recherche clinique en biomécanique, INSEP (2014 - 2018)", "Consultant en rééducation physique, Paris Saint-Germain FC (2015 - 2021)"]
    },
    de: {
      title: "Dr.",
      specialty: "Physiotherapie & Rehabilitation",
      institution: "Sorbonne University Clinical Center",
      degree: "Ph.D. in Kinesiologie & Rehabilitationsmedizin",
      bio: "Dr. Marc Dubois arbeitet an der Schnittstelle von klinischer Biomechanik und manueller Physiotherapie. Seine Forschung ist weltweit anerkannt für die Entwicklung von Trainingsprogrammen zur Sehnenrehabilitation unter hoher Belastung.",
      researchInterests: ["Remodellierungswege bei Tendinopathie", "Exzentrische Überlastungsparadigmen", "Kardiorespiratorische Erholung nach viralen Infektionen"],
      qualifications: ["Ph.D. in rehabilitativer Kinesiologie, Sorbonne Universität", "M.S. in Physiotherapie, Universität Paris", "Klinisches Stipendium für Muskel-Skelett-Verletzungen, INSEP"],
      awards: ["Europäischer Sportphysiotherapie-Innovationspreis (2023)", "Sorbonne-Medaille für hervorragende klinische Forschung (2021)"],
      certifications: ["Zulassung als Physiotherapeut (Frankreich)", "Zertifizierter Dry Needling Therapeut (Advanced)"],
      experience: ["Leitender orthopädischer Physiotherapeut, Sorbonne Clinical Center (2018 - heute)", "Berater für klinische Biomechanik-Stipendien, INSEP (2014 - 2018)", "Berater für physische Rehabilitation, Paris Saint-Germain FC (2015 - 2021)"]
    }
  },
  "res-003": {
    ar: {
      title: "أستاذ بروفيسور",
      specialty: "الطب الجزيئي وعلم الغدد الصماء",
      institution: "كلية الطب بجامعة كيوتو",
      degree: "دكتوراه في علم الأمراض الجزيئي",
      bio: "البروفيسور تاكاهاشي هو عالم بيولوجيا جزيئية رائد يبحث في الحفاظ على الأنسجة العضلية. يعزل مختبره المؤشرات الحيوية للمييوكين التي تتنبأ بنشاط الخلايا الجذعية العضلية أثناء التدهور الديناميكي المرتبط بالعمر.",
      researchInterests: ["علم الوراثة وعلاجات الساركوبينيا", "نقل مستقبلات المييوكين", "التكيف الأيضي الكيتوني"],
      qualifications: ["دكتوراه في علم الأمراض، جامعة كيوتو", "ماجستير في الكيمياء الحيوية، جامعة طوكيو"],
      awards: ["جائزة أكاديمية اليابان للعلوم الطبية (2025)", "جائزة الإنجاز مدى الحياة من جمعية العضلات لآسيا والمحيط الهادئ (2023)"],
      certifications: ["أخصائي علم أمراض كيميائي حيوي مسجل، اليابان"],
      experience: ["أستاذ الطب الجزيئي، كلية الطب بجامعة كيوتو (2015 - الحالي)", "مدير مختبر الخلايا الجذعية وأمراض العضلات، كيوتو (2010 - 2015)", "باحث زائر، معهد هارفارد للخلايا الجذعية (2008 - 2010)"]
    },
    fr: {
      title: "Prof.",
      specialty: "Médecine moléculaire et endocrinologie",
      institution: "Faculté de médecine de l'Université de Kyoto",
      degree: "Ph.D. en pathologie moléculaire",
      bio: "Le professeur Takahashi est un biologiste moléculaire de premier plan qui étudie la préservation des tissus musculaires. Son laboratoire isole des biomarqueurs de myokines qui prédisent l'activité des cellules souches musculaires lors du déclin dynamique lié à l'âge.",
      researchInterests: ["Génétique et thérapie de la sarcopénie", "Transduction des récepteurs des myokines", "Adaptation métabolique des cétones"],
      qualifications: ["Ph.D. en pathologie, Université de Kyoto", "M.S. en biochimie, Université de Tokyo"],
      awards: ["Prix de l'Académie du Japon pour les sciences médicales (2025)", "Prix d'excellence de la Société de biologie musculaire d'Asie-Pacifique (2023)"],
      certifications: ["Pathologiste biochimique enregistré, JP"],
      experience: ["Professeur de médecine moléculaire, Faculté de médecine de l'Université de Kyoto (2015 - Présent)", "Directeur du laboratoire des cellules souches et de pathologie musculaire, Kyoto (2010 - 2015)", "Chercheur invité, Harvard Stem Cell Institute (2008 - 2010)"]
    },
    de: {
      title: "Prof.",
      specialty: "Molekulare Medizin & Endokrinologie",
      institution: "Kyoto University School of Medicine",
      degree: "Ph.D. in molekularer Pathologie",
      bio: "Professor Takahashi ist ein führender Molekularbiologe, der sich mit dem Erhalt von Muskelgewebe beschäftigt. Sein Labor isoliert Myokin-Biomarker, die die Aktivität von Muskelstammzellen während des altersbedingten Abbaus vorhersagen.",
      researchInterests: ["Sarkopenie-Genetik und -Therapie", "Myokinrezeptor-Transduktion", "Ketogene Stoffwechselanpassung"],
      qualifications: ["Ph.D. in Pathologie, Kyoto-Universität", "M.S. in Biochemie, Universität Tokio"],
      awards: ["Japan-Akademie-Preis für Medizinische Wissenschaft (2025)", "Lebenswerk-Auszeichnung der Asia-Pacific Muscle Society (2023)"],
      certifications: ["Eingetragener Biochemischer Pathologe, JP"],
      experience: ["Professor für Molekulare Medizin, Kyoto University School of Medicine (2015 - heute)", "Leiter des Labors für Stammzellen & Muskelpathologie, Kyoto (2010 - 2015)", "Gastwissenschaftler, Harvard Stem Cell Institute (2008 - 2010)"]
    }
  },
  "res-004": {
    ar: {
      title: "د.",
      specialty: "الميكانيكا الحيوية وعلم الحركة",
      institution: "جامعة إدنبرة",
      degree: "دكتوراه في الحركة البشرية وعلم الحركة الحيوية",
      bio: "الدكتور فانس هو مهندس ميكانيكي حيوي متخصص في ميكانيكا المشي والحركة الرياضية. يستخدم الرؤية الحاسوبية والميكانيكا الحيوية ثلاثية الأبعاد لمنع إصابات الأربطة في الرياضات الاحتكاكية.",
      researchInterests: ["مراقبة المشي بالرؤية الحاسوبية", "أنماط تحميل الرباط الصليبي العصبي العضلي", "تشخيص موجهات لوحة القوة"],
      qualifications: ["دكتوراه في الهندسة الميكانيكية، جامعة إدنبرة", "بكالوريوس في علم الحركة، جامعة غلاسكو"],
      awards: ["جائزة الباحث الشاب في العلوم الرياضية بالمملكة المتحدة (2022)", "منحة الابتكار من الأكاديمية الملكية للهندسة (2023)"],
      certifications: ["مهندس معتمد (CENG - المملكة المتحدة)", "أخصائي معتمد في تحليل المشي"],
      experience: ["مهندس ميكانيكا حيوية ومحاضر أول، جامعة إدنبرة (2021 - الحالي)", "منسق مختبر الحركة، المعهد الاسكتلندي للرياضة (2017 - 2021)", "مستشار الرؤية الحاسوبية، شركة تحليل الحركة (2015 - 2017)"]
    },
    fr: {
      title: "Dr.",
      specialty: "Biomécanique et kinésiologie",
      institution: "Université d'Édimbourg",
      degree: "Ph.D. en cinématique et mouvement humain",
      bio: "Le Dr Vance est un ingénieur biomécanique spécialisé dans la cinématique de la marche et le mouvement athlétique. Il applique la vision par ordinateur et la biomécanique 3D pour prévenir les blessures ligamentaires dans les sports de contact.",
      researchInterests: ["Analyse de la marche par vision par ordinateur", "Modèles de charge neuromusculaire du ligament croisé", "Diagnostic des forces de réaction au sol par plateforme"],
      qualifications: ["Ph.D. en génie mécanique, Université d'Édimbourg", "B.S. en kinésiologie, Université de Glasgow"],
      awards: ["Prix du jeune chercheur en sciences du sport du Royaume-Uni (2022)", "Bourse d'innovation de la Royal Academy of Engineering (2023)"],
      certifications: ["Ingénieur agréé (CENG - UK)", "Spécialiste agréé de l'analyse de la marche"],
      experience: ["Ingénieur biomécanique senior et conférencier, Université d'Édimbourg (2021 - Présent)", "Coordonnateur du laboratoire de cinématique, Institut écossais du sport (2017 - 2021)", "Consultant en vision par ordinateur, Motion Analysis Corp (2015 - 2017)"]
    },
    de: {
      title: "Dr.",
      specialty: "Biomechanik & Kinesiologie",
      institution: "Universität Edinburgh",
      degree: "Ph.D. in Kinematik und menschlicher Bewegung",
      bio: "Dr. Vance ist ein Biomechanik-Ingenieur, der sich auf Gangmechanik und sportliche Bewegungsabläufe spezialisiert hat. Er nutzt Computer Vision und 3D-Kinematik, um Bandverletzungen im Kontaktsport zu verhindern.",
      researchInterests: ["Ganganalyse mittels Computer-Vision", "Neuromuskuläre Belastungsmuster des Kreuzbands (ACL)", "Kraftmessplatten-Vektordiagnostik"],
      qualifications: ["Ph.D. in Maschinenbau, Universität Edinburgh", "B.S. in Kinesiologie, Universität Glasgow"],
      awards: ["UK Sports Science Young Investigator Award (2022)", "Innovationsstipendium der Royal Academy of Engineering (2023)"],
      certifications: ["Chartered Engineer (CENG - UK)", "Zertifizierter Gangspezialist"],
      experience: ["Senior Biomechanischer Ingenieur & Dozent, Universität Edinburgh (2021 - heute)", "Koordinator des Kinematik-Labors, Scottish Institute of Sport (2017 - 2021)", "Berater für Computer Vision, Motion Analysis Corp (2015 - 2017)"]
    }
  },
  "res-005": {
    ar: {
      title: "د.",
      specialty: "علوم النوم والتغذية الرياضية",
      institution: "كلية الطب بجامعة هارفارد",
      degree: "دكتوراه في الكيمياء الحيوية الغذائية، دكتوراه في التربية",
      bio: "تتناول الأبحاث السريرية للدكتورة سارة جينكينز تدخلات التغذية الدقيقة وبنية النوم. يقدم مختبر النوم التابع لها تدريبًا للتعافي للعديد من البرامج الرياضية الوطنية.",
      researchInterests: ["استرات الكيتون الخارجية", "تتبع تخطيط النوم بالتحرك النشط", "تغذية إشارات البناء العضلي"],
      qualifications: ["دكتوراه في العلوم الغذائية، جامعة هارفارد", "ماجستير في التغذية السريرية، جامعة تافتس", "أخصائي معتمد من البورد في التغذية الرياضية (CSSD)"],
      awards: ["جائزة أبحاث هارفارد الطبية المتميزة (2024)", "أخصائي التغذية الرياضية للعام من الجمعية الأمريكية للتغذية (2023)"],
      certifications: ["أخصائي تغذية مسجل (RD)", "أخصائي تغذية رياضية معتمد (CISSN)"],
      experience: ["مدير مختبر بنية النوم والتعافي البشري، كلية الطب بجامعة هارفارد (2019 - الحالي)", "أخصائي تغذية الأداء، الاتحاد الأمريكي لألعاب القوى (2015 - 2019)", "زميل ما بعد الدكتوراه، مركز تافتس لأبحاث التغذية البشرية (2012 - 2015)"]
    },
    fr: {
      title: "Dr.",
      specialty: "Science du sommeil et nutrition sportive",
      institution: "Faculté de médecine de Harvard",
      degree: "Ph.D. en biochimie nutritionnelle, Ed.D.",
      bio: "Les recherches cliniques de la Dre Sarah Jenkins portent sur la micronutrition et l'architecture du sommeil. Son laboratoire de recherche sur le sommeil fournit un accompagnement à la récupération pour de nombreux programmes athlétiques nationaux.",
      researchInterests: ["Monoesters de cétones exogènes", "Suivi actigraphique de l'hygiène du sommeil", "Nutrition de signalisation anabolique"],
      qualifications: ["Ph.D. en sciences de la nutrition, Université Harvard", "Master en diététique clinique, Université Tufts", "Spécialiste certifié en diététique sportive (CSSD)"],
      awards: ["Prix de recherche clinique des anciens de la faculté de médecine de Harvard (2024)", "Nutritionniste sportif de l'année de l'American Society for Nutrition (2023)"],
      certifications: ["Diététicien agréé (RD)", "Nutritionniste sportif certifié (CISSN)"],
      experience: ["Directrice du laboratoire d'architecture du sommeil et de récupération humaine, Harvard Medical School (2019 - Présent)", "Nutritionniste de performance, USA Track & Field (2015 - 2019)", "Chercheuse postdoctorale, Centre de recherche en nutrition humaine de Tufts (2012 - 2015)"]
    },
    de: {
      title: "Dr.",
      specialty: "Schlafforschung & Sporternährung",
      institution: "Harvard Medical School",
      degree: "Ph.D. in Ernährungswissenschaften, Ed.D.",
      bio: "Die klinische Forschung von Dr. Sarah Jenkins befasst sich mit Mikronährstoffen und der Schlafarchitektur. Ihr Schlaflabor berät und betreut zahlreiche nationale Sportprogramme bei der Erholung.",
      researchInterests: ["Exogene Keton-Monoester", "Schlaf-Aktigraphie-Verlaufskontrolle", "Ernährungsinduzierte anabole Signalwege"],
      qualifications: ["Ph.D. in Ernährungswissenschaften, Harvard University", "Master in klinischer Diätetik, Tufts University", "Zertifizierter Spezialist für Sportdiätetik (CSSD)"],
      awards: ["Harvard Medical Alumni Clinical Research Award (2024)", "American Society for Nutrition Sporternährungswissenschaftler des Jahres (2023)"],
      certifications: ["Eingetragener Diätassistent (RD)", "Zertifizierter Sporternährungsberater (CISSN)"],
      experience: ["Leiterin des Labors für Schlafarchitektur & Regeneration, Harvard Medical School (2019 - heute)", "Performance-Ernährungsberaterin, USA Track & Field (2015 - 2019)", "Postdoktorandin, Tufts Nutrition Research Center (2012 - 2015)"]
    }
  },
  "res-006": {
    ar: {
      title: "د.",
      specialty: "أبحاث أمراض القلب والطب الرياضي",
      institution: "معهد سانت بطرسبرغ الحكومي للبحوث",
      degree: "دكتوراه في العلوم الطبية",
      bio: "الدكتورة إيلينا روستوفا هي طبيبة قلب باحثة متخصصة في إعادة تشكيل الأنسجة القلبية. يصمم فريقها بروتوكولات فحص القلب للرياضيين الشباب العائدين من التهابات فيروسية حادة.",
      researchInterests: ["تتبع التهاب عضلة القلب بعد الفيروسات", "المؤشرات الحيوية بالرنين المغناطيسي للقلب عالي الدقة", "اندماج الميتوكوندريا والبقاء على قيد الحياة"],
      qualifications: ["دكتوراه في العلوم الطبية، جامعة سانت بطرسبرغ الحكومية", "إقامة ما بعد الدكتوراه في أمراض القلب السريرية، جامعة بافلوف الطبية الأولى"],
      awards: ["ميدالية باحث شاب من جمعية أمراض القلب الروسية (2023)"],
      certifications: ["طبيب قلب معتمد (روسيا)", "دعم الحياة القلبية المتقدم (ACLS)"],
      experience: ["رئيس قسم أمراض القلب الرياضية، معهد سانت بطرسبرغ للأبحاث (2020 - الحالي)", "استشاري أمراض القلب، الاتحاد الروسي للرياضيين الوطنيين (2016 - 2020)", "طبيب مقيم في أمراض القلب، جامعة بافلوف الطبية الأولى (2011 - 2016)"]
    },
    fr: {
      title: "Dr.",
      specialty: "Cardiologie et médecine du sport",
      institution: "Institut d'État de recherche de Saint-Pétersbourg",
      degree: "Dr. med. (Docteur en sciences médicales)",
      bio: "La Dre Elena Rostova est une cardiologue chercheuse spécialisée dans le remodelage des tissus cardiaques. Son équipe conçoit des protocoles de dépistage cardiaque pour les jeunes athlètes après des infections virales aiguës.",
      researchInterests: ["Suivi des myocardites post-virales", "Biomarqueurs d'IRM cardiaque haute résolution", "Fusion mitochondriale et survie cellulaire"],
      qualifications: ["Docteur en sciences médicales (Dr. med.), Université d'État de Saint-Pétersbourg", "Résidence postdoctorale en cardiologie clinique, Première université médicale Pavlov"],
      awards: ["Médaille du jeune scientifique de l'Association russe de cardiologie (2023)"],
      certifications: ["Cardiologue agréé (RU)", "Soutien cardiorespiratoire avancé (ACLS)"],
      experience: ["Chef de la division de cardiologie du sport, Institut de recherche de Saint-Pétersbourg (2020 - Présent)", "Cardiologue consultant, Association nationale des athlètes russes (2016 - 2020)", "Interne en cardiologie clinique, Première université médicale Pavlov (2011 - 2016)"]
    },
    de: {
      title: "Dr.",
      specialty: "Kardiologie & Sportmedizin",
      institution: "Staatliches Forschungsinstitut Sankt Petersburg",
      degree: "Dr. med. (Doktor der Medizinischen Wissenschaften)",
      bio: "Dr. Elena Rostova ist eine kardiologische Forscherin, die sich auf den Gewebeumbau des Herzens spezialisiert hat. Ihr Team entwickelt Screening-Protokolle für junge Sportler nach akuten Virusinfektionen.",
      researchInterests: ["Nachverfolgung von Myokarditis nach viralen Infekten", "Hochauflösende MRT-Biomarker des Herzens", "Mitochondriale Fusion und Zellüberleben"],
      qualifications: ["Doktor der Medizinischen Wissenschaften (Dr. med.), Staatliche Universität Sankt Petersburg", "Postdoktorale Facharztausbildung in klinischer Kardiologie, Erste Medizinische Pawlow-Universität"],
      awards: ["Kardiologie-Forschungsmedaille für junge Wissenschaftler (2023)"],
      certifications: ["Zertifizierter Kardiologe (RU)", "Advanced Cardiac Life Support (ACLS)"],
      experience: ["Leiterin der Abteilung für Sportkardiologie, Forschungsinstitut Sankt Petersburg (2020 - heute)", "Beratende Kardiologin, Russischer Nationaler Sportverband (2016 - 2020)", "Facharztausbildung Kardiologie, Erste Medizinische Pawlow-Universität (2011 - 2016)"]
    }
  }
};
