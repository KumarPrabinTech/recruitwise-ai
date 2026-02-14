import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Send, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FeedbackForm = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);

    // Simulate submission
    await new Promise((r) => setTimeout(r, 800));

    toast({
      title: "Thank you for your feedback!",
      description: "We appreciate you taking the time to share your thoughts.",
    });

    setName("");
    setEmail("");
    setRating(0);
    setMessage("");
    setSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 shadow-elevated z-40 gap-1.5"
          aria-label="Send feedback"
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="feedback-desc">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        <p id="feedback-desc" className="text-sm text-muted-foreground mb-4">
          Help us improve Recruit-AI. Your feedback matters!
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="feedback-name" className="text-xs">Name (optional)</Label>
              <Input
                id="feedback-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="feedback-email" className="text-xs">Email (optional)</Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          {/* Star rating */}
          <div>
            <Label className="text-xs">Rating</Label>
            <div className="flex gap-1 mt-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                  role="radio"
                  aria-checked={rating === star}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-[hsl(38,92%,50%)] text-[hsl(38,92%,50%)]"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="feedback-message" className="text-xs">Message *</Label>
            <Textarea
              id="feedback-message"
              placeholder="Tell us what you think, report a bug, or suggest a feature..."
              className="mt-1 min-h-[100px] text-sm resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button
            className="w-full gradient-primary text-primary-foreground"
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
