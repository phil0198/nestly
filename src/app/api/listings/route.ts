import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PEXELS_HOST } from "@/lib/photos";
import { AMENITY_BY_ID, CATEGORY_BY_SLUG, PROPERTY_TYPES, ROOM_TYPES } from "@/lib/constants";

const imageUrl = z
  .string()
  .refine((u) => u.startsWith("/api/uploads/") || u.startsWith(`https://${PEXELS_HOST}/photos/`), "Invalid photo URL.");

const listingSchema = z.object({
  propertyType: z.enum(PROPERTY_TYPES.map((p) => p.id) as [string, ...string[]]),
  roomType: z.enum(ROOM_TYPES),
  city: z.string().trim().min(1, "Add a city.").max(80),
  region: z.string().trim().max(80).default(""),
  country: z.string().trim().min(1, "Add a country.").max(80),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  guests: z.number().int().min(1).max(16),
  bedrooms: z.number().int().min(0).max(50),
  beds: z.number().int().min(1).max(50),
  baths: z.number().min(0.5).max(50),
  amenities: z.array(z.string()).max(60).refine((a) => a.every((id) => AMENITY_BY_ID[id]), "Unknown amenity."),
  categories: z.array(z.string()).min(1, "Pick at least one category.").max(3).refine((c) => c.every((s) => CATEGORY_BY_SLUG[s]), "Unknown category."),
  images: z.array(imageUrl).min(5, "Add at least 5 photos.").max(30),
  title: z.string().trim().min(3, "Add a title.").max(32, "Keep the title to 32 characters."),
  description: z.string().trim().min(20, "Write at least a short description.").max(2000),
  price: z.number().int().min(10, "Price must be at least $10.").max(10000),
});

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Log in to create a listing." }, { status: 401 });
  const parsed = listingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid listing." }, { status: 400 });
  const d = parsed.data;
  const listing = await prisma.listing.create({
    data: {
      hostId: userId,
      title: d.title,
      description: d.description,
      propertyType: d.propertyType,
      roomType: d.roomType,
      categories: d.categories.join(","),
      city: d.city,
      region: d.region || d.city,
      country: d.country,
      lat: d.lat,
      lng: d.lng,
      guests: d.guests,
      bedrooms: d.bedrooms,
      beds: d.beds,
      baths: d.baths,
      price: d.price,
      cleaningFee: Math.round((d.price * 0.2) / 5) * 5,
      amenities: JSON.stringify(d.amenities),
      highlights: JSON.stringify([
        { icon: "sparkle", title: "New on Nestly", body: "Be one of the first guests to stay and leave a review." },
        ...(d.amenities.includes("self-check-in") ? [{ icon: "door", title: "Self check-in", body: "Check yourself in with the keypad." }] : []),
        { icon: "free-cancel", title: "Free cancellation for 48 hours", body: "Get a full refund if you change your mind." },
      ]),
      images: { create: d.images.map((url, position) => ({ url, position })) },
    },
  });
  return NextResponse.json({ id: listing.id }, { status: 201 });
}
