import React from "react";
import { X, Keyboard, Search, CornerDownLeft, Sparkles, Navigation, BookOpen, User, Building, ShieldCheck, Globe } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "Quick Search & Focus",
      shortcuts: [
        { key: "/", macKey: "/", description: "Focus the primary search bar from anywhere" },
        { key: "Cmd + K", macKey: "⌘ + K", description: "Alternative quick search shortcut" },
        { key: "Esc", macKey: "Esc", description: "Close dialogs, filter drawers, popups or blur search" },
        { key: "?", macKey: "?", description: "Toggle this Keyboard Shortcuts cheat sheet" },
      ]
    },
    {
      title: "Global Navigation (Alt + Key)",
      shortcuts: [
        { key: "Alt + H", macKey: "⌥ + H", description: "Go to Archive Search Home" },
        { key: "Alt + J", macKey: "⌥ + J", description: "Go to Scientific Journal" },
        { key: "Alt + R", macKey: "⌥ + R", description: "Go to Researchers Directory" },
        { key: "Alt + I", macKey: "⌥ + I", description: "Go to Institutions Directory" },
        { key: "Alt + C", macKey: "⌥ + C", description: "Go to Professional Courses" },
        { key: "Alt + W", macKey: "⌥ + W", description: "Open Research Workspace" },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-label="Close shortcuts modal overlay"
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden z-10 space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-800 rounded-xl border border-neutral-700">
              <Keyboard className="w-5 h-5 text-amber-400 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-sans tracking-wide text-white flex items-center gap-2">
                Researcher Keyboard Shortcuts
              </h2>
              <p className="text-[11px] text-neutral-400 font-mono">
                Press <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-amber-300 rounded text-[10px]">?</kbd> anytime to toggle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
                {group.title}
              </h3>
              
              <div className="space-y-2">
                {group.shortcuts.map((sc, sIdx) => (
                  <div 
                    key={sIdx} 
                    className="flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl border border-neutral-200/70 transition-colors"
                  >
                    <span className="text-xs font-medium text-neutral-700 font-sans">
                      {sc.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <kbd className="px-2 py-1 text-[11px] font-mono font-bold text-black bg-white border border-neutral-300 rounded-lg shadow-2xs">
                        {sc.key}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center text-[11px] text-neutral-500 font-sans leading-relaxed">
            💡 <strong className="text-neutral-800 font-semibold">Pro tip for researchers:</strong> Focus search anytime with <kbd className="px-1 py-0.5 bg-white border border-neutral-300 rounded text-[10px] font-mono text-black font-bold">/</kbd> to quickly query DOIs, author names, or clinical topics without using your mouse.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono text-[11px]">Healthedia Navigation Engine v2.4</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
