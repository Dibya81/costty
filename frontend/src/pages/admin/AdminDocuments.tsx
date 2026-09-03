import { useState } from "react";
import { Trash2, HardDrive } from "lucide-react";
import { Stat } from "../../components/ui/Stat";
import { CategoryBars } from "../../components/admin/CategoryBars";
import { Badge } from "../../components/ui/Badge";
import { useAsync } from "../../hooks/useAsync";
import { getDocumentBreakdown, getOverview } from "../../services/analyticsService";

// Mock recent uploads for display
const MOCK_UPLOADS = [
  { id: 1, name: "Q3_Financial_Report.pdf", user: "alex_m", size: "4.8 MB", category: "PDF", uploaded: "2 min ago" },
  { id: 2, name: "Product_Specs_v2.docx", user: "sarah_k", size: "2.1 MB", category: "Word", uploaded: "14 min ago" },
  { id: 3, name: "Budget_2026.xlsx", user: "rahul_v", size: "6.4 MB", category: "Excel", uploaded: "1 hr ago" },
  { id: 4, name: "Investor_Deck.pptx", user: "priya_s", size: "12.3 MB", category: "PowerPoint", uploaded: "3 hr ago" },
];

const CATEGORY_BADGE: Record<string, "accent" | "positive" | "warning" | "neutral"> = {
  PDF: "accent",
  Word: "neutral",
  Excel: "positive",
  PowerPoint: "warning",
};

export function AdminDocuments() {
  const { data: overview } = useAsync(getOverview, []);
  const { data: docBreakdown } = useAsync(getDocumentBreakdown, []);
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const uploads = MOCK_UPLOADS.filter((u) => !removedIds.includes(u.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Documents</h1>
        <p className="mt-1 text-sm text-ink-soft">Storage usage, category breakdown, and upload management.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Documents" value={overview?.totalDocuments.toLocaleString("en-IN") ?? "—"} />
        <Stat label="PDF" value="—" />
        <Stat label="Word / Excel / PPTX" value="—" />
        <div className="rounded-md border border-line bg-paper-raised/40 p-4 flex items-center gap-3">
          <HardDrive size={16} className="text-ink-soft shrink-0" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Storage</p>
            <p className="font-display text-lg font-bold text-ink mt-0.5">—</p>
          </div>
        </div>
      </div>

      {/* Format breakdown */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Format Breakdown</h2>
        <div className="rounded-md border border-line bg-paper-raised/40 p-5">
          {docBreakdown ? (
            <CategoryBars data={docBreakdown} />
          ) : (
            <p className="py-8 text-center text-sm text-ink-soft">Loading breakdown…</p>
          )}
        </div>
      </section>

      {/* Recent uploads */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Recent Uploads</h2>
        <div className="divide-y divide-line rounded-md border border-line">
          {uploads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-soft">No recent uploads.</p>
          ) : (
            uploads.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    @{doc.user} · {doc.size} · {doc.uploaded}
                  </p>
                </div>
                <Badge tone={CATEGORY_BADGE[doc.category] ?? "neutral"}>{doc.category}</Badge>
                <button
                  onClick={() => setRemovedIds((prev) => [...prev, doc.id])}
                  className="shrink-0 rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-accent/10 hover:text-accent"
                  title="Remove file"
                  aria-label="Remove file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDocuments;
