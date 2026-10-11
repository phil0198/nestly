import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

const addSchema = z
  .object({
    listingId: z.string().min(1),
    wishlistId: z.string().min(1).nullable().optional(),
    name: z.string().trim().max(50).optional(),
  })
  .refine((v) => v.wishlistId || v.name, { message: "Choose or name a wishlist." });

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = addSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { listingId, wishlistId, name } = parsed.data;

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  let wishlist;
  if (wishlistId) {
    wishlist = await prisma.wishlist.findFirst({ where: { id: wishlistId, ownerId: userId } });
    if (!wishlist) return NextResponse.json({ error: "Wishlist not found." }, { status: 404 });
  } else {
    wishlist = await prisma.wishlist.create({ data: { ownerId: userId, name: name! } });
  }
  await prisma.wishlistItem.upsert({
    where: { wishlistId_listingId: { wishlistId: wishlist.id, listingId } },
    update: {},
    create: { wishlistId: wishlist.id, listingId },
  });
  return NextResponse.json({ wishlist: { id: wishlist.id, name: wishlist.name } });
}

const removeSchema = z.object({ listingId: z.string().min(1), wishlistId: z.string().optional() });

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = removeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await prisma.wishlistItem.deleteMany({
    where: {
      listingId: parsed.data.listingId,
      wishlist: { ownerId: userId, ...(parsed.data.wishlistId ? { id: parsed.data.wishlistId } : {}) },
    },
  });
  return NextResponse.json({ ok: true });
}
