import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "../../lib/ThemeContext";
import { cn } from "../../utils/cn";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];

  if (compact) {
    return (
      <button
        onClick={() => {
          const idx = OPTIONS.findIndex((o) => o.value === theme);
          const next = OPTIONS[(idx + 1) % OPTIONS.length].value;
          setTheme(next);
        }}
        className="rounded-sm p-1.5 text-ink-soft hover:bg-paper-raised hover:text-ink"
        title={`Theme: ${current.label} (click to change)`}
        aria-label={`Theme: ${current.label}`}
      >
        <current.icon size={15} />
      </button>
    );
  }

  return (
    <div className="inline-flex rounded-sm border border-line-strong bg-paper-raised/40 p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors",
            theme === opt.value
              ? "bg-ink text-paper"
              : "text-ink-soft hover:text-ink"
          )}
          title={`Use ${opt.label.toLowerCase()} theme`}
        >
          <opt.icon size={11} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
