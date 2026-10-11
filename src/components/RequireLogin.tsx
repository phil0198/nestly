"use client";

import { useEffect } from "react";
import { useUI } from "./ui/UIContext";

/** Shown on account-only pages when signed out; opens the login modal automatically. */
export function RequireLogin({ title, body }: { title: string; body: string }) {
  const { openAuth } = useUI();
  useEffect(() => openAuth("login"), [openAuth]);
  return (
    <div className="border-b border-divider pb-12">
      <h2 className="text-[22px] font-semibold leading-[26px]">{title}</h2>
      <p className="mt-2 max-w-[460px] text-base text-muted">{body}</p>
      <button type="button" onClick={() => openAuth("login")} className="btn-brand mt-6">
        Log in
      </button>
    </div>
  );
}
