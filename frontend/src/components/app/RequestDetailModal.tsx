import { useState } from "react";
import { Paperclip, CheckCircle2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Input";
import { addOffer, markFulfilled } from "../../services/communityService";
import type { CommunityRequest } from "../../services/communityService";
import { useToast } from "../ui/Toast";
import { relativeTime } from "../../utils/date";
import { FileIcon } from "../ui/FileIcon";
import { inferTypeInfo } from "../../utils/fileType";

export function RequestDetailModal({
  request,
  onClose,
  onUpdate,
}: {
  request: CommunityRequest;
  onClose: () => void;
  onUpdate: (updated: CommunityRequest) => void;
}) {
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [attachedName, setAttachedName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOffer = async () => {
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      const updated = await addOffer(request.id, {
        note: note.trim(),
        file_name: attachedName ?? undefined,
      });
      onUpdate(updated);
      setNote("");
      setAttachedName(null);
      push("Offer sent");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to send offer", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFulfilled = async () => {
    try {
      const updated = await markFulfilled(request.id);
      onUpdate(updated);
      push("Marked as fulfilled");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to mark fulfilled", "warning");
    }
  };

  return (
    <Modal open onClose={onClose} title={request.title} width="32rem">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={request.status === "fulfilled" ? "positive" : "accent"}>
          {request.status === "fulfilled" ? "Fulfilled" : "Open"}
        </Badge>
        {request.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-soft">{request.description}</p>
      <p className="mt-2 font-mono text-xs text-ink-soft">
        {request.author_name} · {relativeTime(request.created_at)}
      </p>

      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-soft">
          {request.offers.length} offer{request.offers.length === 1 ? "" : "s"}
        </p>
        {request.offers.length === 0 ? (
          <p className="text-sm text-ink-soft">No one has offered a file yet.</p>
        ) : (
          <div className="space-y-3">
            {request.offers.map((offer) => (
              <div key={offer.id} className="rounded-sm border border-line bg-paper-raised/40 p-3">
                <p className="text-sm text-ink">{offer.note}</p>
                {offer.file_name && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
                    <FileIcon category={inferTypeInfo(offer.file_name).category} size={13} />
                    {offer.file_name}
                  </div>
                )}
                <p className="mt-1.5 font-mono text-[11px] text-ink-soft">
                  {offer.author_name} · {relativeTime(offer.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {request.status === "open" && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-soft">Offer a file</p>
          <Textarea
            rows={2}
            placeholder="Describe what you're sharing…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-soft hover:text-ink">
              <Paperclip size={13} />
              {attachedName ?? "Attach a file"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setAttachedName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleFulfilled}>
                <CheckCircle2 size={13} className="mr-1" />
                Mark fulfilled
              </Button>
              <Button size="sm" onClick={handleOffer} disabled={submitting || !note.trim()}>
                {submitting ? "Sending…" : "Send offer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
