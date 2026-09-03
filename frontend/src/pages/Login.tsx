import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FileStack, ArrowRight, Shield, User } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input, Label } from "../components/ui/Input";
import { useAuth } from "../lib/AuthContext";

type LoginMode = "user" | "admin";

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as { from?: string } | null)?.from || "/app/dashboard";

  const [mode, setMode] = useState<LoginMode>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.is_admin ? "/admin" : redirect} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const u = await login(email, password);
      if (mode === "admin" && !u.is_admin) {
        setError("This account does not have admin access.");
        return;
      }
      navigate(u.is_admin ? "/admin" : redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <FileStack size={22} className="text-accent" strokeWidth={1.8} />
          <span className="font-display text-lg font-bold text-ink">Folio</span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">Welcome back. Continue to your library.</p>

        {/* Mode toggle */}
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-sm border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => { setMode("user"); setError(null); }}
            className={`flex items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium transition ${
              mode === "user"
                ? "bg-paper text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <User size={14} />
            User
          </button>
          <button
            type="button"
            onClick={() => { setMode("admin"); setError(null); }}
            className={`flex items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium transition ${
              mode === "admin"
                ? "bg-accent text-paper shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Shield size={14} />
            Admin
          </button>
        </div>

        {mode === "admin" && (
          <div className="mt-4 rounded-sm border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-ink-soft">
            <div className="flex items-center gap-1.5 font-medium text-accent">
              <Shield size={12} />
              Admin sign-in
            </div>
            <p className="mt-1">
              You'll be redirected to the admin dashboard. Use a valid admin account.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder={mode === "admin" ? "admin@example.com" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-sm border border-accent/20 bg-accent/5 px-3 py-2 text-sm text-accent">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : mode === "admin" ? "Sign in as admin" : "Sign in"}
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-ink-soft">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-ink underline-offset-2 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
