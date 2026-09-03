import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FileStack, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input, Label } from "../components/ui/Input";
import { useAuth } from "../lib/AuthContext";

export function Register() {
  const { user, register, login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, fullName);
      // Auto-login after registration.
      const u = await login(email, password);
      navigate(u.is_admin ? "/admin" : "/app/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <FileStack size={22} className="text-accent" strokeWidth={1.8} />
          <span className="font-display text-lg font-bold text-ink">COSTTY</span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">Start managing your documents in minutes.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              autoComplete="name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
            {submitting ? "Creating account…" : "Create account"}
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
