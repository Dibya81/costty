import { useEffect, useMemo, useState } from "react";
import { Calculator, Check } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Input";
import { Select } from "../ui/Select";
import { calculateEstimate, createEstimate, type ColorMode, type PrintType, type EstimateResponse } from "../../services/printService";
import { formatPaise, rupeesToPaise } from "../../utils/currency";
import { useToast } from "../ui/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  fileId: number;
  fileName: string;
  initialPageCount: number;
  onSaved: (estimate: EstimateResponse) => void;
}

export function EstimateModal({ open, onClose, fileName, initialPageCount, onSaved }: Props) {
  const { push } = useToast();
  const [pageCount, setPageCount] = useState<number>(Math.max(1, initialPageCount));
  const [copies, setCopies] = useState<number>(1);
  const [colorMode, setColorMode] = useState<ColorMode>("bw");
  const [printType, setPrintType] = useState<PrintType>("duplex");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPageCount(Math.max(1, initialPageCount));
      setCopies(1);
      setColorMode("bw");
      setPrintType("duplex");
    }
  }, [open, initialPageCount]);

  const preview = useMemo(
    () => calculateEstimate({ pageCount, copies, colorMode, sidedness: printType }),
    [pageCount, copies, colorMode, printType]
  );

  const handleSave = async () => {
    if (pageCount < 1) {
      push("Page count must be at least 1", "warning");
      return;
    }
    setSaving(true);
    try {
      const est = await createEstimate({
        page_count: pageCount,
        copies,
        color_mode: colorMode,
        print_type: printType,
      });
      onSaved(est);
      push(`Estimate saved: ${formatPaise(rupeesToPaise(Number(est.total_cost)))}`);
      onClose();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to save estimate", "warning");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Estimate for "${fileName}"`} width="30rem">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Pages</Label>
            <Input
              type="number"
              min={1}
              value={pageCount}
              onChange={(e) => setPageCount(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div>
            <Label>Copies</Label>
            <Input
              type="number"
              min={1}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Color</Label>
            <Select value={colorMode} onChange={(e) => setColorMode(e.target.value as ColorMode)}>
              <option value="bw">B&amp;W</option>
              <option value="color">Color</option>
            </Select>
          </div>
          <div>
            <Label>Print</Label>
            <Select value={printType} onChange={(e) => setPrintType(e.target.value as PrintType)}>
              <option value="simplex">Simplex</option>
              <option value="duplex">Duplex</option>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-line-strong bg-paper-raised/50 p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Pages</p>
              <p className="mt-1 font-mono text-lg font-semibold text-ink">{preview.pageCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Sides</p>
              <p className="mt-1 font-mono text-lg font-semibold text-ink">{preview.totalPrintedSides}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Sheets</p>
              <p className="mt-1 font-mono text-lg font-semibold text-ink">{preview.totalPhysicalSheets}</p>
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Estimated cost</span>
            <span className="font-mono text-2xl font-bold text-accent">{formatPaise(preview.totalPaise)}</span>
          </div>
        </div>

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Check size={15} className="mr-1.5" /> Save estimate
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-ink-soft">
          <Calculator size={11} className="mr-0.5 inline" /> Rates: B&amp;W ₹2.50/side · Color ₹8.00/side
        </p>
      </div>
    </Modal>
  );
}
