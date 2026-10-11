"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AMENITIES, AMENITY_BY_ID, ESSENTIAL_AMENITIES, PROPERTY_TYPES, type RoomType } from "@/lib/constants";
import { activeFilterCount, parseSearchParams, toQueryString, type SearchFilters } from "@/lib/search-params";
import { cn } from "@/lib/utils";

import { Icon } from "../icons";
import { Modal } from "../ui/Modal";
import { Stepper } from "../ui/Stepper";

const BINS = 40;

function PriceHistogram({
  prices,
  min,
  max,
  low,
  high,
  onChange,
}: {
  prices: number[];
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(1, max - min);
  const bins = useMemo(() => {
    const counts = new Array(BINS).fill(0);
    for (const p of prices) counts[Math.min(BINS - 1, Math.floor(((p - min) / span) * BINS))]++;
    const peak = Math.max(1, ...counts);
    return counts.map((c) => c / peak);
  }, [prices, min, span]);

  const pct = (v: number) => ((v - min) / span) * 100;

  function drag(which: "low" | "high") {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const move = (ev: PointerEvent) => {
        const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
        const v = Math.round(min + ratio * span);
        if (which === "low") onChange(Math.min(v, high - 5), high);
        else onChange(low, Math.max(v, low + 5));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  }

  const key = (which: "low" | "high") => (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 50 : 5;
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -step : 0;
    if (!d) return;
    e.preventDefault();
    if (which === "low") onChange(Math.max(min, Math.min(low + d, high - 5)), high);
    else onChange(low, Math.min(max, Math.max(high + d, low + 5)));
  };

  return (
    <div className="px-4">
      <div className="flex h-[60px] items-end gap-px">
        {bins.map((h, i) => {
          const binStart = min + (i / BINS) * span;
          const inRange = binStart >= low - span / BINS && binStart <= high;
          return (
            <div
              key={i}
              className={cn("flex-1 rounded-t-[1px] transition-colors", inRange ? "bg-brand" : "bg-hairline")}
              style={{ height: `${Math.max(h > 0 ? 6 : 0, h * 100)}%` }}
            />
          );
        })}
      </div>
      <div ref={trackRef} className="relative h-0.5 bg-hairline">
        <div className="absolute h-0.5 bg-ink" style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }} />
        {(["low", "high"] as const).map((which) => {
          const v = which === "low" ? low : high;
          return (
            <button
              key={which}
              type="button"
              role="slider"
              aria-label={which === "low" ? "Minimum price" : "Maximum price"}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={v}
              onPointerDown={drag(which)}
              onKeyDown={key(which)}
              className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border border-[#B0B0B0] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-transform active:scale-110"
              style={{ left: `${pct(v)}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function PriceInput({ label, value, onCommit, plus }: { label: string; value: number; onCommit: (n: number) => void; plus?: boolean }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted">{label}</span>
      <label className="flex h-14 w-[100px] items-center justify-center rounded-full border border-[#B0B0B0] px-4 text-base focus-within:border-ink focus-within:shadow-ring">
        <span>$</span>
        <input
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
          onBlur={() => onCommit(Number(text) || 0)}
          onKeyDown={(e) => e.key === "Enter" && onCommit(Number(text) || 0)}
          className="w-full min-w-0 bg-transparent text-center outline-none"
          aria-label={label}
        />
        {plus && <span>+</span>}
      </label>
    </div>
  );
}

function Section({ title, sub, children, last }: { title: string; sub?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={cn("py-8", !last && "border-b border-divider")}>
      <h3 className="text-[22px] font-semibold leading-[26px]">{title}</h3>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function CountRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-base">{label}</span>
      <div className="flex items-center gap-4">
        <Stepper value={value} min={0} max={8} label={label.toLowerCase()} onChange={onChange} suffix="+" />
      </div>
    </div>
  );
}

export function FiltersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const applied = useMemo(() => parseSearchParams(new URLSearchParams(params.toString())), [params]);
  const [draft, setDraft] = useState<SearchFilters>(applied);
  const [count, setCount] = useState<number | null>(null);
  const [prices, setPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  const priceMin = prices.length ? Math.floor(Math.min(...prices) / 10) * 10 : 10;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices) / 50) * 50 : 1000;
  const low = draft.minPrice ?? priceMin;
  const high = draft.maxPrice ?? priceMax;

  // Live "Show N places" count (debounced).
  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/listings/count?${toQueryString(draft)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { count: number; prices: number[] };
        setCount(data.count);
        setPrices(data.prices);
      } catch {
        /* aborted */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [draft, open]);

  const set = (patch: Partial<SearchFilters>) => setDraft((d) => ({ ...d, ...patch }));
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function apply() {
    const qs = toQueryString({ ...draft, bounds: pathname === "/s" ? draft.bounds : null });
    router.push(`/s${qs ? `?${qs}` : ""}`, { scroll: false });
    onClose();
  }

  function clearAll() {
    set({
      minPrice: null,
      maxPrice: null,
      roomType: null,
      bedrooms: 0,
      beds: 0,
      baths: 0,
      amenities: [],
      propertyTypes: [],
      guestFavorite: false,
    });
  }

  const roomOptions: { label: string; value: RoomType | null }[] = [
    { label: "Any type", value: null },
    { label: "Room", value: "Private room" },
    { label: "Entire home", value: "Entire home" },
  ];

  const amenityList = showAllAmenities ? AMENITIES.map((a) => a.id) : ESSENTIAL_AMENITIES.slice(0, 8);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      width="max-w-[780px]"
      bodyClassName="px-6"
      footer={
        <div className="flex items-center justify-between">
          <button type="button" onClick={clearAll} className="rounded-lg px-2.5 py-2.5 -ml-2.5 text-base font-semibold underline hover:bg-faint">
            Clear all
          </button>
          <button type="button" onClick={apply} className="btn-dark min-w-[160px]" disabled={count === 0}>
            {loading && count === null ? (
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
              </span>
            ) : count === 0 ? (
              "No exact matches"
            ) : (
              `Show ${count ?? ""} place${count === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      }
    >
      <Section title="Type of place" sub="Search rooms, entire homes or any type of place.">
        <div className="grid grid-cols-3 rounded-2xl border border-hairline bg-white p-1">
          {roomOptions.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => set({ roomType: o.value })}
              className={cn(
                "h-12 rounded-xl text-sm font-semibold transition-colors sm:h-14 sm:text-base",
                draft.roomType === o.value ? "bg-ink text-white" : "hover:bg-faint",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Price range" sub="Nightly prices before fees and taxes">
        <PriceHistogram
          prices={prices}
          min={priceMin}
          max={priceMax}
          low={Math.max(priceMin, Math.min(low, priceMax))}
          high={Math.min(priceMax, Math.max(high, priceMin))}
          onChange={(l, h) => set({ minPrice: l <= priceMin ? null : l, maxPrice: h >= priceMax ? null : h })}
        />
        <div className="mt-8 flex items-center justify-between px-2">
          <PriceInput label="Minimum" value={low} onCommit={(n) => set({ minPrice: n <= priceMin ? null : Math.min(n, high - 5) })} />
          <PriceInput label="Maximum" value={high} plus={draft.maxPrice == null} onCommit={(n) => set({ maxPrice: n >= priceMax ? null : Math.max(n, low + 5) })} />
        </div>
      </Section>

      <Section title="Rooms and beds">
        <CountRow label="Bedrooms" value={draft.bedrooms} onChange={(n) => set({ bedrooms: n })} />
        <CountRow label="Beds" value={draft.beds} onChange={(n) => set({ beds: n })} />
        <CountRow label="Bathrooms" value={draft.baths} onChange={(n) => set({ baths: n })} />
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-3">
          {amenityList.map((id) => {
            const a = AMENITY_BY_ID[id];
            if (!a) return null;
            const on = draft.amenities.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => set({ amenities: toggleIn(draft.amenities, id) })}
                aria-pressed={on}
                className={cn(
                  "flex h-12 items-center gap-2 rounded-full border px-5 text-base transition-colors",
                  on ? "border-[2px] border-ink bg-faint px-[19px]" : "border-hairline hover:border-ink",
                )}
              >
                <Icon name={a.icon} size={20} />
                {a.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => setShowAllAmenities((s) => !s)} className="mt-6 flex items-center gap-2 text-base font-semibold underline">
          {showAllAmenities ? "Show less" : "Show more"}
          <Icon name={showAllAmenities ? "chevron-up" : "chevron-down"} size={14} strokeWidth={2.5} />
        </button>
      </Section>

      <Section title="Standout stays">
        <button
          type="button"
          aria-pressed={draft.guestFavorite}
          onClick={() => set({ guestFavorite: !draft.guestFavorite })}
          className={cn(
            "flex w-full max-w-[290px] flex-col items-start rounded-xl border p-4 text-left transition-colors",
            draft.guestFavorite ? "border-[2px] border-ink bg-faint p-[15px]" : "border-hairline hover:border-ink",
          )}
        >
          <Icon name="medal" size={28} />
          <span className="mt-6 text-base font-semibold">Guest favourite</span>
          <span className="text-sm text-muted">The most loved homes on Nestly</span>
        </button>
      </Section>

      <Section title="Property type" last>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PROPERTY_TYPES.map((p) => {
            const on = draft.propertyTypes.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => set({ propertyTypes: toggleIn(draft.propertyTypes, p.id) })}
                className={cn(
                  "flex h-[110px] flex-col justify-between rounded-xl border p-4 text-left transition-colors",
                  on ? "border-[2px] border-ink bg-faint p-[15px]" : "border-hairline hover:border-ink",
                )}
              >
                <Icon name={p.icon} size={30} />
                <span className="text-base font-semibold">{p.id}</span>
              </button>
            );
          })}
        </div>
      </Section>
    </Modal>
  );
}

export function FiltersButton({ round }: { round?: boolean }) {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(parseSearchParams(new URLSearchParams(params.toString())));
  return (
    <>
      {round ? (
        <button
          type="button"
          aria-label="Filters"
          onClick={() => setOpen(true)}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-white"
        >
          <Icon name="filters" size={16} strokeWidth={2} />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 rounded-xl border px-4 text-xs font-semibold transition-colors hover:border-ink hover:bg-faint",
            count > 0 ? "border-[2px] border-ink bg-faint px-[15px]" : "border-hairline",
          )}
        >
          <Icon name="filters" size={16} strokeWidth={2} />
          Filters
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{count}</span>
          )}
        </button>
      )}
      <FiltersModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

