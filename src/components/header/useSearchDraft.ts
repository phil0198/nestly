"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, isSameMonth } from "date-fns";
import { parseSearchParams, toQueryString, guestSummary } from "@/lib/search-params";
import type { Guests } from "../ui/GuestPicker";

export interface SearchDraft {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: Guests;
}

export function formatRange(checkIn: Date | null, checkOut: Date | null, empty = "Any week") {
  if (!checkIn) return empty;
  if (!checkOut) return format(checkIn, "MMM d");
  if (isSameMonth(checkIn, checkOut)) return `${format(checkIn, "MMM d")} – ${format(checkOut, "d")}`;
  return `${format(checkIn, "MMM d")} – ${format(checkOut, "MMM d")}`;
}

/** Search form state seeded from the URL, plus a submit that navigates to /s. */
export function useSearchDraft() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = useMemo(() => parseSearchParams(new URLSearchParams(params.toString())), [params]);

  const fromUrl = useCallback(
    (): SearchDraft => ({
      location: current.location,
      checkIn: current.checkIn,
      checkOut: current.checkOut,
      guests: { adults: current.adults, children: current.children, infants: current.infants, pets: current.pets },
    }),
    [current],
  );

  const [draft, setDraft] = useState<SearchDraft>(fromUrl);
  useEffect(() => setDraft(fromUrl()), [fromUrl]);

  const submit = useCallback(
    (override?: Partial<SearchDraft>) => {
      const d = { ...draft, ...override };
      const keepFilters = pathname === "/s" ? current : { ...current, category: null };
      const qs = toQueryString({
        ...keepFilters,
        bounds: null,
        location: d.location,
        checkIn: d.checkIn,
        checkOut: d.checkOut,
        ...d.guests,
      });
      router.push(`/s${qs ? `?${qs}` : ""}`);
    },
    [draft, pathname, current, router],
  );

  const reset = useCallback(() => setDraft(fromUrl()), [fromUrl]);

  return {
    draft,
    setDraft,
    submit,
    reset,
    applied: current,
    summary: {
      where: current.location || "Anywhere",
      when: formatRange(current.checkIn, current.checkOut),
      who: guestSummary(current),
    },
  };
}
