import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import JdTemplateSelector from "@/components/JdTemplateSelector";
import DarkModeToggle from "@/components/DarkModeToggle";
import type { SavedJobDescription } from "@/lib/types";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  ArrowLeft,
  X,
  CheckCircle2,
  Plus,
  Save,
  Clock,
  Keyboard,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: "Interview" | "Reject";
  reasoning: string;
}

export interface ResumeEntry {
  id: string;
  fileName: string;
  text: string;
}

interface ScreeningFormProps {
  onAnalyzeSingle: (jobDescription: string, resume: string) => void;
  onAnalyzeBatch: (jobDescription: string, resumes: ResumeEntry[]) => void;
  isLoading: boolean;
  onBack: () => void;
  mode: "single" | "batch";
  onModeChange: (mode: "single" | "batch") => void;
  savedJds: SavedJobDescription[];
  onSaveJd: (title: string, content: string) => void;
  onRemoveJd: (id: string) => void;
  onOpenHistory: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str).join(" "));
  }
  return pages.join("\n\n");
};

const ScreeningForm = ({
  onAnalyzeSingle,
  onAnalyzeBatch,
  isLoading,
  onBack,
  mode,
  onModeChange,
  savedJds,
  onSaveJd,
  onRemoveJd,
  onOpenHistory,
}: ScreeningFormProps) => {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [errors, setErrors] = useState<{ jd?: string; resume?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch state
  const [batchResumes, setBatchResumes] = useState<ResumeEntry[]>([]);
  const [batchParsing, setBatchParsing] = useState(false);
  const batchFileRef = useRef<HTMLInputElement>(null);

  const handleSingleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrors((p) => ({ ...p, resume: "Only PDF files are accepted" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((p) => ({ ...p, resume: "File must be under 5MB" }));
      return;
    }
    setIsParsing(true);
    setFileName(file.name);
    setErrors((p) => ({ ...p, resume: undefined }));
    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        setErrors((p) => ({ ...p, resume: "Could not extract text. PDF may be image-based." }));
        setFileName("");
        setResume("");
      } else {
        setResume(text);
      }
    } catch {
      setErrors((p) => ({ ...p, resume: "Failed to parse PDF." }));
      setFileName("");
      setResume("");
    } finally {
      setIsParsing(false);
    }
  };

  const handleBatchFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => {
      if (f.type !== "application/pdf") return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });

    if (validFiles.length === 0) {
      setErrors((p) => ({ ...p, resume: "No valid PDF files selected (must be PDF, <5MB each)" }));
      return;
    }

    setBatchParsing(true);
    setErrors((p) => ({ ...p, resume: undefined }));

    const newEntries: ResumeEntry[] = [];
    for (const file of validFiles) {
      try {
        const text = await extractTextFromPdf(file);
        if (text.trim()) {
          newEntries.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            text,
          });
        }
      } catch {
        // skip failed files
      }
    }

    setBatchResumes((prev) => [...prev, ...newEntries]);
    setBatchParsing(false);

    if (newEntries.length < validFiles.length) {
      setErrors((p) => ({
        ...p,
        resume: `${validFiles.length - newEntries.length} file(s) could not be parsed`,
      }));
    }
  };

  const removeBatchResume = (id: string) => {
    setBatchResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const clearSingleFile = () => {
    setFileName("");
    setResume("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!jobDescription.trim()) newErrors.jd = "Job description is required";

    if (mode === "single") {
      if (!resume.trim())
        newErrors.resume =
          inputMode === "file" ? "Please upload a resume PDF" : "Resume content is required";
    } else {
      if (batchResumes.length === 0) newErrors.resume = "Please upload at least one resume";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    if (mode === "single") {
      onAnalyzeSingle(jobDescription, resume);
    } else {
      onAnalyzeBatch(jobDescription, batchResumes);
    }
  }, [jobDescription, resume, mode, batchResumes, onAnalyzeSingle, onAnalyzeBatch]);

  // Ctrl+Enter shortcut
  useKeyboardShortcut({
    key: "Enter",
    ctrlKey: true,
    callback: handleSubmit,
    enabled: !isLoading && !isParsing && !batchParsing,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
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

          {/* Mode toggle + History + Dark mode */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Button variant="ghost" size="sm" onClick={onOpenHistory} className="text-muted-foreground" data-tour="history-btn" aria-label="View analysis history">
              <Clock className="h-4 w-4 mr-1.5" />
              History
            </Button>
            <div className="flex gap-1 bg-muted rounded-lg p-1" data-tour="mode-toggle" role="tablist" aria-label="Analysis mode">
              <button
                role="tab"
                aria-selected={mode === "single"}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === "single"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onModeChange("single")}
              >
                Single
              </button>
              <button
                role="tab"
                aria-selected={mode === "batch"}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === "batch"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onModeChange("batch")}
              >
                Batch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {mode === "single" ? "Candidate Screening" : "Batch Screening"}
          </h2>
          <p className="text-muted-foreground">
            {mode === "single"
              ? "Paste the job description and candidate resume to get an AI-powered analysis."
              : "Upload multiple resumes to screen candidates in batch against the job description."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Description */}
          <Card className="p-6 shadow-card" data-tour="jd-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Job Description</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {jobDescription.trim().length > 20 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    onClick={() => onSaveJd("", jobDescription)}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                )}
                <JdTemplateSelector
                  onSelect={(content) => {
                    setJobDescription(content);
                    setErrors((p) => ({ ...p, jd: undefined }));
                  }}
                />
              </div>
            </div>

            {/* Recent saved JDs */}
            {savedJds.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {savedJds.slice(0, 5).map((jd) => (
                  <button
                    key={jd.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors group"
                    onClick={() => {
                      setJobDescription(jd.content);
                      setErrors((p) => ({ ...p, jd: undefined }));
                    }}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    <span className="truncate max-w-[100px]">{jd.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveJd(jd.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}

            <Textarea
              placeholder="Paste the full job description here or select a template above..."
              className="min-h-[300px] resize-none text-sm"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (errors.jd) setErrors((p) => ({ ...p, jd: undefined }));
              }}
            />
            {errors.jd && <p className="text-destructive text-sm mt-2">{errors.jd}</p>}
          </Card>

          {/* Resume(s) */}
          <Card className="p-6 shadow-card" data-tour="resume-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-secondary" />
                <h3 className="text-base font-semibold text-foreground">
                  {mode === "single" ? "Candidate Resume" : "Candidate Resumes"}
                </h3>
              </div>
              {mode === "single" && (
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      inputMode === "text"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setInputMode("text")}
                  >
                    Paste Text
                  </button>
                  <button
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      inputMode === "file"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setInputMode("file")}
                  >
                    Upload PDF
                  </button>
                </div>
              )}
            </div>

            {mode === "single" ? (
              // Single mode
              inputMode === "text" ? (
                <Textarea
                  placeholder="Paste the candidate's resume here..."
                  className="min-h-[300px] resize-none text-sm"
                  value={resume}
                  onChange={(e) => {
                    setResume(e.target.value);
                    if (errors.resume) setErrors((p) => ({ ...p, resume: undefined }));
                  }}
                />
              ) : (
                <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg hover:border-primary/40 transition-colors">
                  {isParsing ? (
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
                      <p className="text-sm font-medium text-foreground">Extracting text from PDF...</p>
                    </div>
                  ) : fileName ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-10 w-10 text-[hsl(152,68%,46%)] mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground">{fileName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resume ? `${resume.length.toLocaleString()} characters extracted` : "Processing..."}
                      </p>
                      <button
                        onClick={clearSingleFile}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center p-8 w-full h-full flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground">Click to upload PDF</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF files only, max 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleSingleFile}
                      />
                    </label>
                  )}
                </div>
              )
            ) : (
              // Batch mode
              <div className="min-h-[300px] flex flex-col">
                {/* File list */}
                {batchResumes.length > 0 && (
                  <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-1">
                    {batchResumes.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-[hsl(152,68%,46%)] shrink-0" />
                          <span className="text-sm text-foreground truncate">{r.fileName}</span>
                        </div>
                        <button
                          onClick={() => removeBatchResume(r.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg hover:border-primary/40 transition-colors min-h-[120px]">
                  {batchParsing ? (
                    <div className="text-center py-4">
                      <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                      <p className="text-sm font-medium text-foreground">Parsing PDFs...</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center p-6 w-full h-full flex flex-col items-center justify-center">
                      <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        {batchResumes.length > 0 ? "Add more resumes" : "Upload PDF resumes"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select multiple PDFs (max 5MB each)
                      </p>
                      <input
                        ref={batchFileRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple
                        className="hidden"
                        onChange={handleBatchFiles}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
            {errors.resume && <p className="text-destructive text-sm mt-2">{errors.resume}</p>}
          </Card>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground px-10 py-6 text-base font-semibold shadow-glow hover:opacity-90 transition-opacity"
            onClick={handleSubmit}
            disabled={isLoading || isParsing || batchParsing}
            data-tour="analyze-btn"
            aria-label="Analyze candidate"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {mode === "single" ? "Analyzing Candidate..." : "Analyzing Batch..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {mode === "single"
                  ? "Analyze Candidate"
                  : `Analyze ${batchResumes.length} Candidate${batchResumes.length !== 1 ? "s" : ""}`}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <Keyboard className="h-3 w-3" />
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd>
            <span>to analyze</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScreeningForm;
