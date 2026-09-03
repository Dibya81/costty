import { useState } from "react";
import { Settings, LogOut, Globe } from "lucide-react";
import { ThemeToggle } from "../../components/app/ThemeToggle";
import { useAuth } from "../../lib/AuthContext";

const PRICING = [
  { label: "B&W Simplex (per side)", value: "₹2.50" },
  { label: "B&W Duplex (per side)", value: "₹2.50" },
  { label: "Color Simplex (per side)", value: "₹8.00" },
  { label: "Color Duplex (per side)", value: "₹8.00" },
];

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi"];

export function AdminSettings() {
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState("English");

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Admin Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Platform configuration, appearance, and admin account.</p>
      </div>

      {/* Admin Profile */}
      {user && (
        <section className="rounded-md border border-line bg-paper-raised/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-ink">Admin Profile</h2>
            <Settings size={15} className="text-ink-soft" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink">{user.full_name}</p>
            <p className="text-xs text-ink-soft">{user.email}</p>
          </div>
        </section>
      )}

      {/* Appearance */}
      <section className="rounded-md border border-line bg-paper-raised/40 p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Theme</p>
            <p className="text-xs text-ink-soft">Light, Dark, or follow system</p>
          </div>
          <ThemeToggle />
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
        <p className="mt-3 text-xs text-ink-soft">Full localisation coming soon.</p>
      </section>

      {/* Pricing Config */}
      <section className="rounded-md border border-line bg-paper-raised/40 p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Pricing Configuration</h2>
        <div className="space-y-3">
          {PRICING.map((p) => (
            <div key={p.label} className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">{p.label}</span>
              <span className="font-mono font-semibold text-ink">{p.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-soft border-t border-line pt-3">
          Pricing changes require a backend config update. Contact the system administrator.
        </p>
      </section>

      {/* Platform Info */}
      <section className="rounded-md border border-line bg-paper-raised/40 p-6">
        <h2 className="mb-2 font-display text-sm font-semibold text-ink">Platform</h2>
        <p className="text-xs text-ink-soft">COSTlY v0.1 preview · Additional platform settings coming soon.</p>
      </section>

      {/* Logout */}
      <section className="rounded-md border border-line bg-paper-raised/40 p-6">
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Session</h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </section>
    </div>
  );
}

export default AdminSettings;
