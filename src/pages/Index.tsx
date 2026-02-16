import { useState, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import ScreeningForm from "@/components/ScreeningForm";
import type { AnalysisResult, ResumeEntry, CandidateInfo } from "@/components/ScreeningForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import BatchResultsTable from "@/components/BatchResultsTable";
import type { BatchQueueItem } from "@/components/BatchResultsTable";
import ComparisonView from "@/components/ComparisonView";
import HistoryView from "@/components/HistoryView";
import OnboardingTour from "@/components/OnboardingTour";
import FeedbackForm from "@/components/FeedbackForm";
import DarkModeToggle from "@/components/DarkModeToggle";
import type { CandidateResult } from "@/lib/types";
import { useAnalysisHistory, useSavedJobDescriptions } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, RotateCcw } from "lucide-react";

const API_URL = "https://prabin-free-trial.app.n8n.cloud/webhook/recruit-ai-screening";

type View = "hero" | "screening" | "single-results" | "batch-results" | "comparison" | "history";

const Index = () => {
  const [view, setView] = useState<View>("hero");
  const [isLoading, setIsLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<AnalysisResult | null>(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<Date>(new Date());
  const [screeningMode, setScreeningMode] = useState<"single" | "batch">("single");

  const [batchQueue, setBatchQueue] = useState<BatchQueueItem[]>([]);
  const [batchResults, setBatchResults] = useState<CandidateResult[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  const { toast } = useToast();
  const { history, addEntry, removeEntry, clearHistory } = useAnalysisHistory();
  const { savedJds, saveJd, removeJd } = useSavedJobDescriptions();

  // Store current JD title for history
  const [currentJdTitle, setCurrentJdTitle] = useState("Custom JD");

  const callApi = async (jobDescription: string, resume: string, candidateInfo?: CandidateInfo): Promise<AnalysisResult> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobDescription,
        resume,
        candidateName: candidateInfo?.name || "Unknown",
        candidateEmail: candidateInfo?.email || "",
        jobTitle: candidateInfo?.jobTitle || "",
        hiringManagerEmail: candidateInfo?.hiringManagerEmail || "hr@company.com",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        response.status === 429
          ? "Too many requests. Please wait a moment and try again."
          : response.status >= 500
          ? "The screening service is temporarily unavailable."
          : `Analysis failed (${response.status}). ${errorText || "Please try again."}`
      );
    }

    const data = await response.json();
    if (typeof data.score !== "number" || !data.summary) {
      throw new Error("Received an unexpected response from the server.");
    }

    return {
      matchScore: Math.max(0, Math.min(100, Math.round(data.score))),
      summary: data.summary,
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      concerns: Array.isArray(data.concerns) ? data.concerns : [],
      recommendation: data.recommendation === "INTERVIEW" || data.recommendation === "Interview" ? "Interview" : "Reject",
      reasoning: data.reasoning || "",
      applicationId: data.applicationId || undefined,
      breakdown: data.breakdown || undefined,
    };
  };

  const handleAnalyzeSingle = async (jobDescription: string, resume: string, candidateInfo: CandidateInfo) => {
    setIsLoading(true);
    const jdTitle = jobDescription.split("\n")[0].slice(0, 60) || "Custom JD";
    setCurrentJdTitle(jdTitle);

    try {
      const result = await callApi(jobDescription, resume, candidateInfo);
      setSingleResult(result);
      setAnalysisTimestamp(new Date());

      // Save to history
      addEntry(candidateInfo.name || "Single Candidate", jdTitle, result);

      // Show toast based on recommendation
      if (result.recommendation === "Interview") {
        toast({
          title: "✅ Recommend Interview",
          description: `${candidateInfo.name || "Candidate"} scored ${result.matchScore}/100. Proceed to interview.`,
        });
      } else {
        toast({
          title: "ℹ️ Not Recommended",
          description: `${candidateInfo.name || "Candidate"} scored ${result.matchScore}/100. Does not meet requirements.`,
          variant: "destructive",
        });
      }

      setView("single-results");
    } catch (err) {
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeBatch = useCallback(
    async (jobDescription: string, resumes: ResumeEntry[], candidateInfo: CandidateInfo) => {
      setIsLoading(true);
      setBatchResults([]);

      const jdTitle = jobDescription.split("\n")[0].slice(0, 60) || "Custom JD";

      const queue: BatchQueueItem[] = resumes.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        status: "pending",
      }));
      setBatchQueue(queue);
      setView("batch-results");

      const results: CandidateResult[] = [];

      for (let i = 0; i < resumes.length; i++) {
        const entry = resumes[i];

        setBatchQueue((prev) =>
          prev.map((q) => (q.id === entry.id ? { ...q, status: "processing" } : q))
        );

        try {
          const result = await callApi(jobDescription, entry.text, candidateInfo);
          const candidate: CandidateResult = {
            id: entry.id,
            fileName: entry.fileName,
            result,
            timestamp: new Date(),
          };
          results.push(candidate);
          setBatchResults((prev) => [...prev, candidate]);
          setBatchQueue((prev) =>
            prev.map((q) => (q.id === entry.id ? { ...q, status: "done" } : q))
          );

          // Save each to history
          addEntry(entry.fileName, jdTitle, result);
        } catch (err) {
          setBatchQueue((prev) =>
            prev.map((q) =>
              q.id === entry.id
                ? { ...q, status: "error", error: err instanceof Error ? err.message : "Failed" }
                : q
            )
          );
        }
      }

      setIsLoading(false);

      const failedCount = queue.length - results.length;
      if (failedCount > 0) {
        toast({
          title: "Some analyses failed",
          description: `${failedCount} of ${queue.length} candidates could not be analyzed.`,
          variant: "destructive",
        });
      }
    },
    [toast, addEntry]
  );

  const handleCompare = (ids: string[]) => {
    setComparisonIds(ids);
    setView("comparison");
  };

  const handleResetSingle = () => {
    setSingleResult(null);
    setView("screening");
  };

  const handleResetBatch = () => {
    setBatchQueue([]);
    setBatchResults([]);
    setView("screening");
  };

  // ---- VIEWS ----

  if (view === "hero") {
    return <HeroSection onGetStarted={() => setView("screening")} />;
  }

  if (view === "single-results" && singleResult) {
    return (
      <ResultsDisplay
        result={singleResult}
        analysisTimestamp={analysisTimestamp}
        onReset={handleResetSingle}
        onBack={() => setView("screening")}
      />
    );
  }

  if (view === "history") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("screening")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to screening"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="gradient-primary p-1.5 rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">Recruit-AI</span>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
        <div className="container mx-auto px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Analysis History</h2>
          <HistoryView
            history={history}
            onRemove={removeEntry}
            onClear={clearHistory}
            onBack={() => setView("screening")}
          />
        </div>
      </div>
    );
  }

  if (view === "comparison") {
    const compCandidates = batchResults.filter((c) => comparisonIds.includes(c.id));
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="gradient-primary p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">Recruit-AI</span>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <ComparisonView
            candidates={compCandidates}
            onBack={() => setView("batch-results")}
          />
        </div>
      </div>
    );
  }

  if (view === "batch-results") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("screening")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="gradient-primary p-1.5 rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">Recruit-AI</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetBatch}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Batch Results</h2>
          <BatchResultsTable
            queue={batchQueue}
            results={batchResults}
            onCompare={handleCompare}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <OnboardingTour run={view === "screening"} />
      <ScreeningForm
        onAnalyzeSingle={handleAnalyzeSingle}
        onAnalyzeBatch={handleAnalyzeBatch}
        isLoading={isLoading}
        onBack={() => setView("hero")}
        mode={screeningMode}
        onModeChange={setScreeningMode}
        savedJds={savedJds}
        onSaveJd={saveJd}
        onRemoveJd={removeJd}
        onOpenHistory={() => setView("history")}
      />
      <FeedbackForm />
    </>
  );
};

export default Index;
