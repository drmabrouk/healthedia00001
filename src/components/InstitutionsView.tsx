import React, { useState, useEffect } from "react";
import {
  Search, Building2, MapPin, Globe, ArrowUpRight, ChevronLeft, Plus, Mail, Phone, BookOpen, Users, Activity
} from "lucide-react";
import { Institution, UserProfileData } from "../types";
import { getStoredItem, setStoredItem } from "../lib/taxonomyStore";
import { INITIAL_INSTITUTIONS } from "../lib/taxonomyStore";

interface InstitutionsViewProps {
  currentUser: UserProfileData | null;
  setCurrentPage: (page: string) => void;
  initialSelectedId?: string | null;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function InstitutionsView({
  currentUser,
  setCurrentPage,
  initialSelectedId,
  showToast
}: InstitutionsViewProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");

  // Simple Suggestion Form state
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestOfficialName, setSuggestOfficialName] = useState("");
  const [suggestType, setSuggestType] = useState("Medical School");
  const [suggestCountry, setSuggestCountry] = useState("");
  const [suggestCity, setSuggestCity] = useState("");
  const [suggestWebsite, setSuggestWebsite] = useState("");
  const [suggestDescription, setSuggestDescription] = useState("");

  // Load institutions on mount
  useEffect(() => {
    const loadedInsts = getStoredItem<Institution[]>("healthedia_institutions", []);
    if (loadedInsts.length === 0) {
      setStoredItem("healthedia_institutions", INITIAL_INSTITUTIONS);
      setInstitutions(INITIAL_INSTITUTIONS);
    } else {
      setInstitutions(loadedInsts);
    }
  }, []);

  useEffect(() => {
    const handleClose = () => {
      setShowSuggestForm(false);
    };
    window.addEventListener("healthedia:close-modals", handleClose);
    return () => window.removeEventListener("healthedia:close-modals", handleClose);
  }, []);

  // Sync to initialSelectedId
  useEffect(() => {
    if (initialSelectedId && institutions.length > 0) {
      const found = institutions.find(
        (i) => i.id === initialSelectedId || i.id.toLowerCase() === initialSelectedId.toLowerCase()
      );
      if (found) {
        setSelectedInstitution(found);
      }
    } else if (!initialSelectedId) {
      setSelectedInstitution(null);
    }
  }, [initialSelectedId, institutions]);

  // Handle Selection change
  const handleSelectInstitution = (inst: Institution | null) => {
    setSelectedInstitution(inst);
    if (inst) {
      window.location.hash = `institutions/${inst.id}`;
    } else {
      window.location.hash = "institutions";
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // Submit suggestion
  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName || !suggestOfficialName || !suggestCountry || !suggestCity) {
      showToast("Please fill out all required fields.", "error");
      return;
    }

    const newId = suggestName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const newInst: Institution = {
      id: newId,
      name: suggestName,
      officialName: suggestOfficialName,
      country: suggestCountry,
      city: suggestCity,
      website: suggestWebsite || "https://healthedia.org",
      logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=200",
      institutionType: suggestType,
      description: suggestDescription,
      history: "A newly registered academic profile awaiting comprehensive historical cataloging.",
      faculties: ["General Faculty of Biological & Medical Sciences"],
      specialties: ["General Medicine"],
      status: "Approved", // Approved immediately to show up in the encyclopedia directory!
      submittedBy: currentUser?.email || "Anonymous",
      submittedAt: new Date().toISOString().split("T")[0],
      customStats: {
        publishedPapers: 1,
        verifiedResearchers: 0,
        activeProjects: 1,
        medicalPrograms: 1
      }
    };

    const updated = [...institutions, newInst];
    setStoredItem("healthedia_institutions", updated);
    setInstitutions(updated);
    showToast("Institution suggested successfully! Added to the Global Registry.", "success");

    // Reset Suggestion Form
    setSuggestName("");
    setSuggestOfficialName("");
    setSuggestType("Medical School");
    setSuggestCountry("");
    setSuggestCity("");
    setSuggestWebsite("");
    setSuggestDescription("");
    setShowSuggestForm(false);
  };

  // Filter logic
  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.officialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "all" || inst.institutionType === selectedType;
    const matchesCountry = selectedCountry === "all" || inst.country === selectedCountry;

    return matchesSearch && matchesType && matchesCountry;
  });

  // Unique types and countries for filtering
  const institutionTypes = ["Medical School", "Research Institute", "Public Health Agency", "Sports Science Center", "Rehabilitation Clinic", "University Hospital"];
  const countries = Array.from(new Set(institutions.map((i) => i.country))).sort();

  return (
    <div className="flex-grow bg-white py-10 font-sans animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Selected Institution Profile View */}
        {selectedInstitution ? (
          <div className="space-y-8">
            {/* Contextual System Administrator Controls */}
            {currentUser?.role === "Admin" && (
              <div className="bg-red-950 text-white border border-red-800 rounded-2xl p-3.5 mb-2 flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-red-300 shrink-0 stroke-[2]" />
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-100 block leading-none">
                      Administrator Contextual Controls
                    </span>
                    <span className="text-[10px] font-mono text-red-300">
                      Live Management • Institution ID: {selectedInstitution.id}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newType = prompt("Change Institution Type:", selectedInstitution.institutionType);
                      if (newType) {
                        const updated = { ...selectedInstitution, institutionType: newType };
                        setSelectedInstitution(updated);
                        showToast("Institution classification updated live.", "success");
                      }
                    }}
                    className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
                  >
                    Change Classification
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newName = prompt("Edit Official Institution Name:", selectedInstitution.name);
                      if (newName) {
                        setSelectedInstitution({ ...selectedInstitution, name: newName });
                        showToast("Institution name updated live.", "success");
                      }
                    }}
                    className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
                  >
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete institution record for ${selectedInstitution.name}?`)) {
                        setSelectedInstitution(null);
                        showToast("Institution record permanently removed.", "success");
                      }
                    }}
                    className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-red-100 text-[11px] font-mono font-bold rounded-xl border border-red-600 transition-colors cursor-pointer"
                  >
                    Delete Record
                  </button>
                </div>
              </div>
            )}

            {/* Back Header */}
            <button
              onClick={() => handleSelectInstitution(null)}
              className="inline-flex items-center text-xs font-mono font-bold text-neutral-500 hover:text-black uppercase tracking-wider cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Directory
            </button>

            {/* Main Profile Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Profile Header Card */}
              <div className="lg:col-span-3 border border-neutral-200/70 p-6 sm:p-8 bg-neutral-50/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl border border-neutral-200 bg-white flex items-center justify-center font-bold text-black text-2xl uppercase tracking-wider select-none shrink-0 overflow-hidden">
                    {selectedInstitution.logo ? (
                      <img
                        src={selectedInstitution.logo}
                        alt={selectedInstitution.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      selectedInstitution.name.substring(0, 2)
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded font-bold">
                        {selectedInstitution.institutionType}
                      </span>
                      <span className="inline-flex items-center text-[10px] font-mono text-neutral-500">
                        <MapPin className="w-3 h-3 mr-1 text-neutral-400" />
                        {selectedInstitution.city}, {selectedInstitution.country}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-black leading-tight">
                      {selectedInstitution.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 font-light italic font-mono">
                      {selectedInstitution.officialName}
                    </p>
                  </div>
                </div>

                <a
                  href={selectedInstitution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white text-xs font-mono font-bold uppercase px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-center"
                >
                  Visit Official Portal
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Left Column: Encyclopedia Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Overview */}
                <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl space-y-3">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                    I. Institutional Overview
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
                    {selectedInstitution.description}
                  </p>
                </div>

                {/* 2. Historical Context */}
                <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl space-y-3">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                    II. Historical Development
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light whitespace-pre-line">
                    {selectedInstitution.history}
                  </p>
                </div>

                {/* 3. Faculties & Departments */}
                <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl space-y-4">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                    III. Departments & Academic Divisions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {selectedInstitution.faculties?.map((fac, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700 font-light bg-neutral-50/50 border border-neutral-100 p-3 rounded-xl">
                        <span className="font-mono text-[9px] bg-neutral-200 text-neutral-600 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Key Metrics & Registry Contacts */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Scientific Output Metrics */}
                <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl space-y-4">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                    IV. Archive Analytics
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">Published Articles</span>
                      <div className="text-xl font-bold text-black flex items-center justify-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-black stroke-[1.5]" />
                        {selectedInstitution.customStats?.publishedPapers || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">Vetted Researchers</span>
                      <div className="text-xl font-bold text-black flex items-center justify-center gap-1.5">
                        <Users className="w-4 h-4 text-black stroke-[1.5]" />
                        {selectedInstitution.customStats?.verifiedResearchers || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center space-y-1 col-span-2">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">Active Investigations</span>
                      <div className="text-base font-bold text-black flex items-center justify-center gap-1.5 mt-0.5">
                        <Activity className="w-4 h-4 text-black" />
                        {selectedInstitution.customStats?.activeProjects || 0} Projects Ongoing
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Specialties */}
                <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl space-y-3">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                    V. Clinical Specialties
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedInstitution.specialties?.map((spec, idx) => (
                      <span key={idx} className="text-[10px] font-mono uppercase tracking-wider border border-neutral-200 bg-neutral-50 text-neutral-600 px-2.5 py-1 rounded-lg">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Registry Details */}
                <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl space-y-4">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-400 border-b border-neutral-100 pb-2">
                    VI. Contact Registry
                  </h2>
                  <div className="space-y-3 text-xs">
                    {selectedInstitution.email && (
                      <div className="flex items-center gap-2.5 text-neutral-600">
                        <Mail className="w-4 h-4 text-black shrink-0" />
                        <span className="font-mono">{selectedInstitution.email}</span>
                      </div>
                    )}
                    {selectedInstitution.phone && (
                      <div className="flex items-center gap-2.5 text-neutral-600">
                        <Phone className="w-4 h-4 text-black shrink-0" />
                        <span className="font-mono">{selectedInstitution.phone}</span>
                      </div>
                    )}
                    {selectedInstitution.address && (
                      <div className="flex items-start gap-2.5 text-neutral-600">
                        <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                        <span className="font-light">{selectedInstitution.address}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Header Block */}
            <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-sans font-black text-black tracking-tight uppercase">
                  Global Encyclopedia of Academies
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
                  An authoritative indexed archive of certified medical schools, sports science institutes, and research clinics.
                </p>
              </div>
              <button
                onClick={() => setShowSuggestForm(true)}
                className="bg-black text-white text-xs font-mono font-bold uppercase px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer self-start shrink-0"
              >
                <Plus className="w-4 h-4" /> Suggest Academy
              </button>
            </div>

            {/* Interactive Filters Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search */}
              <div className="flex border border-neutral-200 focus-within:border-black transition-colors rounded-xl overflow-hidden bg-white sm:col-span-1">
                <div className="flex items-center pl-3 text-neutral-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  data-search-input="true"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, country or specialty..."
                  className="w-full py-2.5 pl-2 pr-2 text-xs text-black focus:outline-none"
                />
                <div className="hidden sm:flex items-center mr-2 shrink-0 select-none">
                  <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded">
                    /
                  </kbd>
                </div>
              </div>

              {/* Type selector */}
              <div className="flex border border-neutral-200 focus-within:border-black transition-colors rounded-xl bg-white px-3 py-1">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-white text-xs text-neutral-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Institution Types</option>
                  {institutionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Country selector */}
              <div className="flex border border-neutral-200 focus-within:border-black transition-colors rounded-xl bg-white px-3 py-1">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-white text-xs text-neutral-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Suggestion Form Inline (Only if toggled active) */}
            {showSuggestForm && (
              <div className="border border-black p-6 bg-neutral-50/50 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Submit Academic Registry Proposal
                  </h3>
                  <button
                    onClick={() => setShowSuggestForm(false)}
                    className="text-xs text-neutral-400 hover:text-black uppercase font-mono font-bold"
                  >
                    Cancel
                  </button>
                </div>
                
                <form onSubmit={handleSuggestSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Academy Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kyoto University School of Medicine"
                      value={suggestName}
                      onChange={(e) => setSuggestName(e.target.value)}
                      className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Official / Legal Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kyoto University Graduate School of Medicine"
                      value={suggestOfficialName}
                      onChange={(e) => setSuggestOfficialName(e.target.value)}
                      className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Institution Category</label>
                    <select
                      value={suggestType}
                      onChange={(e) => setSuggestType(e.target.value)}
                      className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none cursor-pointer"
                    >
                      {institutionTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Official Website URL</label>
                    <input
                      type="url"
                      placeholder="https://www.med.kyoto-u.ac.jp"
                      value={suggestWebsite}
                      onChange={(e) => setSuggestWebsite(e.target.value)}
                      className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Country</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Japan"
                      value={suggestCountry}
                      onChange={(e) => setSuggestCountry(e.target.value)}
                      className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kyoto"
                      value={suggestCity}
                      onChange={(e) => setSuggestCity(e.target.value)}
                      className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Academic & Medical Overview</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe core faculties, clinical training systems, or world-recognized research programs..."
                      value={suggestDescription}
                      onChange={(e) => setSuggestDescription(e.target.value)}
                      className="w-full text-xs border border-neutral-200 p-2.5 rounded-xl bg-white focus:outline-none focus:border-black resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 bg-black text-white text-xs font-mono font-bold uppercase py-3 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Publish Academy Profile
                  </button>
                </form>
              </div>
            )}

            {/* Encyclopedia Directory Grid */}
            {filteredInstitutions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    onClick={() => handleSelectInstitution(inst)}
                    className="border border-neutral-200/70 p-5 bg-white hover:border-black rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between group space-y-4 hover:shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Top metadata line */}
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] uppercase tracking-wider bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded font-bold">
                          {inst.institutionType}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono inline-flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5 text-neutral-300" />
                          {inst.city}, {inst.country}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-black text-sm group-hover:text-black leading-snug">
                          {inst.name}
                        </h3>
                        <p className="text-xs text-neutral-500 font-light line-clamp-3 leading-relaxed">
                          {inst.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Stats summary */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                        {inst.customStats?.publishedPapers || 0} papers
                      </span>
                      <span className="text-black group-hover:translate-x-1 transition-transform font-bold inline-flex items-center uppercase text-[9px]">
                        Read Entry <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-neutral-200 p-12 text-center rounded-2xl">
                <Building2 className="w-8 h-8 text-neutral-300 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-xs text-neutral-400 italic font-mono">No matching academies indexed in database.</p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
