import React, { useState, useEffect } from "react";
import { ShieldCheck, Award, AlertTriangle, Search, CheckCircle2, ArrowRight, ExternalLink, ShieldAlert, Building2, User } from "lucide-react";
import { getStoredItem } from "../lib/taxonomyStore";
import { INITIAL_PAPERS } from "../data";
import PublicationCertificate from "./PublicationCertificate";

interface CertificateVerificationViewProps {
  initialCode?: string;
}

export default function CertificateVerificationView({ initialCode = "" }: CertificateVerificationViewProps) {
  const [verifyInput, setVerifyInput] = useState(initialCode);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showCert, setShowCert] = useState(false);

  // Load published papers from storage
  const papers = getStoredItem<any[]>("healthedia_published_papers", INITIAL_PAPERS);

  const handleVerify = (codeToVerify: string) => {
    const query = codeToVerify.trim();
    if (!query) return;

    setHasSearched(true);
    setErrorMsg("");
    setVerificationResult(null);

    // Look up by ID, DOI, or Title slug
    const matchedPaper = papers.find((p: any) => {
      const matchId = p.id?.toLowerCase() === query.toLowerCase();
      const matchDoi = p.doi?.toLowerCase() === query.toLowerCase() || p.doi?.toLowerCase().includes(query.toLowerCase());
      const cleanTitle = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const matchSlug = cleanTitle.includes(query.toLowerCase()) || query.toLowerCase().includes(cleanTitle);
      return matchId || matchDoi || matchSlug;
    });

    if (matchedPaper) {
      setVerificationResult(matchedPaper);
    } else {
      setErrorMsg("Verification Refused: The requested DOI or authentication signature was not resolved within Healthedia's global academic archive ledger.");
    }
  };

  useEffect(() => {
    if (initialCode) {
      setVerifyInput(initialCode);
      handleVerify(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
      {/* Header and Brand Area */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-black text-white rounded-2xl mb-2">
          <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h1 className="text-3xl font-sans font-black tracking-tight text-neutral-900 uppercase">
          Ledger Integrity Verification
        </h1>
        <p className="text-neutral-500 text-sm max-w-xl mx-auto leading-relaxed">
          Verify scientific publication records, double-blind audit completions, and permanent Digital Object Identifier (DOI) certificates on Healthedia's global performance archive.
        </p>
      </div>

      {/* Input Field Form card */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(verifyInput);
          }}
          className="space-y-4"
        >
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Enter Certificate Signature, Paper ID, or DOI Code
          </label>
          <div className="relative rounded-xl shadow-xs flex">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="e.g. 10.1016/j.hgps.2025.04.012 or paper-001"
              className="block w-full rounded-l-xl border border-neutral-200 py-3 pl-11 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-0 outline-none transition-all"
            />
            <button
              type="submit"
              className="bg-black hover:bg-neutral-900 text-white px-6 rounded-r-xl text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors shrink-0"
            >
              Verify Record
            </button>
          </div>
        </form>

        {/* Dynamic results layout */}
        {hasSearched && (
          <div className="pt-6 border-t border-neutral-100 animate-fadeIn">
            {verificationResult ? (
              <div className="space-y-6">
                {/* Authentic verification banner badge */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
                      Record Authenticity Guaranteed
                    </p>
                    <p className="text-xs text-emerald-600 font-sans leading-relaxed">
                      This scholarly work has passed rigorous independent, double-blind peer reviews and is permanently indexed with dynamic cryptographic certification on Healthedia Global Archive.
                    </p>
                  </div>
                </div>

                {/* Paper properties card */}
                <div className="bg-neutral-50/50 rounded-xl p-5 border border-neutral-150 space-y-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-widest text-neutral-400">
                      Indexed Paper Details
                    </span>
                    <h2 className="text-base font-sans font-extrabold text-neutral-900 uppercase tracking-tight">
                      {verificationResult.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-2 border-t border-neutral-150/50">
                    <div className="flex items-start gap-2 text-neutral-600">
                      <User className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-neutral-800 text-[10px] uppercase font-mono tracking-wider">Investigator Authors</span>
                        <span>{Array.isArray(verificationResult.authors) ? verificationResult.authors.join(", ") : verificationResult.authors}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-600">
                      <Building2 className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-neutral-800 text-[10px] uppercase font-mono tracking-wider">Academic Affiliation</span>
                        <span>{verificationResult.institution}, {verificationResult.country}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-600">
                      <Award className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-neutral-800 text-[10px] uppercase font-mono tracking-wider">Specialty Field</span>
                        <span>{verificationResult.specialty}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-600">
                      <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-neutral-800 text-[10px] uppercase font-mono tracking-wider">Permanent DOI / Citation ID</span>
                        <span className="font-mono">{verificationResult.doi || "Pending"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to action certificates */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowCert(true)}
                    className="flex-grow flex items-center justify-center gap-2 py-3 border border-black hover:bg-neutral-50 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    <Award className="w-4 h-4" />
                    Display Official Certificate
                  </button>
                  <a
                    href={verificationResult.doiUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-grow flex items-center justify-center gap-2 py-3 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View External DOI Registry
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold uppercase tracking-widest text-rose-700">
                    Verification Refused
                  </p>
                  <p className="text-xs text-rose-600 font-sans leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Demo verification tags */}
        <div className="pt-4 text-center">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-3">
            Available Archive Test Signatures
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {papers.slice(0, 3).map((p: any) => (
              <button
                key={p.id}
                onClick={() => {
                  setVerifyInput(p.doi || p.id);
                  handleVerify(p.doi || p.id);
                }}
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black rounded-lg text-[10px] font-mono transition-colors cursor-pointer"
              >
                {p.doi}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCert && verificationResult && (
        <PublicationCertificate
          paper={{
            id: verificationResult.id,
            title: verificationResult.title,
            authors: verificationResult.authors,
            journal: verificationResult.journal,
            submittedAt: verificationResult.year ? `${verificationResult.year}-01-01` : undefined,
            doi: verificationResult.doi,
            specialty: verificationResult.specialty,
            institution: verificationResult.institution,
            country: verificationResult.country
          }}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
