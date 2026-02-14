import { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

const CopyButton = ({ text, label, className = "" }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [text, toast]);

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded ${className}`}
      aria-label={label || "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[hsl(152,68%,46%)]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {label && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
};

export default CopyButton;
