import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Guards routes that require authentication. Redirects to /login if no user.
 * If `requireAdmin` is true, also enforces the user.is_admin flag.
 */
export function RequireAuth({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
