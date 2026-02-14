import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScoreGauge from "@/components/ScoreGauge";
import type { AnalysisResult } from "@/components/ScreeningForm";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react";

interface ResultsDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
  onBack: () => void;
}

const ResultsDisplay = ({ result, onReset, onBack }: ResultsDisplayProps) => {
  const isInterview = result.recommendation === "Interview";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="gradient-primary p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">Recruit-AI</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Analyze Another
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <h2 className="text-2xl font-bold text-foreground mb-8 animate-fade-in">
          Screening Results
        </h2>

        {/* Score + Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-8 shadow-card flex flex-col items-center justify-center animate-scale-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Match Score
            </h3>
            <ScoreGauge score={result.matchScore} />
          </Card>

          <Card
            className="p-8 shadow-card flex flex-col items-center justify-center animate-scale-in"
            style={{ animationDelay: "0.1s" }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Recommendation
            </h3>
            <div
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
                isInterview
                  ? "bg-[hsl(152,68%,46%)]/10 text-[hsl(152,68%,36%)]"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {isInterview ? (
                <ThumbsUp className="h-5 w-5" />
              ) : (
                <ThumbsDown className="h-5 w-5" />
              )}
              {result.recommendation}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4 max-w-xs">
              {result.reasoning}
            </p>
          </Card>
        </div>

        {/* Summary */}
        <Card
          className="p-6 shadow-card mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="text-base font-semibold text-foreground mb-3">Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        </Card>

        {/* Strengths & Concerns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="p-6 shadow-card animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-[hsl(152,68%,46%)]" />
              <h3 className="text-base font-semibold text-foreground">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(152,68%,46%)] shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>

          <Card
            className="p-6 shadow-card animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-[hsl(38,92%,50%)]" />
              <h3 className="text-base font-semibold text-foreground">Areas of Concern</h3>
            </div>
            {result.concerns.length > 0 ? (
              <ul className="space-y-2">
                {result.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(38,92%,50%)] shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No significant concerns identified.</p>
            )}
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center mt-10 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground px-10 py-6 text-base font-semibold shadow-glow hover:opacity-90 transition-opacity"
            onClick={onReset}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Analyze Another Candidate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
