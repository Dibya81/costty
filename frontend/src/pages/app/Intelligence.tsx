import { useState } from "react";
import { RotateCcw, ScanSearch } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { UploadDropzone } from "../../components/app/UploadDropzone";
import { StageProgress } from "../../components/app/StageProgress";
import { FileIcon } from "../../components/ui/FileIcon";
import { Button } from "../../components/ui/Button";
import { ANALYSIS_STAGES, analyzeDocument, stageLabel } from "../../services/documentService";
import type { AnalysisResult, AnalysisStage } from "../../types/document";
import { formatBytes } from "../../utils/bytes";

const STAGE_LABELS = Object.fromEntries(ANALYSIS_STAGES.map((s) => [s, stageLabel(s)])) as Record<string, string>;

export function Intelligence() {
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    setResult(null);
    setStage("uploading");
    const analysis = await analyzeDocument({ name: file.name, sizeBytes: file.size }, (s) => setStage(s as AnalysisStage));
    setResult(analysis);
  };

  const reset = () => {
    setStage("idle");
    setResult(null);
  };

  return (
    <div>
      <PageHeader
        title="Document Intelligence"
        description="Drop in a file and COSTlY identifies its type, extracts metadata, and classifies it."
      />

      {stage === "idle" && <UploadDropzone onFiles={handleFiles} />}

      {stage !== "idle" && stage !== "complete" && (
        <div className="mx-auto max-w-md rounded-md border border-line bg-paper-raised/40 p-6">
          <div className="mb-4 flex items-center gap-2 text-ink-soft">
            <ScanSearch size={16} />
            <span className="font-mono text-xs uppercase tracking-wide">Analyzing…</span>
          </div>
          <StageProgress stages={ANALYSIS_STAGES.slice(0, -1)} labels={STAGE_LABELS} current={stage} />
        </div>
      )}

      {stage === "complete" && result && (
        <div className="mx-auto max-w-md">
          <div className="rounded-md border border-line bg-paper-raised/40 p-6">
            <div className="mb-5 flex items-center gap-3">
              <FileIcon category={result.category} size={24} className="text-accent" />
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-ink">{result.fileName}</p>
                <p className="text-xs text-ink-soft">Classification complete</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                ["File type", result.fileType],
                ["Category", result.category],
                ["Size", formatBytes(result.sizeBytes)],
                ["Extension", `.${result.extension}`],
                ["MIME type", result.mimeType],
                ["Page count", String(result.pageCount)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</dt>
                  <dd className="mt-0.5 truncate text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Button variant="secondary" className="mt-4 w-full" onClick={reset}>
            <RotateCcw size={14} className="mr-1.5" />
            Analyze another file
          </Button>
        </div>
      )}
    </div>
  );
}
