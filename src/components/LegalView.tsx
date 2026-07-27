import React, { useState, useEffect } from "react";
import { Scale, Shield, FileCheck, ArrowRight, BookOpen } from "lucide-react";

interface LegalViewProps {
  initialSection: "terms" | "privacy" | "publication-policies";
}

export default function LegalView({ initialSection }: LegalViewProps) {
  const [activeSection, setActiveSection] = useState<"terms" | "privacy" | "publication-policies">("terms");

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  return (
    <div className="flex-grow bg-white py-10 font-sans animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="border-b border-neutral-200 pb-6 mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight uppercase">
            Institutional Registry Policies
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
            Official guidelines, data privacy frameworks, copyright allocations, and publication ethics governing Healthedia.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side Tabs */}
          <div className="lg:col-span-1 space-y-1">
            {[
              { id: "terms", label: "Terms & Conditions", icon: Scale },
              { id: "privacy", label: "Privacy Policy (GDPR)", icon: Shield },
              { id: "publication-policies", label: "Publication Policies", icon: FileCheck }
            ].map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left border cursor-pointer rounded-none ${
                    activeSection === section.id
                      ? "bg-black text-white border-black"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-black border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Legal Text Area */}
          <div className="lg:col-span-3 border border-neutral-200 p-6 sm:p-8 bg-white max-w-none text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans space-y-6 rounded-none">
            
            {/* 1. TERMS & CONDITIONS */}
            {activeSection === "terms" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-200 pb-4">
                  <h2 className="text-lg font-bold text-black uppercase font-sans">
                    Terms & Conditions of Use
                  </h2>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase tracking-wider">
                    Last Revised: July 15, 2026 • Document Version: 4.2.1
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    Welcome to the **Healthedia Global Health & Performance Archive**. By accessing our indexed records, submitting metadata, claims, or interacting with our peer-review systems, you explicitly agree to conform to these Terms & Conditions.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">1. Open Access & Redistributive Licenses</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    All full-text articles authored and uploaded to the Healthedia Scientific Journal are syndicated under a **Creative Commons Attribution 4.0 International (CC BY 4.0)** license. You are permitted to share, copy, and redistribute the material in any medium, provided you give appropriate credit to original authors and cite DOI records perfectly.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">2. Scholar Credentials & Claim Authorization</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    Registered users claiming authorship of existing publications or submitting clinical materials warrant that their credentials are authentic. Fabricating affiliations, ORCID associations, or medical license details constitutes a material breach and will trigger immediate account termination and reporting to respective academic registries.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">3. Limitations of Clinical Advice</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600 bg-neutral-50 p-3 border border-neutral-100 rounded-none">
                    <strong>Disclaimer:</strong> The research papers, sports physiology reviews, and clinical protocols indexed inside Healthedia are for academic research, education, and peer-to-peer discussions. Under no circumstances should they be used as absolute clinical treatment prescriptions or medical diagnosis frameworks without active local certified practitioner intervention.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">4. Automated Scraping & Crawler Governance</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    Healthedia permits search crawlers and data syndicators to harvest abstracts and DOI metadata for indexing purposes. However, aggressive scraping that disrupts Core Web Vitals, API servers, or container services will trigger automated IP restrictions.
                  </p>
                </div>
              </div>
            )}

            {/* 2. PRIVACY POLICY */}
            {activeSection === "privacy" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-200 pb-4">
                  <h2 className="text-lg font-bold text-black uppercase font-sans">
                    Privacy Policy (GDPR Compliant)
                  </h2>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase tracking-wider">
                    Last Revised: July 15, 2026 • General Data Protection Regulation Statement
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    Healthedia is committed to maintaining pristine standards of personal and professional data protection. This Privacy Policy clarifies how we gather, protect, and process user credentials globally.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">1. Gathered Information</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    During registration or verification, we collect: Name, Salutation, Institutional Affiliation, Academic Specialty, Email Address, ORCID ID, and simulated physical documents (CV files). This metadata is strictly used to compile our professionals directory.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">2. Cookie Policy & System Storage</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    Our platform uses standard client-side storage mechanisms (cookies and `localStorage`) to persist active sessions, support ticket status tracking, and maintain advanced filter states. No third-party marketing trackers or ad-tech cookies are ever deployed.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">3. GDPR Right to Rectification & Deletion</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    Under the General Data Protection Regulation (GDPR), all authors and users maintain absolute authority to:
                  </p>
                  <ul className="list-disc pl-8 space-y-1 text-neutral-600 text-xs">
                    <li>Edit or restrict discoverability of personal biography details inside Healthedia's public directory.</li>
                    <li>Download a portable copy of registered publications, settings, and logged tickets.</li>
                    <li>Instruct administrative review teams to delete their account database profiles entirely.</li>
                  </ul>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">4. Third-Party Data Dissemination</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    We never rent, sell, or commercialize registered researcher profiles. Email details are only visible to verified professional peers if explicitly approved in the account's privacy options.
                  </p>
                </div>
              </div>
            )}

            {/* 3. PUBLICATION POLICIES */}
            {activeSection === "publication-policies" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-200 pb-4">
                  <h2 className="text-lg font-bold text-black uppercase font-sans">
                    Publication Policies & Ethics
                  </h2>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase tracking-wider">
                    Core Practices • Committee on Publication Ethics (COPE) Guidelines
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    Healthedia enforces the highest academic ethics to safeguard the scientific record. This section outlines our mandatory requirements for researchers submitting or indexing clinical and sports-science papers.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">1. Plagiarism & Authorship Guidelines</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    All submitted research is analyzed via Turnitin. Manuscripts displaying similarity indexes exceeding 10% or containing unattributed paraphrased text are immediately rejected. Authorship lists must accurately credit all individuals who made substantial intellectual contributions to study design, data collection, or statistical evaluations.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">2. Data Transparency & Integrity</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    Studies analyzing human clinical cohorts (e.g., cardiorespiratory rehabilitation or musculoskeletal exercises) must supply complete methodology documentation. Authors should be prepared to securely share raw, anonymized datasets with the editorial board upon special review request to prevent data fabrication.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">3. Retractions & Corrections</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    If inadvertent scientific errors are identified post-publication, Healthedia will cooperate with the authors to publish a formal erratum note. In instances of verified data manipulation, plagiarized elements, or duplicate submissions, Healthedia will execute a formal retraction of the article's online PDF and update DOI metadata.
                  </p>

                  <h3 className="font-mono text-xs font-bold text-black uppercase tracking-wider">4. Conflicts of Interest</h3>
                  <p className="pl-4 border-l border-neutral-200 text-neutral-600">
                    Authors are required to declare any financial associations, funding grants, corporate sponsorships, or professional rivalries that could introduce bias into experimental evaluations or statistical results.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
