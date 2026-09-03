import { useState } from "react";
import { Calendar, Shield, LogOut, Globe } from "lucide-react";
import { PageHeader } from "../../components/app/PageHeader";
import { Button } from "../../components/ui/Button";
import { ThemeToggle } from "../../components/app/ThemeToggle";
import { useAuth } from "../../lib/AuthContext";
import { formatDate } from "../../utils/date";

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi"];

export function Profile() {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("English");

  if (!user) return null;

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(String(user.id)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <PageHeader title="Settings" description="Your profile, appearance, and account preferences." />

      <div className="mt-6 max-w-lg space-y-5">

        {/* Identity card */}
        <section className="rounded-md border border-line bg-paper-raised/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">{user.full_name}</h2>
              <p className="mt-0.5 text-sm text-ink-soft">{user.email}</p>
            </div>
            {user.is_admin && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-accent">
                <Shield size={11} />
                Admin
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              Joined {formatDate(user.created_at)}
            </span>
            <button
              onClick={handleCopyId}
              className="ml-auto flex items-center gap-1 font-mono hover:text-ink"
              title="Copy user ID"
            >
              #{user.id} {copied ? "(copied)" : ""}
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-md border border-line bg-paper-raised/40 p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Theme</p>
                <p className="text-xs text-ink-soft">Light, Dark, or follow your system setting</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </section>

        {/* Language */}
        <section className="rounded-md border border-line bg-paper-raised/40 p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Language</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Globe size={15} />
              <span>Interface language</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-sm border border-line-strong bg-paper py-1.5 pl-2.5 pr-8 text-sm text-ink outline-none focus:border-ink"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-xs text-ink-soft">Full localisation coming soon. Interface currently in English.</p>
        </section>

        {/* Account status */}
        <section className="rounded-md border border-line bg-paper-raised/40 p-6">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink">Account</h2>
          <div className="space-y-2 text-sm text-ink-soft">
            <div className="flex items-center justify-between">
              <span>Email verified</span>
              <span className="font-medium text-positive">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Account type</span>
              <span className="font-medium text-ink">{user.is_admin ? "Administrator" : "Member"}</span>
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className="rounded-md border border-line bg-paper-raised/40 p-6">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink">Session</h2>
          <Button variant="secondary" onClick={logout} className="w-full sm:w-auto">
            <LogOut size={14} className="mr-1.5" />
            Logout
          </Button>
        </section>

        {/* Danger zone */}
        <section className="rounded-md border border-warning/20 bg-warning/5 p-6">
          <h2 className="mb-1 font-display text-sm font-semibold text-warning">Account actions</h2>
          <p className="mb-4 text-xs text-ink-soft">Account deletion and other destructive actions coming soon.</p>
          <Button variant="danger" size="sm" disabled>
            Delete account
          </Button>
        </section>

      </div>
    </div>
  );
}
