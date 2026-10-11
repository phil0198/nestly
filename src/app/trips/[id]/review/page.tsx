import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { startOfDay } from "date-fns";
import { Header } from "@/components/header/Header";
import { RequireLogin } from "@/components/RequireLogin";
import { ReviewForm } from "@/components/booking/ReviewForm";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Write a review" };
export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) {
    return (
      <>
        <Header variant="plain" wide={false} />
        <main className="container-narrow py-14">
          <RequireLogin title="Log in to write a review" body="Only guests who stayed can review a place." />
        </main>
      </>
    );
  }
  const trip = await prisma.reservation.findFirst({
    where: { id, guestId: userId },
    include: { review: true, listing: { include: { host: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  if (!trip) notFound();
  const eligible = !trip.review && trip.status === "confirmed" && trip.checkOut < startOfDay(new Date());
  return (
    <>
      <Header variant="plain" wide={false} />
      <ReviewForm
        reservationId={trip.id}
        eligible={eligible}
        reason={trip.review ? "You've already reviewed this stay." : "You can leave a review once your stay is over."}
        listing={{ title: trip.listing.title, city: trip.listing.city, image: trip.listing.images[0]?.url ?? "", host: trip.listing.host.name.split(" ")[0] }}
      />
    </>
  );
}
