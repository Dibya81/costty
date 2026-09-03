import { Link } from "react-router-dom";
import { FileX2 } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <FileX2 size={32} className="text-ink-soft" strokeWidth={1.5} />
      <h1 className="font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        The page you're looking for doesn't exist, or moved.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-sm border border-ink px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Back to home
      </Link>
    </div>
  );
}
