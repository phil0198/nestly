import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { BookingError, createReservation, reservationSchema } from "@/lib/reservations";

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Log in to book this place." }, { status: 401 });
  const parsed = reservationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid booking details." }, { status: 400 });
  }
  try {
    const reservation = await createReservation(userId, parsed.data);
    return NextResponse.json({ id: reservation.id }, { status: 201 });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
