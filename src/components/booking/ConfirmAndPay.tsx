"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { addDays, format, isValid, parseISO, subDays } from "date-fns";
import { cn, formatRating } from "@/lib/utils";
import { formatMoney, nightsBetween, priceBreakdown } from "@/lib/pricing";
import { guestSummary, isoDay } from "@/lib/search-params";
import { Icon, StarSolid } from "../icons";
import { Calendar, type BlockedRange, type DateRange } from "../ui/Calendar";
import { GuestPicker, type Guests } from "../ui/GuestPicker";
import { Modal } from "../ui/Modal";
import { useUI } from "../ui/UIContext";
import { formatRange } from "../header/useSearchDraft";

interface ListingSummary {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  price: number;
  cleaningFee: number;
  rating: number;
  reviewCount: number;
  guestFavorite: boolean;
  maxGuests: number;
  allowPets: boolean;
}

function day(v: string | null) {
  if (!v) return null;
  const d = parseISO(v);
  return isValid(d) ? d : null;
}

function overlaps(range: DateRange, blocked: BlockedRange[]) {
  if (!range.checkIn || !range.checkOut) return false;
  return blocked.some((b) => new Date(b.checkIn) < range.checkOut! && new Date(b.checkOut) > range.checkIn!);
}

const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const inputCls = "w-full bg-transparent px-3 pb-2 pt-6 text-base outline-none";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("relative block border-[#B0B0B0] focus-within:z-10 focus-within:rounded-lg focus-within:shadow-ring", className)}>
      <span className="pointer-events-none absolute left-3 top-2 text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

export function ConfirmAndPay({ listing, blocked }: { listing: ListingSummary; blocked: BlockedRange[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const { openAuth } = useUI();
  const [range, setRange] = useState<DateRange>({ checkIn: day(params.get("checkin")), checkOut: day(params.get("checkout")) });
  const [guests, setGuests] = useState<Guests>({
    adults: Math.max(1, Number(params.get("adults")) || 1),
    children: Number(params.get("children")) || 0,
    infants: Number(params.get("infants")) || 0,
    pets: Number(params.get("pets")) || 0,
  });
  const [editDates, setEditDates] = useState(false);
  const [editGuests, setEditGuests] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange>(range);
  const [draftGuests, setDraftGuests] = useState<Guests>(guests);
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", zip: "", country: "United States" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") openAuth("login");
  }, [status, openAuth]);

  // Keep the URL in sync so refresh/back keeps the edited trip.
  useEffect(() => {
    const q = new URLSearchParams();
    if (range.checkIn) q.set("checkin", isoDay(range.checkIn));
    if (range.checkOut) q.set("checkout", isoDay(range.checkOut));
    q.set("adults", String(guests.adults));
    if (guests.children) q.set("children", String(guests.children));
    if (guests.infants) q.set("infants", String(guests.infants));
    if (guests.pets) q.set("pets", String(guests.pets));
    window.history.replaceState(null, "", `/book/${listing.id}?${q.toString()}`);
  }, [range, guests, listing.id]);

  const nights = range.checkIn && range.checkOut ? nightsBetween(range.checkIn, range.checkOut) : 0;
  const price = useMemo(() => priceBreakdown(listing.price, listing.cleaningFee, nights), [listing, nights]);
  const unavailable = overlaps(range, blocked);
  const datesValid = nights > 0 && !unavailable;
  const cardValid =
    card.number.replace(/\s/g, "").length >= 13 && /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) && /^\d{3,4}$/.test(card.cvv) && card.zip.length >= 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (status === "loading") return;
    if (status !== "authenticated") return openAuth("login");
    if (!datesValid) return setError(unavailable ? "Those dates are not available." : "Choose your dates first.");
    if (!cardValid) return setError("Check your payment details.");
    setBusy(true);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        checkIn: isoDay(range.checkIn!),
        checkOut: isoDay(range.checkOut!),
        ...guests,
        card: { number: card.number, expiry: card.expiry, cvv: card.cvv, zip: card.zip },
      }),
    });
    const data = (await res.json()) as { id?: string; error?: string };
    if (!res.ok || !data.id) {
      setBusy(false);
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(`/trips/${data.id}?confirmed=1`);
    router.refresh();
  }

  const freeCancelBy = range.checkIn ? subDays(range.checkIn, 1) : addDays(new Date(), 2);

  return (
    <main className="container-narrow pb-24 pt-8 sm:pt-16">
      <div className="mb-8 flex items-center gap-4 sm:-ml-12 sm:mb-12">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint">
          <Icon name="chevron-left" size={16} strokeWidth={2.5} />
        </button>
        <h1 className="text-[26px] font-semibold sm:text-[32px]">Confirm and pay</h1>
      </div>

      <form onSubmit={submit} className="flex flex-col-reverse gap-12 lg:flex-row lg:gap-[8.33%]">
        <div className="lg:w-[50%]">
          {listing.guestFavorite && (
            <div className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-hairline p-6">
              <div>
                <div className="text-base font-semibold">This is a rare find.</div>
                <div className="text-base text-muted">This place is usually booked.</div>
              </div>
              <Icon name="sparkle" size={32} className="text-brand" />
            </div>
          )}

          <section className="border-b border-divider pb-8">
            <h2 className="text-[22px] font-semibold">Your trip</h2>
            <div className="mt-6 flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">Dates</div>
                <div className={cn("text-base", unavailable && "text-[#C13515]")}>
                  {range.checkIn && range.checkOut ? formatRange(range.checkIn, range.checkOut) : "Add dates"}
                  {unavailable && " — unavailable"}
                </div>
              </div>
              <button
                type="button"
                className="text-base font-semibold underline"
                onClick={() => {
                  setDraftRange(range);
                  setEditDates(true);
                }}
              >
                Edit
              </button>
            </div>
            <div className="mt-6 flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">Guests</div>
                <div className="text-base">{guestSummary(guests, "1 guest")}</div>
              </div>
              <button
                type="button"
                className="text-base font-semibold underline"
                onClick={() => {
                  setDraftGuests(guests);
                  setEditGuests(true);
                }}
              >
                Edit
              </button>
            </div>
          </section>

          <section className="border-b border-divider py-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-semibold">Pay with</h2>
              <div className="flex gap-1.5" aria-hidden>
                {["#1a1f71", "#eb001b", "#2e77bc", "#ff6000"].map((c) => (
                  <span key={c} className="h-[18px] w-7 rounded-[3px]" style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-[#B0B0B0]">
              <div className="flex items-center gap-3 border-b border-[#B0B0B0] px-3 py-4 text-base">
                <Icon name="credit-card" size={22} />
                Credit or debit card
              </div>
              <Field label="Card number" className="border-b">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                />
              </Field>
              <div className="grid grid-cols-2">
                <Field label="Expiration">
                  <input className={inputCls} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
                </Field>
                <Field label="CVV" className="border-l">
                  <input className={inputCls} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
                </Field>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-[#B0B0B0]">
              <Field label="ZIP code" className="border-b">
                <input className={inputCls} autoComplete="postal-code" value={card.zip} onChange={(e) => setCard({ ...card, zip: e.target.value.slice(0, 10) })} />
              </Field>
              <Field label="Country/region">
                <select className={cn(inputCls, "appearance-none")} value={card.country} onChange={(e) => setCard({ ...card, country: e.target.value })}>
                  {["United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Japan"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted">
              <Icon name="shield" size={14} />
              Demo checkout — no real payment is taken. Any 16-digit number works (e.g. 4242 4242 4242 4242).
            </p>
          </section>

          <section className="border-b border-divider py-8">
            <h2 className="text-[22px] font-semibold">Cancellation policy</h2>
            <p className="mt-4 text-base">
              <span className="font-semibold">Free cancellation before {format(freeCancelBy, "MMM d")}.</span> Cancel before check-in for a partial
              refund. <span className="font-semibold underline">Learn more</span>
            </p>
          </section>

          <section className="border-b border-divider py-8">
            <h2 className="text-[22px] font-semibold">House expectations</h2>
            <p className="mt-4 text-base">We ask every guest to remember a few simple things about what makes a great stay.</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-base">
              <li>Follow the house rules</li>
              <li>Treat your host&rsquo;s home like your own</li>
            </ul>
          </section>

          <div className="py-8">
            <p className="text-xs leading-4">
              By selecting the button below, I agree to the host&rsquo;s house rules, Nestly&rsquo;s rebooking and refund policy, and that Nestly can charge
              my payment method if I&rsquo;m responsible for damage.
            </p>
            {error && (
              <div role="alert" className="mt-6 flex items-center gap-3 rounded-xl border border-[#C13515] bg-[#FFF8F6] p-4 text-sm text-[#C13515]">
                <Icon name="help" size={20} />
                {error}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-brand mt-6 w-full sm:w-auto sm:!px-8">
              {busy ? (
                <span className="flex gap-1 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
                </span>
              ) : (
                "Confirm and pay"
              )}
            </button>
          </div>
        </div>

        {/* Summary card */}
        <div className="lg:w-[41.66%]">
          <div className="rounded-xl border border-hairline p-6 lg:sticky lg:top-8">
            <div className="flex gap-4 border-b border-divider pb-6">
              <img src={listing.image} alt="" className="h-[106px] w-[124px] shrink-0 rounded-lg bg-[#EBEBEB] object-cover text-transparent" />
              <div className="flex min-w-0 flex-col justify-between">
                <div>
                  <div className="text-xs text-muted">{listing.subtitle}</div>
                  <Link href={`/rooms/${listing.id}`} className="line-clamp-2 text-sm hover:underline">
                    {listing.title}
                  </Link>
                </div>
                {listing.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <StarSolid size={10} />
                    <span className="font-semibold">{formatRating(listing.rating)}</span>
                    <span className="text-muted">({listing.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            <h2 className="pt-6 text-[22px] font-semibold">Price details</h2>
            {nights > 0 ? (
              <div className="mt-6 space-y-4 text-base">
                <div className="flex justify-between">
                  <span>
                    {formatMoney(listing.price)} x {nights} night{nights === 1 ? "" : "s"}
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
                <div className="flex justify-between border-t border-divider pt-6 font-semibold">
                  <span>
                    Total <span className="underline">(USD)</span>
                  </span>
                  <span>{formatMoney(price.total)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-base text-muted">Add your dates to see the total.</p>
            )}
          </div>
        </div>
      </form>

      <Modal
        open={editDates}
        onClose={() => setEditDates(false)}
        title="Edit dates"
        width="max-w-[720px]"
        footer={
          <div className="flex items-center justify-between">
            <button type="button" className="text-base font-semibold underline" onClick={() => setDraftRange({ checkIn: null, checkOut: null })}>
              Clear dates
            </button>
            <button
              type="button"
              className="btn-dark"
              disabled={!draftRange.checkIn || !draftRange.checkOut}
              onClick={() => {
                setRange(draftRange);
                setEditDates(false);
              }}
            >
              Save
            </button>
          </div>
        }
      >
        <div className="hidden sm:block">
          <Calendar checkIn={draftRange.checkIn} checkOut={draftRange.checkOut} blocked={blocked} onChange={setDraftRange} cell={44} />
        </div>
        <div className="sm:hidden">
          <Calendar vertical verticalCount={12} checkIn={draftRange.checkIn} checkOut={draftRange.checkOut} blocked={blocked} onChange={setDraftRange} cell={44} />
        </div>
      </Modal>

      <Modal
        open={editGuests}
        onClose={() => setEditGuests(false)}
        title="Guests"
        footer={
          <div className="flex items-center justify-between">
            <button type="button" className="text-base font-semibold underline" onClick={() => setEditGuests(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-dark"
              disabled={draftGuests.adults < 1}
              onClick={() => {
                setGuests(draftGuests);
                setEditGuests(false);
              }}
            >
              Save
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted">This place has a maximum of {listing.maxGuests} guests, not including infants.</p>
        <GuestPicker value={draftGuests} onChange={setDraftGuests} maxGuests={listing.maxGuests} allowPets={listing.allowPets} />
      </Modal>
    </main>
  );
}
