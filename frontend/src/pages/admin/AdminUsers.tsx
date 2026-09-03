import { useState } from "react";
import { Search, Shield, ShieldOff } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { useAsync } from "../../hooks/useAsync";
import { getRecentUsers } from "../../services/analyticsService";
import { formatDate, relativeTime } from "../../utils/date";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

type UserStatus = "active" | "disabled";

export function AdminUsers() {
  const { data: serverUsers } = useAsync(getRecentUsers, []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const debounced = useDebouncedValue(query, 200);

  // Local toggle state overlaid on server data
  const [overrides, setOverrides] = useState<Record<string, UserStatus>>({});

  const users = (serverUsers ?? []).map((u) => ({
    ...u,
    status: (overrides[u.id] ?? u.status) as UserStatus,
  }));

  const toggleStatus = (id: string, current: UserStatus) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: current === "active" ? "disabled" : "active",
    }));
  };

  const filtered = users.filter((u) => {
    const matchesQuery =
      !debounced.trim() || u.name.toLowerCase().includes(debounced.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Users</h1>
        <p className="mt-1 text-sm text-ink-soft">View, search, and manage platform users.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-sm border border-line-strong bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div className="flex gap-2 font-mono text-xs">
          {(["all", "active", "disabled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-sm border px-3 py-1.5 capitalize transition ${
                statusFilter === f
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-md border border-line bg-paper-raised/40 p-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Total</p>
          <p className="font-display text-xl font-bold text-ink mt-0.5">{users.length}</p>
        </div>
        <div className="rounded-md border border-line bg-paper-raised/40 p-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Active</p>
          <p className="font-display text-xl font-bold text-positive mt-0.5">
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="rounded-md border border-line bg-paper-raised/40 p-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Disabled</p>
          <p className="font-display text-xl font-bold text-warning mt-0.5">
            {users.filter((u) => u.status === "disabled").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-raised/50 text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last Active</th>
              <th className="px-4 py-3 font-medium">Docs</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-soft">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-paper-raised/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(user.joinedAt)}</td>
                  <td className="px-4 py-3 text-ink-soft">{relativeTime(user.lastActiveAt)}</td>
                  <td className="tabular px-4 py-3 text-ink-soft">{user.documents}</td>
                  <td className="px-4 py-3">
                    <Badge tone={user.status === "active" ? "positive" : "warning"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(user.id, user.status)}
                      className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition ${
                        user.status === "active"
                          ? "border-warning/40 text-warning hover:bg-warning/10"
                          : "border-positive/40 text-positive hover:bg-positive/10"
                      }`}
                    >
                      {user.status === "active" ? (
                        <><ShieldOff size={11} /> Disable</>
                      ) : (
                        <><Shield size={11} /> Enable</>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
