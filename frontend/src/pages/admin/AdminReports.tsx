import { Flag, AlertTriangle } from "lucide-react";
import { Badge } from "../../components/ui/Badge";

const MOCK_REPORTS = [
  { id: 1, type: "File", content: "CS301_leaked_paper.pdf", reporter: "admin_system", reason: "Copyright violation", status: "pending" },
  { id: 2, type: "Request", content: "Share exam answers for BCA sem 3", reporter: "user_42", reason: "Academic dishonesty", status: "reviewed" },
];

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
            <p className="font-display text-2xl font-bold text-ink mt-0.5">{MOCK_REPORTS.filter(r => r.status === "pending").length}</p>
          </div>
        </div>
        <div className="rounded-md border border-line bg-paper-raised/40 p-5 flex items-center gap-4">
          <div className="p-2 rounded-sm bg-positive/10 text-positive">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Reviewed</p>
            <p className="font-display text-2xl font-bold text-ink mt-0.5">{MOCK_REPORTS.filter(r => r.status === "reviewed").length}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Flagged Content</h2>
        <div className="divide-y divide-line rounded-md border border-line">
          {MOCK_REPORTS.map((report) => (
            <div key={report.id} className="flex items-start gap-4 px-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge>{report.type}</Badge>
                  <p className="text-sm font-medium text-ink truncate">{report.content}</p>
                </div>
                <p className="text-xs text-ink-soft">
                  Reason: <span className="font-medium text-ink">{report.reason}</span> · Reported by @{report.reporter}
                </p>
              </div>
              <Badge tone={report.status === "pending" ? "warning" : "positive"}>
                {report.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminReports;
