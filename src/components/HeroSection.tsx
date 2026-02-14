import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Shield, Zap, Target } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="gradient-hero min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="gradient-primary p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground tracking-tight">
            Recruit-AI
          </span>
        </div>
        <Button
          variant="outline"
          className="border-primary-foreground/20 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10"
          onClick={onGetStarted}
        >
          Get Started
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center max-w-4xl -mt-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/10 mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium text-primary-foreground/80">
            AI-Powered Candidate Screening
          </span>
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          Hire Smarter,{" "}
          <span className="gradient-text">Not Harder</span>
        </h1>

        <p
          className="text-lg sm:text-xl text-primary-foreground/60 max-w-2xl mb-10 leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Instantly analyze resumes against job descriptions using AI. Get match
          scores, key insights, and hiring recommendations in seconds.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground px-8 py-6 text-lg font-semibold shadow-glow hover:opacity-90 transition-opacity"
            onClick={onGetStarted}
          >
            Start Screening
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: Zap, title: "Instant Analysis", desc: "Results in seconds, not hours" },
            { icon: Target, title: "Match Scoring", desc: "0-100 precision scoring" },
            { icon: Shield, title: "Unbiased Screening", desc: "Data-driven decisions" },
          ].map((f, i) => (
            <div
              key={f.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 animate-fade-in"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div className="gradient-primary p-2 rounded-lg shrink-0">
                <f.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">{f.title}</p>
                <p className="text-xs text-primary-foreground/50">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
