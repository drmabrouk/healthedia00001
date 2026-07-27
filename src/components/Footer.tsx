import React from "react";

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-8 mt-auto text-center font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
          <p className="font-sans">
            © {currentYear} Healthedia. All Rights Reserved. Permanent Open-Access Repository.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-medium">
            <button
              onClick={() => setCurrentPage("privacy")}
              className="hover:text-black transition-colors duration-150 cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-neutral-200 hidden md:inline">•</span>
            <button
              onClick={() => setCurrentPage("terms")}
              className="hover:text-black transition-colors duration-150 cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span className="text-neutral-200 hidden md:inline">•</span>
            <button
              onClick={() => setCurrentPage("publication-policies")}
              className="hover:text-black transition-colors duration-150 cursor-pointer"
            >
              Publication Policies
            </button>
            <span className="text-neutral-200 hidden md:inline">•</span>
            <button
              onClick={() => setCurrentPage("certificate-verification")}
              className="hover:text-black transition-colors duration-150 cursor-pointer"
            >
              Certificate Verification
            </button>
            <span className="text-neutral-200 hidden md:inline">•</span>
            <button
              onClick={() => setCurrentPage("support")}
              className="hover:text-black transition-colors duration-150 cursor-pointer"
            >
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
