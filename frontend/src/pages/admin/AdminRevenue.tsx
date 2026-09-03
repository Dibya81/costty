import { Stat } from "../../components/ui/Stat";
import { RevenueChart } from "../../components/admin/RevenueChart";
import { useAsync } from "../../hooks/useAsync";
import { getOverview, getRevenueSeries } from "../../services/analyticsService";
import { formatPaise } from "../../utils/currency";
import { DollarSign } from "lucide-react";

export function AdminRevenue() {
  const { data: overview } = useAsync(getOverview, []);
  const { data: revenue } = useAsync(getRevenueSeries, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Revenue</h1>
        <p className="mt-1 text-sm text-ink-soft">Total, daily, and monthly revenue from print estimates.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Total Revenue"
          value={overview ? formatPaise(overview.revenuePaise) : "—"}
          delta={overview ? `+${overview.revenueDeltaPct}% vs last period` : undefined}
          icon={<DollarSign size={15} />}
        />
        <Stat label="Daily Revenue" value="—" icon={<DollarSign size={15} />} />
        <Stat label="Monthly Revenue" value="—" icon={<DollarSign size={15} />} />
      </div>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Revenue Trend</h2>
        <div className="rounded-md border border-line bg-paper-raised/40 p-5">
          {revenue ? (
            <RevenueChart data={revenue} />
          ) : (
            <p className="py-8 text-center text-sm text-ink-soft">Loading chart…</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminRevenue;
