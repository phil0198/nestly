import { PrismaClient } from "@prisma/client";
import { listingPhotos } from "../src/lib/photos";

/**
 * Replaces legacy random placeholder photos (picsum.photos) with matching house photos.
 * Idempotent: listings without picsum images — including host uploads — are left untouched.
 */
async function run() {
  const prisma = new PrismaClient();
  const listings = await prisma.listing.findMany({
    where: { images: { some: { url: { contains: "picsum.photos" } } } },
    select: { id: true, propertyType: true, categories: true, _count: { select: { images: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const [i, l] of listings.entries()) {
    const seed = [...l.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, i);
    const photos = listingPhotos({ propertyType: l.propertyType, categories: l.categories.split(",") }, seed, l._count.images);
    await prisma.$transaction([
      prisma.listingImage.deleteMany({ where: { listingId: l.id } }),
      prisma.listingImage.createMany({ data: photos.map((url, position) => ({ listingId: l.id, url, position })) }),
    ]);
  }
  console.log(listings.length ? `Updated photos on ${listings.length} listings.` : "Listing photos are up to date.");
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
