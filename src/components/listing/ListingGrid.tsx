import type { ListingCardData } from "@/lib/listings";
import { cn } from "@/lib/utils";
import { ListingCard, ListingCardSkeleton } from "./ListingCard";

/** Column counts follow the reference breakpoints: 1 → 2 → 3 → 4 → 5 → 6. */
export const GRID_COLS =
  "grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6";

export function ListingGrid({ listings }: { listings: ListingCardData[] }) {
  return (
    <div className={GRID_COLS}>
      {listings.map((l, i) => (
        <ListingCard key={l.id} listing={l} priority={i < 6} />
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 12, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(GRID_COLS, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
