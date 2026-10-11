"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { format, isSameMonth } from "date-fns";
import type { ListingCardData } from "@/lib/listings";
import { cn, formatRating } from "@/lib/utils";
import { formatMoney } from "@/lib/pricing";
import { CardHeart, Chevron, StarSolid } from "../icons";
import { useWishlist } from "./WishlistContext";
import { useDisplayTotal } from "@/lib/display-total";
import { SERVICE_FEE_RATE } from "@/lib/pricing";

function shortRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return isSameMonth(s, e) ? `${format(s, "MMM d")} – ${format(e, "d")}` : `${format(s, "MMM d")} – ${format(e, "MMM d")}`;
}

export function ImageCarousel({
  images,
  alt,
  className,
  rounded = "rounded-xl",
  aspect = "aspect-[20/19]",
}: {
  images: string[];
  alt: string;
  className?: string;
  rounded?: string;
  aspect?: string;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)));
  };
  // Show at most 5 dots, sliding the window with the active image like the reference.
  const dotStart = Math.min(Math.max(0, index - 2), Math.max(0, count - 5));
  const dots = images.slice(dotStart, dotStart + 5).map((_, i) => dotStart + i);

  return (
    <div className={cn("group/carousel relative overflow-hidden bg-[#EBEBEB]", rounded, aspect, className)}>
      <div
        className="flex h-full transition-transform duration-300 ease-abnb"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            className="h-full w-full shrink-0 object-cover text-transparent"
          />
        ))}
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => go(e, -1)}
            className={cn(
              "absolute left-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.04] hover:bg-white group-hover/carousel:opacity-100 sm:flex",
              index === 0 && "!hidden",
            )}
          >
            <Chevron dir="left" size={10} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => go(e, 1)}
            className={cn(
              "absolute right-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.04] hover:bg-white group-hover/carousel:opacity-100 sm:flex",
              index === count - 1 && "!hidden",
            )}
          >
            <Chevron dir="right" size={10} />
          </button>
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-[5px]">
            {dots.map((i) => {
              const edge = (i === dots[0] && dotStart > 0) || (i === dots[dots.length - 1] && dotStart + 5 < count);
              return (
                <span
                  key={i}
                  className={cn(
                    "block rounded-full bg-white transition-all duration-200",
                    i === index ? "opacity-100" : "opacity-60",
                    edge ? "h-1 w-1" : "h-1.5 w-1.5",
                  )}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export const HeartButton = memo(function HeartButton({ id, image, className }: { id: string; image?: string; className?: string }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(id);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ id, image });
      }}
      className={cn("transition-transform duration-150 hover:scale-110 active:scale-90", className)}
    >
      <span key={String(saved)} className={cn("block", saved && "animate-heart-pop")}>
        <CardHeart saved={saved} />
      </span>
    </button>
  );
});

export type CardMode = "browse" | "search";

interface ListingCardProps {
  listing: ListingCardData;
  mode?: CardMode;
  nights?: number;
  onHover?: (id: string | null) => void;
  /** Open in new tab like the reference does from the search map view */
  newTab?: boolean;
  priority?: boolean;
}

export function ListingCard({ listing, mode = "browse", nights = 0, onHover, newTab }: ListingCardProps) {
  const location = listing.country === "United States" ? `${listing.city}, ${listing.region}` : `${listing.city}, ${listing.country}`;
  const title = mode === "search" ? `${listing.propertyType} in ${listing.city}` : location;
  const line2 = mode === "search" ? listing.title : `Hosted by ${listing.hostName}`;
  const line3 =
    mode === "search"
      ? `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"} · ${listing.beds} bed${listing.beds === 1 ? "" : "s"}`
      : listing.nextAvailable
        ? shortRange(listing.nextAvailable.start, listing.nextAvailable.end)
        : listing.title;
  const displayTotal = useDisplayTotal();
  const total = nights > 0 ? listing.price * nights : 0;
  const totalBeforeTaxes = (n: number) => Math.round(listing.price * n * (1 + SERVICE_FEE_RATE) + listing.cleaningFee);

  return (
    <div
      className="group relative"
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link href={`/rooms/${listing.id}`} target={newTab ? "_blank" : undefined} className="block">
        <div className="relative">
          <ImageCarousel images={listing.images} alt={listing.title} />
          {listing.guestFavorite && (
            <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold leading-4 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
              Guest favourite
            </div>
          )}
        </div>
        <div className="mt-3 text-[15px] leading-[19px]">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold">{title}</h3>
            {listing.reviewCount > 0 ? (
              <span className="flex shrink-0 items-center gap-1">
                <StarSolid size={12} />
                {formatRating(listing.ratingAvg)}
                {mode === "search" && <span className="text-muted">({listing.reviewCount})</span>}
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1">
                <StarSolid size={12} />
                New
              </span>
            )}
          </div>
          <p className="truncate text-muted">{line2}</p>
          <p className="truncate text-muted">{line3}</p>
          <p className="mt-1.5">
            {displayTotal ? (
              <>
                <span className="font-semibold">{formatMoney(totalBeforeTaxes(nights || 5))}</span>
                <span className="text-muted"> total before taxes</span>
              </>
            ) : total > 0 ? (
              <>
                <span className="font-semibold">{formatMoney(total)}</span>
                <span className="text-muted"> for {nights} night{nights === 1 ? "" : "s"}</span>
              </>
            ) : (
              <>
                <span className="font-semibold">{formatMoney(listing.price)}</span> night
              </>
            )}
          </p>
        </div>
      </Link>
      <HeartButton id={listing.id} image={listing.images[0]} className="absolute right-3 top-3" />
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[20/19] rounded-xl" />
      <div className="skeleton mt-3 h-4 w-3/4 rounded" />
      <div className="skeleton mt-2 h-4 w-1/2 rounded" />
      <div className="skeleton mt-2 h-4 w-1/3 rounded" />
    </div>
  );
}
