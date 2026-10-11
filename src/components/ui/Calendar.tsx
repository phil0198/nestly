"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Chevron } from "../icons";

export interface DateRange {
  checkIn: Date | null;
  checkOut: Date | null;
}

export interface BlockedRange {
  checkIn: Date | string;
  checkOut: Date | string;
}

interface CalendarProps extends DateRange {
  onChange: (range: DateRange) => void;
  /** Number of months rendered side-by-side (desktop) */
  months?: number;
  /** Render months stacked vertically (mobile sheets) */
  vertical?: boolean;
  verticalCount?: number;
  blocked?: BlockedRange[];
  minNights?: number;
  className?: string;
  /** Size of a day cell in px (reference: 48 desktop search, 44 listing page) */
  cell?: number;
  hideWeekdays?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Converts reservation ranges into a set of blocked "night" keys (yyyy-MM-dd). */
function useBlockedNights(blocked?: BlockedRange[]) {
  return useMemo(() => {
    const set = new Set<string>();
    for (const r of blocked ?? []) {
      const start = startOfDay(new Date(r.checkIn));
      const end = addDays(startOfDay(new Date(r.checkOut)), -1);
      if (isAfter(start, end)) continue;
      for (const d of eachDayOfInterval({ start, end })) set.add(format(d, "yyyy-MM-dd"));
    }
    return set;
  }, [blocked]);
}

export function Calendar({
  checkIn,
  checkOut,
  onChange,
  months = 2,
  vertical,
  verticalCount = 12,
  blocked,
  minNights = 1,
  className,
  cell = 48,
  hideWeekdays,
}: CalendarProps) {
  const today = startOfDay(new Date());
  const [offset, setOffset] = useState(() => {
    if (!checkIn) return 0;
    const diff = (checkIn.getFullYear() - today.getFullYear()) * 12 + checkIn.getMonth() - today.getMonth();
    return Math.max(0, Math.min(diff, 22));
  });
  const [hover, setHover] = useState<Date | null>(null);
  const blockedNights = useBlockedNights(blocked);
  const isNightBlocked = (d: Date) => blockedNights.has(format(d, "yyyy-MM-dd"));

  // When choosing a checkout, the stay can't cross a blocked night: find the first blocked night after check-in.
  const firstBlockedAfterCheckIn = useMemo(() => {
    if (!checkIn || checkOut) return null;
    for (let i = 0; i < 400; i++) {
      const d = addDays(checkIn, i);
      if (blockedNights.has(format(d, "yyyy-MM-dd"))) return d;
    }
    return null;
  }, [checkIn, checkOut, blockedNights]);

  const selectingCheckout = !!checkIn && !checkOut;

  function dayState(d: Date) {
    const past = isBefore(d, today);
    let disabled = past;
    let struck = false;
    if (!past) {
      if (selectingCheckout && checkIn) {
        if (isAfter(d, checkIn)) {
          // valid checkout if no blocked night in [checkIn, d)
          if (firstBlockedAfterCheckIn && isAfter(d, firstBlockedAfterCheckIn)) {
            disabled = true;
            struck = isNightBlocked(d);
          } else if (addDays(checkIn, minNights) > d) {
            disabled = true;
          }
        } else if (isNightBlocked(d)) {
          disabled = true;
          struck = true;
        }
      } else if (isNightBlocked(d)) {
        // Can't start a stay on a blocked night (but it can still be a checkout day).
        disabled = true;
        struck = true;
      }
    }
    const isStart = !!checkIn && isSameDay(d, checkIn);
    const isEnd = !!checkOut && isSameDay(d, checkOut);
    const rangeEnd = checkOut ?? (selectingCheckout && hover && checkIn && isAfter(hover, checkIn) ? hover : null);
    const inRange = !!checkIn && !!rangeEnd && isAfter(d, checkIn) && isBefore(d, rangeEnd);
    const isHoverEnd = !checkOut && !!rangeEnd && isSameDay(d, rangeEnd);
    return { disabled, struck, isStart, isEnd, inRange, isHoverEnd };
  }

  function select(d: Date) {
    const { disabled } = dayState(d);
    if (disabled) {
      // Clicking a disabled checkout date with a check-in already set restarts selection if it's a valid start.
      if (selectingCheckout && !isNightBlocked(d) && !isBefore(d, today)) onChange({ checkIn: d, checkOut: null });
      return;
    }
    if (!checkIn || checkOut) return onChange({ checkIn: d, checkOut: null });
    if (!isAfter(d, checkIn)) return onChange({ checkIn: d, checkOut: null });
    onChange({ checkIn, checkOut: d });
  }

  const monthList = vertical
    ? Array.from({ length: verticalCount }, (_, i) => addMonths(startOfMonth(today), i))
    : Array.from({ length: months }, (_, i) => addMonths(startOfMonth(today), offset + i));

  return (
    <div className={cn("relative select-none", className)}>
      {!vertical && (
        <>
          <button
            type="button"
            aria-label="Previous month"
            disabled={offset === 0}
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            className="absolute left-0 top-0 z-[1] flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint disabled:cursor-default disabled:text-[#EBEBEB] disabled:hover:bg-transparent"
          >
            <Chevron dir="left" size={12} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={offset >= 22}
            onClick={() => setOffset((o) => o + 1)}
            className="absolute right-0 top-0 z-[1] flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint disabled:text-[#EBEBEB]"
          >
            <Chevron dir="right" size={12} />
          </button>
        </>
      )}
      <div className={cn(vertical ? "flex flex-col gap-8" : "flex justify-center gap-[52px]")}>
        {monthList.map((month) => {
          const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
          const lead = getDay(days[0]);
          return (
            <div key={month.toISOString()} style={{ width: cell * 7 }}>
              <div className={cn("pb-6 pt-1 text-base font-semibold", vertical ? "text-left" : "text-center")}>
                {format(month, "MMMM yyyy")}
              </div>
              <div className={cn("grid grid-cols-7 pb-2", hideWeekdays && "hidden")}>
                {WEEKDAYS.map((w) => (
                  <div key={w} className="text-center text-xs font-semibold text-muted">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7" onMouseLeave={() => setHover(null)}>
                {Array.from({ length: lead }).map((_, i) => (
                  <div key={`b${i}`} style={{ height: cell - 2 }} />
                ))}
                {days.map((d) => {
                  const s = dayState(d);
                  const selected = s.isStart || s.isEnd;
                  const col = getDay(d);
                  const bandLeft = s.inRange || s.isEnd || s.isHoverEnd;
                  const bandRight = s.inRange || (s.isStart && (!!checkOut || (selectingCheckout && !!hover && isAfter(hover, d))));
                  return (
                    <div key={d.toISOString()} className="relative" style={{ height: cell - 2 }}>
                      {(bandLeft || bandRight) && (
                        <div
                          className={cn(
                            "absolute inset-y-0 bg-faint",
                            bandLeft ? "left-0" : "left-1/2",
                            bandRight ? "right-0" : "right-1/2",
                            col === 0 && "rounded-l-full",
                            col === 6 && "rounded-r-full",
                          )}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => select(d)}
                        onMouseEnter={() => setHover(d)}
                        aria-label={format(d, "EEEE, MMMM d, yyyy")}
                        aria-pressed={selected}
                        aria-disabled={s.disabled}
                        className={cn(
                          "relative z-[1] mx-auto flex h-full items-center justify-center rounded-full text-sm font-semibold transition-colors",
                          selected
                            ? "bg-ink text-white"
                            : s.disabled
                              ? cn("cursor-default text-disabled", s.struck && "line-through")
                              : "border-[1.5px] border-transparent text-ink hover:border-ink",
                        )}
                        style={{ width: cell - 2 }}
                      >
                        {format(d, "d")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
