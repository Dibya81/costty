import { Link } from "react-router-dom";
import { Upload, ScanSearch, Calculator, Users2, ArrowRight, Share2 } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { FileIcon } from "../../components/ui/FileIcon";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAsync } from "../../hooks/useAsync";
import { listDocuments } from "../../services/documentService";
import { listEstimates } from "../../services/printService";
import { listShareLinks } from "../../services/shareService";
import { inferTypeInfo } from "../../utils/fileType";
import { relativeTime } from "../../utils/date";

const QUICK_ACTIONS = [
  { to: "/app/documents", label: "Upload document", icon: Upload },
  { to: "/app/intelligence", label: "Analyze document", icon: ScanSearch },
  { to: "/app/estimator", label: "Estimate print cost", icon: Calculator },
  { to: "/app/community", label: "Community request", icon: Users2 },
];

export function Dashboard() {
  const { data: docData } = useAsync(listDocuments, []);
  const { data: estData } = useAsync(listEstimates, []);
  const { data: shares } = useAsync(listShareLinks, []);

  const documents = docData?.items ?? [];
  const estimates = estData?.items ?? [];
  const recentDocuments = documents.slice(0, 5);
  const recentEstimates = estimates.slice(0, 4);
  const recentShares = (shares ?? []).filter((s) => !s.revoked).slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Good to see you."
        description="Here's what's happening across your documents, estimates, and shares."
      />

      {/* Quick actions */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group flex flex-col gap-3 rounded-md border border-line bg-paper-raised/40 p-4 transition-colors hover:border-ink hover:bg-paper-raised"
          >
            <action.icon size={18} strokeWidth={1.7} className="text-accent" />
            <span className="text-sm font-medium text-ink">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent documents */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink">Recent documents</h2>
            <Link to="/app/documents" className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-line rounded-md border border-line">
            {recentDocuments.length === 0 ? (
              <EmptyState title="No documents yet" description="Upload your first file to get started." />
            ) : (
              recentDocuments.map((doc) => {
                const info = inferTypeInfo(doc.filename);
                return (
                  <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                    <FileIcon category={info.category} className="text-ink-soft" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{doc.filename}</p>
                      <p className="text-xs text-ink-soft">{relativeTime(doc.updated_at)}</p>
                    </div>
                    <Badge>{info.category}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Recent estimates */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink">Recent estimates</h2>
            <Link to="/app/estimator" className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink">
              New estimate <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-line rounded-md border border-line">
            {recentEstimates.length === 0 ? (
              <EmptyState title="No estimates yet" description="Price your first print job." />
            ) : (
              recentEstimates.map((est) => (
                <div key={est.estimate_id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">Estimate #{est.estimate_id}</p>
                    <p className="text-xs text-ink-soft">
                      {est.page_count} pg · {est.copies}× · {est.color_mode === "bw" ? "B&W" : "Color"} · {est.print_type}
                    </p>
                  </div>
                  <p className="tabular font-mono text-sm font-medium text-ink">{"₹"}{est.total_cost}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Shared files */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">Shared files</h2>
          <Link to="/app/shared" className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentShares.length === 0 ? (
            <EmptyState
              icon={<Share2 size={22} strokeWidth={1.5} />}
              title="Nothing shared yet"
              description="Share a file to see its link here."
              className="sm:col-span-2 lg:col-span-4"
            />
          ) : (
            recentShares.map((share) => (
              <div key={share.id} className="rounded-md border border-line bg-paper-raised/40 p-4">
                <p className="truncate text-sm font-medium text-ink">{share.file_name}</p>
                <p className="mt-1 text-xs text-ink-soft">{share.view_count} views · {share.permission}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
