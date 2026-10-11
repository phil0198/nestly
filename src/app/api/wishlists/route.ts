import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ wishlists: [], saved: {} });
  const lists = await prisma.wishlist.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: { listing: { select: { images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 } } } },
      },
    },
  });
  const saved: Record<string, string> = {};
  for (const l of lists) for (const i of l.items) saved[i.listingId] ??= l.id;
  return NextResponse.json({
    wishlists: lists.map((l) => ({
      id: l.id,
      name: l.name,
      count: l.items.length,
      cover: l.items[0]?.listing.images[0]?.url ?? null,
    })),
    saved,
  });
}

const createSchema = z.object({ name: z.string().trim().min(1).max(50) });

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const wishlist = await prisma.wishlist.create({ data: { ownerId: userId, name: parsed.data.name } });
  return NextResponse.json({ wishlist }, { status: 201 });
}
