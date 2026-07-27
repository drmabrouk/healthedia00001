import React, { useState } from "react";
import { Search, Home, ArrowLeft, BookOpen, Users, Building, GraduationCap, ShieldAlert } from "lucide-react";
import { INITIAL_PAPERS } from "../data";

interface PageNotFoundViewProps {
  setCurrentPage: (page: string) => void;
  setSearchQuery?: (query: string) => void;
}

export default function PageNotFoundView({ setCurrentPage, setSearchQuery }: PageNotFoundViewProps) {
  const [localSearch, setLocalSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      if (setSearchQuery) {
        setSearchQuery(localSearch.trim());
      }
      setCurrentPage("search-results");
    }
  };

  // Get a few popular paper titles for quick suggestions
  const popularPapers = INITIAL_PAPERS.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center">
      {/* Visual Indicator */}
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 mb-6 shadow-xs animate-bounce">
        <ShieldAlert className="w-8 h-8 stroke-[1.5]" />
      </div>

      {/* HTTP Status Code Label */}
      <span className="font-mono text-xs font-bold text-red-600 bg-red-50/75 border border-red-200/50 px-3 py-1 rounded-full uppercase tracking-widest mb-3">
        Error Code: 404 Not Found
      </span>

      {/* Page Title */}
      <h1 className="text-4xl sm:text-5xl font-sans font-extrabold tracking-tight text-neutral-900 mb-4 max-w-2xl">
        The requested resource could not be found
      </h1>

      {/* Helpful Error Message */}
      <p className="text-neutral-500 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        The URL may be misspelled, the page might have been moved or unpublished by an administrator, or you may not have authorization to view this resource.
      </p>

      {/* Recovering Search Bar */}
      <form onSubmit={handleSearchSubmit} className="w-full max-w-md relative mb-10">
        <input
          type="text"
          placeholder="Search Healthedia global performance archive..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-11 pr-24 py-3 text-xs border border-neutral-300 rounded-xl bg-white shadow-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-medium text-neutral-800"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5 stroke-[1.5]" />
        <button
          type="submit"
          className="absolute right-2 top-2 px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase bg-black text-white hover:opacity-90 rounded-lg cursor-pointer transition-colors"
        >
          Search Archive
        </button>
      </form>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center px-5 py-3 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2 stroke-[1.5]" />
          Go Back
        </button>
        <button
          onClick={() => setCurrentPage("home")}
          className="inline-flex items-center justify-center px-5 py-3 text-xs font-semibold text-white bg-black hover:opacity-90 border border-transparent rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 mr-2 stroke-[1.5]" />
          Return to Homepage
        </button>
      </div>

      <div className="w-full border-t border-neutral-200/80 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Popular Sections */}
        <div>
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Popular Directories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => setCurrentPage("journal")}
              className="flex items-center p-3 text-xs font-semibold text-neutral-800 hover:text-black hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all cursor-pointer text-left"
            >
              <BookOpen className="w-4 h-4 mr-2.5 text-neutral-400 stroke-[1.5]" />
              Journal Publications
            </button>
            <button
              onClick={() => setCurrentPage("researchers")}
              className="flex items-center p-3 text-xs font-semibold text-neutral-800 hover:text-black hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all cursor-pointer text-left"
            >
              <Users className="w-4 h-4 mr-2.5 text-neutral-400 stroke-[1.5]" />
              Researcher Index
            </button>
            <button
              onClick={() => setCurrentPage("institutions")}
              className="flex items-center p-3 text-xs font-semibold text-neutral-800 hover:text-black hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all cursor-pointer text-left"
            >
              <Building className="w-4 h-4 mr-2.5 text-neutral-400 stroke-[1.5]" />
              Institutions Index
            </button>
            <button
              onClick={() => setCurrentPage("courses")}
              className="flex items-center p-3 text-xs font-semibold text-neutral-800 hover:text-black hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all cursor-pointer text-left"
            >
              <GraduationCap className="w-4 h-4 mr-2.5 text-neutral-400 stroke-[1.5]" />
              Professional Courses
            </button>
          </div>
        </div>

        {/* Suggest Scientific Papers */}
        <div>
          <h3 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Suggested Recent Publications
          </h3>
          <div className="space-y-3">
            {popularPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => {
                  if (setSearchQuery) setSearchQuery(paper.title);
                  setCurrentPage("journal");
                }}
                className="group p-3 border border-neutral-200/60 rounded-xl hover:border-black cursor-pointer transition-all bg-white"
              >
                <h4 className="text-xs font-bold text-neutral-800 group-hover:text-black line-clamp-1">
                  {paper.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-neutral-400">
                    {paper.journal} • {paper.year}
                  </span>
                  <span className="text-[9px] font-mono bg-neutral-50 text-neutral-500 border border-neutral-200/50 px-1.5 py-0.2 rounded font-medium">
                    {paper.specialty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
