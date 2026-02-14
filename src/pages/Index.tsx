import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ScreeningForm from "@/components/ScreeningForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import type { AnalysisResult } from "@/components/ScreeningForm";
import { useToast } from "@/hooks/use-toast";

type View = "hero" | "screening" | "results";

const Index = () => {
  const [view, setView] = useState<View>("hero");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<Date>(new Date());
  const { toast } = useToast();

  const handleAnalyze = async (jobDescription: string, resume: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("https://prabin.up.railway.app/webhook/screen-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          response.status === 429
            ? "Too many requests. Please wait a moment and try again."
            : response.status >= 500
            ? "The screening service is temporarily unavailable. Please try again later."
            : `Analysis failed (${response.status}). ${errorText || "Please try again."}`
        );
      }

      const data = await response.json();

      // Validate response shape
      if (typeof data.score !== "number" || !data.summary) {
        throw new Error("Received an unexpected response from the server.");
      }

      const analysisResult: AnalysisResult = {
        matchScore: Math.max(0, Math.min(100, Math.round(data.score))),
        summary: data.summary,
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        concerns: Array.isArray(data.concerns) ? data.concerns : [],
        recommendation: data.recommendation === "Interview" ? "Interview" : "Reject",
        reasoning: data.reasoning || "",
      };

      setResult(analysisResult);
      setAnalysisTimestamp(new Date());
      setView("results");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({
        title: "Analysis Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setView("screening");
  };

  if (view === "hero") {
    return <HeroSection onGetStarted={() => setView("screening")} />;
  }

  if (view === "results" && result) {
    return <ResultsDisplay result={result} analysisTimestamp={analysisTimestamp} onReset={handleReset} onBack={() => setView("screening")} />;
  }

  return (
    <ScreeningForm
      onAnalyze={handleAnalyze}
      isLoading={isLoading}
      onBack={() => setView("hero")}
    />
  );
};

export default Index;
