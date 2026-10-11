import { NextResponse } from "next/server";
import { z } from "zod";
import { startOfDay } from "date-fns";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeListingRating } from "@/lib/listings";

const score = z.number().int().min(1).max(5);
const schema = z.object({
  reservationId: z.string().min(1),
  cleanliness: score,
  accuracy: score,
  checkIn: score,
  communication: score,
  location: score,
  value: score,
  rating: score,
  comment: z.string().trim().min(10, "Tell future guests a little more (at least 10 characters).").max(1000),
});

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Log in to leave a review." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review." }, { status: 400 });
  const { reservationId, ...data } = parsed.data;

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, guestId: userId },
    include: { review: true },
  });
  if (!reservation) return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
  if (reservation.status !== "confirmed" || reservation.checkOut >= startOfDay(new Date()))
    return NextResponse.json({ error: "You can review a stay after checkout." }, { status: 400 });
  if (reservation.review) return NextResponse.json({ error: "You've already reviewed this stay." }, { status: 409 });

  const review = await prisma.review.create({
    data: { ...data, reservationId, listingId: reservation.listingId, authorId: userId },
  });
  await recomputeListingRating(reservation.listingId);
  return NextResponse.json({ id: review.id }, { status: 201 });
}
