import React from "react";
import { Award, ShieldCheck, Printer, X, Download, QrCode } from "lucide-react";

interface PublicationCertificateProps {
  paper: {
    id: string;
    title: string;
    authors: string[];
    journal?: string;
    submittedAt?: string;
    date?: string;
    doi: string;
    specialty: string;
    institution: string;
    country: string;
  };
  onClose: () => void;
}

export default function PublicationCertificate({ paper, onClose }: PublicationCertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  // Extract author string safely
  const authorNames = Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors;
  const publishDate = paper.date || paper.submittedAt || new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Printable Area Wrapper */}
      <div className="bg-white text-black max-w-3xl w-full relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header toolbar - Hidden on Print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-black" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Scientific Publication Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-150 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-8 sm:p-12 overflow-y-auto print:overflow-visible flex-grow print:p-0">
          
          {/* Certificate Inner Decorative Frame */}
          <div className="border-4 border-double border-neutral-850 p-6 sm:p-10 bg-neutral-50/20 relative rounded-lg print:border-neutral-900 print:bg-white flex flex-col justify-between min-h-[500px]">
            
            {/* Background watermark/crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
              <Award className="w-96 h-96 stroke-[1]" />
            </div>

            {/* Top Branding Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-mono font-bold text-lg rounded-xl print:border print:border-black print:text-black print:bg-white">
                  H
                </div>
              </div>
              <h1 className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 uppercase">
                Healthedia Administrative Council
              </h1>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 tracking-tight uppercase border-b border-neutral-200 pb-4 max-w-md mx-auto print:text-black">
                Certificate of Publication
              </h2>
            </div>

            {/* Awardee and Achievement Narrative */}
            <div className="text-center space-y-6 my-8 z-10">
              <p className="text-xs font-serif italic text-neutral-500">
                This document serves as formal confirmation that the scholarly work titled
              </p>
              
              <div className="space-y-2 px-2 sm:px-6">
                <h3 className="text-base sm:text-lg font-sans font-bold text-black leading-tight tracking-tight uppercase">
                  "{paper.title}"
                </h3>
                <p className="text-xs sm:text-sm font-serif italic text-neutral-500">
                  authored and submitted by the following investigators
                </p>
                <p className="text-sm font-sans font-semibold text-neutral-800 tracking-tight">
                  {authorNames}
                </p>
              </div>

              <p className="text-xs sm:text-sm font-serif italic text-neutral-500 max-w-xl mx-auto leading-relaxed">
                has been rigorously audited under a double-blind scientific review workflow and successfully indexed in the <strong className="text-black font-semibold font-sans">{paper.journal || "Healthedia Global Journal of Performance Science"}</strong>.
              </p>
            </div>

            {/* Bottom Certification Details block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-200 text-xs mt-auto">
              
              {/* Left Column: QR and DOI */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                <div className="bg-white border border-neutral-200 p-1.5 rounded-lg mb-1 print:border-neutral-400">
                  {/* Clean Mock QR Code */}
                  <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center text-white font-mono text-[6px] font-bold tracking-tight rounded p-1 text-center select-none">
                    <div className="relative">
                      <QrCode className="w-14 h-14 opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-white p-0.5 rounded">
                        <span className="text-[5px] text-black font-extrabold">H</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] font-mono font-bold uppercase text-neutral-400">Verification Token</p>
                <p className="text-[9px] font-mono font-medium text-neutral-700 truncate max-w-[150px]">
                  DOI: {paper.doi}
                </p>
                <p className="text-[8px] font-mono text-neutral-400">
                  verify.healthedia.org/pub/{paper.id}
                </p>
              </div>

              {/* Middle Column: Seal representation */}
              <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
                <div className="w-12 h-12 bg-[#be123c]/10 text-[#be123c] rounded-full flex items-center justify-center border-2 border-[#be123c]/30 shadow-xs animate-none print:border-black print:text-black">
                  <Award className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-mono font-extrabold uppercase text-neutral-600 tracking-wider">Editorial Council</p>
                  <p className="text-[8px] font-mono text-[#be123c] font-bold uppercase tracking-wider print:text-black">✓ Offical Archive Seal</p>
                </div>
              </div>

              {/* Right Column: Signatures */}
              <div className="flex flex-col items-center sm:items-end justify-center text-center sm:text-right space-y-1">
                <div className="pb-1">
                  {/* Stylized simulated Signature font or line */}
                  <p className="font-serif italic text-base text-neutral-700 font-bold select-none tracking-tight">
                    K. Takahashi
                  </p>
                  <div className="w-28 h-0.5 bg-neutral-350 mx-auto sm:ml-auto"></div>
                </div>
                <p className="text-[10px] font-sans font-bold text-black uppercase">Prof. Kenji Takahashi, Ph.D.</p>
                <p className="text-[9px] font-serif text-neutral-500">Editor-in-Chief, Healthedia Scientific Board</p>
                <p className="text-[8px] font-mono text-neutral-400 mt-1 uppercase">Date of Publication: {publishDate}</p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
