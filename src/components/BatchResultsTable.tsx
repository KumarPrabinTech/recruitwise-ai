import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { CandidateResult, SortField, SortDir } from "@/lib/types";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  ThumbsDown,
  GitCompareArrows,
  Loader2,
} from "lucide-react";

interface BatchQueueItem {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

interface BatchResultsTableProps {
  queue: BatchQueueItem[];
  results: CandidateResult[];
  onCompare: (ids: string[]) => void;
}

const BatchResultsTable = ({ queue, results, onCompare }: BatchResultsTableProps) => {
  const [sortField, setSortField] = useState<SortField>("matchScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...results].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "fileName":
        return dir * a.fileName.localeCompare(b.fileName);
      case "matchScore":
        return dir * (a.result.matchScore - b.result.matchScore);
      case "recommendation":
        return dir * a.result.recommendation.localeCompare(b.result.recommendation);
      case "timestamp":
        return dir * (a.timestamp.getTime() - b.timestamp.getTime());
      default:
        return 0;
    }
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  const scoreColor = (score: number) =>
    score >= 80
      ? "text-[hsl(152,68%,36%)] bg-[hsl(152,68%,46%)]/10"
      : score >= 60
      ? "text-[hsl(38,80%,40%)] bg-[hsl(38,92%,50%)]/10"
      : "text-destructive bg-destructive/10";

  const pendingItems = queue.filter((q) => q.status !== "done");

  return (
    <div className="space-y-4">
      {/* Processing Queue */}
      {pendingItems.length > 0 && (
        <Card className="p-4 shadow-card">
          <h4 className="text-sm font-semibold text-foreground mb-3">Processing Queue</h4>
          <div className="space-y-2">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50"
              >
                <span className="text-sm text-foreground truncate max-w-[200px]">{item.fileName}</span>
                {item.status === "processing" ? (
                  <div className="flex items-center gap-1.5 text-xs text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing...
                  </div>
                ) : item.status === "error" ? (
                  <span className="text-xs text-destructive">Failed</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Waiting...</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <Card className="shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">
              Results ({results.length} candidate{results.length !== 1 ? "s" : ""})
            </h4>
            {selected.size >= 2 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompare(Array.from(selected))}
              >
                <GitCompareArrows className="h-4 w-4 mr-1.5" />
                Compare ({selected.size})
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => toggleSort("fileName")}
                    >
                      Candidate <SortIcon field="fileName" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors mx-auto"
                      onClick={() => toggleSort("matchScore")}
                    >
                      Score <SortIcon field="matchScore" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors mx-auto"
                      onClick={() => toggleSort("recommendation")}
                    >
                      Action <SortIcon field="recommendation" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Strengths</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Concerns</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-border last:border-0 transition-colors ${
                      selected.has(c.id) ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggleSelect(c.id)}
                        disabled={!selected.has(c.id) && selected.size >= 3}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">
                      {c.fileName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold tabular-nums ${scoreColor(c.result.matchScore)}`}
                      >
                        {c.result.matchScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          c.result.recommendation === "Interview"
                            ? "text-[hsl(152,68%,36%)]"
                            : "text-destructive"
                        }`}
                      >
                        {c.result.recommendation === "Interview" ? (
                          <ThumbsUp className="h-3 w-3" />
                        ) : (
                          <ThumbsDown className="h-3 w-3" />
                        )}
                        {c.result.recommendation}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                      {c.result.strengths.slice(0, 2).join("; ")}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                      {c.result.concerns.length > 0
                        ? c.result.concerns.slice(0, 2).join("; ")
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BatchResultsTable;
export type { BatchQueueItem };
