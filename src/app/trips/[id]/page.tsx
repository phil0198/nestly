import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, startOfDay } from "date-fns";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { RequireLogin } from "@/components/RequireLogin";
import { LocationMapLazy } from "@/components/map/LocationMapLazy";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { locationLabel } from "@/lib/listings";
import { guestSummary } from "@/lib/search-params";

export const metadata: Metadata = { title: "Your trip" };
export const dynamic = "force-dynamic";

export default async function TripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const [{ id }, { confirmed }] = await Promise.all([params, searchParams]);
  const userId = await getUserId();
  if (!userId) {
    return (
      <>
        <Header variant="plain" wide={false} />
        <main className="container-narrow py-14">
          <RequireLogin title="Log in to view this trip" body="Your reservation details are only visible to you." />
        </main>
      </>
    );
  }
  const trip = await prisma.reservation.findFirst({
    where: { id, guestId: userId },
    include: {
      review: true,
      listing: { include: { host: true, images: { orderBy: { position: "asc" }, take: 3 } } },
    },
  });
  if (!trip) notFound();
  const l = trip.listing;
  const isPast = trip.checkOut < startOfDay(new Date());

  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow pb-16 pt-8 sm:pt-12">
        {confirmed && (
          <div className="mb-8 flex items-center gap-4 rounded-xl bg-brand-light p-5 text-base animate-fade-in" role="status">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Icon name="check" size={20} strokeWidth={3} />
            </span>
            <div>
              <div className="font-semibold">Your reservation is confirmed</div>
              <div className="text-sm text-muted">You&rsquo;re going to {l.city}! Confirmation code {trip.id.slice(-8).toUpperCase()}.</div>
            </div>
          </div>
        )}
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
          <div>
            <div className="grid h-[280px] grid-cols-3 grid-rows-2 gap-2 overflow-hidden rounded-xl sm:h-[360px]">
              {l.images.map((img, i) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className={(i === 0 ? "col-span-2 row-span-2 " : "") + "h-full w-full bg-[#EBEBEB] object-cover text-transparent"}
                />
              ))}
            </div>
            <h1 className="mt-8 text-[32px] font-semibold leading-9">
              {isPast ? `Your stay in ${l.city}` : `Your trip to ${l.city}`}
            </h1>
            <Link href={`/rooms/${l.id}`} className="mt-1 block text-base text-muted underline">
              {l.title}
            </Link>
            <div className="mt-8 grid grid-cols-2 divide-x divide-divider rounded-xl border border-hairline">
              <div className="p-5">
                <div className="text-sm font-semibold">Check-in</div>
                <div className="text-base">{format(trip.checkIn, "EEE, MMM d")}</div>
                <div className="text-sm text-muted">3:00 PM</div>
              </div>
              <div className="p-5">
                <div className="text-sm font-semibold">Checkout</div>
                <div className="text-base">{format(trip.checkOut, "EEE, MMM d")}</div>
                <div className="text-sm text-muted">11:00 AM</div>
              </div>
            </div>
            <div className="mt-8 h-[260px] overflow-hidden rounded-xl">
              <LocationMapLazy lat={l.lat} lng={l.lng} zoom={12} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-base">
              <Icon name="location" size={20} />
              {locationLabel(l)}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-hairline p-6">
              <div className="flex items-center gap-4">
                <Avatar name={l.host.name} src={l.host.image} size={56} />
                <div>
                  <div className="text-base font-semibold">Your host, {l.host.name.split(" ")[0]}</div>
                  <div className="text-sm text-muted">{l.host.isSuperhost ? "Superhost · " : ""}Responds {l.host.responseTime}</div>
                </div>
              </div>
              <button type="button" className="btn-outline mt-6 w-full !py-2.5 text-sm">
                <Icon name="message" size={16} className="mr-2" /> Message host
              </button>
            </div>
            <div className="rounded-xl border border-hairline p-6">
              <h2 className="text-[22px] font-semibold">Reservation details</h2>
              <dl className="mt-4 space-y-4 text-base">
                <div>
                  <dt className="font-semibold">Who&rsquo;s coming</dt>
                  <dd className="text-muted">{guestSummary(trip)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Confirmation code</dt>
                  <dd className="text-muted">{trip.id.slice(-8).toUpperCase()}</dd>
                </div>
              </dl>
              <div className="mt-6 space-y-3 border-t border-divider pt-6 text-base">
                <div className="flex justify-between">
                  <span>
                    {formatMoney(trip.nightlyPrice)} x {trip.nights} nights
                  </span>
                  <span>{formatMoney(trip.nightlyPrice * trip.nights)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>{formatMoney(trip.cleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>{formatMoney(trip.serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-divider pt-4 font-semibold">
                  <span>Total paid (USD)</span>
                  <span>{formatMoney(trip.totalPrice)}</span>
                </div>
              </div>
            </div>
            {isPast &&
              (trip.review ? (
                <div className="rounded-xl border border-hairline p-6 text-base">
                  <div className="font-semibold">Thanks for your review</div>
                  <p className="mt-2 text-muted">&ldquo;{trip.review.comment}&rdquo;</p>
                </div>
              ) : (
                <Link href={`/trips/${trip.id}/review`} className="btn-brand w-full">
                  Write a review
                </Link>
              ))}
            <Link href="/trips" className="block text-center text-base font-semibold underline">
              Back to all trips
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
