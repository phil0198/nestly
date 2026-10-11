"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface Toast {
  id: number;
  message: React.ReactNode;
  image?: string;
}

const Ctx = createContext<(message: React.ReactNode, image?: string) => void>(() => {});

/** Bottom-left toast like the reference site's "Saved to …" confirmation. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((message: React.ReactNode, image?: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, image }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:left-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex min-w-[280px] max-w-[400px] items-center gap-3 rounded-xl bg-white p-3 pr-5 text-sm font-semibold text-ink shadow-modal animate-modal-in"
          >
            {t.image && <img src={t.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
