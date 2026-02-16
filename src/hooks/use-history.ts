import { useState, useEffect, useCallback } from "react";
import type { HistoryEntry, SavedJobDescription } from "@/lib/types";
import type { AnalysisResult } from "@/components/ScreeningForm";

const HISTORY_KEY = "recruit-ai-history";
const SAVED_JD_KEY = "recruit-ai-saved-jds";
const MAX_HISTORY = 20;
const MAX_SAVED_JDS = 10;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    loadJson<HistoryEntry[]>(HISTORY_KEY, [])
  );

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = useCallback(
    (candidateName: string, jobTitle: string, result: AnalysisResult) => {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        candidateName,
        jobTitle,
        result,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}

export function useSavedJobDescriptions() {
  const [savedJds, setSavedJds] = useState<SavedJobDescription[]>(() =>
    loadJson<SavedJobDescription[]>(SAVED_JD_KEY, [])
  );

  useEffect(() => {
    localStorage.setItem(SAVED_JD_KEY, JSON.stringify(savedJds));
  }, [savedJds]);

  const saveJd = useCallback((title: string, content: string) => {
    const entry: SavedJobDescription = {
      id: crypto.randomUUID(),
      title: title || `JD - ${new Date().toLocaleDateString()}`,
      content,
      savedAt: new Date().toISOString(),
    };
    setSavedJds((prev) => [entry, ...prev].slice(0, MAX_SAVED_JDS));
  }, []);

  const removeJd = useCallback((id: string) => {
    setSavedJds((prev) => prev.filter((j) => j.id !== id));
  }, []);

  return { savedJds, saveJd, removeJd };
}
