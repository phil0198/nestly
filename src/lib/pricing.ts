import { differenceInCalendarDays } from "date-fns";

/** Guest service fee rate applied to the nightly subtotal (mirrors the reference site's ~14%). */
export const SERVICE_FEE_RATE = 0.14;

export interface PriceBreakdown {
  nights: number;
  nightly: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  return Math.max(0, differenceInCalendarDays(checkOut, checkIn));
}

export function priceBreakdown(nightly: number, cleaningFee: number, nights: number): PriceBreakdown {
  const subtotal = nightly * nights;
  const serviceFee = nights > 0 ? Math.round(subtotal * SERVICE_FEE_RATE) : 0;
  const cleaning = nights > 0 ? cleaningFee : 0;
  return { nights, nightly, subtotal, cleaningFee: cleaning, serviceFee, total: subtotal + cleaning + serviceFee };
}

export function formatMoney(amount: number, opts: { cents?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(amount);
}
