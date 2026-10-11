import type { Prisma } from "@prisma/client";
import { addDays, isBefore, startOfDay } from "date-fns";
import { prisma } from "./prisma";
import { parseSearchParams, type SearchFilters } from "./search-params";

export interface Highlight {
  icon: string;
  title: string;
  body: string;
}

export interface ListingCardData {
  id: string;
  title: string;
  city: string;
  region: string;
  country: string;
  propertyType: string;
  roomType: string;
  bedrooms: number;
  beds: number;
  price: number;
  cleaningFee: number;
  ratingAvg: number;
  reviewCount: number;
  guestFavorite: boolean;
  lat: number;
  lng: number;
  images: string[];
  hostName: string;
  /** Next open 5-night window, ISO dates; null if nothing within 6 months. */
  nextAvailable: { start: string; end: string } | null;
}

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function locationLabel(l: { city: string; region: string; country: string }) {
  if (l.country === "United States") return `${l.city}, ${l.region}`;
  return `${l.city}, ${l.country}`;
}

const cardSelect = {
  id: true,
  title: true,
  city: true,
  region: true,
  country: true,
  propertyType: true,
  roomType: true,
  bedrooms: true,
  beds: true,
  price: true,
  cleaningFee: true,
  ratingAvg: true,
  reviewCount: true,
  guestFavorite: true,
  lat: true,
  lng: true,
  images: { select: { url: true }, orderBy: { position: "asc" }, take: 6 },
  host: { select: { name: true } },
  reservations: {
    where: { status: "confirmed", checkOut: { gte: startOfDay(new Date()) } },
    select: { checkIn: true, checkOut: true },
    orderBy: { checkIn: "asc" },
  },
} satisfies Prisma.ListingSelect;

type CardRow = Prisma.ListingGetPayload<{ select: typeof cardSelect }>;

function nextWindow(reservations: { checkIn: Date; checkOut: Date }[], nights = 5) {
  let start = addDays(startOfDay(new Date()), 7);
  const horizon = addDays(start, 180);
  for (const r of reservations) {
    const end = addDays(start, nights);
    if (!isBefore(r.checkIn, end)) break; // window fits before this booking
    if (isBefore(start, r.checkOut)) start = startOfDay(r.checkOut);
  }
  if (isBefore(horizon, start)) return null;
  return { start: start.toISOString(), end: addDays(start, nights).toISOString() };
}

function toCard(row: CardRow): ListingCardData {
  const { images, host, reservations, ...rest } = row;
  return {
    ...rest,
    images: images.map((i) => i.url),
    hostName: host.name.split(" ")[0],
    nextAvailable: nextWindow(reservations),
  };
}

export function buildWhere(f: SearchFilters, opts: { ignorePrice?: boolean } = {}): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [];
  if (f.location) {
    const term = f.location.split(",")[0].trim();
    if (term) {
      and.push({
        OR: [{ city: { contains: term } }, { region: { contains: term } }, { country: { contains: term } }, { title: { contains: term } }],
      });
    }
  }
  if (f.category) and.push({ categories: { contains: f.category } });
  const guestCount = f.adults + f.children;
  if (guestCount > 1) and.push({ guests: { gte: guestCount } });
  if (f.pets > 0) and.push({ amenities: { contains: '"pets"' } });
  if (!opts.ignorePrice) {
    if (f.minPrice != null) and.push({ price: { gte: f.minPrice } });
    if (f.maxPrice != null) and.push({ price: { lte: f.maxPrice } });
  }
  if (f.roomType) and.push({ roomType: f.roomType });
  if (f.bedrooms) and.push({ bedrooms: { gte: f.bedrooms } });
  if (f.beds) and.push({ beds: { gte: f.beds } });
  if (f.baths) and.push({ baths: { gte: f.baths } });
  if (f.propertyTypes.length) and.push({ propertyType: { in: f.propertyTypes } });
  for (const a of f.amenities) and.push({ amenities: { contains: `"${a}"` } });
  if (f.guestFavorite) and.push({ guestFavorite: true });
  if (f.bounds) {
    const [south, west, north, east] = f.bounds;
    and.push({ lat: { gte: south, lte: north }, lng: { gte: west, lte: east } });
  }
  if (f.checkIn && f.checkOut) {
    and.push({
      reservations: {
        none: { status: "confirmed", checkIn: { lt: f.checkOut }, checkOut: { gt: f.checkIn } },
      },
    });
  }
  return and.length ? { AND: and } : {};
}

export async function searchListings(f: SearchFilters, take = 200) {
  const rows = await prisma.listing.findMany({
    where: buildWhere(f),
    select: cardSelect,
    orderBy: [{ guestFavorite: "desc" }, { reviewCount: "desc" }],
    take,
  });
  return rows.map(toCard);
}

export async function countListings(f: SearchFilters) {
  return prisma.listing.count({ where: buildWhere(f) });
}

/** Prices of listings that match all filters except price — feeds the filter histogram. */
export async function priceDistribution(f: SearchFilters) {
  const rows = await prisma.listing.findMany({ where: buildWhere(f, { ignorePrice: true }), select: { price: true } });
  return rows.map((r) => r.price);
}

export async function browseListings(category: string | null) {
  return searchListings(parseSearchParams(category ? { category } : {}));
}

export async function getSavedListingIds(userId: string | null) {
  if (!userId) return [] as string[];
  const items = await prisma.wishlistItem.findMany({
    where: { wishlist: { ownerId: userId } },
    select: { listingId: true },
  });
  return Array.from(new Set(items.map((i) => i.listingId)));
}

export async function getListingDetail(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      host: {
        include: {
          listings: { select: { id: true, reviewCount: true, ratingAvg: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, image: true, location: true, createdAt: true } } },
      },
      reservations: {
        where: { status: "confirmed", checkOut: { gte: startOfDay(new Date()) } },
        select: { checkIn: true, checkOut: true },
        orderBy: { checkIn: "asc" },
      },
    },
  });
  return listing;
}

export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListingDetail>>>;

export async function getCardsByIds(ids: string[]) {
  const rows = await prisma.listing.findMany({ where: { id: { in: ids } }, select: cardSelect });
  const byId = new Map(rows.map((r) => [r.id, toCard(r)]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as ListingCardData[];
}

export async function recomputeListingRating(listingId: string) {
  const agg = await prisma.review.aggregate({
    where: { listingId },
    _avg: { cleanliness: true, accuracy: true, checkIn: true, communication: true, location: true, value: true },
    _count: true,
  });
  const a = agg._avg;
  const parts = [a.cleanliness, a.accuracy, a.checkIn, a.communication, a.location, a.value].filter((x): x is number => x != null);
  const avg = parts.length ? parts.reduce((s, x) => s + x, 0) / parts.length : 0;
  const ratingAvg = Math.round(avg * 100) / 100;
  await prisma.listing.update({
    where: { id: listingId },
    data: { ratingAvg, reviewCount: agg._count, guestFavorite: agg._count >= 5 && ratingAvg >= 4.85 },
  });
}
