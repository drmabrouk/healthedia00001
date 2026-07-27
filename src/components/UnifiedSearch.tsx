import React, { useRef, useState, useEffect } from "react";
import { Search, Mic, MicOff, X, Sparkles, Loader2, Copy, Check, ArrowRight } from "lucide-react";
import { getAutocompleteSuggestions, AutocompleteSuggestion } from "../searchEngine";
import { useSearchHistory } from "../hooks/useSearchHistory";

interface UnifiedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: (e?: React.FormEvent) => void;
  className?: string;
  size?: "sm" | "lg";
  enableVoice?: boolean;
  enableAi?: boolean;
  onVoiceResult?: (transcript: string) => void;
  onClear?: () => void;
  showSuggestionsDropdown?: boolean;
}

export default function UnifiedSearch({
  value,
  onChange,
  placeholder = "Search...",
  onSubmit,
  className = "",
  size = "sm",
  enableVoice = true,
  enableAi = true,
  onVoiceResult,
  onClear,
  showSuggestionsDropdown = false,
}: UnifiedSearchProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<any>(null);

  // AI Assistant Panel State
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiTopic, setAiTopic] = useState<string>("");
  const [copiedAi, setCopiedAi] = useState(false);

  onResultRef.current = (transcript: string) => {
    if (transcript) {
      onChange(transcript);
      if (onVoiceResult) {
        onVoiceResult(transcript);
      }
    }
  };

  useEffect(() => {
    if (!enableVoice) return;
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
          setSpeechError("Microphone access denied. Please allow permissions.");
        } else if (event.error === "no-speech") {
          setSpeechError("No speech detected.");
        } else {
          setSpeechError(`Speech error: ${event.error}`);
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
  }, [enableVoice]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition is not supported in this browser.");
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
    if (!showSuggestionsDropdown) return;
    if (value.trim().length >= 2) {
      setSuggestions(getAutocompleteSuggestions(value));
    } else {
      setSuggestions([]);
    }
  }, [value, showSuggestionsDropdown]);

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

  const handleAiAssistant = async () => {
    setShowSuggestions(false);
    const targetQuery = value.trim() || "Sports Physiology & Reconditioning";
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleSuggestionSelect = (target: string) => {
    onChange(target);
    setShowSuggestions(false);
    if (onSubmit) {
      setTimeout(() => onSubmit(), 50);
    }
  };

  if (size === "lg") {
    return (
      <div className={`relative ${className}`} ref={suggestionRef}>
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center border border-neutral-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all duration-150 rounded-2xl overflow-hidden bg-white h-16 pr-2"
        >
          <div className="flex items-center pl-5 text-neutral-400 bg-white shrink-0">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setShowSuggestions(true);
              if (speechError) setSpeechError(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full h-full pl-3 pr-4 text-sm sm:text-base text-black bg-white focus:outline-none placeholder-neutral-400 font-sans"
          />

          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-black mr-2 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {enableVoice && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center mr-1.5 shrink-0 border ${
                isListening
                  ? "bg-red-50 text-red-500 border-red-200 animate-pulse"
                  : "bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-black border-neutral-200/50"
              }`}
              title={isListening ? "Listening... Click to cancel" : "Voice search (hands-free)"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 stroke-[2]" />
              ) : (
                <Mic className="w-4 h-4 stroke-[2]" />
              )}
            </button>
          )}

          {enableAi && (
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
          )}

          <button
            type="submit"
            className="bg-black text-white h-11 px-6 sm:px-8 font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all duration-150 cursor-pointer flex items-center justify-center rounded-xl shrink-0"
          >
            Search
          </button>
        </form>

        {speechError && (
          <p className="text-[10px] text-red-500 font-mono text-left mt-2 animate-fadeIn">
            ⚠ {speechError}
          </p>
        )}

        {/* AI Assistant Lightweight Dropdown Panel */}
        {showAiPanel && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-neutral-200 text-left z-50 rounded-2xl shadow-xl overflow-hidden p-5 animate-fadeIn">
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
                      onClick={(e) => {
                        setShowAiPanel(false);
                        onChange(aiTopic);
                        if (onSubmit) onSubmit(e);
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

        {/* Suggestions list */}
        {showSuggestionsDropdown && showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 text-left z-40 divide-y divide-neutral-100 max-h-64 overflow-y-auto rounded-xl shadow-lg">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion.target)}
                className="w-full px-4 py-3 hover:bg-neutral-50 text-xs font-mono flex items-center justify-between text-left transition-colors cursor-pointer text-black"
              >
                <span>{suggestion.text}</span>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold px-2 py-0.5 rounded-md bg-neutral-100 shrink-0">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Small size for inner pages
  return (
    <div className={`flex border border-neutral-200 focus-within:border-black transition-colors rounded-xl overflow-hidden bg-white ${className}`}>
      <div className="flex items-center pl-3 text-neutral-400 shrink-0">
        <Search className="w-3.5 h-3.5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2 pl-2 pr-2 text-xs text-black focus:outline-none bg-white font-sans"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="px-2 hover:text-black text-neutral-400 flex items-center justify-center cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
