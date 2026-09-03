import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Stat({
  label,
  value,
  delta,
  deltaTone = "positive",
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "positive" | "warning" | "neutral";
  icon?: ReactNode;
  className?: string;
}) {
  const deltaColor =
    deltaTone === "positive" ? "text-positive" : deltaTone === "warning" ? "text-warning" : "text-ink-soft";

  return (
    <div className={cn("rounded-md border border-line bg-paper-raised/60 p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">{label}</p>
        {icon && <span className="text-ink-soft">{icon}</span>}
      </div>
      <p className="tabular mt-2 font-display text-2xl font-bold text-ink">{value}</p>
      {delta && <p className={cn("mt-1 text-xs font-medium", deltaColor)}>{delta}</p>}
    </div>
  );
}
