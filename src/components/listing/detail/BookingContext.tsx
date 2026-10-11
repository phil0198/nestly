"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isValid, parseISO } from "date-fns";
import { isoDay } from "@/lib/search-params";
import { nightsBetween, priceBreakdown, type PriceBreakdown } from "@/lib/pricing";
import type { Guests } from "../../ui/GuestPicker";
import type { BlockedRange, DateRange } from "../../ui/Calendar";

interface BookingState extends DateRange {
  guests: Guests;
  setDates: (r: DateRange) => void;
  setGuests: (g: Guests) => void;
  nights: number;
  price: PriceBreakdown;
  blocked: BlockedRange[];
  maxGuests: number;
  allowPets: boolean;
  bookHref: string;
}

const Ctx = createContext<BookingState | null>(null);

function parseDay(v: string | null) {
  if (!v) return null;
  const d = parseISO(v);
  return isValid(d) ? d : null;
}

export function BookingProvider({
  listingId,
  nightly,
  cleaningFee,
  blocked,
  maxGuests,
  allowPets,
  children,
}: {
  listingId: string;
  nightly: number;
  cleaningFee: number;
  blocked: BlockedRange[];
  maxGuests: number;
  allowPets: boolean;
  children: React.ReactNode;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const [range, setRange] = useState<DateRange>(() => ({
    checkIn: parseDay(params.get("checkin")),
    checkOut: parseDay(params.get("checkout")),
  }));
  const [guests, setGuests] = useState<Guests>(() => ({
    adults: Math.max(1, Number(params.get("adults")) || 1),
    children: Number(params.get("children")) || 0,
    infants: Number(params.get("infants")) || 0,
    pets: Number(params.get("pets")) || 0,
  }));

  // Mirror selection into the URL (shareable, survives refresh) without adding history entries.
  useEffect(() => {
    const q = new URLSearchParams();
    if (range.checkIn) q.set("checkin", isoDay(range.checkIn));
    if (range.checkOut) q.set("checkout", isoDay(range.checkOut));
    if (guests.adults > 1) q.set("adults", String(guests.adults));
    if (guests.children) q.set("children", String(guests.children));
    if (guests.infants) q.set("infants", String(guests.infants));
    if (guests.pets) q.set("pets", String(guests.pets));
    const qs = q.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    if (next !== `${pathname}${params.toString() ? `?${params.toString()}` : ""}`) {
      window.history.replaceState(null, "", next);
    }
  }, [range, guests, pathname, params]);

  const setDates = useCallback((r: DateRange) => setRange(r), []);
  const nights = range.checkIn && range.checkOut ? nightsBetween(range.checkIn, range.checkOut) : 0;

  const bookHref = useMemo(() => {
    const q = new URLSearchParams();
    if (range.checkIn) q.set("checkin", isoDay(range.checkIn));
    if (range.checkOut) q.set("checkout", isoDay(range.checkOut));
    q.set("adults", String(guests.adults));
    if (guests.children) q.set("children", String(guests.children));
    if (guests.infants) q.set("infants", String(guests.infants));
    if (guests.pets) q.set("pets", String(guests.pets));
    return `/book/${listingId}?${q.toString()}`;
  }, [range, guests, listingId]);

  const value: BookingState = {
    ...range,
    guests,
    setDates,
    setGuests,
    nights,
    price: priceBreakdown(nightly, cleaningFee, nights),
    blocked,
    maxGuests,
    allowPets,
    bookHref,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
