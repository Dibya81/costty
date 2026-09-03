import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { calculateEstimate } from "../../services/printService";
import { formatPaise } from "../../utils/currency";

export function CloseEstimator() {
  const [pageCount, setPageCount] = useState(48);
  const [copies, setCopies] = useState(1);

  const result = useMemo(
    () => calculateEstimate({ pageCount: pageCount || 1, copies: copies || 1, colorMode: "bw", sidedness: "duplex" }),
    [pageCount, copies]
  );

  return (
    <section className="sc-wrap sc-section border-t border-line">
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-soft">try_it — no upload needed</p>
        <p className="mb-8 text-sm text-ink-soft">
          Type a page count and a copy count. This is the same math the app runs — B&W, duplex, defaults you can
          change once you're inside.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <label className="flex items-center gap-2 rounded-sm border border-line-strong bg-paper px-3 py-2">
            <span className="font-mono text-xs text-ink-soft">Pages</span>
            <input
              type="number"
              min={1}
              max={5000}
              value={pageCount}
              onChange={(e) => setPageCount(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 bg-transparent text-right text-sm font-medium text-ink outline-none"
              aria-label="Page count"
            />
          </label>
          <span className="text-ink-soft">×</span>
          <label className="flex items-center gap-2 rounded-sm border border-line-strong bg-paper px-3 py-2">
            <span className="font-mono text-xs text-ink-soft">Copies</span>
            <input
              type="number"
              min={1}
              max={500}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 bg-transparent text-right text-sm font-medium text-ink outline-none"
              aria-label="Copy count"
            />
          </label>
          <span className="text-ink-soft">=</span>
          <span className="tabular font-display text-3xl font-bold text-accent">{formatPaise(result.totalPaise)}</span>
        </div>

        <Link
          to="/app/estimator"
          className="mt-10 inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Continue in the full estimator
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
