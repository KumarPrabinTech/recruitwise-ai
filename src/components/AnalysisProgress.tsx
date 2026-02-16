import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const STAGES = [
  { label: "Parsing job requirements...", maxSeconds: 5 },
  { label: "Analyzing resume...", maxSeconds: 10 },
  { label: "Calculating match score...", maxSeconds: 15 },
];

const TOTAL_SECONDS = 15;

interface AnalysisProgressProps {
  isLoading: boolean;
}

const AnalysisProgress = ({ isLoading }: AnalysisProgressProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed((p) => Math.min(p + 0.5, TOTAL_SECONDS));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const progress = Math.min((elapsed / TOTAL_SECONDS) * 95, 95); // never quite 100 until done
  const currentStage =
    STAGES.find((s) => elapsed < s.maxSeconds) || STAGES[STAGES.length - 1];
  const remaining = Math.max(0, Math.ceil(TOTAL_SECONDS - elapsed));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      role="alert"
      aria-live="assertive"
      aria-label="Analysis in progress"
    >
      <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-sm w-full mx-4 space-y-5 animate-scale-in">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <h3 className="text-base font-semibold text-foreground">Analyzing Candidate</h3>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{currentStage.label}</p>
          <p className="text-xs text-muted-foreground">
            {remaining > 0
              ? `Estimated time remaining: ~${remaining}s`
              : "Almost done..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
