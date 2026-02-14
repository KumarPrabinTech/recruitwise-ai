import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HistoryEntry } from "@/lib/types";
import {
  Search,
  Trash2,
  Download,
  ThumbsUp,
  ThumbsDown,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { format } from "date-fns";

interface HistoryViewProps {
  history: HistoryEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onBack: () => void;
}

const HistoryView = ({ history, onRemove, onClear, onBack }: HistoryViewProps) => {
  const [search, setSearch] = useState("");
  const [filterRec, setFilterRec] = useState<"all" | "Interview" | "Reject">("all");

  const filtered = history.filter((e) => {
    const matchesSearch =
      !search ||
      e.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.result.summary.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterRec === "all" || e.result.recommendation === filterRec;

    return matchesSearch && matchesFilter;
  });

  const exportCsv = () => {
    const headers = [
      "Candidate",
      "Job Title",
      "Score",
      "Recommendation",
      "Summary",
      "Strengths",
      "Concerns",
      "Reasoning",
      "Date",
    ];

    const rows = filtered.map((e) => [
      e.candidateName,
      e.jobTitle,
      e.result.matchScore.toString(),
      e.result.recommendation,
      `"${e.result.summary.replace(/"/g, '""')}"`,
      `"${e.result.strengths.join("; ").replace(/"/g, '""')}"`,
      `"${e.result.concerns.join("; ").replace(/"/g, '""')}"`,
      `"${e.result.reasoning.replace(/"/g, '""')}"`,
      format(new Date(e.timestamp), "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recruit-ai-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = (score: number) =>
    score >= 80
      ? "text-[hsl(152,68%,36%)] bg-[hsl(152,68%,46%)]/10"
      : score >= 60
      ? "text-[hsl(38,80%,40%)] bg-[hsl(38,92%,50%)]/10"
      : "text-destructive bg-destructive/10";

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates, jobs..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["all", "Interview", "Reject"] as const).map((f) => (
              <button
                key={f}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterRec === f
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setFilterRec(f)}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {filtered.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
          )}
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="p-12 shadow-card text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            {history.length === 0 ? "No history yet" : "No matches found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {history.length === 0
              ? "Your analysis results will appear here after screening candidates."
              : "Try adjusting your search or filter criteria."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 shadow-card hover:shadow-elevated transition-shadow animate-fade-in"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {entry.candidateName}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${scoreColor(entry.result.matchScore)}`}
                    >
                      {entry.result.matchScore}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        entry.result.recommendation === "Interview"
                          ? "text-[hsl(152,68%,36%)]"
                          : "text-destructive"
                      }`}
                    >
                      {entry.result.recommendation === "Interview" ? (
                        <ThumbsUp className="h-3 w-3" />
                      ) : (
                        <ThumbsDown className="h-3 w-3" />
                      )}
                      {entry.result.recommendation}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    <span className="font-medium">Role:</span> {entry.jobTitle}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {entry.result.summary}
                  </p>

                  <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>

                <button
                  onClick={() => onRemove(entry.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1"
                  title="Remove from history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
