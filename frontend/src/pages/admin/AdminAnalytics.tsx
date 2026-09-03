import { Stat } from "../../components/ui/Stat";
import { useAsync } from "../../hooks/useAsync";
import { getEstimateStats } from "../../services/analyticsService";
import { formatPaise } from "../../utils/currency";
import { Calculator } from "lucide-react";

export function AdminAnalytics() {
  const { data: stats } = useAsync(getEstimateStats, []);

  const rows = [
    { label: "Estimates Run", value: stats?.count.toLocaleString("en-IN") ?? "—" },
    { label: "Estimated Revenue", value: stats ? formatPaise(stats.revenuePaise) : "—" },
    { label: "Average Estimate", value: stats ? formatPaise(stats.averagePaise) : "—" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Print Analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">Estimate volume, revenue, and B&amp;W vs Color breakdown.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <Stat key={r.label} label={r.label} value={r.value} icon={<Calculator size={15} />} />
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">B&amp;W vs Color Split</h2>
        <div className="rounded-md border border-line bg-paper-raised/40 p-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">B&amp;W</p>
              <p className="font-display text-2xl font-bold text-ink mt-1">—</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Color</p>
              <p className="font-display text-2xl font-bold text-accent mt-1">—</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Duplex</p>
              <p className="font-display text-2xl font-bold text-ink mt-1">—</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Simplex</p>
              <p className="font-display text-2xl font-bold text-ink mt-1">—</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Daily / Monthly Trends</h2>
        <div className="rounded-md border border-line bg-paper-raised/40 px-4 py-8 text-center text-sm text-ink-soft">
          Trend chart coming soon.
        </div>
      </section>
    </div>
  );
}

export default AdminAnalytics;
