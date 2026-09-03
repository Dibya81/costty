import { Star, Link2, Lock, MessagesSquare, ShieldCheck, Check } from "lucide-react";
import type { ReactNode } from "react";
import { FileIcon } from "../ui/FileIcon";
import { getSeedDocuments } from "../../data/documents";
import { getSeedShareLinks } from "../../data/shares";
import { getSeedCommunityRequests } from "../../data/community";
import { ADMIN_OVERVIEW, REVENUE_SERIES } from "../../data/analytics";
import { calculateEstimate } from "../../services/printService";
import { ANALYSIS_STAGES, stageLabel } from "../../services/documentService";
import { formatPaise } from "../../utils/currency";

const documents = getSeedDocuments().slice(0, 3);
const shares = getSeedShareLinks().filter((s) => !s.revoked).slice(0, 2);
const requests = getSeedCommunityRequests().slice(0, 2);
const colorSample = calculateEstimate({ pageCount: 28, copies: 1, colorMode: "color", sidedness: "simplex" });
const lastRevenue = REVENUE_SERIES[REVENUE_SERIES.length - 1];

function PanelFrame({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div data-sc-in className="rounded-md border border-line bg-paper-raised/40 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-ink-soft/70">{id}</p>
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

export function ModulePanels() {
  return (
    <section className="sc-wrap sc-section">
      <div className="mb-8 max-w-lg">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-soft">What's running underneath</p>
        <p className="text-sm text-ink-soft">
          Every panel below is real markup reading real sample data — the same services and components that power
          the application once you're inside it.
        </p>
      </div>

      <div data-sc-stagger data-sc-in className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PanelFrame id="documents.panel" title="File Management">
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-2 text-xs">
                <FileIcon category={doc.category} size={13} className="shrink-0 text-ink-soft" />
                <span className="truncate text-ink-soft">{doc.name}</span>
                {doc.starred && <Star size={11} className="ml-auto shrink-0 fill-accent text-accent" />}
              </li>
            ))}
          </ul>
        </PanelFrame>

        <PanelFrame id="share.panel" title="File Sharing">
          <ul className="space-y-2.5">
            {shares.map((link) => (
              <li key={link.id} className="text-xs">
                <div className="flex items-center gap-1.5 text-ink-soft">
                  <Link2 size={12} className="shrink-0" />
                  <span className="truncate">{link.documentName}</span>
                  {link.password && <Lock size={10} className="shrink-0" />}
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-ink-soft/60">{link.views} views · {link.permission}</p>
              </li>
            ))}
          </ul>
        </PanelFrame>

        <PanelFrame id="intake.panel" title="Document Intelligence">
          <ul className="space-y-1.5">
            {ANALYSIS_STAGES.map((stage) => (
              <li key={stage} className="flex items-center gap-2 text-xs text-ink-soft">
                <Check size={11} className="shrink-0 text-positive" />
                {stageLabel(stage)}
              </li>
            ))}
          </ul>
        </PanelFrame>

        <PanelFrame id="estimator.panel" title="Print Cost Estimation">
          <div className="space-y-1.5 text-xs text-ink-soft">
            <div className="flex justify-between">
              <span>28 pg × 1 · Color · Simplex</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5">
              <span>Total</span>
              <span className="tabular font-mono font-medium text-ink">{formatPaise(colorSample.totalPaise)}</span>
            </div>
          </div>
        </PanelFrame>

        <PanelFrame id="community.panel" title="Community">
          <ul className="space-y-2.5">
            {requests.map((req) => (
              <li key={req.id} className="text-xs">
                <div className="flex items-center gap-1.5 text-ink-soft">
                  <MessagesSquare size={12} className="shrink-0" />
                  <span className="truncate">{req.title}</span>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-ink-soft/60">
                  {req.status} · {req.offers.length} offer{req.offers.length === 1 ? "" : "s"}
                </p>
              </li>
            ))}
          </ul>
        </PanelFrame>

        <PanelFrame id="admin.panel" title="Admin Monitoring">
          <div className="space-y-1.5 text-xs text-ink-soft">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="shrink-0" />
              <span>{ADMIN_OVERVIEW.totalUsers.toLocaleString("en-IN")} users tracked</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5">
              <span>Revenue, {lastRevenue.month}</span>
              <span className="tabular font-mono font-medium text-ink">{formatPaise(lastRevenue.revenuePaise)}</span>
            </div>
          </div>
        </PanelFrame>
      </div>
    </section>
  );
}
