import { useState } from "react";
import { Stat } from "../../components/ui/Stat";
import { Badge } from "../../components/ui/Badge";
import { useAsync } from "../../hooks/useAsync";
import { getCommunityStats } from "../../services/analyticsService";
import { MessagesSquare, Flag } from "lucide-react";

const MOCK_REQUESTS = [
  { id: 1, title: "CS301 Data Structures Notes", author: "alex_m", tags: ["CS", "Notes"], status: "open", offers: 2 },
  { id: 2, title: "Organic Chemistry Lab Manual", author: "sarah_k", tags: ["Chem", "Lab"], status: "fulfilled", offers: 1 },
  { id: 3, title: "Calculus GATE Previous Papers", author: "rahul_v", tags: ["Maths", "GATE"], status: "open", offers: 0 },
];

const MOCK_REPORTED = [
  { id: 1, type: "Request", content: "Share exam answers BCA sem 3", reporter: "user_42", reason: "Academic dishonesty", moderated: false },
  { id: 2, type: "File", content: "leaked_exam_paper.pdf", reporter: "admin_system", reason: "Copyright violation", moderated: false },
];

export function AdminCommunity() {
  const { data: stats } = useAsync(getCommunityStats, []);
  const [moderated, setModerated] = useState<number[]>([]);

  const pending = MOCK_REPORTED.filter((r) => !moderated.includes(r.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Community</h1>
        <p className="mt-1 text-sm text-ink-soft">Monitor document requests, offers, and moderate reported content.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Total Requests" value={stats?.requests.toLocaleString("en-IN") ?? "—"} icon={<MessagesSquare size={15} />} />
        <Stat label="Open" value={stats?.open.toLocaleString("en-IN") ?? "—"} deltaTone="warning" />
        <Stat label="Fulfilled" value={stats?.fulfilled.toLocaleString("en-IN") ?? "—"} deltaTone="positive" />
      </div>

      {/* Recent Requests */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Recent Requests</h2>
        <div className="divide-y divide-line rounded-md border border-line">
          {MOCK_REQUESTS.map((req) => (
            <div key={req.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{req.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  @{req.author} · {req.offers} offer{req.offers === 1 ? "" : "s"} ·{" "}
                  {req.tags.map((t) => (
                    <span key={t} className="font-mono text-[10px] text-ink-soft mr-1">#{t}</span>
                  ))}
                </p>
              </div>
              <Badge tone={req.status === "fulfilled" ? "positive" : "accent"}>
                {req.status === "fulfilled" ? "Fulfilled" : "Open"}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Moderate Reported Content */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Flag size={14} className="text-warning" />
          <h2 className="font-display text-sm font-semibold text-ink">Reported Content</h2>
          {pending.length > 0 && (
            <span className="rounded-full bg-warning/15 px-2 py-0.5 font-mono text-[10px] text-warning">
              {pending.length} pending
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="rounded-md border border-line px-4 py-8 text-center text-sm text-ink-soft">
            No pending reports. All clear. ✓
          </div>
        ) : (
          <div className="divide-y divide-line rounded-md border border-line">
            {pending.map((report) => (
              <div key={report.id} className="flex items-start gap-4 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge tone="warning">{report.type}</Badge>
                    <p className="text-sm font-medium text-ink truncate">{report.content}</p>
                  </div>
                  <p className="text-xs text-ink-soft">
                    Reason: <span className="font-medium text-ink">{report.reason}</span> · by @{report.reporter}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setModerated((prev) => [...prev, report.id])}
                    className="rounded-sm border border-positive/40 px-2.5 py-1 font-mono text-[11px] text-positive hover:bg-positive/10 transition"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => setModerated((prev) => [...prev, report.id])}
                    className="rounded-sm border border-accent/40 px-2.5 py-1 font-mono text-[11px] text-accent hover:bg-accent/10 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminCommunity;
