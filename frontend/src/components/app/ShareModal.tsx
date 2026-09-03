import { useState } from "react";
import { Copy, Check, Link2, Ban } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Input";
import { Select } from "../ui/Select";
import { createShareLink, revokeShareLink } from "../../services/shareService";
import type { SharePermission } from "../../services/shareService";
import { useToast } from "../ui/Toast";

const EXPIRY_OPTIONS = [
  { value: "", label: "Never" },
  { value: "24", label: "1 day" },
  { value: "168", label: "7 days" },
  { value: "720", label: "30 days" },
];

export function ShareModal({
  open,
  onClose,
  fileId,
  fileName,
}: {
  open: boolean;
  onClose: () => void;
  fileId: number;
  fileName: string;
}) {
  const { push } = useToast();
  const [permission, setPermission] = useState<SharePermission>("view");
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState<{ id: number; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);

  const reset = () => {
    setPermission("view");
    setPassword("");
    setExpiry("");
    setLink(null);
    setCopied(false);
    setRevoked(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = async () => {
    setCreating(true);
    try {
      const created = await createShareLink({
        file_id: fileId,
        permission,
        password: password || undefined,
        expires_in_hours: expiry ? Number(expiry) : undefined,
      });
      const url = `${window.location.origin}/share/${created.slug}`;
      setLink({ id: created.id, url });
      push("Share link created");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to create link", "warning");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.url).catch(() => {});
    setCopied(true);
    push("Link copied");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleRevoke = async () => {
    if (!link) return;
    try {
      await revokeShareLink(link.id);
      setRevoked(true);
      push("Link revoked", "warning");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to revoke", "warning");
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={`Share "${fileName}"`} width="28rem">
      {!link ? (
        <div className="space-y-4">
          <div>
            <Label>Permission</Label>
            <Select value={permission} onChange={(e) => setPermission(e.target.value as SharePermission)}>
              <option value="view">Can view</option>
              <option value="comment">Can comment</option>
              <option value="edit">Can edit</option>
            </Select>
          </div>
          <div>
            <Label>Password (optional)</Label>
            <Input
              type="text"
              placeholder="Leave blank for no password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Expires</Label>
            <Select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
              {EXPIRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <Button className="w-full" onClick={handleGenerate} disabled={creating}>
            <Link2 size={15} className="mr-1.5" />
            {creating ? "Generating…" : "Generate link"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-sm border border-line-strong bg-paper px-3 py-2">
            <p className="flex-1 truncate font-mono text-xs text-ink-soft">{link.url}</p>
            <button
              onClick={handleCopy}
              disabled={revoked}
              className="shrink-0 rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-paper-raised hover:text-ink disabled:opacity-40"
              aria-label="Copy link"
            >
              {copied ? <Check size={15} className="text-positive" /> : <Copy size={15} />}
            </button>
          </div>
          <p className="text-xs text-ink-soft">
            {permission === "view" ? "Can view" : permission === "comment" ? "Can comment" : "Can edit"}
            {password && " · Password protected"}
            {expiry && ` · Expires in ${expiry} hours`}
          </p>
          {revoked ? (
            <p className="rounded-sm bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
              This link has been revoked and no longer works.
            </p>
          ) : (
            <Button variant="danger" className="w-full" onClick={handleRevoke}>
              <Ban size={15} className="mr-1.5" />
              Revoke link
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
