import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Brain, Bot, HelpCircle, ArrowRight, RotateCcw, Flame, 
  Dumbbell, Heart, Activity, ShieldCheck, AlertCircle, FileText
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIPageViewProps {
  setCurrentPage: (page: string) => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

const PRESET_PROMPTS = [
  {
    title: "ACL Rehabilitation Protocol",
    prompt: "What are the evidence-based guidelines for load progression during late-stage post-operative ACL reconstruction?",
    icon: Dumbbell,
    color: "text-blue-500 bg-blue-50 border-blue-200"
  },
  {
    title: "Endocrine Failure Mitigation",
    prompt: "How can athletes mitigate adaptation degradation and endocrine fatigue during prolonged high-volume resistance training cycles?",
    icon: Activity,
    color: "text-amber-500 bg-amber-50 border-amber-200"
  },
  {
    title: "Myocardial Strain Dynamics",
    prompt: "Summarize current research insights regarding myocardial strain dynamics and athletic heart adaptation in endurance runners.",
    icon: Heart,
    color: "text-rose-500 bg-rose-50 border-rose-200"
  },
  {
    title: "Double-Blind Control Standards",
    prompt: "What criteria does the Healthedia registry require to meet double-blind physiological control standards for publishing?",
    icon: ShieldCheck,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200"
  }
];

export default function AIPageView({ setCurrentPage, showToast }: AIPageViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Welcome to Healthedia AI Research Assistant. I am trained on advanced sports science, clinical performance literature, and academic guidelines.\n\nHow can I help you accelerate your physiological research or review protocol today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const chatPayload = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatPayload })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Failed to communicate with AI");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.text || "I apologize, but I received an empty response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      if (showToast) {
        showToast(err.message || "Unable to reach Gemini. Please verify your API Key.", "error");
      }
      
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Service Interruption**: ${err.message || "I encountered an error connecting to the backend Gemini service. Please check that GEMINI_API_KEY is properly set in your Secrets config."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content: "Reset complete. Welcome to Healthedia AI Research Assistant. Ask me anything about sports medicine, sports reconditioning protocols, or global registry standards.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (showToast) {
      showToast("Conversation cleared", "info");
    }
  };

  return (
    <div id="ai-assistant-page" className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col min-h-[calc(100vh-140px)] select-none">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-black text-white rounded-2xl mb-4 border border-neutral-800 shadow-sm animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black font-sans tracking-tight text-neutral-900 leading-tight">
          AI Research Assistant
        </h1>
        <p className="text-xs font-mono text-neutral-400 mt-2 uppercase tracking-widest leading-none font-semibold">
          Powered by Gemini 3.5 Flash • Evidence-Based Sports Science & Clinical Protocol Engine
        </p>
      </div>

      {/* Main Grid: Prompts + Chat Container */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col flex-grow min-h-[500px]">
        {/* Chat window status bar */}
        <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Live Cognitive Node Connection</span>
          </div>
          <button 
            onClick={resetConversation}
            className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-black cursor-pointer uppercase tracking-wider font-bold"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
            <span>Reset Session</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[480px] min-h-[350px]">
          {messages.map((msg) => {
            const isAI = msg.role === "assistant";
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-xs ${
                  isAI ? "bg-black border-black text-white" : "bg-neutral-50 border-neutral-200 text-neutral-600"
                }`}>
                  {isAI ? <Bot className="w-4 h-4 stroke-[1.5]" /> : <Brain className="w-4 h-4 stroke-[1.5]" />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isAI 
                      ? "bg-neutral-50 border border-neutral-200/60 text-neutral-800" 
                      : "bg-black text-white"
                  }`}>
                    <div className="whitespace-pre-wrap font-sans font-medium">
                      {msg.content}
                    </div>
                  </div>
                  <span className={`text-[8px] font-mono text-neutral-400 mt-1 ${isAI ? "text-left" : "text-right"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-black text-white border border-black shadow-xs">
                <Bot className="w-4 h-4 stroke-[1.5] animate-spin" />
              </div>
              <div className="flex flex-col">
                <div className="p-4 rounded-2xl text-xs bg-neutral-50 border border-neutral-200/60 text-neutral-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-200"></span>
                  <span className="font-mono text-[10px] uppercase font-semibold text-neutral-400 ml-1">Analyzing literature database...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Box (Only show if only 1 initial greeting message exists) */}
        {messages.length === 1 && (
          <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Suggested Explorations & Direct Questions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {PRESET_PROMPTS.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 border border-neutral-200/80 bg-white rounded-xl text-left hover:border-black hover:bg-neutral-50 transition-all duration-150 cursor-pointer group flex items-start gap-2.5"
                  >
                    <div className={`p-1.5 rounded-lg border shrink-0 ${item.color}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-neutral-900 group-hover:text-black flex items-center gap-1 font-sans">
                        <span>{item.title}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-[9px] text-neutral-400 mt-0.5 truncate leading-relaxed">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Input area */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-4 bg-white border-t border-neutral-200/80 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your physiological or clinical inquiry here..."
            disabled={isLoading}
            className="flex-grow bg-neutral-50 border border-neutral-200/80 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-black transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 rounded-2xl transition-all duration-150 cursor-pointer flex items-center justify-center border border-black shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Warning Alert */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-700 leading-normal font-sans font-medium">
          <strong>Academic Research Disclaimer</strong>: Healthedia AI is optimized for evidence exploration, training protocol synthesis, and cataloging compliance audits. It is not a substitute for professional medical diagnostics, clinical decision frameworks, or primary physiological investigations.
        </p>
      </div>
    </div>
  );
}
