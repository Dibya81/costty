import { useMemo, useState } from "react";
import { Search, Plus, MessageSquare } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { EmptyState } from "../../components/ui/EmptyState";
import { NewRequestModal } from "../../components/app/NewRequestModal";
import { RequestDetailModal } from "../../components/app/RequestDetailModal";
import { useAsync } from "../../hooks/useAsync";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { listRequests } from "../../services/communityService";
import type { CommunityRequest } from "../../services/communityService";
import { relativeTime } from "../../utils/date";

export function Community() {
  const { data, setData } = useAsync(listRequests, []);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "fulfilled">("all");
  const [newOpen, setNewOpen] = useState(false);
  const [active, setActive] = useState<CommunityRequest | null>(null);

  const requests = data?.items ?? [];

  const filtered = useMemo(() => {
    let list = requests;
    if (debounced.trim()) {
      const q = debounced.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [requests, debounced, statusFilter]);

  const updateRequest = (updated: CommunityRequest) => {
    setData({ ...(data ?? { items: [], page: 1, page_size: 0, total_items: 0, total_pages: 0 }), items: requests.map((r) => (r.id === updated.id ? updated : r)) });
    setActive(updated);
  };

  return (
    <div>
      <PageHeader
        title="Community"
        description="Ask for a document you're missing, or help someone who's asking."
        action={
          <Button onClick={() => setNewOpen(true)}>
            <Plus size={15} className="mr-1.5" />
            New request
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requests or tags…"
            className="w-full rounded-sm border border-line-strong bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <SegmentedControl
          options={[
            { value: "all", label: "All" },
            { value: "open", label: "Open" },
            { value: "fulfilled", label: "Fulfilled" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={22} strokeWidth={1.5} />}
          title="No requests found"
          description="Try a different search, or post what you're looking for."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((request) => (
            <button
              key={request.id}
              onClick={() => setActive(request)}
              className="flex flex-col gap-2 rounded-md border border-line bg-paper-raised/40 p-4 text-left transition-colors hover:border-ink"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold leading-snug text-ink">{request.title}</p>
                <Badge tone={request.status === "fulfilled" ? "positive" : "accent"} className="shrink-0">
                  {request.status === "fulfilled" ? "Fulfilled" : "Open"}
                </Badge>
              </div>
              <p className="line-clamp-2 text-sm text-ink-soft">{request.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {request.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <p className="mt-1 font-mono text-xs text-ink-soft">
                {request.author_name} · {relativeTime(request.created_at)} · {request.offers.length} offer
                {request.offers.length === 1 ? "" : "s"}
              </p>
            </button>
          ))}
        </div>
      )}

      <NewRequestModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(req) => setData({ ...(data ?? { items: [], page: 1, page_size: 0, total_items: 0, total_pages: 0 }), items: [req, ...requests] })}
      />
      {active && <RequestDetailModal request={active} onClose={() => setActive(null)} onUpdate={updateRequest} />}
    </div>
  );
}
