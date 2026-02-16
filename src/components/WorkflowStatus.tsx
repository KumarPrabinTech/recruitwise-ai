import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Mail,
  Calendar,
  Bell,
  Archive,
  FileText,
  Eye,
  Clock,
  Video,
} from "lucide-react";
import { addBusinessDays, format } from "date-fns";

type StepStatus = "pending" | "processing" | "done";

interface TimelineStep {
  label: string;
  delayMs: number;
  interviewOnly?: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { label: "Analysis Complete", delayMs: 0 },
  { label: "Email Sent", delayMs: 2000 },
  { label: "Calendar Updated", delayMs: 4000, interviewOnly: true },
  { label: "Process Complete", delayMs: 6000 },
];

interface WorkflowStatusProps {
  recommendation: "Interview" | "Reject";
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}

const WorkflowStatus = ({
  recommendation,
  candidateName,
  candidateEmail,
  jobTitle,
}: WorkflowStatusProps) => {
  const isInterview = recommendation === "Interview";
  const steps = useMemo(
    () => TIMELINE_STEPS.filter((s) => !s.interviewOnly || isInterview),
    [isInterview]
  );

  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((step, i) => {
      timers.push(setTimeout(() => setCompletedCount(i + 1), step.delayMs));
    });
    return () => timers.forEach(clearTimeout);
  }, [steps]);

  const getStepStatus = (index: number): StepStatus => {
    if (index < completedCount) return "done";
    if (index === completedCount) return "processing";
    return "pending";
  };

  const proposedDate = addBusinessDays(new Date(), 3);

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
      {/* Communication Status Card */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-5">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            📧 Candidate Communication
          </h3>
        </div>

        {completedCount < steps.length ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {isInterview ? (
              <>
                <StatusBadge icon={<CheckCircle2 className="h-3.5 w-3.5" />} text="Interview invitation sent" variant="success" />
                <StatusBadge icon={<Calendar className="h-3.5 w-3.5" />} text="Calendar event created" variant="success" />
                <StatusBadge icon={<Bell className="h-3.5 w-3.5" />} text="Hiring manager notified" variant="success" />
              </>
            ) : (
              <>
                <StatusBadge icon={<Mail className="h-3.5 w-3.5" />} text="Rejection email sent" variant="muted" />
                <StatusBadge icon={<Archive className="h-3.5 w-3.5" />} text="Application archived" variant="muted" />
              </>
            )}
          </div>
        )}
      </Card>

      {/* Visual Timeline */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Workflow Progress</h3>
        </div>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-border" />
          {/* Animated progress line */}
          <div
            className="absolute left-[11px] top-1 w-0.5 bg-[hsl(152,68%,46%)] transition-all duration-700 ease-out rounded-full"
            style={{
              height:
                completedCount === 0
                  ? "0%"
                  : `${((completedCount - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
          <div className="space-y-6">
            {steps.map((step, i) => {
              const status = getStepStatus(i);
              return (
                <div key={step.label} className="relative flex items-center gap-3">
                  <div className="absolute -left-6">
                    {status === "done" ? (
                      <CheckCircle2 className="h-[22px] w-[22px] text-[hsl(152,68%,46%)] bg-background rounded-full animate-scale-in" />
                    ) : status === "processing" ? (
                      <Loader2 className="h-[22px] w-[22px] text-primary animate-spin bg-background rounded-full" />
                    ) : (
                      <Circle className="h-[22px] w-[22px] text-muted-foreground/40 bg-background rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      status === "done"
                        ? "text-foreground"
                        : status === "processing"
                        ? "text-primary"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Interview Details (Interview only) */}
      {isInterview && completedCount === steps.length && (
        <Card className="p-6 shadow-card bg-[hsl(152,68%,46%)]/5 border-[hsl(152,68%,46%)]/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-[hsl(152,68%,46%)]" />
            <h3 className="text-base font-semibold text-foreground">Interview Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <DetailRow label="Scheduled for" value={format(proposedDate, "EEEE, MMMM d, yyyy")} />
            <DetailRow label="Duration" value="60 minutes" />
            <DetailRow label="Type" value="Virtual Meeting" />
            <DetailRow label="Calendar invite sent to" value={candidateEmail || "candidate"} />
          </div>
        </Card>
      )}

      {/* Preview Email Button */}
      {completedCount === steps.length && (
        <div className="flex justify-center animate-fade-in">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1.5" />
                Preview Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {isInterview ? "Interview Invitation" : "Application Update"}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 rounded-lg border border-border bg-muted/30 p-5 text-sm leading-relaxed text-foreground space-y-4">
                {isInterview ? (
                  <>
                    <p><strong>To:</strong> {candidateEmail || "candidate@email.com"}</p>
                    <p><strong>Subject:</strong> Interview Invitation — {jobTitle || "Open Position"}</p>
                    <hr className="border-border" />
                    <p>Dear {candidateName || "Candidate"},</p>
                    <p>
                      Thank you for your application for the <strong>{jobTitle || "open position"}</strong> role.
                      We were impressed with your qualifications and would like to invite you to an interview.
                    </p>
                    <p>
                      <strong>Proposed Date:</strong> {format(proposedDate, "EEEE, MMMM d, yyyy")}<br />
                      <strong>Duration:</strong> 60 minutes<br />
                      <strong>Format:</strong> Virtual Meeting (link will follow)
                    </p>
                    <p>Please confirm your availability at your earliest convenience.</p>
                    <p>Best regards,<br />The Hiring Team</p>
                  </>
                ) : (
                  <>
                    <p><strong>To:</strong> {candidateEmail || "candidate@email.com"}</p>
                    <p><strong>Subject:</strong> Application Update — {jobTitle || "Open Position"}</p>
                    <hr className="border-border" />
                    <p>Dear {candidateName || "Candidate"},</p>
                    <p>
                      Thank you for your interest in the <strong>{jobTitle || "open position"}</strong> role
                      and for taking the time to apply.
                    </p>
                    <p>
                      After careful review, we have decided to move forward with other candidates whose
                      qualifications more closely match our current needs. We encourage you to apply for
                      future openings that align with your experience.
                    </p>
                    <p>We wish you the best in your career endeavors.</p>
                    <p>Best regards,<br />The Hiring Team</p>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default WorkflowStatus;

/* ---- Sub-components ---- */

function StatusBadge({
  icon,
  text,
  variant,
}: {
  icon: React.ReactNode;
  text: string;
  variant: "success" | "muted";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        variant === "success"
          ? "bg-[hsl(152,68%,46%)]/10 text-[hsl(152,68%,36%)]"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {icon}
      {text}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
