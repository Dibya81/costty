import { useState } from "react";
import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAsync } from "../../hooks/useAsync";
import { listEstimates, type EstimateResponse } from "../../services/printService";
import { formatPaise, rupeesToPaise } from "../../utils/currency";
import { formatDate, relativeTime } from "../../utils/date";

function ConfigChip({ children, color = "ink" }: { children: React.ReactNode; color?: "ink" | "accent" | "muted" }) {
  const colorClass = color === "accent" ? "border-accent text-accent" : color === "muted" ? "border-line text-ink-soft" : "border-line-strong text-ink";
  return (
    <span className={`rounded-sm border ${colorClass} px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide`}>
      {children}
    </span>
  );
}

function EstimateRow({ est }: { est: EstimateResponse }) {
  const totalPaise = rupeesToPaise(Number(est.total_cost));
  return (
    <div className="grid grid-cols-12 items-center gap-3 px-4 py-3">
      <div className="col-span-12 sm:col-span-5">
        <p className="font-mono text-sm font-semibold text-ink">
          {est.page_count} {est.page_count === 1 ? "page" : "pages"} · {est.copies} {est.copies === 1 ? "copy" : "copies"}
        </p>
        <p className="text-xs text-ink-soft">
          {formatDate(est.created_at)} · {relativeTime(est.created_at)}
        </p>
      </div>
      <div className="col-span-7 flex flex-wrap items-center gap-1.5 sm:col-span-4">
        <ConfigChip color={est.color_mode === "color" ? "accent" : "ink"}>
          {est.color_mode === "color" ? "Color" : "B&W"}
        </ConfigChip>
        <ConfigChip color="muted">{est.print_type === "duplex" ? "Duplex" : "Simplex"}</ConfigChip>
      </div>
      <div className="col-span-5 text-right sm:col-span-3">
        <p className="font-mono text-base font-bold text-accent">{formatPaise(totalPaise)}</p>
        <p className="font-mono text-[10px] text-ink-soft">
          {est.printed_sides_per_copy} sides · {est.physical_sheets_per_copy} sheets/copy
        </p>
      </div>
    </div>
  );
}

export function Prices() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, loading } = useAsync(() => listEstimates(page, pageSize), [page]);

  const estimates = data?.items ?? [];
  const totalItems = data?.total_items ?? 0;
  const totalPages = data?.total_pages ?? 0;

  return (
    <div>
      <PageHeader
        title="Prices"
        description="Every print estimate you have created, newest first."
      />

      <div className="mt-6 rounded-md border border-line">
        <div className="flex items-center justify-between border-b border-line bg-paper-raised/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-ink-soft" />
            <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              {totalItems} {totalItems === 1 ? "estimate" : "estimates"}
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-sm p-1 text-ink-soft hover:bg-paper-raised hover:text-ink disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="font-mono text-xs text-ink-soft">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-sm p-1 text-ink-soft hover:bg-paper-raised hover:text-ink disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-soft">Loading estimates…</p>
        ) : estimates.length === 0 ? (
          <EmptyState
            title="No estimates yet"
            description="Upload a document and the price will appear here automatically, or use the Print Estimator to calculate one."
          />
        ) : (
          <div className="divide-y divide-line">
            {estimates.map((est) => (
              <EstimateRow key={est.estimate_id} est={est} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Prices;
