import { Stat } from "../../components/ui/Stat";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAsync } from "../../hooks/useAsync";
import { getCommunityStats } from "../../services/analyticsService";
import { MessagesSquare, Flag } from "lucide-react";

export function AdminCommunity() {
  const { data: stats } = useAsync(getCommunityStats, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Community</h1>
        <p className="mt-1 text-sm text-ink-soft">Monitor document requests, offers, and moderate reported content.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Total Requests" value={stats?.requests.toLocaleString("en-IN") ?? "—"} icon={<MessagesSquare size={15} />} />
        <Stat label="Open" value={stats?.open.toLocaleString("en-IN") ?? "—"} deltaTone="warning" />
        <Stat label="Fulfilled" value={stats?.fulfilled.toLocaleString("en-IN") ?? "—"} deltaTone="positive" />
      </div>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Recent Requests</h2>
        <div className="rounded-md border border-line">
          <EmptyState
            title="No community requests yet"
            description="Requests posted through the community page will appear here."
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Flag size={14} className="text-warning" />
          <h2 className="font-display text-sm font-semibold text-ink">Reported Content</h2>
        </div>
        <div className="rounded-md border border-line">
          <EmptyState
            title="No reports to review"
            description="Content flagged by the community or system will appear here for moderation."
          />
        </div>
      </section>
    </div>
  );
}

export default AdminCommunity;