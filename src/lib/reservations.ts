import { z } from "zod";
import { isBefore, parseISO, startOfDay } from "date-fns";
import { prisma } from "./prisma";
import { nightsBetween, priceBreakdown } from "./pricing";

export const reservationSchema = z
  .object({
    listingId: z.string().min(1),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    adults: z.number().int().min(1).max(16),
    children: z.number().int().min(0).max(15).default(0),
    infants: z.number().int().min(0).max(5).default(0),
    pets: z.number().int().min(0).max(5).default(0),
    card: z.object({
      number: z.string().transform((s) => s.replace(/\s/g, "")).pipe(z.string().regex(/^\d{13,19}$/, "Enter a valid card number.")),
      expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Enter expiration as MM/YY."),
      cvv: z.string().regex(/^\d{3,4}$/, "Enter a valid CVV."),
      zip: z.string().min(3, "Enter a ZIP code.").max(10),
    }),
  })
  .refine((v) => isBefore(parseISO(v.checkIn), parseISO(v.checkOut)), { message: "Checkout must be after check-in.", path: ["checkOut"] });

export type ReservationInput = z.input<typeof reservationSchema>;

export class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Creates a reservation inside a transaction that re-checks availability, so overlapping stays can't be double-booked. */
export async function createReservation(guestId: string, input: z.output<typeof reservationSchema>) {
  const checkIn = startOfDay(parseISO(input.checkIn));
  const checkOut = startOfDay(parseISO(input.checkOut));
  if (isBefore(checkIn, startOfDay(new Date()))) throw new BookingError("Check-in can't be in the past.");
  const nights = nightsBetween(checkIn, checkOut);
  if (nights > 60) throw new BookingError("Stays are limited to 60 nights.");

  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: input.listingId } });
    if (!listing) throw new BookingError("This listing no longer exists.", 404);
    if (listing.hostId === guestId) throw new BookingError("You can't book your own listing.");
    if (input.adults + input.children > listing.guests) throw new BookingError(`This place allows up to ${listing.guests} guests.`);
    if (input.pets > 0 && !listing.amenities.includes('"pets"')) throw new BookingError("This place doesn't allow pets.");

    const overlap = await tx.reservation.findFirst({
      where: { listingId: listing.id, status: "confirmed", checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
      select: { id: true },
    });
    if (overlap) throw new BookingError("Those dates were just booked. Please choose different dates.", 409);

    const price = priceBreakdown(listing.price, listing.cleaningFee, nights);
    return tx.reservation.create({
      data: {
        listingId: listing.id,
        guestId,
        checkIn,
        checkOut,
        adults: input.adults,
        children: input.children,
        infants: input.infants,
        pets: input.pets,
        nightlyPrice: listing.price,
        nights,
        cleaningFee: price.cleaningFee,
        serviceFee: price.serviceFee,
        totalPrice: price.total,
      },
    });
  });
}
