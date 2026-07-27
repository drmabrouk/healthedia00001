import React, { useState, useRef, useEffect } from "react";
import { Search, Clock, Trash2, X, Mic, MicOff, Sparkles, Copy, Check, Loader2, ArrowRight } from "lucide-react";
import { getAutocompleteSuggestions, AutocompleteSuggestion } from "../searchEngine";
import { useSearchHistory } from "../hooks/useSearchHistory";

interface HomeViewProps {
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function HomeView({ setSearchQuery, setCurrentPage }: HomeViewProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const { recentQueries, addQuery, removeQuery, clearAll } = useSearchHistory();

  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<any>(null);

  // AI Assistant Search State
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiTopic, setAiTopic] = useState<string>("");
  const [copiedAi, setCopiedAi] = useState(false);

  onResultRef.current = (transcript: string) => {
    if (transcript) {
      setQuery(transcript);
      addQuery(transcript);
      setSearchQuery(transcript);
      setCurrentPage("search-results");
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        if (event.error === "aborted") {
          // Programmatic abort, ignore silently
          return;
        }
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone access denied. Please allow permissions or open in a new tab.");
        } else if (event.error === "no-speech") {
          setSpeechError("No speech detected. Please speak clearly.");
        } else {
          setSpeechError(`Speech recognition error: ${event.error}`);
        }
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onResultRef.current) {
          onResultRef.current(transcript);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
        setSpeechError("Failed to start speech recognition.");
      }
    }
  };

  useEffect(() => {
    if (query.trim().length >= 2) {
      setSuggestions(getAutocompleteSuggestions(query));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const deleteRecentSearch = (e: React.MouseEvent, searchVal: string) => {
    e.stopPropagation();
    removeQuery(searchVal);
  };

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      addQuery(query.trim());
      setSearchQuery(query.trim());
      setCurrentPage("search-results");
    }
  };

  const handleAiAssistant = async () => {
    setShowSuggestions(false);
    const targetQuery = query.trim() || "Sports Physiology & Exercise Science";
    setAiTopic(targetQuery);

    if (showAiPanel && aiTopic === targetQuery && aiResponse && !aiLoading) {
      setShowAiPanel(false);
      return;
    }

    setShowAiPanel(true);
    setAiLoading(true);
    setCopiedAi(false);

    try {
      const promptText = `Provide a concise, authoritative scientific definition or clinical summary for "${targetQuery}". Keep the output strictly between 150 and 240 characters. Use reliable medical language. Do not include markdown headers, introductions, or conversational filler.`;
      
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptText }]
        })
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      let text = data.text || "";
      text = text.replace(/^[#\*\s]+/, '').replace(/\n+/g, ' ').trim();
      if (text.length > 250) {
        const truncated = text.substring(0, 245);
        const lastPeriod = truncated.lastIndexOf(".");
        text = (lastPeriod > 100 ? truncated.substring(0, lastPeriod + 1) : truncated + "...");
      }
      setAiResponse(text || `${targetQuery}: Evidence-based clinical research index analyzing physiological adaptations, tissue mechanics, and targeted performance protocols.`);
    } catch (err) {
      setAiResponse(`${targetQuery}: Open-access medical indexing standard focusing on sports physiology, biomechanics, neuromuscular control, and clinical outcome metrics.`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSuggestionClick = (target: string) => {
    addQuery(target);
    setSearchQuery(target);
    setCurrentPage("search-results");
  };

  const trendingTopics = [
    "HIIT vs Continuous Aerobic",
    "Achilles Tendinopathy",
    "Myokines in Muscle Aging",
    "Sleep Optimization",
    "Sarcopenia",
    "Gait Biomechanics",
    "Ketone Monoester Supplementation",
  ];

  return (
    <div className="flex-grow bg-white flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full text-center">
        {/* Logo and Tagline */}
        <div className="mb-10 select-none animate-fadeIn">
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-black tracking-tight uppercase">
            Healthedia
          </h1>
          <p className="mt-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            Global Health & Performance Archive
          </p>
          <div className="w-12 h-0.5 bg-black mx-auto mt-4"></div>
          <p className="mt-4 text-xs text-neutral-400 max-w-lg mx-auto font-sans leading-relaxed">
            The leading open-access indexing database for medical, rehabilitation, sports physiology, biomechanics, and human performance studies.
          </p>
        </div>

        {/* Large Centered Search Bar */}
        <div className="relative mb-8" ref={suggestionRef}>
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex items-center border border-neutral-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all duration-150 rounded-2xl overflow-hidden bg-white h-16 pr-2"
          >
            <div className="flex items-center pl-5 text-neutral-400 bg-white shrink-0">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </div>
            <input
              type="text"
              data-search-input="true"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                if (speechError) setSpeechError(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by title, author, keyword, journal, specialty or DOI..."
              className="w-full h-full pl-3 pr-4 text-sm sm:text-base text-black bg-white focus:outline-none placeholder-neutral-400 font-sans"
              autoFocus
            />
            {/* Shortcut Badge Hint */}
            <div className="hidden md:flex items-center mr-2 shrink-0 select-none">
              <kbd className="px-2 py-1 text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-lg shadow-2xs">
                /
              </kbd>
            </div>
            {/* Voice Search (Hands-free Web Speech API) */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center mr-1.5 shrink-0 border ${
                isListening 
                  ? "bg-red-50 text-red-500 border-red-200 animate-pulse" 
                  : "bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-black border-neutral-200/50"
              }`}
              title={isListening ? "Listening... Click to cancel" : "Voice Search (micro-recognition)"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 stroke-[2]" />
              ) : (
                <Mic className="w-4 h-4 stroke-[2]" />
              )}
            </button>

            {/* AI Assistant Quick Definition Icon */}
            <button
              type="button"
              onClick={handleAiAssistant}
              className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center mr-2 shrink-0 border ${
                showAiPanel
                  ? "bg-black text-white border-black"
                  : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-black border-neutral-200/50"
              }`}
              title="AI Assistant: Instant Scientific Explanation"
            >
              <Sparkles className="w-4 h-4 stroke-[2]" />
            </button>

            <button
              type="submit"
              className="bg-black text-white h-11 px-6 sm:px-8 font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all duration-150 cursor-pointer flex items-center justify-center rounded-xl shrink-0"
            >
              Search
            </button>
          </form>

          {/* AI Assistant Lightweight Dropdown Panel */}
          {showAiPanel && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-neutral-200/90 text-left z-50 rounded-2xl shadow-xl overflow-hidden p-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-black text-white rounded-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black font-sans uppercase tracking-tight">AI Scientific Summary</span>
                    <p className="text-[10px] font-mono text-neutral-400">Concise medical definition & evidence-based context</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiPanel(false)}
                  className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {aiLoading ? (
                <div className="py-6 text-center space-y-2">
                  <Loader2 className="w-5 h-5 text-black animate-spin mx-auto" />
                  <p className="text-xs font-mono text-neutral-500">Synthesizing peer-reviewed evidence for "{aiTopic}"...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-sans text-neutral-800 leading-relaxed font-normal bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-100 select-text">
                    {aiResponse}
                  </p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-neutral-400">
                      ~{aiResponse.length} characters • Healthedia Indexed Literature
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse);
                          setCopiedAi(true);
                          setTimeout(() => setCopiedAi(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 hover:border-black text-neutral-700 text-[11px] font-mono font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedAi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedAi ? "Copied" : "Copy"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAiPanel(false);
                          addQuery(aiTopic);
                          setSearchQuery(aiTopic);
                          setCurrentPage("search-results");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-[11px] font-mono font-bold rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <span>Search Papers</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Autocomplete or Recent Searches dropdown */}
          {showSuggestions && (
            <>
              {suggestions.length > 0 ? (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 text-left z-40 divide-y divide-neutral-100 max-h-64 overflow-y-auto rounded-xl shadow-none">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.target)}
                      className="w-full px-4 py-3 text-xs sm:text-sm text-neutral-700 hover:bg-neutral-50 text-left flex items-center justify-between cursor-pointer rounded-none border-none"
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 text-left z-40 rounded-xl shadow-md overflow-hidden divide-y divide-neutral-100">
                    <div className="flex items-center px-4 py-2.5 bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent Searches
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100">
                      {recentQueries.map((search, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setQuery(search);
                            setSearchQuery(search);
                            setCurrentPage("search-results");
                          }}
                          className="w-full px-4 py-3 hover:bg-neutral-50 text-left flex items-center justify-between cursor-pointer group/item transition-colors"
                        >
                          <span className="text-xs sm:text-sm text-neutral-700 group-hover/item:text-black font-sans font-medium truncate">
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

        {speechError && (
          <div className="mb-6 -mt-4 text-center select-none animate-fadeIn">
            <p className="text-[10px] font-mono font-medium text-red-500 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100 inline-flex items-center gap-1.5 shadow-xs">
              <span className="text-red-600 font-bold">⚠️</span>
              {speechError}
            </p>
          </div>
        )}

        {/* Trending Tags / Quick Searches */}
        <div className="mb-14">
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {trendingTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  addQuery(topic);
                  setSearchQuery(topic);
                  setCurrentPage("search-results");
                }}
                className="text-[9px] font-mono uppercase tracking-wider font-medium px-2.5 py-1 bg-neutral-50/50 text-neutral-500 hover:text-black hover:bg-neutral-100 border border-neutral-200/70 hover:border-black transition-all duration-150 cursor-pointer rounded-full"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
