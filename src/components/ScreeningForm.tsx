import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Upload, FileText, Loader2, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: "Interview" | "Reject";
  reasoning: string;
}

interface ScreeningFormProps {
  onAnalyze: (jobDescription: string, resume: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ScreeningForm = ({ onAnalyze, isLoading, onBack }: ScreeningFormProps) => {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [errors, setErrors] = useState<{ jd?: string; resume?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => item.str)
        .join(" ");
      pages.push(text);
    }

    return pages.join("\n\n");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, resume: "Only PDF files are accepted" }));
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, resume: "File must be under 5MB" }));
      return;
    }

    setIsParsing(true);
    setFileName(file.name);
    setErrors((prev) => ({ ...prev, resume: undefined }));

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        setErrors((prev) => ({ ...prev, resume: "Could not extract text from this PDF. It may be image-based." }));
        setFileName("");
        setResume("");
      } else {
        setResume(text);
      }
    } catch {
      setErrors((prev) => ({ ...prev, resume: "Failed to parse the PDF. Please try pasting the text instead." }));
      setFileName("");
      setResume("");
    } finally {
      setIsParsing(false);
    }
  };

  const clearFile = () => {
    setFileName("");
    setResume("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!jobDescription.trim()) newErrors.jd = "Job description is required";
    if (!resume.trim()) newErrors.resume = inputMode === "file" ? "Please upload a resume PDF" : "Resume content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAnalyze(jobDescription, resume);
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
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Candidate Screening</h2>
          <p className="text-muted-foreground">
            Paste the job description and candidate resume to get an AI-powered analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Description */}
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Job Description</h3>
            </div>
            <Textarea
              placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
              className="min-h-[300px] resize-none text-sm"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (errors.jd) setErrors((prev) => ({ ...prev, jd: undefined }));
              }}
            />
            {errors.jd && <p className="text-destructive text-sm mt-2">{errors.jd}</p>}
          </Card>

          {/* Resume */}
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-secondary" />
                <h3 className="text-base font-semibold text-foreground">Candidate Resume</h3>
              </div>
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
            </div>

            {inputMode === "text" ? (
              <Textarea
                placeholder="Paste the candidate's resume here..."
                className="min-h-[300px] resize-none text-sm"
                value={resume}
                onChange={(e) => {
                  setResume(e.target.value);
                  if (errors.resume) setErrors((prev) => ({ ...prev, resume: undefined }));
                }}
              />
            ) : (
              <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg hover:border-primary/40 transition-colors relative">
                {isParsing ? (
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-sm font-medium text-foreground">Extracting text from PDF...</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                  </div>
                ) : fileName ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-10 w-10 text-[hsl(152,68%,46%)] mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">{fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resume ? `${resume.length.toLocaleString()} characters extracted` : "Processing..."}
                    </p>
                    <button
                      onClick={clearFile}
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
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>
            )}
            {errors.resume && <p className="text-destructive text-sm mt-2">{errors.resume}</p>}
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground px-10 py-6 text-base font-semibold shadow-glow hover:opacity-90 transition-opacity"
            onClick={handleSubmit}
            disabled={isLoading || isParsing}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Candidate...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Candidate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningForm;
