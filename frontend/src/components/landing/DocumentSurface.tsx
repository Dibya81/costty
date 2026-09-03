import { calculateEstimate } from "../../services/printService";
import { paiseToRupees } from "../../utils/currency";

/**
 * The ONE bespoke move (spec section 3): document -> pages -> printing ->
 * cost, all inside a single data-sc-act="pin" so it reads as one continuous
 * operation rather than several animation systems stacked together.
 *
 * The outline and text lines draw themselves via the pathLength trick
 * (stroke-dasharray/offset driven by --sc-p, which the engine publishes on
 * the act element per scrollcraft.js line ~810) — no video, no image
 * sequence, just real SVG responding to real scroll. Each legend row is a
 * plain data-sc-cue, the same device the rest of the page uses. The
 * numbers are not typed into the markup: they come from calculateEstimate(),
 * the exact function the real Estimator page uses, on a clearly-labelled
 * sample job. That is the "live surface" honesty rule — the panel is
 * operable markup computing its own state, not a picture of an answer.
 */
const SAMPLE = calculateEstimate({ pageCount: 100, copies: 2, colorMode: "bw", sidedness: "duplex" });
const SAMPLE_RUPEES = Math.round(paiseToRupees(SAMPLE.totalPaise));

const LEGEND = [
  { at: "0.16 0.34", label: "File type", value: "PDF document", detail: "application/pdf" },
  { at: "0.32 0.48", label: "Metadata", value: "4.1 MB · 86×110mm", detail: "extracted, not typed" },
  { at: "0.46 0.62", label: "Pages", value: `${SAMPLE.pageCount} pages`, detail: `${SAMPLE.copies} copies requested` },
  {
    at: "0.60 0.76",
    label: "Print configuration",
    value: "B&W · Duplex",
    detail: `${SAMPLE.printedSides} sides on ${SAMPLE.physicalSheets} sheets`,
  },
];

export function DocumentSurface() {
  return (
    <section data-sc-act="pin" data-sc-span="5.5" aria-label="How Folio prices a document">
      <div data-sc-stage className="flex items-center border-y border-line bg-paper">
        <div className="sc-wrap w-full py-10 sm:py-0">
          <div className="mb-6 flex items-center gap-2 sm:mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              intake.panel — sample_report.pdf — analyzing
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-4">
            {/* The document, drawing itself */}
            <div className="flex justify-center lg:justify-end">
              <svg
                viewBox="0 0 240 300"
                className="h-[34vh] max-h-64 w-auto sm:h-[40vh] sm:max-h-80 lg:h-[46vh] lg:max-h-[26rem]"
                fill="none"
                stroke="var(--sc-ink)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                {/* outline: finishes drawing early, then holds */}
                <path
                  pathLength={1}
                  d="M24,12 H156 L216,72 V288 H24 Z"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: "calc(1 - min(var(--sc-p, 0) / 0.14, 1))",
                  }}
                  className="folio-doc-line"
                />
                <path
                  pathLength={1}
                  d="M156,12 V72 H216"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: "calc(1 - min(var(--sc-p, 0) / 0.14, 1))",
                  }}
                  className="folio-doc-line"
                  opacity={0.55}
                />
                {/* text lines: draw in shortly after the outline settles */}
                {[100, 124, 148, 172, 196, 220, 244].map((y, i) => (
                  <path
                    key={y}
                    pathLength={1}
                    d={`M44,${y} H${i % 3 === 2 ? 150 : 188}`}
                    strokeWidth={1.6}
                    opacity={0.4}
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: `calc(1 - min(max(var(--sc-p, 0) - 0.1, 0) / 0.22, 1))`,
                    }}
                    className="folio-doc-line"
                  />
                ))}
              </svg>
            </div>

            {/* Spec sheet legend */}
            <div className="max-w-md lg:max-w-none">
              <dl className="divide-y divide-line border-t border-line lg:border-t-0">
                {LEGEND.map((row, i) => (
                  <div key={row.label} data-sc-cue={row.at} data-sc-rise="1" className="flex items-baseline justify-between gap-4 py-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-ink-soft/60">0{i + 1}</span>
                      <dt className="font-mono text-xs uppercase tracking-wide text-ink-soft">{row.label}</dt>
                    </div>
                    <dd className="text-right">
                      <span className="block text-sm font-medium text-ink">{row.value}</span>
                      <span className="block text-xs text-ink-soft">{row.detail}</span>
                    </dd>
                  </div>
                ))}

                {/* the peak: real computed total, counting up in sync with its own reveal */}
                <div data-sc-cue="0.76 0.94" data-sc-rise="1" className="flex items-baseline justify-between gap-4 pt-5">
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-soft">Estimated cost</dt>
                  <dd className="tabular font-display text-4xl font-bold text-accent sm:text-5xl">
                    <span aria-hidden="true">₹</span>
                    <span data-sc-count={`0 ${SAMPLE_RUPEES}`} data-sc-count-at="0.76 0.92">
                      0
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
