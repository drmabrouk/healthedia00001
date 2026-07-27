import React, { useState, useEffect, useRef } from "react";
import {
  Search, Filter, SlidersHorizontal, FileText, Check, Copy, ExternalLink, RefreshCw, ChevronDown, ChevronUp, BookOpen, MapPin, Landmark, Clock, Trash2, X
} from "lucide-react";
import { ResearchPaper } from "../types";
import { searchPapers, suggestSpellingCorrection, getAutocompleteSuggestions, AutocompleteSuggestion } from "../searchEngine";
import { useSearchHistory } from "../hooks/useSearchHistory";

interface SearchResultsViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewPaper?: (paperId: string) => void;
}

export default function SearchResultsView({
  searchQuery,
  setSearchQuery,
  onViewPaper,
}: SearchResultsViewProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [results, setResults] = useState<ResearchPaper[]>([]);
  const [spellingCorrection, setSpellingCorrection] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { recentQueries, addQuery, removeQuery, clearAll } = useSearchHistory();

  const triggerDownload = (id: string, doi: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1500);
  };

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const deleteRecentSearch = (e: React.MouseEvent, searchVal: string) => {
    e.stopPropagation();
    removeQuery(searchVal);
  };

  // Filter States
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedResearchTypes, setSelectedResearchTypes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);

  // Sorting State
  const [sortBy, setSortBy] = useState<"relevance" | "year-new" | "year-old" | "title-az">("relevance");

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => {
      setIsMobileFilterOpen(false);
      setShowSuggestions(false);
    };
    window.addEventListener("healthedia:close-modals", handleClose);
    return () => window.removeEventListener("healthedia:close-modals", handleClose);
  }, []);

  // Trigger search whenever the globally selected query changes
  useEffect(() => {
    setLocalQuery(searchQuery);
    const searchRes = searchPapers(searchQuery);
    setResults(searchRes);
    setSpellingCorrection(suggestSpellingCorrection(searchQuery));
    
    // Reset filters on new global query search
    setSelectedYears([]);
    setSelectedSpecialties([]);
    setSelectedAuthors([]);
    setSelectedResearchTypes([]);
    setSelectedLanguages([]);
    setSelectedCountries([]);
    setSelectedInstitutions([]);
    setExpandedPaperId(null);
  }, [searchQuery]);

  // Handle autocomplete matching
  useEffect(() => {
    if (localQuery.trim().length >= 2) {
      setSuggestions(getAutocompleteSuggestions(localQuery));
    } else {
      setSuggestions([]);
    }
  }, [localQuery]);

  // Click outside to close autocomplete suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      addQuery(localQuery.trim());
      setSearchQuery(localQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (target: string) => {
    addQuery(target);
    setLocalQuery(target);
    setSearchQuery(target);
    setShowSuggestions(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get unique filter facets from currently search-matched records (dynamic facets)
  const allMatchedPapers = searchPapers(searchQuery);

  const availableYears = Array.from(new Set(allMatchedPapers.map((p) => p.year))).sort((a, b) => b - a);
  const availableSpecialties = Array.from(new Set(allMatchedPapers.map((p) => p.specialty))).sort();
  const availableResearchTypes = Array.from(new Set(allMatchedPapers.map((p) => p.researchType))).sort();
  const availableLanguages = Array.from(new Set(allMatchedPapers.map((p) => p.language))).sort();
  const availableCountries = Array.from(new Set(allMatchedPapers.map((p) => p.country))).sort();
  const availableInstitutions = Array.from(new Set(allMatchedPapers.map((p) => p.institution))).sort();
  
  // Extract all unique authors
  const availableAuthors: string[] = [];
  allMatchedPapers.forEach((p) => {
    p.authors.forEach((author) => {
      if (!availableAuthors.includes(author)) {
        availableAuthors.push(author);
      }
    });
  });
  availableAuthors.sort();

  // Multi-select toggle helper
  const toggleFilter = <T,>(list: T[], item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedYears([]);
    setSelectedSpecialties([]);
    setSelectedAuthors([]);
    setSelectedResearchTypes([]);
    setSelectedLanguages([]);
    setSelectedCountries([]);
    setSelectedInstitutions([]);
  };

  // Filter & Sort Results
  const filteredResults = results.filter((paper) => {
    if (selectedYears.length > 0 && !selectedYears.includes(paper.year)) return false;
    if (selectedSpecialties.length > 0 && !selectedSpecialties.includes(paper.specialty)) return false;
    if (selectedResearchTypes.length > 0 && !selectedResearchTypes.includes(paper.researchType)) return false;
    if (selectedLanguages.length > 0 && !selectedLanguages.includes(paper.language)) return false;
    if (selectedCountries.length > 0 && !selectedCountries.includes(paper.country)) return false;
    if (selectedInstitutions.length > 0 && !selectedInstitutions.includes(paper.institution)) return false;
    
    if (selectedAuthors.length > 0) {
      const hasMatchedAuthor = paper.authors.some((author) => selectedAuthors.includes(author));
      if (!hasMatchedAuthor) return false;
    }
    
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "year-new") return b.year - a.year;
    if (sortBy === "year-old") return a.year - b.year;
    if (sortBy === "title-az") return a.title.localeCompare(b.title);
    return 0; // Default: searchEngine scoring relevance (pre-sorted)
  });

  const SidebarFilters = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
        <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-black flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" /> Filters
        </h3>
        {(selectedYears.length > 0 ||
          selectedSpecialties.length > 0 ||
          selectedAuthors.length > 0 ||
          selectedResearchTypes.length > 0 ||
          selectedLanguages.length > 0 ||
          selectedCountries.length > 0 ||
          selectedInstitutions.length > 0) && (
          <button
            onClick={resetAllFilters}
            className="text-[10px] font-mono text-neutral-400 hover:text-black border-b border-transparent hover:border-black flex items-center cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" style={{ animationDuration: '3s' }} /> Reset All
          </button>
        )}
      </div>

      {/* Specialty Filter */}
      {availableSpecialties.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono text-[9px]">Research Specialty</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {availableSpecialties.map((spec) => (
              <label key={spec} className="flex items-center text-xs text-neutral-600 hover:text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedSpecialties.includes(spec)}
                  onChange={() => toggleFilter(selectedSpecialties, spec, setSelectedSpecialties)}
                  className="mr-2 border-neutral-300 text-black focus:ring-black accent-black w-3.5 h-3.5 rounded-md"
                />
                <span className="truncate">{spec}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Publication Year Filter */}
      {availableYears.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono text-[9px]">Publication Year</h4>
          <div className="flex flex-wrap gap-1.5">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => toggleFilter(selectedYears, year, setSelectedYears)}
                className={`text-[10px] font-mono px-2.5 py-1 border transition-all cursor-pointer rounded-lg ${
                  selectedYears.includes(year)
                    ? "bg-black text-white border-black font-bold"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-black"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Research Type Filter */}
      {availableResearchTypes.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono text-[9px]">Research Type</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {availableResearchTypes.map((type) => (
              <label key={type} className="flex items-center text-xs text-neutral-600 hover:text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedResearchTypes.includes(type)}
                  onChange={() => toggleFilter(selectedResearchTypes, type, setSelectedResearchTypes)}
                  className="mr-2 border-neutral-300 text-black focus:ring-black accent-black w-3.5 h-3.5 rounded-md"
                />
                <span className="truncate">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Author Filter */}
      {availableAuthors.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono text-[9px]">Author</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {availableAuthors.map((author) => (
              <label key={author} className="flex items-center text-xs text-neutral-600 hover:text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedAuthors.includes(author)}
                  onChange={() => toggleFilter(selectedAuthors, author, setSelectedAuthors)}
                  className="mr-2 border-neutral-300 text-black focus:ring-black accent-black w-3.5 h-3.5 rounded-md"
                />
                <span className="truncate">{author}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Institution Filter */}
      {availableInstitutions.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono text-[9px]">Affiliation</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {availableInstitutions.map((inst) => (
              <label key={inst} className="flex items-center text-xs text-neutral-600 hover:text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedInstitutions.includes(inst)}
                  onChange={() => toggleFilter(selectedInstitutions, inst, setSelectedInstitutions)}
                  className="mr-2 border-neutral-300 text-black focus:ring-black accent-black w-3.5 h-3.5 rounded-md"
                />
                <span className="truncate">{inst}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Country Filter */}
      {availableCountries.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono text-[9px]">Country of Origin</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {availableCountries.map((country) => (
              <label key={country} className="flex items-center text-xs text-neutral-600 hover:text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country)}
                  onChange={() => toggleFilter(selectedCountries, country, setSelectedCountries)}
                  className="mr-2 border-neutral-300 text-black focus:ring-black accent-black w-3.5 h-3.5 rounded-md"
                />
                <span className="truncate">{country}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Language Filter */}
      {availableLanguages.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono text-[9px]">Language</h4>
          <div className="space-y-1.5">
            {availableLanguages.map((lang) => (
              <label key={lang} className="flex items-center text-xs text-neutral-600 hover:text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang)}
                  onChange={() => toggleFilter(selectedLanguages, lang, setSelectedLanguages)}
                  className="mr-2 border-neutral-300 text-black focus:ring-black accent-black w-3.5 h-3.5 rounded-md"
                />
                <span>{lang}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-grow bg-white py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Refinement Header */}
        <div className="relative mb-8" ref={suggestionRef}>
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex items-center border border-neutral-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all duration-150 max-w-4xl rounded-2xl overflow-hidden bg-white h-14 pr-2"
          >
            <div className="flex items-center pl-4 bg-white text-neutral-400 shrink-0">
              <Search className="w-4.5 h-4.5 stroke-[1.5]" />
            </div>
            <input
              type="text"
              data-search-input="true"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Refine archive search..."
              className="w-full h-full pl-3 pr-4 text-xs sm:text-sm text-black bg-white focus:outline-none placeholder-neutral-400 font-sans"
            />
            <div className="hidden md:flex items-center mr-2 shrink-0 select-none">
              <kbd className="px-2 py-1 text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-lg shadow-2xs">
                /
              </kbd>
            </div>
            <button
              type="submit"
              className="bg-black text-white h-10 px-5 sm:px-6 font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors duration-150 cursor-pointer rounded-xl shrink-0"
            >
              Update
            </button>
          </form>

          {/* Autocomplete or Recent Searches dropdown */}
          {showSuggestions && (
            <>
              {suggestions.length > 0 ? (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 text-left z-40 divide-y divide-neutral-100 max-h-60 overflow-y-auto max-w-4xl rounded-xl shadow-none">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.target)}
                      className="w-full px-4 py-3 text-xs text-neutral-700 hover:bg-neutral-50 text-left flex items-center justify-between cursor-pointer border-none"
                    >
                      <span className="truncate font-sans font-medium text-black">
                        {suggestion.text}
                      </span>
                      <span className="ml-2 font-mono text-[9px] bg-neutral-50 text-neutral-500 uppercase px-2 py-0.5 border border-neutral-200 rounded-lg shrink-0">
                        {suggestion.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                recentQueries.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 text-left z-40 max-w-4xl rounded-xl shadow-md overflow-hidden divide-y divide-neutral-100">
                    <div className="flex items-center px-4 py-2.5 bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent Searches
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100">
                      {recentQueries.map((search, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setLocalQuery(search);
                            setSearchQuery(search);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-3 hover:bg-neutral-50 text-left flex items-center justify-between cursor-pointer group/item transition-colors"
                        >
                          <span className="text-xs text-neutral-700 group-hover/item:text-black font-sans font-medium truncate">
                            {search}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => deleteRecentSearch(e, search)}
                            className="p-1 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove from history"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end px-4 py-2 bg-neutral-50 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-[10px] font-mono text-neutral-500 hover:text-black transition-colors font-bold uppercase hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All
                      </button>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Spelling suggestion block */}
        {spellingCorrection && (
          <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center space-x-1 rounded-xl">
            <span>Did you mean:</span>
            <button
              onClick={() => {
                addQuery(spellingCorrection);
                setSearchQuery(spellingCorrection);
                setLocalQuery(spellingCorrection);
              }}
              className="font-bold text-black border-b border-black hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center bg-transparent border-t-0 border-l-0 border-r-0"
            >
              {spellingCorrection}
            </button>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white border border-neutral-200 p-5 rounded-2xl">
              <SidebarFilters />
            </div>
          </div>

          {/* Search Results Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sort & Quick Metadata Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral-200 space-y-3 sm:space-y-0">
              <div className="text-[11px] text-neutral-500 font-mono">
                Showing <span className="text-black font-bold">{sortedResults.length}</span> of{" "}
                <span className="text-black font-bold">{results.length}</span> matches for "
                <span className="text-black italic font-sans font-semibold">{searchQuery}</span>"
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center px-3 py-1.5 border border-neutral-300 text-xs font-sans text-neutral-700 hover:text-black hover:border-black cursor-pointer bg-white rounded-xl transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-2 stroke-[1.5]" /> Filters
                </button>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-neutral-400 font-mono">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-neutral-200 text-black py-1.5 px-3 bg-white text-xs font-sans focus:outline-none focus:border-black rounded-xl cursor-pointer"
                  >
                    <option value="relevance">Relevance Score</option>
                    <option value="year-new">Newest First</option>
                    <option value="year-old">Oldest First</option>
                    <option value="title-az">Title: A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Active Filters Summary Bar */}
            {(selectedYears.length > 0 ||
              selectedSpecialties.length > 0 ||
              selectedAuthors.length > 0 ||
              selectedResearchTypes.length > 0 ||
              selectedCountries.length > 0 ||
              selectedInstitutions.length > 0) && (
              <div className="flex flex-wrap gap-1.5 items-center bg-neutral-50 p-3 border border-neutral-200 text-[10px] rounded-xl">
                <span className="font-mono text-neutral-400 uppercase mr-1 font-bold">Active:</span>
                {selectedSpecialties.map((s) => (
                  <span key={s} className="bg-white border border-neutral-200 text-black px-2.5 py-1 rounded-full flex items-center">
                    {s}
                    <button onClick={() => toggleFilter(selectedSpecialties, s, setSelectedSpecialties)} className="ml-1.5 text-neutral-400 hover:text-black font-semibold">×</button>
                  </span>
                ))}
                {selectedYears.map((y) => (
                  <span key={y} className="bg-white border border-neutral-200 text-black px-2.5 py-1 rounded-full flex items-center">
                    {y}
                    <button onClick={() => toggleFilter(selectedYears, y, setSelectedYears)} className="ml-1.5 text-neutral-400 hover:text-black font-semibold">×</button>
                  </span>
                ))}
                {selectedResearchTypes.map((t) => (
                  <span key={t} className="bg-white border border-neutral-200 text-black px-2.5 py-1 rounded-full flex items-center">
                    {t}
                    <button onClick={() => toggleFilter(selectedResearchTypes, t, setSelectedResearchTypes)} className="ml-1.5 text-neutral-400 hover:text-black font-semibold">×</button>
                  </span>
                ))}
                {selectedAuthors.map((a) => (
                  <span key={a} className="bg-white border border-neutral-200 text-black px-2.5 py-1 rounded-full flex items-center">
                    {a}
                    <button onClick={() => toggleFilter(selectedAuthors, a, setSelectedAuthors)} className="ml-1.5 text-neutral-400 hover:text-black font-semibold">×</button>
                  </span>
                ))}
                {selectedInstitutions.map((i) => (
                  <span key={i} className="bg-white border border-neutral-200 text-black px-2.5 py-1 rounded-full flex items-center">
                    {i}
                    <button onClick={() => toggleFilter(selectedInstitutions, i, setSelectedInstitutions)} className="ml-1.5 text-neutral-400 hover:text-black font-semibold">×</button>
                  </span>
                ))}
                {selectedCountries.map((c) => (
                  <span key={c} className="bg-white border border-neutral-200 text-black px-2.5 py-1 rounded-full flex items-center">
                    {c}
                    <button onClick={() => toggleFilter(selectedCountries, c, setSelectedCountries)} className="ml-1.5 text-neutral-400 hover:text-black font-semibold">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Results List */}
            {sortedResults.length > 0 ? (
              <div className="space-y-6">
                {sortedResults.map((paper) => {
                  const isExpanded = expandedPaperId === paper.id;
                  return (
                    <article
                      key={paper.id}
                      className="border border-neutral-200 bg-white p-6 sm:p-7 transition-all hover:border-black rounded-2xl flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Upper Meta */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                          <span className="font-bold text-black bg-neutral-100 px-2 py-0.5 border border-neutral-200 rounded-lg">
                            {paper.researchType}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center text-neutral-500 font-medium">
                            <BookOpen className="w-3.5 h-3.5 mr-1" />
                            {paper.journal}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-neutral-500">{paper.year}</span>
                        </div>

                        {/* Title */}
                        <h2 
                          onClick={() => onViewPaper && onViewPaper(paper.id)}
                          className={`text-base sm:text-lg font-sans font-bold tracking-tight text-black hover:text-neutral-700 leading-snug ${onViewPaper ? 'cursor-pointer hover:underline' : ''}`}
                        >
                          {paper.title}
                        </h2>

                        {/* Authors */}
                        <div className="text-xs text-neutral-600 flex flex-wrap gap-x-1 items-center">
                          <span className="font-mono text-[9px] text-neutral-400 uppercase font-bold">Authors:</span>
                          {paper.authors.map((author, index) => (
                            <span key={author}>
                              <button
                                onClick={() => {
                                  setSearchQuery(author);
                                  setLocalQuery(author);
                                }}
                                className="text-black font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                              >
                                {author}
                              </button>
                              {index < paper.authors.length - 1 && <span className="mr-1">,</span>}
                            </span>
                          ))}
                        </div>

                        {/* Affiliation and location details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400 font-sans font-medium">
                          <span className="flex items-center">
                            <Landmark className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                            {paper.institution}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                            {paper.country} ({paper.language})
                          </span>
                        </div>

                        {/* Abstract block (expandable) */}
                        <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans pt-2">
                          <p className={isExpanded ? "" : "line-clamp-3"}>
                            {paper.abstract}
                          </p>
                          <button
                            onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                            className="mt-2 text-xs font-mono font-bold text-black hover:text-neutral-500 inline-flex items-center space-x-1 bg-transparent border-none p-0 cursor-pointer"
                          >
                            <span>{isExpanded ? "Collapse Abstract" : "Read Abstract Preview"}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Extended Abstract Details (Keywords) */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-neutral-100 space-y-2 mt-3 animate-fadeIn">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[9px] font-mono text-neutral-400 uppercase self-center mr-1.5 font-bold">Keywords:</span>
                              {paper.keywords.map((kw) => (
                                <button
                                  key={kw}
                                  onClick={() => {
                                    setSearchQuery(kw);
                                    setLocalQuery(kw);
                                  }}
                                  className="text-[10px] font-mono bg-neutral-50 text-neutral-500 border border-neutral-200 px-2.5 py-1 hover:bg-black hover:text-white hover:border-black transition-all rounded-lg cursor-pointer"
                                >
                                  {kw}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Paper Footer Action links */}
                      <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                        {/* DOI and DOI link */}
                        <div className="flex items-center space-x-2 text-[11px] font-mono">
                          <span className="text-neutral-400 uppercase font-bold">DOI:</span>
                          <span className="bg-neutral-50 border border-neutral-200 px-2.5 py-1 text-neutral-700 select-all font-mono rounded-lg">
                            {paper.doi}
                          </span>
                          <button
                            onClick={() => copyToClipboard(paper.doi, paper.id)}
                            className="p-1.5 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-black rounded-lg transition-colors cursor-pointer"
                            title="Copy DOI identifier"
                          >
                            {copiedId === paper.id ? (
                              <Check className="w-3.5 h-3.5 text-black" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Available Research Links */}
                        <div className="flex items-center space-x-4 text-xs font-mono">
                          {onViewPaper && (
                            <button
                              onClick={() => onViewPaper(paper.id)}
                              className="inline-flex items-center text-black hover:text-neutral-600 font-semibold border-b border-black pb-0.5 cursor-pointer transition-colors"
                            >
                              View Scholarly Page
                            </button>
                          )}
                          <a
                            href={paper.doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-neutral-400 hover:text-black hover:border-black border-b border-transparent pb-0.5 transition-all font-semibold"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Publisher Portal
                          </a>
                          <button
                            onClick={() => triggerDownload(paper.id, paper.doi)}
                            className="inline-flex items-center bg-black text-white border border-black hover:bg-white hover:text-black px-4.5 py-2 transition-colors duration-150 rounded-xl cursor-pointer font-bold"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            {downloadingId === paper.id ? (
                              <span className="flex items-center space-x-1 font-bold animate-pulse">
                                Downloading...
                              </span>
                            ) : (
                              "Open PDF (Full Access)"
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="border border-neutral-200 p-12 text-center bg-white space-y-4 rounded-2xl">
                <p className="text-sm font-mono text-neutral-400 uppercase font-bold">No Archive Matches Found</p>
                <h3 className="text-lg font-sans font-bold text-black">
                  Zero indexed records match your query
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed font-medium">
                  Refine your search parameters, check for spelling discrepancies, or expand your specialty filter to capture all health and performance data points.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-2 text-xs font-mono font-bold bg-black text-white px-5 py-2.5 hover:bg-neutral-800 transition-colors cursor-pointer rounded-xl"
                >
                  Clear Active Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-xs bg-white h-full overflow-y-auto p-6 flex flex-col justify-between rounded-l-2xl animate-slideLeft">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-black flex items-center">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-neutral-400 hover:text-black font-bold text-sm bg-transparent border-none cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <SidebarFilters />
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-black text-white text-xs font-mono py-3 rounded-xl font-bold uppercase tracking-widest text-center mt-6 cursor-pointer"
            >
              Apply Filter Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
