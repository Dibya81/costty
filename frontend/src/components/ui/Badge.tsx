import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Tone = "neutral" | "positive" | "warning" | "info" | "accent";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-paper-raised text-ink-soft border-line-strong",
  positive: "bg-positive-soft text-positive border-positive/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  info: "bg-info-soft text-info border-info/25",
  accent: "bg-accent/10 text-accent border-accent/25",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
