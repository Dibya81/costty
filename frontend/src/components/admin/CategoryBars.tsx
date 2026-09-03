import type { DocumentBreakdown } from "../../types/analytics";
import { FileIcon } from "../ui/FileIcon";

export function CategoryBars({ data }: { data: DocumentBreakdown[] }) {
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.category} className="flex items-center gap-3">
          <div className="flex w-28 shrink-0 items-center gap-1.5 text-xs font-medium text-ink-soft">
            <FileIcon category={item.category} size={13} />
            {item.category}
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
          </div>
          <span className="tabular w-14 shrink-0 text-right font-mono text-xs text-ink-soft">
            {item.count.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}
