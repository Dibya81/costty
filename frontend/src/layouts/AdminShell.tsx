import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  BarChart2,
  DollarSign,
  MessageSquare,
  Flag,
  Settings,
  ShieldCheck,
  LogOut,
  Calculator,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useAuth } from "../lib/AuthContext";

const ADMIN_NAV = [
  { to: "/admin",                 label: "Dashboard",       icon: LayoutDashboard, end: true },
  { to: "/admin/users",          label: "Users",           icon: Users },
  { to: "/admin/documents",      label: "Documents",       icon: FolderOpen },
  { to: "/admin/analytics",      label: "Print Analytics", icon: BarChart2 },
  { to: "/admin/revenue",        label: "Revenue",         icon: DollarSign },
  { to: "/admin/community",      label: "Community",       icon: MessageSquare },
  { to: "/admin/reports",        label: "Reports",         icon: Flag },
  { to: "/admin/settings",       label: "Settings",        icon: Settings },
];

function CostlyWordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center text-paper shadow">
        <Calculator size={14} strokeWidth={2} />
      </div>
      <span className="font-display text-base font-extrabold tracking-tight text-ink">
        COST<span className="text-accent">lY</span>
      </span>
      <span className="ml-1 rounded border border-accent/30 bg-accent/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
        Admin
      </span>
    </div>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  return (
    <>
      <Link to="/" className="flex items-center gap-2 px-5 py-5" onClick={onNavigate}>
        <CostlyWordmark />
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:bg-paper-raised hover:text-ink"
              )
            }
          >
            <item.icon size={17} strokeWidth={1.8} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line px-5 py-4">
        {user && (
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink">{user.full_name}</p>
              <p className="truncate text-[11px] text-ink-soft">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-2 shrink-0 rounded-sm p-1 text-ink-soft hover:bg-paper-raised hover:text-ink"
              aria-label="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-ink-soft font-mono">
          <ShieldCheck size={12} className="text-accent" />
          <span>Restricted admin view</span>
        </div>
      </div>
    </>
  );
}

export function AdminShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-paper md:flex">
        <NavContent />
      </aside>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
        <Link to="/"><CostlyWordmark /></Link>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-sm p-2 text-ink hover:bg-paper-raised">
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-paper shadow-e3">
            <div className="flex items-center justify-end px-3 pt-3">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-sm p-2 text-ink-soft hover:bg-paper-raised">
                <X size={20} />
              </button>
            </div>
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
