import { useState } from "react";
import { Copy, Check, Ban, Link2, Lock, Clock, Eye } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { ShareModal } from "../../components/app/ShareModal";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../components/ui/Toast";
import { listShareLinks, revokeShareLink } from "../../services/shareService";
import { listDocuments } from "../../services/documentService";
import type { FileResponse } from "../../services/documentService";
import { formatDate } from "../../utils/date";

export function SharedFiles() {
  const { data, loading, setData } = useAsync(listShareLinks, []);
  const { data: docData } = useAsync(listDocuments, []);
  const { push } = useToast();

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<FileResponse | null>(null);

  const links = data ?? [];
  const documents = docData?.items ?? [];

  const buildUrl = (slug: string) => `${window.location.origin}/share/${slug}`;

  const handleCopy = async (url: string, id: number) => {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(id);
    push("Link copied");
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleRevoke = async (id: number) => {
    const updated = await revokeShareLink(id);
    setData(links.map((l) => (l.id === updated.id ? updated : l)));
    push("Link revoked", "warning");
  };

  return (
    <div>
      <PageHeader
        title="Shared Files"
        description="Every link you've generated, and what it can do."
        action={
          <Button onClick={() => setPickerOpen(true)}>
            <Link2 size={15} className="mr-1.5" />
            New share
          </Button>
        }
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-soft">Loading shares…</p>
      ) : links.length === 0 ? (
        <EmptyState
          icon={<Link2 size={22} strokeWidth={1.5} />}
          title="No share links yet"
          description="Create one from a document, or start here."
        />
      ) : (
        <div className="divide-y divide-line rounded-md border border-line">
          {links.map((link) => {
            const url = buildUrl(link.slug);
            return (
              <div key={link.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{link.file_name}</p>
                    <Badge tone={link.revoked ? "warning" : "accent"}>{link.revoked ? "Revoked" : link.permission}</Badge>
                    {link.password && (
                      <span className="flex items-center gap-1 text-xs text-ink-soft">
                        <Lock size={11} /> Password
                      </span>
                    )}
                    {link.expires_at && (
                      <span className="flex items-center gap-1 text-xs text-ink-soft">
                        <Clock size={11} /> Expires {formatDate(link.expires_at)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-ink-soft">
                      <Eye size={11} /> {link.view_count} views
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-ink-soft">{url}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" disabled={link.revoked} onClick={() => handleCopy(url, link.id)}>
                    {copiedId === link.id ? <Check size={13} className="mr-1 text-positive" /> : <Copy size={13} className="mr-1" />}
                    Copy
                  </Button>
                  {!link.revoked && (
                    <Button variant="danger" size="sm" onClick={() => handleRevoke(link.id)}>
                      <Ban size={13} className="mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose a document to share">
        <DocumentPicker
          documents={documents}
          onPick={(doc) => {
            setSharingDoc(doc);
            setPickerOpen(false);
          }}
        />
      </Modal>

      {sharingDoc && (
        <ShareModal open onClose={() => setSharingDoc(null)} fileId={sharingDoc.id} fileName={sharingDoc.filename} />
      )}
    </div>
  );
}

function DocumentPicker({ documents, onPick }: { documents: FileResponse[]; onPick: (doc: FileResponse) => void }) {
  const [selected, setSelected] = useState<number | string>(documents[0]?.id ?? "");

  return (
    <div>
      <Select value={String(selected)} onChange={(e) => setSelected(Number(e.target.value))}>
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.filename}
          </option>
        ))}
      </Select>
      <Button
        className="mt-4 w-full"
        onClick={() => {
          const doc = documents.find((d) => d.id === selected);
          if (doc) onPick(doc);
        }}
        disabled={!selected}
      >
        Continue
      </Button>
    </div>
  );
}
