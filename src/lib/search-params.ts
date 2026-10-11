import { isValid, parseISO, format } from "date-fns";
import { z } from "zod";
import { ROOM_TYPES, type RoomType } from "./constants";

export interface SearchFilters {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  roomType: RoomType | null;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  propertyTypes: string[];
  guestFavorite: boolean;
  /** [south, west, north, east] */
  bounds: [number, number, number, number] | null;
}

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function get(params: RawParams, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

const intish = (min: number, max: number) =>
  z.coerce.number().int().min(min).max(max).catch(min);

function date(v: string | undefined) {
  if (!v) return null;
  const d = parseISO(v);
  return isValid(d) ? d : null;
}

function num(v: string | undefined) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseSearchParams(params: RawParams): SearchFilters {
  let checkIn = date(get(params, "checkin"));
  let checkOut = date(get(params, "checkout"));
  if (checkIn && checkOut && checkOut <= checkIn) checkOut = null;
  if (!checkIn) checkOut = null;
  if (!checkOut) checkIn = checkIn ?? null;

  const room = get(params, "room_type");
  const boundsRaw = get(params, "bounds")?.split(",").map(Number);
  const bounds =
    boundsRaw && boundsRaw.length === 4 && boundsRaw.every(Number.isFinite)
      ? (boundsRaw as [number, number, number, number])
      : null;
  const adults = intish(0, 16).parse(get(params, "adults") ?? 0);

  return {
    location: (get(params, "location") ?? "").trim(),
    checkIn,
    checkOut,
    adults,
    children: intish(0, 15).parse(get(params, "children") ?? 0),
    infants: intish(0, 5).parse(get(params, "infants") ?? 0),
    pets: intish(0, 5).parse(get(params, "pets") ?? 0),
    category: get(params, "category") || null,
    minPrice: num(get(params, "price_min")),
    maxPrice: num(get(params, "price_max")),
    roomType: ROOM_TYPES.includes(room as RoomType) ? (room as RoomType) : null,
    bedrooms: intish(0, 8).parse(get(params, "bedrooms") ?? 0),
    beds: intish(0, 8).parse(get(params, "beds") ?? 0),
    baths: intish(0, 8).parse(get(params, "baths") ?? 0),
    amenities: (get(params, "amenities") ?? "").split(",").filter(Boolean),
    propertyTypes: (get(params, "property_types") ?? "").split(",").filter(Boolean),
    guestFavorite: get(params, "guest_favorite") === "1",
    bounds,
  };
}

export const isoDay = (d: Date) => format(d, "yyyy-MM-dd");

/** Serialises filters to a query string, omitting defaults. */
export function toQueryString(f: Partial<SearchFilters>) {
  const q = new URLSearchParams();
  if (f.location) q.set("location", f.location);
  if (f.checkIn) q.set("checkin", isoDay(f.checkIn));
  if (f.checkOut) q.set("checkout", isoDay(f.checkOut));
  if (f.adults) q.set("adults", String(f.adults));
  if (f.children) q.set("children", String(f.children));
  if (f.infants) q.set("infants", String(f.infants));
  if (f.pets) q.set("pets", String(f.pets));
  if (f.category) q.set("category", f.category);
  if (f.minPrice != null) q.set("price_min", String(f.minPrice));
  if (f.maxPrice != null) q.set("price_max", String(f.maxPrice));
  if (f.roomType) q.set("room_type", f.roomType);
  if (f.bedrooms) q.set("bedrooms", String(f.bedrooms));
  if (f.beds) q.set("beds", String(f.beds));
  if (f.baths) q.set("baths", String(f.baths));
  if (f.amenities?.length) q.set("amenities", f.amenities.join(","));
  if (f.propertyTypes?.length) q.set("property_types", f.propertyTypes.join(","));
  if (f.guestFavorite) q.set("guest_favorite", "1");
  if (f.bounds) q.set("bounds", f.bounds.map((n) => n.toFixed(4)).join(","));
  return q.toString();
}

export function guestSummary(f: Pick<SearchFilters, "adults" | "children" | "infants" | "pets">, empty = "Add guests") {
  const guests = f.adults + f.children;
  if (!guests && !f.infants && !f.pets) return empty;
  const parts = [`${guests} guest${guests === 1 ? "" : "s"}`];
  if (f.infants) parts.push(`${f.infants} infant${f.infants === 1 ? "" : "s"}`);
  if (f.pets) parts.push(`${f.pets} pet${f.pets === 1 ? "" : "s"}`);
  return parts.join(", ");
}

/** Number of active filters shown on the "Filters" button badge. */
export function activeFilterCount(f: SearchFilters) {
  let n = 0;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.roomType) n++;
  if (f.bedrooms) n++;
  if (f.beds) n++;
  if (f.baths) n++;
  n += f.amenities.length;
  n += f.propertyTypes.length;
  if (f.guestFavorite) n++;
  return n;
}
