import { Check, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function StageProgress({
  stages,
  labels,
  current,
}: {
  stages: string[];
  labels: Record<string, string>;
  current: string;
}) {
  const currentIndex = stages.indexOf(current);

  return (
    <div className="space-y-0">
      {stages.map((stage, i) => {
        const done = i < currentIndex || current === "complete";
        const active = i === currentIndex && current !== "complete";
        return (
          <div key={stage} className="flex items-center gap-3 py-2">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                done
                  ? "border-positive bg-positive-soft text-positive"
                  : active
                  ? "border-accent text-accent"
                  : "border-line-strong text-ink-soft/50"
              )}
            >
              {done ? <Check size={13} /> : active ? <Loader2 size={13} className="animate-spin" /> : i + 1}
            </div>
            <span className={cn("text-sm", done ? "text-ink-soft" : active ? "font-medium text-ink" : "text-ink-soft/50")}>
              {labels[stage]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
