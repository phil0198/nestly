"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width class for the dialog on desktop. */
  width?: string;
  /** Full-screen on every breakpoint (photo tour, all photos). */
  fullscreen?: boolean;
  /** Hide the bordered header, keep only the close button. */
  bare?: boolean;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  bodyClassName?: string;
  ariaLabel?: string;
}

/** Shared modal shell: centred card on desktop, bottom sheet on phones, 400ms slide-up like the reference. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-[568px]",
  fullscreen,
  bare,
  headerLeft,
  headerRight,
  bodyClassName,
  ariaLabel,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative flex w-full flex-col bg-white outline-none animate-modal-in",
          fullscreen
            ? "h-full max-h-full"
            : cn("max-h-[calc(100%-24px)] rounded-t-xl sm:max-h-[calc(100vh-80px)] sm:rounded-xl shadow-modal", width),
        )}
      >
        {!bare ? (
          <div className="relative flex min-h-16 shrink-0 items-center justify-between border-b border-divider px-6 py-4">
            <div className="flex min-w-8 items-center">
              {headerLeft ?? (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint"
                >
                  <Icon name="close" size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <div className="absolute left-1/2 max-w-[70%] -translate-x-1/2 truncate text-base font-bold">{title}</div>
            <div className="flex min-w-8 items-center justify-end">{headerRight}</div>
          </div>
        ) : (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-faint"
          >
            <Icon name="close" size={16} strokeWidth={2.5} />
          </button>
        )}
        <div className={cn("min-h-0 flex-1 overflow-y-auto", bodyClassName ?? "px-6 py-6")}>{children}</div>
        {footer && <div className="shrink-0 border-t border-divider px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
