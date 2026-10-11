"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { formatMoney } from "@/lib/pricing";
import { guestSummary } from "@/lib/search-params";
import { cn, formatRating } from "@/lib/utils";
import { Calendar } from "../../ui/Calendar";
import { GuestPicker } from "../../ui/GuestPicker";
import { Icon, StarSolid } from "../../icons";
import { Modal } from "../../ui/Modal";
import { useUI } from "../../ui/UIContext";
import { useBooking } from "./BookingContext";
import { formatRange } from "../../header/useSearchDraft";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside, active]);
}

function useReserve() {
  const b = useBooking();
  const router = useRouter();
  const { status } = useSession();
  const { openAuth } = useUI();
  return () => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      openAuth("login", () => router.push(b.bookHref));
      return;
    }
    router.push(b.bookHref);
  };
}

export function PriceRows({ compact }: { compact?: boolean }) {
  const { price } = useBooking();
  if (!price.nights) return null;
  return (
    <div className={cn("text-base", compact ? "mt-4" : "mt-6")}>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="underline">
            {formatMoney(price.nightly)} x {price.nights} night{price.nights === 1 ? "" : "s"}
          </span>
          <span>{formatMoney(price.subtotal)}</span>
        </div>
        {price.cleaningFee > 0 && (
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>{formatMoney(price.cleaningFee)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="underline">Nestly service fee</span>
          <span>{formatMoney(price.serviceFee)}</span>
        </div>
      </div>
      <div className="mt-6 flex justify-between border-t border-hairline pt-6 font-semibold">
        <span>Total before taxes</span>
        <span>{formatMoney(price.total)}</span>
      </div>
    </div>
  );
}

export function BookingCard({ nightly, rating, reviewCount }: { nightly: number; rating: number; reviewCount: number }) {
  const b = useBooking();
  const reserve = useReserve();
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const datesRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);
  useClickOutside(datesRef, () => setDatesOpen(false), datesOpen);
  useClickOutside(guestsRef, () => setGuestsOpen(false), guestsOpen);

  const ready = !!b.checkIn && !!b.checkOut;

  return (
    <div className="rounded-xl border border-hairline p-6 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          {ready ? (
            <>
              <span className="text-[22px] font-semibold">{formatMoney(b.price.subtotal)}</span>
              <span className="text-base"> for {b.nights} night{b.nights === 1 ? "" : "s"}</span>
            </>
          ) : (
            <>
              <span className="text-[22px] font-semibold">{formatMoney(nightly)}</span>
              <span className="text-base"> night</span>
            </>
          )}
        </div>
        {reviewCount > 0 && (
          <span className="flex items-center gap-1 text-sm">
            <StarSolid size={12} />
            <span className="font-semibold">{formatRating(rating)}</span>
            <span className="text-muted">·</span>
            <span className="text-muted underline">{reviewCount} reviews</span>
          </span>
        )}
      </div>

      <div className="relative mt-6 rounded-lg border border-[#B0B0B0]">
        <div ref={datesRef}>
          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={() => setDatesOpen(true)}
              className={cn("rounded-tl-lg px-3 pb-2.5 pt-3 text-left", datesOpen && !b.checkIn && "rounded-lg shadow-ring")}
            >
              <div className="text-[10px] font-extrabold uppercase tracking-[0.04em]">Check-in</div>
              <div className={cn("text-sm", !b.checkIn && "text-muted")}>{b.checkIn ? format(b.checkIn, "M/d/yyyy") : "Add date"}</div>
            </button>
            <button
              type="button"
              onClick={() => setDatesOpen(true)}
              className={cn("rounded-tr-lg border-l border-[#B0B0B0] px-3 pb-2.5 pt-3 text-left", datesOpen && b.checkIn && !b.checkOut && "rounded-lg shadow-ring")}
            >
              <div className="text-[10px] font-extrabold uppercase tracking-[0.04em]">Checkout</div>
              <div className={cn("text-sm", !b.checkOut && "text-muted")}>{b.checkOut ? format(b.checkOut, "M/d/yyyy") : "Add date"}</div>
            </button>
          </div>
          {datesOpen && (
            <div className="absolute -right-6 -top-6 z-30 w-[min(660px,calc(100vw-48px))] rounded-2xl bg-white px-8 pb-4 pt-6 shadow-modal animate-fade-in">
              <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                  <div className="text-[22px] font-semibold leading-[26px]">
                    {b.nights ? `${b.nights} night${b.nights === 1 ? "" : "s"}` : b.checkIn ? "Select checkout date" : "Select dates"}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {b.checkIn && b.checkOut
                      ? `${format(b.checkIn, "MMM d, yyyy")} - ${format(b.checkOut, "MMM d, yyyy")}`
                      : "Add your travel dates for exact pricing"}
                  </div>
                </div>
                <div className="flex shrink-0 rounded-lg border border-[#B0B0B0]">
                  <div className={cn("w-[140px] rounded-lg px-3 py-2", !b.checkIn && "shadow-ring")}>
                    <div className="text-[10px] font-extrabold uppercase">Check-in</div>
                    <div className="text-sm">{b.checkIn ? format(b.checkIn, "M/d/yyyy") : <span className="text-muted">MM/DD/YYYY</span>}</div>
                  </div>
                  <div className={cn("w-[140px] rounded-lg border-l border-[#B0B0B0] px-3 py-2", b.checkIn && !b.checkOut && "shadow-ring")}>
                    <div className="text-[10px] font-extrabold uppercase">Checkout</div>
                    <div className="text-sm">{b.checkOut ? format(b.checkOut, "M/d/yyyy") : <span className="text-muted">MM/DD/YYYY</span>}</div>
                  </div>
                </div>
              </div>
              <Calendar
                checkIn={b.checkIn}
                checkOut={b.checkOut}
                blocked={b.blocked}
                cell={42}
                onChange={(r) => {
                  b.setDates(r);
                  if (r.checkIn && r.checkOut) setTimeout(() => setDatesOpen(false), 150);
                }}
              />
              <div className="mt-4 flex items-center justify-between">
                <Icon name="calendar" size={20} />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-2.5 py-2 text-sm font-semibold underline hover:bg-faint"
                    onClick={() => b.setDates({ checkIn: null, checkOut: null })}
                  >
                    Clear dates
                  </button>
                  <button type="button" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setDatesOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={guestsRef} className="relative">
          <button
            type="button"
            onClick={() => setGuestsOpen((o) => !o)}
            className={cn("flex w-full items-center justify-between border-t border-[#B0B0B0] px-3 pb-2.5 pt-3 text-left", guestsOpen && "rounded-b-lg shadow-ring")}
          >
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.04em]">Guests</div>
              <div className="text-sm">{guestSummary(b.guests, "1 guest")}</div>
            </div>
            <Icon name={guestsOpen ? "chevron-up" : "chevron-down"} size={16} strokeWidth={2} />
          </button>
          {guestsOpen && (
            <div className="absolute inset-x-0 top-full z-20 mt-1 rounded bg-white px-4 py-1 shadow-[0_2px_6px_rgba(0,0,0,0.15)] animate-fade-in">
              <GuestPicker compact value={b.guests} onChange={b.setGuests} maxGuests={b.maxGuests} allowPets={b.allowPets} />
              <p className="pb-2 text-xs text-muted">
                This place has a maximum of {b.maxGuests} guests, not including infants.
                {!b.allowPets && " Pets aren't allowed."}
              </p>
              <div className="flex justify-end pb-3">
                <button type="button" className="rounded-lg px-2.5 py-2 text-base font-semibold underline hover:bg-faint" onClick={() => setGuestsOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <button type="button" onClick={ready ? reserve : () => setDatesOpen(true)} className="btn-brand mt-4 w-full">
        {ready ? "Reserve" : "Check availability"}
      </button>
      {ready && <p className="mt-4 text-center text-sm">You won&rsquo;t be charged yet</p>}
      <PriceRows />
    </div>
  );
}

/** Fixed bottom bar on phones/tablets with price + Reserve, opening a dates sheet when needed. */
export function MobileBookingBar({ nightly }: { nightly: number }) {
  const b = useBooking();
  const reserve = useReserve();
  const [open, setOpen] = useState(false);
  const ready = !!b.checkIn && !!b.checkOut;
  return (
    <>
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white lg:hidden">
        <div className="flex h-20 items-center justify-between px-6">
          <div>
            <div className="text-base">
              <span className="font-semibold">{formatMoney(ready ? b.price.subtotal : nightly)}</span>{" "}
              {ready ? `for ${b.nights} night${b.nights === 1 ? "" : "s"}` : "night"}
            </div>
            <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold underline">
              {ready ? formatRange(b.checkIn, b.checkOut) : "Add dates"}
            </button>
          </div>
          <button type="button" onClick={ready ? reserve : () => setOpen(true)} className="btn-brand !px-7">
            {ready ? "Reserve" : "Check availability"}
          </button>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={b.nights ? `${b.nights} nights` : "Select dates"}
        width="max-w-[720px]"
        footer={
          <div className="flex items-center justify-between">
            <button type="button" className="text-base font-semibold underline" onClick={() => b.setDates({ checkIn: null, checkOut: null })}>
              Clear dates
            </button>
            <button type="button" className="btn-dark" disabled={!ready} onClick={() => setOpen(false)}>
              Save
            </button>
          </div>
        }
      >
        <div className="hidden sm:block">
          <Calendar checkIn={b.checkIn} checkOut={b.checkOut} blocked={b.blocked} onChange={b.setDates} cell={44} />
        </div>
        <div className="sm:hidden">
          <Calendar vertical verticalCount={12} checkIn={b.checkIn} checkOut={b.checkOut} blocked={b.blocked} onChange={b.setDates} cell={44} />
        </div>
        <div className="mt-6 border-t border-divider pt-4">
          <GuestPicker compact value={b.guests} onChange={b.setGuests} maxGuests={b.maxGuests} allowPets={b.allowPets} />
        </div>
      </Modal>
    </>
  );
}

export function AvailabilitySection({ city }: { city: string }) {
  const b = useBooking();
  return (
    <section className="py-12">
      <h2 className="text-[22px] font-semibold leading-[26px]">
        {b.nights ? `${b.nights} night${b.nights === 1 ? "" : "s"} in ${city}` : b.checkIn ? "Select checkout date" : "Select check-in date"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {b.checkIn && b.checkOut
          ? `${format(b.checkIn, "MMM d, yyyy")} - ${format(b.checkOut, "MMM d, yyyy")}`
          : "Add your travel dates for exact pricing"}
      </p>
      <div className="mt-8 hidden sm:block">
        <Calendar checkIn={b.checkIn} checkOut={b.checkOut} blocked={b.blocked} onChange={b.setDates} cell={44} className="[&>div]:justify-start" />
      </div>
      <div className="mt-8 sm:hidden">
        <Calendar months={1} checkIn={b.checkIn} checkOut={b.checkOut} blocked={b.blocked} onChange={b.setDates} cell={44} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Icon name="calendar" size={20} />
        <button type="button" className="rounded-lg px-2 py-1.5 text-sm font-semibold underline hover:bg-faint" onClick={() => b.setDates({ checkIn: null, checkOut: null })}>
          Clear dates
        </button>
      </div>
    </section>
  );
}
