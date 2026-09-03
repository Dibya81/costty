import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Check, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";

type ToastTone = "success" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  push: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_ICON: Record<ToastTone, typeof Check> = {
  success: Check,
  info: Info,
  warning: AlertTriangle,
};

const TONE_CLASS: Record<ToastTone, string> = {
  success: "border-positive/30 text-positive",
  info: "border-info/30 text-info",
  warning: "border-warning/30 text-warning",
};

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: ToastTone = "success") => {
    counter += 1;
    const id = counter;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6">
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone];
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-sm border bg-paper px-4 py-2.5 text-sm font-medium text-ink shadow-e2 animate-[toast-in_200ms_ease-out]",
                TONE_CLASS[toast.tone]
              )}
            >
              <Icon size={15} />
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
