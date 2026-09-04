import { Users, FileText, Calculator, MessagesSquare, DollarSign } from "lucide-react";
import { Stat } from "../../components/ui/Stat";
import { Badge } from "../../components/ui/Badge";
import { RevenueChart } from "../../components/admin/RevenueChart";
import { useAsync } from "../../hooks/useAsync";
import {
  getOverview,
  getRecentUsers,
  getRevenueSeries,
} from "../../services/analyticsService";
import { formatPaise } from "../../utils/currency";
import { formatDate, relativeTime } from "../../utils/date";

export function AdminDashboard() {
  const { data: overview } = useAsync(getOverview, []);
  const { data: revenue } = useAsync(getRevenueSeries, []);
  const { data: recentUsers } = useAsync(getRecentUsers, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Platform Overview</h1>
        <p className="mt-1 text-sm text-ink-soft">Live snapshot of COSTTY's activity and revenue.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat
          label="Total Revenue"
          value={overview ? formatPaise(overview.revenuePaise) : "—"}
          delta={overview ? `+${overview.revenueDeltaPct}% vs last period` : undefined}
          icon={<DollarSign size={15} />}
        />
        <Stat
          label="Total Users"
          value={overview?.totalUsers.toLocaleString("en-IN") ?? "—"}
          icon={<Users size={15} />}
        />
        <Stat
          label="Active Users"
          value={overview?.activeUsers.toLocaleString("en-IN") ?? "—"}
          deltaTone="positive"
          icon={<Users size={15} />}
        />
        <Stat
          label="Documents"
          value={overview?.totalDocuments.toLocaleString("en-IN") ?? "—"}
          icon={<FileText size={15} />}
        />
        <Stat
          label="Print Estimates"
          value={overview?.totalEstimates.toLocaleString("en-IN") ?? "—"}
          icon={<Calculator size={15} />}
        />
      </div>

      {/* Revenue chart */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Revenue Trend</h2>
        <div className="rounded-md border border-line bg-paper-raised/40 p-5">
          {revenue && <RevenueChart data={revenue} />}
        </div>
      </section>

      {/* Recent users */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">Recent Users</h2>
          <a href="/admin/users" className="text-xs font-medium text-ink-soft hover:text-ink">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-raised/50 text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Joined</th>
                <th className="px-4 py-2.5 font-medium">Last active</th>
                <th className="px-4 py-2.5 font-medium">Docs</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(recentUsers ?? []).map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2.5 font-medium text-ink">{user.name}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{formatDate(user.joinedAt)}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{relativeTime(user.lastActiveAt)}</td>
                  <td className="tabular px-4 py-2.5 text-ink-soft">{user.documents}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={user.status === "active" ? "positive" : "neutral"}>{user.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Community quick stats */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Community</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Total Requests" value="—" icon={<MessagesSquare size={15} />} />
          <Stat label="Open" value="—" deltaTone="warning" />
          <Stat label="Fulfilled" value="—" deltaTone="positive" />
        </div>
      </section>
    </div>
  );
}
