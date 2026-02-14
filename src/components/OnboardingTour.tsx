import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

const TOUR_KEY = "recruit-ai-tour-completed";

const steps: Step[] = [
  {
    target: "[data-tour='jd-card']",
    content: "Start by pasting a job description or selecting one of our pre-built templates.",
    title: "📋 Job Description",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='resume-card']",
    content: "Paste the candidate's resume text or upload a PDF file. In batch mode, you can upload multiple resumes at once.",
    title: "📄 Resume Input",
    placement: "left",
  },
  {
    target: "[data-tour='analyze-btn']",
    content: "Click here or press Ctrl+Enter to analyze the candidate. You'll get a match score, strengths, concerns, and a recommendation.",
    title: "🚀 Analyze",
    placement: "top",
  },
  {
    target: "[data-tour='mode-toggle']",
    content: "Switch between single candidate analysis and batch mode to screen multiple candidates at once.",
    title: "🔄 Single & Batch Mode",
    placement: "bottom",
  },
  {
    target: "[data-tour='history-btn']",
    content: "Access your analysis history here. Results are saved locally and you can export them as CSV.",
    title: "📊 History",
    placement: "bottom",
  },
];

interface OnboardingTourProps {
  run: boolean;
}

const OnboardingTour = ({ run }: OnboardingTourProps) => {
  const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    if (!run) return;
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      // Small delay so DOM targets are ready
      const t = setTimeout(() => setShouldRun(true), 800);
      return () => clearTimeout(t);
    }
  }, [run]);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(TOUR_KEY, "true");
      setShouldRun(false);
    }
  };

  if (!shouldRun) return null;

  return (
    <Joyride
      steps={steps}
      run={shouldRun}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: "hsl(230, 80%, 56%)",
          zIndex: 10000,
          arrowColor: "hsl(var(--card))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--foreground))",
        },
        tooltip: {
          borderRadius: "12px",
          padding: "20px",
          fontSize: "14px",
        },
        tooltipTitle: {
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "8px",
        },
        buttonNext: {
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 600,
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "13px",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "13px",
        },
        spotlight: {
          borderRadius: "12px",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Done",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
};

export default OnboardingTour;
