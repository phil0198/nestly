"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Icon } from "../icons";
import { LogoMark } from "../Logo";
import { useUI } from "../ui/UIContext";

const HIDDEN_ON = [/^\/rooms\//, /^\/book\//, /^\/become-a-host/, /^\/trips\/[^/]+\/review/];

/** Phone-only bottom navigation. Slides away while scrolling down, returns on scroll up. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { status } = useSession();
  const { openAuth } = useUI();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < 6) return;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDDEN_ON.some((r) => r.test(pathname))) return null;

  const authed = status === "authenticated";
  const tabs = [
    { href: "/", label: "Explore", icon: "search", match: (p: string) => p === "/" || p.startsWith("/s") },
    { href: "/wishlists", label: "Wishlists", icon: "heart", match: (p: string) => p.startsWith("/wishlists") },
    { href: "/trips", label: "Trips", icon: "logo", match: (p: string) => p.startsWith("/trips") },
    authed
      ? { href: "/account", label: "Profile", icon: "user", match: (p: string) => p.startsWith("/account") || p.startsWith("/host") }
      : { href: "#login", label: "Log in", icon: "user", match: () => false },
  ];

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-white transition-transform duration-300 ease-abnb sm:hidden",
        hidden && "translate-y-full",
      )}
    >
      <ul className="mx-auto flex h-16 max-w-[560px] items-stretch justify-center gap-2">
        {tabs.map((t) => {
          const active = t.match(pathname);
          const content = (
            <span className={cn("flex h-full flex-col items-center justify-center gap-1 text-[10px] font-semibold", active ? "text-brand" : "text-muted")}>
              {t.icon === "logo" ? <LogoMark size={24} /> : <Icon name={t.icon} size={24} strokeWidth={active ? 2.2 : 1.8} />}
              {t.label}
            </span>
          );
          return (
            <li key={t.label} className="flex-1">
              {t.href === "#login" ? (
                <button type="button" className="h-full w-full" onClick={() => openAuth("login")}>
                  {content}
                </button>
              ) : (
                <Link
                  href={t.href}
                  className="block h-full"
                  onClick={(e) => {
                    if (!authed && t.href !== "/") {
                      e.preventDefault();
                      openAuth("login");
                    }
                  }}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
