import { useState, useEffect, useRef } from "react";

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge = ({ score }: ScoreGaugeProps) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const [animatedScore, setAnimatedScore] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  const getColor = () => {
    if (score >= 80) return { stroke: "url(#greenGrad)", label: "Excellent Match", glow: "hsl(152, 68%, 46%)" };
    if (score >= 60) return { stroke: "url(#yellowGrad)", label: "Moderate Match", glow: "hsl(38, 92%, 50%)" };
    return { stroke: "url(#redGrad)", label: "Low Match", glow: "hsl(0, 72%, 51%)" };
  };

  const { stroke, label, glow } = getColor();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(152, 68%, 46%)" />
              <stop offset="100%" stopColor="hsl(165, 60%, 42%)" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(38, 92%, 50%)" />
              <stop offset="100%" stopColor="hsl(45, 90%, 55%)" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
              <stop offset="100%" stopColor="hsl(15, 70%, 50%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="7"
          />
          {/* Score arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#glow)"
            style={{
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-extrabold text-foreground tabular-nums"
            style={{ textShadow: `0 0 20px ${glow}33` }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-muted-foreground font-medium mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
    </div>
  );
};

export default ScoreGauge;
