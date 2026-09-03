import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line-strong px-6 py-14 text-center", className)}>
      {icon && <div className="text-ink-soft">{icon}</div>}
      <div>
        <p className="font-display text-base font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
