import { useMemo, useState } from "react";
import { Search, Save, Printer, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { Input, Label } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAsync } from "../../hooks/useAsync";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToast } from "../../components/ui/Toast";
import { createEstimate, listEstimates } from "../../services/printService";
import type { ColorMode, PrintType, EstimateResponse } from "../../services/printService";
import { formatDate } from "../../utils/date";
import { cn } from "../../utils/cn";

export function Estimator() {
  const [tab, setTab] = useState<"estimate" | "history">("estimate");

  return (
    <div>
      <PageHeader
        title="Print Estimator"
        description="Price a print job in real time, then save it to your history."
        action={
          <SegmentedControl
            options={[
              { value: "estimate", label: "Estimate" },
              { value: "history", label: "History" },
            ]}
            value={tab}
            onChange={setTab}
          />
        }
      />
      {tab === "estimate" ? <EstimateForm /> : <HistoryList />}
    </div>
  );
}

function EstimateForm() {
  const { push } = useToast();
  const [pageCount, setPageCount] = useState(100);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<ColorMode>("bw");
  const [printType, setPrintType] = useState<PrintType>("duplex");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EstimateResponse | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const estimate = await createEstimate({ page_count: pageCount, copies, color_mode: colorMode, print_type: printType });
      setResult(estimate);
      push("Estimate saved to history");
    } catch {
      push("Failed to create estimate", "warning");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Inputs */}
      <div className="space-y-5 lg:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="page-count">Page count</Label>
            <Input
              id="page-count"
              type="number"
              min={1}
              max={5000}
              value={pageCount}
              onChange={(e) => setPageCount(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div>
            <Label htmlFor="copies">Copies</Label>
            <Input
              id="copies"
              type="number"
              min={1}
              max={500}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>
        <div>
          <Label>Color</Label>
          <SegmentedControl
            className="w-full"
            options={[
              { value: "bw", label: "B&W" },
              { value: "color", label: "Color" },
            ]}
            value={colorMode}
            onChange={setColorMode}
          />
        </div>
        <div>
          <Label>Sides</Label>
          <SegmentedControl
            className="w-full"
            options={[
              { value: "simplex", label: "Simplex" },
              { value: "duplex", label: "Duplex" },
            ]}
            value={printType}
            onChange={setPrintType}
          />
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <><Loader2 size={15} className="mr-1.5 animate-spin" />Saving…</> : <><Save size={15} className="mr-1.5" />Save to history</>}
        </Button>
      </div>

      {/* Result */}
      <div className="lg:col-span-3">
        <div className="rounded-md border border-line bg-paper-raised/40 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-ink-soft">
            <Printer size={16} />
            <span className="font-mono text-xs uppercase tracking-wide">Estimate</span>
          </div>

          {result ? (
            <>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  ["Pages", result.page_count],
                  ["Copies", result.copies],
                  ["Printed sides", result.total_printed_sides],
                  ["Physical sheets", result.total_physical_sheets],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</p>
                    <p className="tabular mt-1 font-display text-xl font-bold text-ink">{value}</p>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-line" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Cost per copy</p>
                  <p className="tabular mt-1 font-mono text-lg text-ink-soft">{"₹"}{result.cost_per_copy}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Total estimated cost</p>
                  <p className="tabular mt-1 font-display text-4xl font-bold text-accent">{"₹"}{result.total_cost}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-ink-soft">Fill in the form and save to see your estimate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryList() {
  const { data, loading } = useAsync(listEstimates, []);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const [colorFilter, setColorFilter] = useState<"all" | ColorMode>("all");

  const filtered = useMemo(() => {
    let list = data?.items ?? [];
    if (debounced.trim()) {
      const q = debounced.toLowerCase();
      list = list.filter((e) => String(e.estimate_id).includes(q));
    }
    if (colorFilter !== "all") list = list.filter((e) => e.color_mode === colorFilter);
    return list;
  }, [data, debounced, colorFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search estimates…"
            className="w-full rounded-sm border border-line-strong bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <SegmentedControl
          options={[
            { value: "all", label: "All" },
            { value: "bw", label: "B&W" },
            { value: "color", label: "Color" },
          ]}
          value={colorFilter}
          onChange={setColorFilter}
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-soft">Loading history…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No estimates found" description="Run an estimate and save it to see it here." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-raised/50 text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-2.5 font-medium">#</th>
                <th className="px-4 py-2.5 font-medium">Pages</th>
                <th className="px-4 py-2.5 font-medium">Color</th>
                <th className="px-4 py-2.5 font-medium">Sides</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((entry) => (
                <tr key={entry.estimate_id}>
                  <td className="px-4 py-3 font-medium text-ink">{entry.estimate_id}</td>
                  <td className="tabular px-4 py-3 text-ink-soft">
                    {entry.page_count} × {entry.copies}
                  </td>
                  <td className={cn("px-4 py-3", entry.color_mode === "color" ? "text-accent" : "text-ink-soft")}>
                    {entry.color_mode === "bw" ? "B&W" : "Color"}
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{entry.print_type}</td>
                  <td className="tabular px-4 py-3 font-mono font-medium text-ink">{"₹"}{entry.total_cost}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
