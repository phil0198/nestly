import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { startOfDay } from "date-fns";
import { Header } from "@/components/header/Header";
import { ConfirmAndPay } from "@/components/booking/ConfirmAndPay";
import { prisma } from "@/lib/prisma";
import { locationLabel } from "@/lib/listings";

export const metadata: Metadata = { title: "Confirm and pay" };
export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      reservations: {
        where: { status: "confirmed", checkOut: { gte: startOfDay(new Date()) } },
        select: { checkIn: true, checkOut: true },
      },
    },
  });
  if (!listing) notFound();
  return (
    <>
      <Header variant="plain" wide={false} sticky={false} />
      <Suspense fallback={null}>
        <ConfirmAndPay
          listing={{
            id: listing.id,
            title: listing.title,
            subtitle: `${listing.roomType === "Entire home" ? `Entire ${listing.propertyType.toLowerCase()}` : listing.roomType} · ${locationLabel(listing)}`,
            image: listing.images[0]?.url ?? "",
            price: listing.price,
            cleaningFee: listing.cleaningFee,
            rating: listing.ratingAvg,
            reviewCount: listing.reviewCount,
            guestFavorite: listing.guestFavorite,
            maxGuests: listing.guests,
            allowPets: listing.amenities.includes('"pets"'),
          }}
          blocked={listing.reservations.map((r) => ({ checkIn: r.checkIn.toISOString(), checkOut: r.checkOut.toISOString() }))}
        />
      </Suspense>
    </>
  );
}
