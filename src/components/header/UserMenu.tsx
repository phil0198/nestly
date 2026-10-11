"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useUI } from "../ui/UIContext";
import { Avatar } from "../ui/Avatar";
import { cn } from "@/lib/utils";

function DefaultAvatar() {
  // Original placeholder avatar: grey disc with a simple head-and-shoulders cut-out.
  return (
    <svg viewBox="0 0 30 30" width={30} height={30} aria-hidden>
      <circle cx="15" cy="15" r="15" fill="#6A6A6A" />
      <circle cx="15" cy="12" r="5" fill="#fff" />
      <path d="M6.2 24.6c1.8-3.6 5-5.6 8.8-5.6s7 2 8.8 5.6A12.4 12.4 0 0 1 15 28a12.4 12.4 0 0 1-8.8-3.4Z" fill="#fff" />
    </svg>
  );
}

function MenuItem({
  href,
  onClick,
  children,
  bold,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  bold?: boolean;
}) {
  const cls = cn("block w-full px-4 py-3 text-left text-sm hover:bg-faint", bold && "font-semibold");
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick} role="menuitem">
        {children}
      </Link>
    );
  return (
    <button type="button" className={cls} onClick={onClick} role="menuitem">
      {children}
    </button>
  );
}

export function UserMenu() {
  const { data: session, status } = useSession();
  const { openAuth } = useUI();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const user = session?.user;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Main navigation menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-[42px] items-center gap-3 rounded-full border border-hairline bg-white pl-3.5 pr-1.5 transition-shadow duration-200 hover:shadow-pill-hover",
          open && "shadow-pill-hover",
        )}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
        <span className="relative">
          {user ? <Avatar name={user.name ?? "?"} src={user.image} size={30} /> : <DefaultAvatar />}
          {status === "authenticated" && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" aria-hidden />
          )}
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[52px] z-50 w-60 rounded-xl bg-white py-2 shadow-menu animate-fade-in">
          {user ? (
            <>
              <MenuItem href="/trips" onClick={close} bold>
                Trips
              </MenuItem>
              <MenuItem href="/wishlists" onClick={close} bold>
                Wishlists
              </MenuItem>
              <MenuItem href="/account" onClick={close} bold>
                Messages
              </MenuItem>
              <div className="my-2 h-px bg-divider" />
              <MenuItem href="/host/listings" onClick={close}>
                Manage listings
              </MenuItem>
              <MenuItem href="/host/reservations" onClick={close}>
                Host reservations
              </MenuItem>
              <MenuItem href="/become-a-host" onClick={close}>
                Create a new listing
              </MenuItem>
              <MenuItem href="/account" onClick={close}>
                Account
              </MenuItem>
              <div className="my-2 h-px bg-divider" />
              <MenuItem href="/help" onClick={close}>
                Help Centre
              </MenuItem>
              <MenuItem
                onClick={() => {
                  close();
                  signOut({ callbackUrl: "/" });
                }}
              >
                Log out
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem
                bold
                onClick={() => {
                  close();
                  openAuth("signup");
                }}
              >
                Sign up
              </MenuItem>
              <MenuItem
                onClick={() => {
                  close();
                  openAuth("login");
                }}
              >
                Log in
              </MenuItem>
              <div className="my-2 h-px bg-divider" />
              <MenuItem href="/become-a-host" onClick={close}>
                Host your home
              </MenuItem>
              <MenuItem href="/help" onClick={close}>
                Help Centre
              </MenuItem>
            </>
          )}
        </div>
      )}
    </div>
  );
}
