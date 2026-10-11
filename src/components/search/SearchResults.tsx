"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListingCardData } from "@/lib/listings";
import { cn } from "@/lib/utils";
import { Icon, Chevron } from "../icons";
import { ListingCard } from "../listing/ListingCard";

const SearchMap = dynamic(() => import("../map/SearchMap").then((m) => m.SearchMap), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

const PAGE_SIZE = 18;

function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const nums: (number | "…")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const btn = "flex h-8 w-8 items-center justify-center rounded-full text-sm";
  return (
    <nav aria-label="Search results pages" className="flex items-center justify-center gap-2 py-8">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(btn, "hover:bg-faint")} aria-label="Previous">
          <Chevron dir="left" size={12} />
        </Link>
      ) : (
        <span className={cn(btn, "text-hairline")}>
          <Chevron dir="left" size={12} />
        </span>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="px-1">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(btn, n === page ? "bg-ink font-semibold text-white" : "hover:bg-faint")}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className={cn(btn, "hover:bg-faint")} aria-label="Next">
          <Chevron dir="right" size={12} />
        </Link>
      ) : (
        <span className={cn(btn, "text-hairline")}>
          <Chevron dir="right" size={12} />
        </span>
      )}
    </nav>
  );
}

export function SearchResults({
  listings,
  heading,
  nights,
  page,
  hasBounds,
}: {
  listings: ListingCardData[];
  heading: string;
  nights: number;
  page: number;
  hasBounds: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [hovered, setHovered] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const pages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageItems = listings.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => {
    document.body.style.overflow = showMap ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMap]);

  const hrefFor = (p: number) => {
    const q = new URLSearchParams(params.toString());
    if (p > 1) q.set("page", String(p));
    else q.delete("page");
    return `${pathname}?${q.toString()}`;
  };

  const onBounds = useCallback(
    (b: [number, number, number, number]) => {
      const q = new URLSearchParams(params.toString());
      q.set("bounds", b.map((n) => n.toFixed(4)).join(","));
      q.delete("location");
      q.delete("page");
      router.replace(`/s?${q.toString()}`, { scroll: false });
    },
    [params, router],
  );

  return (
    <div className="relative lg:flex">
      {/* List */}
      <section
        className={cn(
          "page-gutter min-w-0 pb-28 pt-6 lg:w-[58%] lg:pb-12 lg:pr-6 xl:w-[60%]",
          showMap && "hidden lg:block",
        )}
      >
        <h1 className="mb-6 text-sm font-semibold">{heading}</h1>
        {listings.length === 0 ? (
          <div className="py-10">
            <h2 className="text-[22px] font-semibold leading-[26px]">No exact matches</h2>
            <p className="mt-2 text-base text-muted">Try changing or removing some of your filters or adjusting your search area.</p>
            <Link href="/s" className="btn-outline mt-6">
              Remove all filters
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
              {pageItems.map((l) => (
                <ListingCard key={l.id} listing={l} mode="search" nights={nights} onHover={setHovered} />
              ))}
            </div>
            <Pagination page={current} pages={pages} hrefFor={hrefFor} />
            <p className="text-center text-sm text-muted">
              {listings.length > PAGE_SIZE
                ? `${(current - 1) * PAGE_SIZE + 1} – ${Math.min(current * PAGE_SIZE, listings.length)} of ${listings.length} places to stay`
                : `${listings.length} place${listings.length === 1 ? "" : "s"} to stay`}
            </p>
          </>
        )}
      </section>

      {/* Map */}
      <section
        aria-label="Map"
        className={cn(
          "bg-[#E8EAED]",
          showMap
            ? "fixed inset-x-0 bottom-0 top-[72px] z-20 sm:top-[152px] lg:sticky"
            : "hidden lg:block",
          "lg:sticky lg:top-[158px] lg:h-[calc(100vh-158px)] lg:flex-1",
        )}
      >
        <SearchMap listings={pageItems} hoveredId={hovered} onBoundsChange={onBounds} keepViewport={hasBounds} nights={nights} />
      </section>

      {/* Floating Map / List toggle (phones & tablets) */}
      <button
        type="button"
        onClick={() => {
          setShowMap((s) => !s);
          window.scrollTo({ top: 0 });
        }}
        className="fixed bottom-24 left-1/2 z-30 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-transform hover:scale-[1.04] sm:bottom-12 lg:hidden"
      >
        {showMap ? "Show list" : "Show map"}
        <Icon name={showMap ? "list" : "map"} size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
