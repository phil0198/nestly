"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type AuthMode = "login" | "signup";

interface UIState {
  authOpen: boolean;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode, afterLogin?: () => void) => void;
  closeAuth: () => void;
  runAfterLogin: () => void;
}

const Ctx = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [after, setAfter] = useState<(() => void) | null>(null);

  const openAuth = useCallback((mode: AuthMode = "login", afterLogin?: () => void) => {
    setAuthMode(mode);
    setAfter(() => afterLogin ?? null);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const runAfterLogin = useCallback(() => {
    after?.();
    setAfter(null);
  }, [after]);

  const value = useMemo(
    () => ({ authOpen, authMode, openAuth, closeAuth, runAfterLogin }),
    [authOpen, authMode, openAuth, closeAuth, runAfterLogin],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
