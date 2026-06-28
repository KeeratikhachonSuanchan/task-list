"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Toast = { id: number; message: string; type: "success" | "error" };
const ToastCtx = createContext<(m: string, t?: Toast["type"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
           role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id}
            className={`rounded-md px-4 py-2 text-sm text-white shadow-card animate-fade-in
              ${t.type === "success" ? "bg-success" : "bg-danger"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}