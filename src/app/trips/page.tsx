import type { Metadata } from "next";
import Link from "next/link";
import { format, isSameMonth, isSameYear, startOfDay } from "date-fns";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequireLogin } from "@/components/RequireLogin";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { locationLabel } from "@/lib/listings";

export const metadata: Metadata = { title: "Trips" };
export const dynamic = "force-dynamic";

function range(a: Date, b: Date) {
  if (isSameMonth(a, b)) return `${format(a, "MMM d")} – ${format(b, "d, yyyy")}`;
  if (isSameYear(a, b)) return `${format(a, "MMM d")} – ${format(b, "MMM d, yyyy")}`;
  return `${format(a, "MMM d, yyyy")} – ${format(b, "MMM d, yyyy")}`;
}

export default async function TripsPage() {
  const userId = await getUserId();
  const today = startOfDay(new Date());
  const trips = userId
    ? await prisma.reservation.findMany({
        where: { guestId: userId },
        orderBy: { checkIn: "asc" },
        include: {
          review: { select: { id: true } },
          listing: {
            select: {
              id: true, title: true, city: true, region: true, country: true, propertyType: true,
              host: { select: { name: true } },
              images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      })
    : [];
  const upcoming = trips.filter((t) => t.checkOut >= today && t.status === "confirmed");
  const past = trips.filter((t) => t.checkOut < today || t.status !== "confirmed").reverse();

  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow min-h-[60vh] pb-16 pt-8 sm:pt-14">
        <h1 className="mb-8 text-[32px] font-semibold leading-9">Trips</h1>
        {!userId ? (
          <RequireLogin title="Log in to view your trips" body="You can create, view or edit trips once you've logged in." />
        ) : (
          <>
            {upcoming.length === 0 ? (
              <EmptyState
                title="No trips booked...yet!"
                body="Time to dust off your bags and start planning your next adventure."
                cta="Start searching"
                href="/"
              />
            ) : (
              <section className="border-b border-divider pb-12">
                <h2 className="mb-6 text-[22px] font-semibold">Upcoming reservations</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {upcoming.map((t) => (
                    <Link
                      key={t.id}
                      href={`/trips/${t.id}`}
                      className="flex overflow-hidden rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
                        <div>
                          <div className="text-[22px] font-semibold leading-[26px]">{t.listing.city}</div>
                          <div className="mt-1 truncate text-sm text-muted">
                            {t.listing.propertyType} hosted by {t.listing.host.name.split(" ")[0]}
                          </div>
                        </div>
                        <div className="mt-6 border-t border-divider pt-4 text-sm">
                          <div className="font-semibold">{range(t.checkIn, t.checkOut)}</div>
                          <div className="text-muted">{locationLabel(t.listing)}</div>
                        </div>
                      </div>
                      <img src={t.listing.images[0]?.url} alt="" className="w-[38%] shrink-0 bg-[#EBEBEB] object-cover text-transparent" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section className="pt-12">
                <h2 className="mb-6 text-[22px] font-semibold">Where you&rsquo;ve been</h2>
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {past.map((t) => (
                    <div key={t.id} className="flex items-center gap-4">
                      <Link href={`/trips/${t.id}`} className="shrink-0">
                        <img src={t.listing.images[0]?.url} alt="" className="h-16 w-16 rounded-lg bg-[#EBEBEB] object-cover text-transparent" />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/trips/${t.id}`} className="block truncate text-base font-semibold hover:underline">
                          {t.listing.city}
                        </Link>
                        <div className="truncate text-sm text-muted">Hosted by {t.listing.host.name.split(" ")[0]}</div>
                        <div className="text-sm text-muted">{t.status === "cancelled" ? "Cancelled" : range(t.checkIn, t.checkOut)}</div>
                        {t.status === "confirmed" &&
                          (t.review ? (
                            <span className="text-sm text-muted">Reviewed ✓</span>
                          ) : (
                            <Link href={`/trips/${t.id}/review`} className="text-sm font-semibold underline">
                              Write a review
                            </Link>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <p className="mt-12 text-sm text-muted">
              Can&rsquo;t find your reservation here? <Link href="/help" className="font-semibold text-ink underline">Visit the Help Centre</Link>
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
