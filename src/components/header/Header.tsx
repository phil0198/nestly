"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo } from "../Logo";
import { Icon } from "../icons";
import { UserMenu } from "./UserMenu";
import { CompactPill, DesktopSearch, type Segment } from "./DesktopSearch";
import { MobileSearchPill } from "./MobileSearch";
import { useSearchDraft } from "./useSearchDraft";

export type HeaderVariant = "search" | "listing" | "plain";

interface HeaderProps {
  variant?: HeaderVariant;
  /** Full-bleed container (browse/search) vs. 1280px container (listing, account pages). */
  wide?: boolean;
  sticky?: boolean;
  /** Shown on the right of the mobile pill (e.g. filters button on /s). */
  mobileAction?: React.ReactNode;
  /** Hide the mobile pill entirely (pages with their own mobile top bar). */
  hideMobile?: boolean;
}

function SearchArea({ expanded, setExpanded }: { expanded: boolean; setExpanded: (v: boolean) => void }) {
  const { summary } = useSearchDraft();
  const [segment, setSegment] = useState<Segment | null>(null);

  const open = useCallback(
    (s: Segment) => {
      setSegment(s);
      setExpanded(true);
    },
    [setExpanded],
  );
  const close = useCallback(() => {
    setSegment(null);
    setExpanded(false);
  }, [setExpanded]);

  useEffect(() => {
    if (!expanded) setSegment(null);
  }, [expanded]);

  return (
    <>
      <div className="absolute left-1/2 top-4 -translate-x-1/2">
        <CompactPill where={summary.where} when={summary.when} who={summary.who} onOpen={open} hidden={expanded} />
      </div>
      <div className={cn("absolute inset-x-0 top-[88px] px-10", !expanded && "pointer-events-none")}>
        <DesktopSearch open={expanded} segment={segment} setSegment={setSegment} onClose={close} />
      </div>
    </>
  );
}

function StaysTabs({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-0 flex h-20 -translate-x-1/2 items-center gap-2 text-base transition-all duration-200 ease-abnb",
        visible ? "opacity-100" : "pointer-events-none translate-y-6 scale-75 opacity-0",
      )}
    >
      <span className="relative px-4 py-2.5 font-semibold text-ink after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-[18px] after:-translate-x-1/2 after:bg-ink">
        Stays
      </span>
      <span className="cursor-default rounded-full px-4 py-2.5 text-muted hover:bg-faint hover:text-ink" title="Coming soon">
        Experiences
      </span>
    </div>
  );
}

export function Header({ variant = "search", wide = true, sticky = true, mobileAction, hideMobile }: HeaderProps) {
  const [expanded, setExpanded] = useState(false);
  const { status } = useSession();

  // Collapse the expanded search when the page scrolls, mirroring the reference behaviour.
  useEffect(() => {
    if (!expanded) return;
    const startY = window.scrollY;
    // Ignore incidental scrolls (focus, scroll-into-view); collapse once the user really scrolls.
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 30) setExpanded(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const showSearch = variant !== "plain";

  return (
    <>
      <header
        className={cn(
          "z-40 w-full bg-white",
          sticky ? "sticky top-0" : "relative",
          variant === "listing" ? "border-b border-divider" : "border-b border-divider",
        )}
      >
        {/* Desktop / tablet */}
        <div
          className={cn(
            "relative hidden transition-[height] duration-200 ease-abnb sm:block",
            wide ? "page-gutter mx-auto max-w-[2520px]" : "container-narrow",
            expanded ? "h-[168px]" : "h-20",
          )}
        >
          <div className="relative flex h-20 items-center justify-between">
            <div className="flex flex-1 items-center">
              <Logo />
            </div>
            <div className="flex flex-1 items-center justify-end gap-1">
              <Link
                href="/become-a-host"
                className="hidden whitespace-nowrap rounded-full px-3 py-3 text-sm font-semibold hover:bg-faint md:block"
              >
                {status === "authenticated" ? "Switch to hosting" : "Host your home"}
              </Link>
              <button
                type="button"
                aria-label="Choose a language and currency"
                className="mr-2 hidden h-10 w-10 items-center justify-center rounded-full hover:bg-faint md:flex"
              >
                <Icon name="globe" size={16} strokeWidth={1.8} />
              </button>
              <UserMenu />
            </div>
          </div>
          {showSearch && (
            <>
              <StaysTabs visible={expanded} />
              <Suspense fallback={null}>
                <SearchArea expanded={expanded} setExpanded={setExpanded} />
              </Suspense>
            </>
          )}
        </div>

        {/* Phone */}
        {!hideMobile && (
          <div className="flex h-[72px] items-center gap-2.5 px-6 sm:hidden">
            {showSearch ? (
              <Suspense fallback={<div className="h-14 flex-1 rounded-full shadow-pill" />}>
                <MobileSearchPill />
              </Suspense>
            ) : (
              <div className="flex flex-1 items-center justify-between">
                <Logo compactBelow="never" />
              </div>
            )}
            {mobileAction}
          </div>
        )}
      </header>
      {expanded && (
        <div className="fixed inset-0 z-[35] bg-black/25 animate-fade-in" onClick={() => setExpanded(false)} aria-hidden />
      )}
    </>
  );
}
