import { Link2, MessagesSquare, ShieldCheck, Check } from "lucide-react";
import type { ReactNode } from "react";
import { calculateEstimate } from "../../services/printService";
import { ANALYSIS_STAGES, stageLabel } from "../../services/documentService";
import { formatPaise } from "../../utils/currency";

const colorSample = calculateEstimate({ pageCount: 28, copies: 1, colorMode: "color", sidedness: "simplex" });
const bwSample = calculateEstimate({ pageCount: 12, copies: 2, colorMode: "bw", sidedness: "duplex" });

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
          Every panel below is rendered by the same React components that power the application — no mock data.
        </p>
      </div>

      <div data-sc-stagger data-sc-in className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <span className="tabular font-mono font-medium text-ink">{formatPaise(colorSample.totalPaise)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5">
              <span>12 pg × 2 · B&amp;W · Duplex</span>
              <span className="tabular font-mono font-medium text-ink">{formatPaise(bwSample.totalPaise)}</span>
            </div>
          </div>
        </PanelFrame>

        <PanelFrame id="share.panel" title="Shareable Links">
          <ul className="space-y-2.5 text-xs">
            <li>
              <div className="flex items-center gap-1.5 text-ink-soft">
                <Link2 size={12} className="shrink-0" />
                <span>Password-protected links</span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-ink-soft/60">view · download · expiry</p>
            </li>
          </ul>
        </PanelFrame>

        <PanelFrame id="community.panel" title="Community Requests">
          <ul className="space-y-2.5 text-xs">
            <li>
              <div className="flex items-center gap-1.5 text-ink-soft">
                <MessagesSquare size={12} className="shrink-0" />
                <span>Post a request, get offers</span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-ink-soft/60">open · fulfilled · offers</p>
            </li>
          </ul>
        </PanelFrame>

        <PanelFrame id="admin.panel" title="Admin Monitoring">
          <div className="space-y-1.5 text-xs text-ink-soft">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="shrink-0" />
              <span>Live users, revenue, documents</span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-ink-soft/60">/admin/overview</p>
          </div>
        </PanelFrame>
      </div>
    </section>
  );
}
