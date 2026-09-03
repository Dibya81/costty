import { useMemo, useState } from "react";
import { Search, MoreVertical, Download, Pencil, Trash2, Share2, Check } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { FileIcon } from "../../components/ui/FileIcon";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";
import { UploadDropzone } from "../../components/app/UploadDropzone";
import { RenameModal } from "../../components/app/RenameModal";
import { ConfirmModal } from "../../components/app/ConfirmModal";
import { ShareModal } from "../../components/app/ShareModal";
import { useAsync } from "../../hooks/useAsync";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToast } from "../../components/ui/Toast";
import {
  deleteDocument,
  downloadDocument,
  listDocuments,
  renameDocument,
  uploadDocument,
} from "../../services/documentService";
import type { DocumentCategory } from "../../types/document";
import type { FileResponse } from "../../services/documentService";
import { formatBytes } from "../../utils/bytes";
import { formatDate, relativeTime } from "../../utils/date";
import { inferTypeInfo } from "../../utils/fileType";

type SortKey = "recent" | "name" | "size";
const CATEGORIES: (DocumentCategory | "All")[] = ["All", "PDF", "Word", "Excel", "PowerPoint", "Text", "Image", "Other"];

export function Documents() {
  const { data, loading, setData } = useAsync(listDocuments, []);
  const { push } = useToast();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [category, setCategory] = useState<DocumentCategory | "All">("All");
  const [sort, setSort] = useState<SortKey>("recent");

  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<FileResponse | null>(null);
  const [deleting, setDeleting] = useState<FileResponse | null>(null);
  const [sharing, setSharing] = useState<FileResponse | null>(null);
  const [downloadedId, setDownloadedId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const documents = data?.items ?? [];

  const filtered = useMemo(() => {
    let list = documents;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((d) => d.filename.toLowerCase().includes(q));
    }
    if (category !== "All") {
      list = list.filter((d) => inferTypeInfo(d.filename).category === category);
    }

    const sorted = [...list];
    switch (sort) {
      case "name":
        sorted.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case "size":
        sorted.sort((a, b) => b.size_bytes - a.size_bytes);
        break;
      default:
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    return sorted;
  }, [documents, debouncedQuery, category, sort]);

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    try {
      for (const file of files) {
        const doc = await uploadDocument(file);
        setData({ ...data!, items: [doc, ...documents] });
      }
      push(files.length > 1 ? `${files.length} files uploaded` : "File uploaded");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: FileResponse) => {
    setMenuOpenId(null);
    await downloadDocument(doc.id);
    setDownloadedId(doc.id);
    push(`Downloading ${doc.filename}`);
    setTimeout(() => setDownloadedId(null), 1800);
  };

  const handleRename = async (name: string) => {
    if (!renaming) return;
    const updated = await renameDocument(renaming.id, name);
    setData({ ...data!, items: documents.map((d) => (d.id === updated.id ? updated : d)) });
    push("Renamed");
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteDocument(deleting.id);
    setData({ ...data!, items: documents.filter((d) => d.id !== deleting.id) });
    push("Document deleted", "warning");
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Upload, organize, and manage all your documents in COSTlY."
      />

      <UploadDropzone onFiles={handleFiles} compact />
      {uploading && <p className="mt-2 text-xs font-medium text-ink-soft">Uploading…</p>}

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-sm border border-line-strong bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory | "All")} className="w-36">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-32">
            <option value="recent">Most recent</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="mt-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-ink-soft">Loading documents…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No documents match" description="Try a different search term or filter." />
        ) : (
          <div className="divide-y divide-line rounded-md border border-line">
            {filtered.map((doc) => {
              const info = inferTypeInfo(doc.filename);
              return (
                <div key={doc.id} className="group flex items-center gap-3 px-4 py-3">
                  <FileIcon category={info.category} className="shrink-0 text-ink-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{doc.filename}</p>
                    <p className="text-xs text-ink-soft">
                      {formatBytes(doc.size_bytes)} · {formatDate(doc.updated_at)} · {relativeTime(doc.updated_at)}
                    </p>
                  </div>
                  <Badge className="hidden sm:inline-flex">{info.category}</Badge>

                  <div className="relative shrink-0">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                      aria-label="More actions"
                      className="rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-paper-raised hover:text-ink"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpenId === doc.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-sm border border-line-strong bg-paper shadow-e2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-raised"
                          >
                            {downloadedId === doc.id ? <Check size={14} className="text-positive" /> : <Download size={14} />}
                            Download
                          </button>
                          <button
                            onClick={() => {
                              setSharing(doc);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-raised"
                          >
                            <Share2 size={14} />
                            Share
                          </button>
                          <button
                            onClick={() => {
                              setRenaming(doc);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-raised"
                          >
                            <Pencil size={14} />
                            Rename
                          </button>
                          <button
                            onClick={() => {
                              setDeleting(doc);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-accent hover:bg-accent/10"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {renaming && (
        <RenameModal
          open
          currentName={renaming.filename}
          onClose={() => setRenaming(null)}
          onRename={handleRename}
        />
      )}
      {deleting && (
        <ConfirmModal
          open
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          title="Delete document"
          description={`"${deleting.filename}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
        />
      )}
      {sharing && (
        <ShareModal open onClose={() => setSharing(null)} fileId={sharing.id} fileName={sharing.filename} />
      )}
    </div>
  );
}
