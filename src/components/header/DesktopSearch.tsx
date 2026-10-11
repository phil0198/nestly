"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DESTINATIONS, SUGGESTED_DESTINATIONS } from "@/lib/constants";
import { guestSummary } from "@/lib/search-params";
import { format } from "date-fns";
import { Icon } from "../icons";
import { Calendar } from "../ui/Calendar";
import { GuestPicker } from "../ui/GuestPicker";
import { useSearchDraft } from "./useSearchDraft";

export type Segment = "where" | "checkin" | "checkout" | "who";

export function SearchGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round">
      <circle cx="10" cy="10" r="7.5" />
      <path d="m15.8 15.8 6 6" />
    </svg>
  );
}

/** The compact "Anywhere | Any week | Add guests" pill. */
export function CompactPill({
  where,
  when,
  who,
  onOpen,
  hidden,
}: {
  where: string;
  when: string;
  who: string;
  onOpen: (s: Segment) => void;
  hidden?: boolean;
}) {
  const hasWho = who !== "Add guests";
  return (
    <div
      className={cn(
        "flex h-12 items-center rounded-full border border-hairline bg-white text-sm shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 ease-abnb hover:shadow-pill-hover",
        hidden && "pointer-events-none -translate-y-2 scale-[1.6] opacity-0",
      )}
      aria-hidden={hidden}
    >
      <button type="button" onClick={() => onOpen("where")} className="h-full max-w-[180px] truncate pl-6 pr-4 font-semibold">
        {where}
      </button>
      <span className="h-6 w-px bg-hairline" />
      <button type="button" onClick={() => onOpen("checkin")} className="h-full truncate px-4 font-semibold">
        {when}
      </button>
      <span className="h-6 w-px bg-hairline" />
      <button type="button" onClick={() => onOpen("who")} className="flex h-full items-center gap-3 pl-4 pr-2">
        <span className={cn("truncate", hasWho ? "font-semibold text-ink" : "text-muted")}>{who}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
          <SearchGlyph />
        </span>
      </button>
    </div>
  );
}

export function DesktopSearch({
  open,
  segment,
  setSegment,
  onClose,
}: {
  open: boolean;
  segment: Segment | null;
  setSegment: (s: Segment | null) => void;
  onClose: () => void;
}) {
  const { draft, setDraft, submit, reset } = useSearchDraft();
  const [flex, setFlex] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (segment === "where") inputRef.current?.focus({ preventScroll: true });
  }, [segment]);

  const active = segment !== null;
  const query = draft.location.trim().toLowerCase();
  const matches = query
    ? DESTINATIONS.filter((d) => d.label.toLowerCase().includes(query) || d.query.toLowerCase().includes(query))
    : SUGGESTED_DESTINATIONS;

  function go() {
    submit();
    onClose();
  }

  const seg = (s: Segment, row = false) =>
    cn(
      "relative flex h-full min-w-0 justify-center rounded-full px-8 text-left transition-colors duration-150",
      row ? "flex-row items-center" : "flex-col",
      segment === s ? "bg-white shadow-[0_3px_12px_rgba(0,0,0,0.15)]" : active ? "hover:bg-[#DDDDDD]" : "hover:bg-[#EBEBEB]",
    );

  const Divider = ({ hide }: { hide: boolean }) => (
    <span className={cn("h-8 w-px shrink-0 bg-hairline transition-opacity", hide && "opacity-0")} />
  );

  const clearBtn = (show: boolean, onClear: () => void) =>
    show ? (
      <button
        type="button"
        aria-label="Clear"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-hairline"
      >
        <Icon name="close" size={10} strokeWidth={3} />
      </button>
    ) : null;

  const g = draft.guests;
  const who = guestSummary(g, "Add guests");

  return (
    <div
      ref={barRef}
      className={cn(
        "relative mx-auto w-full max-w-[850px] origin-top transition-all duration-200 ease-abnb",
        open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-[58px] scale-[0.42] opacity-0",
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className={cn(
          "flex h-[66px] items-center rounded-full border border-hairline shadow-[0_3px_12px_0_rgba(0,0,0,0.1)] transition-colors",
          active ? "bg-[#EBEBEB]" : "bg-white",
        )}
      >
        <div className={cn(seg("where"), "flex-[1.3] cursor-text")} onClick={() => setSegment("where")}>
          <label htmlFor="where-input" className="text-xs font-bold">
            Where
          </label>
          <input
            id="where-input"
            ref={inputRef}
            value={draft.location}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            onFocus={() => setSegment("where")}
            placeholder="Search destinations"
            autoComplete="off"
            className="w-full truncate bg-transparent pr-6 text-sm text-ink outline-none placeholder:text-muted"
          />
          {clearBtn(segment === "where" && !!draft.location, () => setDraft({ ...draft, location: "" }))}
        </div>
        <Divider hide={segment === "where" || segment === "checkin"} />
        <button type="button" className={cn(seg("checkin"), "flex-1")} onClick={() => setSegment("checkin")}>
          <span className="text-xs font-bold">Check in</span>
          <span className={cn("truncate text-sm", draft.checkIn ? "text-ink" : "text-muted")}>
            {draft.checkIn ? format(draft.checkIn, "MMM d") : "Add dates"}
          </span>
          {clearBtn(segment === "checkin" && !!draft.checkIn, () => setDraft({ ...draft, checkIn: null, checkOut: null }))}
        </button>
        <Divider hide={segment === "checkin" || segment === "checkout"} />
        <button type="button" className={cn(seg("checkout"), "flex-1")} onClick={() => setSegment("checkout")}>
          <span className="text-xs font-bold">Check out</span>
          <span className={cn("truncate text-sm", draft.checkOut ? "text-ink" : "text-muted")}>
            {draft.checkOut ? format(draft.checkOut, "MMM d") : "Add dates"}
          </span>
          {clearBtn(segment === "checkout" && !!draft.checkOut, () => setDraft({ ...draft, checkOut: null }))}
        </button>
        <Divider hide={segment === "checkout" || segment === "who"} />
        <div
          role="button"
          tabIndex={0}
          className={cn(seg("who", true), "flex-[1.8] !justify-between !pr-2")}
          onClick={() => setSegment("who")}
          onKeyDown={(e) => e.key === "Enter" && setSegment("who")}
        >
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-bold">Who</span>
            <span className={cn("truncate text-sm", who !== "Add guests" ? "text-ink" : "text-muted")}>{who}</span>
          </div>
          {segment === "who" && who !== "Add guests" && (
            <button
              type="button"
              aria-label="Clear guests"
              onClick={(e) => {
                e.stopPropagation();
                setDraft({ ...draft, guests: { adults: 0, children: 0, infants: 0, pets: 0 } });
              }}
              className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-hairline"
            >
              <Icon name="close" size={10} strokeWidth={3} />
            </button>
          )}
          <button
            type="submit"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex h-12 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full text-base font-semibold text-white transition-all duration-200 ease-abnb",
              active ? "w-[116px] px-4" : "w-12",
            )}
            style={{ background: "var(--brand-gradient)" }}
          >
            <SearchGlyph size={16} />
            <span className={cn("whitespace-nowrap transition-opacity", active ? "opacity-100" : "hidden opacity-0")}>Search</span>
          </button>
        </div>
      </form>

      {/* ---- Panels ---- */}
      {segment === "where" && (
        <div className="absolute left-0 top-[78px] z-10 w-[425px] rounded-[32px] bg-white py-4 shadow-float animate-pop-in">
          {!query && <div className="px-8 pb-2 pt-2 text-xs font-semibold">Suggested destinations</div>}
          {matches.length === 0 && (
            <div className="px-8 py-4 text-sm text-muted">No matches yet — press Search to look for &ldquo;{draft.location}&rdquo;.</div>
          )}
          <ul>
            {matches.map((d) => (
              <li key={d.label}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ ...draft, location: d.query });
                    setSegment("checkin");
                  }}
                  className="flex w-full items-center gap-4 px-8 py-2 text-left hover:bg-faint"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EBEBEB]/70 text-ink">
                    <Icon name={query ? "location" : d.icon} size={22} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base text-ink">{d.label}</span>
                    {!query && <span className="block truncate text-sm text-muted">{d.sub}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(segment === "checkin" || segment === "checkout") && (
        <div className="absolute left-1/2 top-[78px] z-10 w-[850px] -translate-x-1/2 rounded-[32px] bg-white px-8 pb-6 pt-6 shadow-float animate-pop-in">
          <div className="mx-auto mb-6 flex w-fit rounded-full bg-[#EBEBEB] p-1 text-sm font-semibold">
            <span className="rounded-full bg-white px-5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">Dates</span>
            <span className="cursor-not-allowed px-5 py-2 text-muted" title="Coming soon">
              Months
            </span>
            <span className="cursor-not-allowed px-5 py-2 text-muted" title="Coming soon">
              Flexible
            </span>
          </div>
          <Calendar
            checkIn={draft.checkIn}
            checkOut={draft.checkOut}
            onChange={(r) => {
              setDraft({ ...draft, ...r });
              if (r.checkIn && !r.checkOut) setSegment("checkout");
            }}
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {["Exact dates", "± 1 day", "± 2 days", "± 3 days", "± 7 days", "± 14 days"].map((label, i) => (
              <button
                type="button"
                key={label}
                onClick={() => setFlex(i)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs transition-colors",
                  flex === i ? "border-[1.5px] border-ink bg-faint" : "border-hairline hover:border-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {segment === "who" && (
        <div className="absolute right-0 top-[78px] z-10 w-[425px] rounded-[32px] bg-white px-8 py-4 shadow-float animate-pop-in">
          <GuestPicker value={draft.guests} onChange={(guests) => setDraft({ ...draft, guests })} />
        </div>
      )}
    </div>
  );
}
