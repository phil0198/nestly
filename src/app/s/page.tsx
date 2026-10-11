import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/header/Header";
import { CategoryBar } from "@/components/search/CategoryBar";
import { SearchResults } from "@/components/search/SearchResults";
import { FiltersButton } from "@/components/search/FiltersModal";
import { searchListings } from "@/lib/listings";
import { parseSearchParams } from "@/lib/search-params";
import { nightsBetween } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: Params }): Promise<Metadata> {
  const f = parseSearchParams(await searchParams);
  return { title: f.location ? `${f.location} · Stays` : "Stays" };
}

export default async function SearchPage({ searchParams }: { searchParams: Params }) {
  const raw = await searchParams;
  const filters = parseSearchParams(raw);
  const listings = await searchListings(filters);
  const nights = filters.checkIn && filters.checkOut ? nightsBetween(filters.checkIn, filters.checkOut) : 0;
  const page = Math.max(1, Number(Array.isArray(raw.page) ? raw.page[0] : raw.page) || 1);
  const where = filters.bounds ? "within map area" : filters.location ? `in ${filters.location}` : "";
  const heading =
    listings.length === 0
      ? "No places found"
      : `${listings.length >= 200 ? "Over 200" : listings.length} place${listings.length === 1 ? "" : "s"}${where ? ` ${where}` : ""}`;

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
        <CategoryBar active={filters.category} />
      </Suspense>
      <main className="mx-auto max-w-[2520px] border-t border-divider">
        <Suspense fallback={null}>
          <SearchResults listings={listings} heading={heading} nights={nights} page={page} hasBounds={!!filters.bounds} />
        </Suspense>
      </main>
    </>
  );
}
