import { Link } from "react-router-dom";
import { FileStack } from "lucide-react";

const TABS = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/documents", label: "Documents" },
  { to: "/app/intelligence", label: "Intelligence" },
  { to: "/app/estimator", label: "Estimator" },
  { to: "/app/shared", label: "Shared" },
  { to: "/app/community", label: "Community" },
];

/**
 * Live-surface grammar bans a wordmark-plus-CTA marketing bar; the nav has to
 * be app chrome real enough to be the navigation. So this tab strip is not a
 * decorative preview — every tab is a genuine link into the corresponding
 * page of the real application.
 */
export function AppTabStrip() {
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="sc-wrap flex h-12 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-1.5">
          <FileStack size={15} className="text-accent" strokeWidth={2} />
          <span className="font-mono text-xs font-medium uppercase tracking-wide text-ink">folio</span>
        </Link>
        <nav className="scrollbar-none flex flex-1 items-center gap-0.5 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className="shrink-0 whitespace-nowrap rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft transition-colors hover:bg-paper-raised hover:text-ink"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/admin"
          className="hidden shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-soft transition-colors hover:text-ink sm:block"
        >
          Admin →
        </Link>
      </div>
    </div>
  );
}
