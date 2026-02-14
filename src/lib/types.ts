import { AnalysisResult } from "@/components/ScreeningForm";

export interface CandidateResult {
  id: string;
  fileName: string;
  result: AnalysisResult;
  timestamp: Date;
}

export type SortField = "fileName" | "matchScore" | "recommendation" | "timestamp";
export type SortDir = "asc" | "desc";
