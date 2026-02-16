import { Sparkles } from "lucide-react";

const APP_VERSION = "1.0.0";

const AppFooter = () => (
  <footer className="border-t border-border bg-card py-6 mt-auto">
    <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Powered by <span className="font-semibold text-foreground">Recruit-AI</span></span>
        <span className="text-muted-foreground/50">v{APP_VERSION}</span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="mailto:feedback@recruit-ai.com?subject=Recruit-AI Feedback"
          className="hover:text-foreground transition-colors"
        >
          Feedback
        </a>
        <span className="text-muted-foreground/30">•</span>
        <span>© {new Date().getFullYear()} Recruit-AI</span>
      </div>
    </div>
  </footer>
);

export default AppFooter;
