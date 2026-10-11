import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { RequireLogin } from "@/components/RequireLogin";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Wishlists" };
export const dynamic = "force-dynamic";

export default async function WishlistsPage() {
  const userId = await getUserId();
  const lists = userId
    ? await prisma.wishlist.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            orderBy: { createdAt: "desc" },
            take: 3,
            include: { listing: { select: { images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 } } } },
          },
          _count: { select: { items: true } },
        },
      })
    : [];

  return (
    <>
      <Header variant="plain" />
      <main className="page-gutter mx-auto min-h-[60vh] max-w-[2520px] pb-16 pt-8 sm:pt-14">
        <h1 className="mb-8 text-[32px] font-semibold leading-9">Wishlists</h1>
        {!userId ? (
          <RequireLogin title="Log in to view your wishlists" body="You can create, view or edit wishlists once you've logged in." />
        ) : lists.length === 0 ? (
          <EmptyState
            title="Create your first wishlist"
            body="As you search, tap the heart icon to save your favourite places to stay to a wishlist."
            cta="Start exploring"
            href="/"
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {lists.map((w) => {
              const covers = w.items.map((i) => i.listing.images[0]?.url).filter(Boolean) as string[];
              return (
                <Link key={w.id} href={`/wishlists/${w.id}`} className="group">
                  <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl bg-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                    {covers.length === 0 ? (
                      <div className="col-span-2 row-span-2" />
                    ) : covers.length < 3 ? (
                      <img src={covers[0]} alt="" className="col-span-2 row-span-2 h-full w-full object-cover text-transparent transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <>
                        <img src={covers[0]} alt="" className="row-span-2 h-full w-full object-cover text-transparent" />
                        <img src={covers[1]} alt="" className="h-full w-full object-cover text-transparent" />
                        <img src={covers[2]} alt="" className="h-full w-full object-cover text-transparent" />
                      </>
                    )}
                  </div>
                  <div className="mt-3 text-[15px] font-semibold">{w.name}</div>
                  <div className="text-sm text-muted">{w._count.items} saved</div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer wide />
    </>
  );
}
