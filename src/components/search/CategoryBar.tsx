"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { setDisplayTotal, useDisplayTotal } from "@/lib/display-total";
import { Chevron, Icon } from "../icons";
import { FiltersButton } from "./FiltersModal";

function CategoryLinks({ active }: { active: string | null }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: true });

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Keep the active category in view on load.
  useEffect(() => {
    const el = scroller.current?.querySelector<HTMLElement>("[aria-current='page']");
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const hrefFor = (slug: string | null) => {
    const q = new URLSearchParams(params.toString());
    q.delete("bounds");
    if (slug) q.set("category", slug);
    else q.delete("category");
    const base = pathname === "/s" ? "/s" : "/";
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={scroller}
        onScroll={update}
        className="scrollbar-none flex items-center gap-8 overflow-x-auto scroll-smooth"
      >
        {CATEGORIES.map((c) => {
          const isActive = active === c.slug;
          return (
            <Link
              key={c.slug}
              href={isActive ? hrefFor(null) : hrefFor(c.slug)}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex shrink-0 flex-col items-center gap-2 border-b-2 pb-2.5 pt-1 transition-[opacity,border-color,color] duration-200",
                isActive ? "border-ink text-ink opacity-100" : "border-transparent text-muted opacity-[0.72] hover:border-hairline hover:text-ink hover:opacity-100",
              )}
            >
              <Icon name={c.icon} size={24} strokeWidth={1.5} />
              <span className="whitespace-nowrap text-xs font-semibold">{c.label}</span>
            </Link>
          );
        })}
      </div>
      {edges.left && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-20 items-center bg-gradient-to-r from-white from-60% to-transparent">
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollBy(-1)}
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-black/30 bg-white transition-transform hover:scale-[1.04] hover:shadow-pill-hover"
          >
            <Chevron dir="left" size={10} />
          </button>
        </div>
      )}
      {edges.right && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-20 items-center justify-end bg-gradient-to-l from-white from-60% to-transparent">
          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollBy(1)}
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-black/30 bg-white transition-transform hover:scale-[1.04] hover:shadow-pill-hover"
          >
            <Chevron dir="right" size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

function TotalToggle() {
  const on = useDisplayTotal();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setDisplayTotal(!on)}
      className="hidden h-12 shrink-0 items-center gap-4 rounded-xl border border-hairline px-4 text-xs font-semibold hover:border-ink hover:bg-faint 2xl:flex"
    >
      <span className="whitespace-nowrap">Display total before taxes</span>
      <span className={cn("relative h-8 w-12 rounded-full transition-colors duration-200", on ? "bg-ink" : "bg-[#B0B0B0]")}>
        <span
          className={cn(
            "absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white transition-transform duration-200 ease-abnb",
            on ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        >
          {on && <Icon name="check" size={12} strokeWidth={3} />}
        </span>
      </span>
    </button>
  );
}

export function CategoryBar({ active, sticky = true }: { active: string | null; sticky?: boolean }) {
  return (
    <div className={cn("z-30 bg-white", sticky && "sticky top-[72px] sm:top-20")}>
      <div className="page-gutter mx-auto flex max-w-[2520px] items-center gap-6 pt-3 sm:pt-5">
        <CategoryLinks active={active} />
        <div className="hidden shrink-0 items-center gap-4 pb-2 sm:flex">
          <FiltersButton />
          <TotalToggle />
        </div>
      </div>
    </div>
  );
}
