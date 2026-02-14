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
      // Simulated analysis — replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const jdLower = jobDescription.toLowerCase();
      const resumeLower = resume.toLowerCase();

      // Simple keyword matching for demo
      const keywords = ["react", "typescript", "javascript", "python", "node", "aws", "docker", "sql", "api", "agile", "leadership", "communication", "design", "testing", "ci/cd"];
      const jdKeywords = keywords.filter((k) => jdLower.includes(k));
      const matchedKeywords = jdKeywords.filter((k) => resumeLower.includes(k));
      const score = jdKeywords.length > 0
        ? Math.min(98, Math.round((matchedKeywords.length / jdKeywords.length) * 85 + Math.random() * 15))
        : Math.round(40 + Math.random() * 40);

      const mockResult: AnalysisResult = {
        matchScore: score,
        summary: `The candidate shows ${score >= 70 ? "strong" : "moderate"} alignment with the role requirements. ${matchedKeywords.length} out of ${jdKeywords.length || "several"} key skills were identified in the resume.`,
        strengths: [
          ...(matchedKeywords.length > 0
            ? [`Demonstrated experience with ${matchedKeywords.slice(0, 3).join(", ")}`]
            : []),
          "Resume is well-structured and clearly presented",
          score >= 60 ? "Relevant industry experience aligns with role" : "Shows willingness to learn",
          "Professional background suggests cultural fit",
        ],
        concerns: score < 70
          ? [
              `Missing key skills: ${jdKeywords.filter((k) => !matchedKeywords.includes(k)).slice(0, 3).join(", ") || "some required technologies"}`,
              "May require additional training in certain areas",
            ]
          : [],
        recommendation: score >= 60 ? "Interview" : "Reject",
        reasoning:
          score >= 60
            ? "Candidate meets the core requirements and warrants further evaluation through an interview."
            : "Candidate lacks several key qualifications. Consider other applicants who better match the role.",
      };

      setResult(mockResult);
      setAnalysisTimestamp(new Date());
      setView("results");
    } catch {
      toast({
        title: "Analysis Failed",
        description: "Something went wrong. Please try again.",
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
