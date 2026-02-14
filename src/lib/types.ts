import { AnalysisResult } from "@/components/ScreeningForm";

export interface CandidateResult {
  id: string;
  fileName: string;
  result: AnalysisResult;
  timestamp: Date;
}

export type SortField = "fileName" | "matchScore" | "recommendation" | "timestamp";
export type SortDir = "asc" | "desc";

// History types
export interface HistoryEntry {
  id: string;
  candidateName: string;
  jobTitle: string;
  result: AnalysisResult;
  timestamp: string; // ISO string for serialization
}

export interface SavedJobDescription {
  id: string;
  title: string;
  content: string;
  savedAt: string;
}
