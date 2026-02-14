import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScoreGauge from "@/components/ScoreGauge";
import type { CandidateResult } from "@/lib/types";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface ComparisonViewProps {
  candidates: CandidateResult[];
  onBack: () => void;
}

const ComparisonView = ({ candidates, onBack }: ComparisonViewProps) => {
  const maxScore = Math.max(...candidates.map((c) => c.result.matchScore));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-bold text-foreground">
          Candidate Comparison ({candidates.length})
        </h3>
      </div>

      {/* Side by side cards */}
      <div className={`grid gap-6 ${candidates.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
        {candidates.map((c) => {
          const isBest = c.result.matchScore === maxScore;
          const isInterview = c.result.recommendation === "Interview";

          return (
            <Card
              key={c.id}
              className={`p-6 shadow-card relative overflow-hidden transition-all ${
                isBest ? "ring-2 ring-primary" : ""
              }`}
            >
              {isBest && (
                <div className="absolute top-0 right-0 gradient-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  TOP MATCH
                </div>
              )}

              {/* Name */}
              <h4 className="text-sm font-bold text-foreground mb-4 truncate pr-16">
                {c.fileName}
              </h4>

              {/* Score */}
              <div className="flex justify-center mb-4">
                <ScoreGauge score={c.result.matchScore} />
              </div>

              {/* Recommendation */}
              <div className="flex justify-center mb-5">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${
                    isInterview
                      ? "bg-[hsl(152,68%,46%)]/10 text-[hsl(152,68%,36%)]"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {isInterview ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                  {c.result.recommendation}
                </span>
              </div>

              {/* Summary */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                {c.result.summary}
              </p>

              {/* Strengths */}
              <div className="mb-3">
                <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(152,68%,46%)]" />
                  Strengths
                </h5>
                <ul className="space-y-1">
                  {c.result.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-[hsl(152,68%,46%)] shrink-0" />
                      <span className="line-clamp-2">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-[hsl(38,92%,50%)]" />
                  Concerns
                </h5>
                {c.result.concerns.length > 0 ? (
                  <ul className="space-y-1">
                    {c.result.concerns.slice(0, 3).map((con, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-[hsl(38,92%,50%)] shrink-0" />
                        <span className="line-clamp-2">{con}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">None identified</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Score comparison bar */}
      <Card className="p-6 shadow-card">
        <h4 className="text-sm font-semibold text-foreground mb-4">Score Comparison</h4>
        <div className="space-y-3">
          {candidates
            .sort((a, b) => b.result.matchScore - a.result.matchScore)
            .map((c) => {
              const pct = c.result.matchScore;
              const barColor =
                pct >= 80
                  ? "from-[hsl(152,68%,46%)] to-[hsl(165,60%,42%)]"
                  : pct >= 60
                  ? "from-[hsl(38,92%,50%)] to-[hsl(45,90%,55%)]"
                  : "from-[hsl(0,72%,51%)] to-[hsl(15,70%,50%)]";

              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-foreground w-32 truncate shrink-0">
                    {c.fileName}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out flex items-center justify-end pr-2`}
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-[10px] font-bold text-primary-foreground">{pct}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack}>
          Back to Results
        </Button>
      </div>
    </div>
  );
};

export default ComparisonView;
