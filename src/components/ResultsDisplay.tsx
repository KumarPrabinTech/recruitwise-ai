import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScoreGauge from "@/components/ScoreGauge";
import CopyButton from "@/components/CopyButton";
import DarkModeToggle from "@/components/DarkModeToggle";
import type { AnalysisResult } from "@/components/ScreeningForm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronDown,
  Download,
  Clock,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

interface ResultsDisplayProps {
  result: AnalysisResult;
  analysisTimestamp: Date;
  onReset: () => void;
  onBack: () => void;
}

const ResultsDisplay = ({ result, analysisTimestamp, onReset, onBack }: ResultsDisplayProps) => {
  const isInterview = result.recommendation === "Interview";
  const [detailsOpen, setDetailsOpen] = useState(true);

  const handleExportPdf = () => {
    const doc = buildPdfHtml(result, analysisTimestamp);
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    // Trigger print dialog so the user can "Save as PDF"
    if (win) {
      win.addEventListener("load", () => {
        win.print();
      });
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

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
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Button variant="outline" size="sm" onClick={handleExportPdf} aria-label="Export results as PDF">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onReset} aria-label="Analyze another candidate">
              <RotateCcw className="h-4 w-4 mr-2" />
              Analyze Another
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        {/* Title + Timestamp */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-2 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground">Screening Results</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Completed {format(analysisTimestamp, "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
        </div>

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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Summary</h3>
            </div>
            <CopyButton text={result.summary} label="Copy" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        </Card>

        {/* Expandable Detailed Analysis */}
        <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <Card className="shadow-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h3 className="text-base font-semibold text-foreground">Detailed Analysis</h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      detailsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6">
                  <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-[hsl(152,68%,46%)]" />
                          <h4 className="text-sm font-semibold text-foreground">Key Strengths</h4>
                        </div>
                        <CopyButton text={result.strengths.join("\n")} label="Copy" />
                      </div>
                      <ul className="space-y-3">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-[hsl(152,68%,46%)] shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Concerns */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-[hsl(38,92%,50%)]" />
                          <h4 className="text-sm font-semibold text-foreground">Areas of Concern</h4>
                        </div>
                        <CopyButton text={result.concerns.join("\n") || "None"} label="Copy" />
                      </div>
                      {result.concerns.length > 0 ? (
                        <ul className="space-y-3">
                          {result.concerns.map((c, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                              <AlertTriangle className="h-4 w-4 text-[hsl(38,92%,50%)] shrink-0 mt-0.5" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No significant concerns identified.</p>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base font-semibold"
            onClick={handleExportPdf}
          >
            <Download className="mr-2 h-5 w-5" />
            Export as PDF
          </Button>
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

// ---- PDF HTML builder ----
function buildPdfHtml(result: AnalysisResult, timestamp: Date): string {
  const time = format(timestamp, "MMMM d, yyyy 'at' h:mm a");
  const scoreColor =
    result.matchScore >= 80
      ? "#22c55e"
      : result.matchScore >= 60
      ? "#f59e0b"
      : "#ef4444";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Recruit-AI Screening Report</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 700px; margin: 40px auto; color: #1a1a2e; padding: 0 24px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 13px; margin-bottom: 32px; }
  .score-section { text-align: center; margin: 32px 0; }
  .score { font-size: 64px; font-weight: 800; color: ${scoreColor}; }
  .score-label { font-size: 14px; color: #666; }
  .badge { display: inline-block; padding: 8px 20px; border-radius: 999px; font-weight: 700; font-size: 16px;
    background: ${result.recommendation === "Interview" ? "#dcfce7" : "#fee2e2"};
    color: ${result.recommendation === "Interview" ? "#166534" : "#991b1b"}; }
  h2 { font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 28px; }
  ul { padding-left: 0; list-style: none; }
  li { padding: 4px 0; font-size: 14px; }
  li::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; }
  .str li::before { background: #22c55e; }
  .con li::before { background: #f59e0b; }
  .summary { font-size: 14px; line-height: 1.7; color: #444; }
  @media print { body { margin: 20px; } }
</style></head><body>
<h1>Recruit-AI Screening Report</h1>
<div class="meta">Generated on ${time}</div>
<div class="score-section">
  <div class="score">${result.matchScore}</div>
  <div class="score-label">Match Score out of 100</div>
  <div style="margin-top:16px"><span class="badge">${result.recommendation}</span></div>
  <p style="font-size:13px;color:#666;margin-top:8px;max-width:400px;margin-left:auto;margin-right:auto">${result.reasoning}</p>
</div>
<h2>Summary</h2>
<p class="summary">${result.summary}</p>
<h2>Key Strengths</h2>
<ul class="str">${result.strengths.map((s) => `<li>${s}</li>`).join("")}</ul>
<h2>Areas of Concern</h2>
${result.concerns.length > 0 ? `<ul class="con">${result.concerns.map((c) => `<li>${c}</li>`).join("")}</ul>` : `<p style="font-size:14px;color:#666">No significant concerns identified.</p>`}
</body></html>`;
}
