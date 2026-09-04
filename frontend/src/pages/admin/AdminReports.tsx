import { Flag, AlertTriangle } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";

export function AdminReports() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Reports & Moderation</h1>
        <p className="mt-1 text-sm text-ink-soft">Review flagged files and community requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line bg-paper-raised/40 p-5 flex items-center gap-4">
          <div className="p-2 rounded-sm bg-warning/10 text-warning">
            <Flag size={18} />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Pending Reports</p>
            <p className="font-display text-2xl font-bold text-ink mt-0.5">0</p>
          </div>
        </div>
        <div className="rounded-md border border-line bg-paper-raised/40 p-5 flex items-center gap-4">
          <div className="p-2 rounded-sm bg-positive/10 text-positive">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Reviewed</p>
            <p className="font-display text-2xl font-bold text-ink mt-0.5">0</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Flagged Content</h2>
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

export default AdminReports;