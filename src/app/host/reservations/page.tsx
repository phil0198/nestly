import type { Metadata } from "next";
import Link from "next/link";
import { format, startOfDay } from "date-fns";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { HostNav } from "@/components/host/HostNav";
import { RequireLogin } from "@/components/RequireLogin";
import { Avatar } from "@/components/ui/Avatar";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { guestSummary } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reservations" };
export const dynamic = "force-dynamic";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "current", label: "Currently hosting" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
] as const;

export default async function HostReservationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab = TABS.find((t) => t.id === rawTab)?.id ?? "upcoming";
  const userId = await getUserId();
  const today = startOfDay(new Date());
  const where =
    tab === "upcoming"
      ? { checkIn: { gt: today } }
      : tab === "current"
        ? { checkIn: { lte: today }, checkOut: { gte: today } }
        : tab === "completed"
          ? { checkOut: { lt: today } }
          : {};
  const reservations = userId
    ? await prisma.reservation.findMany({
        where: { listing: { hostId: userId }, ...where },
        orderBy: { checkIn: tab === "completed" ? "desc" : "asc" },
        take: 100,
        include: {
          guest: { select: { name: true, image: true } },
          listing: { select: { id: true, title: true } },
        },
      })
    : [];

  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow min-h-[60vh] pb-16 pt-8 sm:pt-14">
        <h1 className="mb-6 text-[32px] font-semibold leading-9">Reservations</h1>
        {!userId ? (
          <RequireLogin title="Log in to see your reservations" body="Bookings for the homes you host appear here." />
        ) : (
          <>
            <HostNav />
            <div className="scrollbar-none mb-8 flex gap-2 overflow-x-auto">
              {TABS.map((t) => (
                <Link
                  key={t.id}
                  href={`/host/reservations?tab=${t.id}`}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm",
                    tab === t.id ? "border-[2px] border-ink bg-faint px-[15px] py-[7px] font-semibold" : "border-hairline hover:border-ink",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            {reservations.length === 0 ? (
              <div className="rounded-2xl bg-faint p-12 text-center">
                <h2 className="text-lg font-semibold">You don&rsquo;t have any {tab === "all" ? "" : TABS.find((t) => t.id === tab)!.label.toLowerCase()} reservations</h2>
                <p className="mt-1 text-base text-muted">When guests book your place, you&rsquo;ll see their trips here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-hairline">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-hairline bg-faint text-xs font-semibold uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Listing</th>
                      <th className="px-4 py-3">Check-in</th>
                      <th className="px-4 py-3">Checkout</th>
                      <th className="px-4 py-3">Booked</th>
                      <th className="px-4 py-3 text-right">Total payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider">
                    {reservations.map((r) => (
                      <tr key={r.id} className="hover:bg-faint">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={r.guest.name} src={r.guest.image} size={32} />
                            <div>
                              <div className="font-semibold">{r.guest.name}</div>
                              <div className="text-xs text-muted">{guestSummary(r)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-4">
                          <Link href={`/rooms/${r.listing.id}`} className="hover:underline">
                            {r.listing.title}
                          </Link>
                        </td>
                        <td className="px-4 py-4">{format(r.checkIn, "MMM d, yyyy")}</td>
                        <td className="px-4 py-4">{format(r.checkOut, "MMM d, yyyy")}</td>
                        <td className="px-4 py-4 text-muted">{format(r.createdAt, "MMM d")}</td>
                        <td className="px-4 py-4 text-right font-semibold">{formatMoney(r.totalPrice - r.serviceFee)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
