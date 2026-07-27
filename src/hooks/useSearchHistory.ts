import { useState, useEffect, useCallback } from "react";

export function useSearchHistory() {
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  const loadHistory = useCallback(() => {
    const saved = localStorage.getItem("healthedia_recent_searches");
    if (saved) {
      try {
        setRecentQueries(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing recent searches", e);
      }
    } else {
      setRecentQueries([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    // Listen to storage events or custom triggers for cross-component sync
    window.addEventListener("storage", loadHistory);
    return () => {
      window.removeEventListener("storage", loadHistory);
    };
  }, [loadHistory]);

  const addQuery = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const saved = localStorage.getItem("healthedia_recent_searches") || "[]";
    let currentList: string[] = [];
    try {
      currentList = JSON.parse(saved);
    } catch (e) {}

    // Check if the query is already in history (case-insensitive check to prevent duplicate entries)
    const filtered = currentList.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    
    // Add the new query to the beginning of the history and restrict to the most recent 5 entries
    const updated = [trimmed, ...filtered].slice(0, 5);
    
    localStorage.setItem("healthedia_recent_searches", JSON.stringify(updated));
    setRecentQueries(updated);

    // Dispatch event to notify other components
    window.dispatchEvent(new Event("storage"));
  }, []);

  const removeQuery = useCallback((query: string) => {
    const saved = localStorage.getItem("healthedia_recent_searches") || "[]";
    let currentList: string[] = [];
    try {
      currentList = JSON.parse(saved);
    } catch (e) {}

    const updated = currentList.filter((q) => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem("healthedia_recent_searches", JSON.stringify(updated));
    setRecentQueries(updated);

    window.dispatchEvent(new Event("storage"));
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem("healthedia_recent_searches");
    setRecentQueries([]);
    window.dispatchEvent(new Event("storage"));
  }, []);

  return {
    recentQueries,
    addQuery,
    removeQuery,
    clearAll,
  };
}
