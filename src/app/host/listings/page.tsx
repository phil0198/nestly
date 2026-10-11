import type { Metadata } from "next";
import Link from "next/link";
import { startOfDay } from "date-fns";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { Icon, StarSolid } from "@/components/icons";
import { HostNav } from "@/components/host/HostNav";
import { RequireLogin } from "@/components/RequireLogin";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { locationLabel } from "@/lib/listings";
import { formatRating } from "@/lib/utils";

export const metadata: Metadata = { title: "Your listings" };
export const dynamic = "force-dynamic";

export default async function HostListingsPage({ searchParams }: { searchParams: Promise<{ published?: string }> }) {
  const { published } = await searchParams;
  const userId = await getUserId();
  const today = startOfDay(new Date());
  const listings = userId
    ? await prisma.listing.findMany({
        where: { hostId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          _count: { select: { reservations: { where: { checkOut: { gte: today }, status: "confirmed" } } } },
        },
      })
    : [];

  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow min-h-[60vh] pb-16 pt-8 sm:pt-14">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[32px] font-semibold leading-9">Your listings</h1>
          {userId && (
            <Link href="/become-a-host" aria-label="Create a new listing" className="flex h-10 w-10 items-center justify-center rounded-full bg-faint hover:bg-[#EBEBEB]">
              <Icon name="plus" size={18} strokeWidth={2} />
            </Link>
          )}
        </div>
        {!userId ? (
          <RequireLogin title="Log in to manage your listings" body="Hosting tools are available once you've logged in." />
        ) : (
          <>
            <HostNav />
            {published && (
              <div role="status" className="mb-8 flex items-center gap-3 rounded-xl bg-brand-light p-4 text-base">
                <Icon name="check-circle" size={24} className="text-brand" />
                <span>
                  Your listing is live!{" "}
                  <Link href={`/rooms/${published}`} className="font-semibold underline">
                    View it
                  </Link>
                </span>
              </div>
            )}
            {listings.length === 0 ? (
              <div className="rounded-2xl border border-hairline p-10 text-center">
                <Icon name="home" size={48} strokeWidth={1} className="mx-auto" />
                <h2 className="mt-4 text-[22px] font-semibold">You don&rsquo;t have any listings yet</h2>
                <p className="mt-2 text-base text-muted">Create your first listing in a few minutes and start welcoming guests.</p>
                <Link href="/become-a-host" className="btn-brand mt-6">
                  Create a listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 md:grid-cols-3">
                {listings.map((l) => (
                  <Link key={l.id} href={`/rooms/${l.id}`} className="group">
                    <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-[#EBEBEB]">
                      {l.images[0] && (
                        <img src={l.images[0].url} alt="" className="h-full w-full object-cover text-transparent transition-transform duration-300 group-hover:scale-[1.03]" />
                      )}
                      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
                        <span className="h-2 w-2 rounded-full bg-[#008A05]" /> Listed
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between gap-2 text-[15px]">
                      <span className="truncate font-semibold">{l.title}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <StarSolid size={12} />
                        {l.reviewCount ? formatRating(l.ratingAvg) : "New"}
                      </span>
                    </div>
                    <div className="text-[15px] text-muted">{locationLabel(l)}</div>
                    <div className="text-[15px] text-muted">
                      {l._count.reservations} upcoming reservation{l._count.reservations === 1 ? "" : "s"}
                    </div>
                    <div className="mt-1 text-[15px]">
                      <span className="font-semibold">{formatMoney(l.price)}</span> night
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
