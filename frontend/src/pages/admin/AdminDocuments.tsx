import { HardDrive } from "lucide-react";
import { Stat } from "../../components/ui/Stat";
import { CategoryBars } from "../../components/admin/CategoryBars";
import { useAsync } from "../../hooks/useAsync";
import { getDocumentBreakdown, getOverview } from "../../services/analyticsService";

const CATEGORY_LABELS: Record<string, string> = {
  PDF: "PDF",
  Word: "Word",
  Excel: "Excel",
  PowerPoint: "PowerPoint",
  Text: "Text",
  Image: "Image",
  Other: "Other",
};

export function AdminDocuments() {
  const { data: overview } = useAsync(getOverview, []);
  const { data: docBreakdown } = useAsync(getDocumentBreakdown, []);

  // Per-category counts from the real backend breakdown
  const counts: Record<string, number> = {};
  if (docBreakdown) {
    for (const d of docBreakdown) counts[d.category] = d.count;
  }
  const pdfCount = counts.PDF ?? 0;
  const officeCount = (counts.Word ?? 0) + (counts.Excel ?? 0) + (counts.PowerPoint ?? 0);
  const imageCount = counts.Image ?? 0;
  const otherCount = (counts.Text ?? 0) + (counts.Other ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Documents</h1>
        <p className="mt-1 text-sm text-ink-soft">Storage usage, category breakdown, and upload management.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Documents" value={overview?.totalDocuments.toLocaleString("en-IN") ?? "—"} />
        <Stat label="PDF" value={pdfCount.toLocaleString("en-IN")} />
        <Stat label="Word / Excel / PPTX" value={officeCount.toLocaleString("en-IN")} />
        <Stat label="Image / Other" value={(imageCount + otherCount).toLocaleString("en-IN")} />
      </div>

      {/* Format breakdown */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Format Breakdown</h2>
        <div className="rounded-md border border-line bg-paper-raised/40 p-5">
          {docBreakdown && docBreakdown.length > 0 ? (
            <CategoryBars data={docBreakdown} />
          ) : (
            <p className="py-8 text-center text-sm text-ink-soft">
              {docBreakdown ? "No documents uploaded yet." : "Loading breakdown…"}
            </p>
          )}
        </div>
      </section>

      {/* Live list of categories from the backend (no mock data) */}
      {docBreakdown && docBreakdown.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-sm font-semibold text-ink">Category Counts</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {docBreakdown.map((d) => (
              <div
                key={d.category}
                className="flex items-center justify-between rounded-md border border-line bg-paper-raised/40 px-3 py-2"
              >
                <span className="text-xs text-ink-soft">{CATEGORY_LABELS[d.category] ?? d.category}</span>
                <span className="font-mono text-sm font-medium text-ink">{d.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminDocuments;
