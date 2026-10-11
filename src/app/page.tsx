import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/header/Header";
import { CategoryBar } from "@/components/search/CategoryBar";
import { ListingGrid, ListingGridSkeleton } from "@/components/listing/ListingGrid";
import { MiniFooter } from "@/components/Footer";
import { FiltersButton } from "@/components/search/FiltersModal";
import { browseListings } from "@/lib/listings";
import { CATEGORY_BY_SLUG } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function Results({ category }: { category: string | null }) {
  const listings = await browseListings(category);
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <h2 className="text-[22px] font-semibold">No exact matches</h2>
        <p className="mt-2 max-w-sm text-base text-muted">Try changing or removing some of your filters or adjusting your search area.</p>
        <Link href="/" className="btn-outline mt-6">
          Remove all filters
        </Link>
      </div>
    );
  }
  return <ListingGrid listings={listings} />;
}

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { category: raw } = await searchParams;
  const category = raw && CATEGORY_BY_SLUG[raw] ? raw : null;
  return (
    <>
      <Header
        variant="search"
        mobileAction={
          <Suspense fallback={null}>
            <FiltersButton round />
          </Suspense>
        }
      />
      <Suspense fallback={<div className="h-[78px]" />}>
        <CategoryBar active={category} />
      </Suspense>
      <main className="page-gutter mx-auto max-w-[2520px] pb-28 pt-6 sm:pb-24">
        <Suspense key={category ?? "all"} fallback={<ListingGridSkeleton />}>
          <Results category={category} />
        </Suspense>
      </main>
      <MiniFooter />
    </>
  );
}
