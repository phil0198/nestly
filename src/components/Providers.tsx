"use client";

import { SessionProvider } from "next-auth/react";
import { UIProvider } from "./ui/UIContext";
import { WishlistProvider } from "./listing/WishlistContext";
import { ToastProvider } from "./ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <UIProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </UIProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
