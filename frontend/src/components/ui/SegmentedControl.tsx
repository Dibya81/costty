import { cn } from "../../utils/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={cn("inline-flex rounded-sm border border-line-strong bg-paper p-0.5", className)} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[4px] px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
            value === opt.value
              ? "bg-ink text-paper"
              : "text-ink-soft hover:text-ink"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
