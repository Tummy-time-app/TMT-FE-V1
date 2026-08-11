"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
}

type ShowOptions = { title?: string; duration?: number };

interface ToastContextValue {
  toasts: ToastItem[];
  show: (type: ToastType, message: string, opts?: ShowOptions) => string;
  dismiss: (id: string) => void;
  success: (message: string, opts?: ShowOptions) => string;
  error: (message: string, opts?: ShowOptions) => string;
  info: (message: string, opts?: ShowOptions) => string;
  warning: (message: string, opts?: ShowOptions) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;
const MAX_VISIBLE_TOASTS = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (type: ToastType, message: string, opts?: ShowOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = opts?.duration ?? DEFAULT_DURATION;
      setToasts((prev) => [
        ...prev.slice(-(MAX_VISIBLE_TOASTS - 1)),
        { id, type, message, title: opts?.title, duration },
      ]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
      return id;
    },
    [dismiss]
  );

  const pause = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
  }, []);

  const resume = useCallback(
    (id: string) => {
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 2000)
      );
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    toasts,
    show,
    dismiss,
    success: (message, opts) => show("success", message, opts),
    error: (message, opts) => show("error", message, opts),
    info: (message, opts) => show("info", message, opts),
    warning: (message, opts) => show("warning", message, opts),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} onPause={pause} onResume={resume} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const ICON_CLASSES: Record<ToastType, string> = {
  success: "text-success",
  error: "text-error",
  info: "text-info",
  warning: "text-warning",
};

function ToastViewport({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => onPause(t.id)}
              onMouseLeave={() => onResume(t.id)}
              role="status"
              aria-live="polite"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-surface-elevated p-4 shadow-lg"
            >
              <Icon size={20} className={cn("mt-0.5 shrink-0", ICON_CLASSES[t.type])} aria-hidden />
              <div className="min-w-0 flex-1">
                {t.title && <p className="text-small font-semibold text-text">{t.title}</p>}
                <p className="text-small text-text-muted">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-full p-1 text-text-subtle transition-colors hover:bg-black/5 hover:text-text"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
