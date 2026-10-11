import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header/Header";
import { RequireLogin } from "@/components/RequireLogin";
import { WishlistDetail } from "@/components/listing/WishlistDetail";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCardsByIds } from "@/lib/listings";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) {
    return (
      <>
        <Header variant="plain" />
        <main className="page-gutter py-14">
          <RequireLogin title="Log in to view this wishlist" body="Wishlists are private to your account." />
        </main>
      </>
    );
  }
  const wishlist = await prisma.wishlist.findFirst({
    where: { id, ownerId: userId },
    include: { items: { orderBy: { createdAt: "desc" }, select: { listingId: true } } },
  });
  if (!wishlist) notFound();
  const listings = await getCardsByIds(wishlist.items.map((i) => i.listingId));
  return (
    <>
      <Header variant="plain" />
      <WishlistDetail id={wishlist.id} name={wishlist.name} listings={listings} />
    </>
  );
}
