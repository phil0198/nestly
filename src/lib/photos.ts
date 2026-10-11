/**
 * Listing photography. All images are free-licence photos from Pexels (https://www.pexels.com/license/),
 * served from the Pexels CDN. Covers are picked to match each listing's property type and setting;
 * the remaining photos walk through the rooms.
 */

export const PEXELS_HOST = "images.pexels.com";

export function pexels(id: number, width = 1200) {
  return `https://${PEXELS_HOST}/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

const EXTERIORS = {
  modern: [7587880, 6422929, 9976121, 8134746, 20200291],
  villa: [31817156, 8134746, 20200273, 20200291, 1746876],
  beach: [16520694, 2468773, 19130093, 3897529, 333966, 27429688],
  cabin: [28965544, 28965545, 5644485, 12319511, 1084362, 3889919],
  snow: [4969871, 4969837, 18813182, 19278915, 6530839],
  tiny: [19278915, 13008672, 12319511],
  treehouse: [1084362, 3889919, 18813730],
  dome: [33415953, 2526025, 11635537, 17049056, 756780],
  castle: [968705, 6726652, 18144859, 2416463],
  apartment: [6933852, 33893215, 4180974, 28843334, 4703],
} as const;

const ROOMS = {
  living: [4846106, 5825398, 30399204, 4915583, 4451407, 28620165],
  bedroom: [15404863, 15667603, 18738880, 6487951, 7045832, 20390778, 271624],
  kitchen: [6283970, 4713242, 6301168, 10827396, 15062155, 4030908],
  bath: [1457847, 7045299, 6956840, 15369789, 6782573, 7534571],
  outdoor: [7061663, 7587879, 4112236],
} as const;

type ExteriorKind = keyof typeof EXTERIORS;

function exteriorKind(propertyType: string, categories: string[]): ExteriorKind {
  const has = (...c: string[]) => c.some((x) => categories.includes(x));
  switch (propertyType) {
    case "Castle":
      return "castle";
    case "Treehouse":
      return "treehouse";
    case "Dome":
    case "Tent":
      return "dome";
    case "Tiny home":
      return "tiny";
    case "Apartment":
      return "apartment";
    case "Boat":
      return "beach";
    case "Cabin":
      return has("skiing", "arctic", "mountains") ? "snow" : "cabin";
    case "Villa":
      return has("beachfront", "islands") ? "beach" : "villa";
    default:
      if (has("beachfront", "islands")) return "beach";
      if (has("skiing", "arctic")) return "snow";
      if (has("amazing-pools", "tropical", "luxe")) return "villa";
      if (has("cabins", "lakefront", "countryside", "farms")) return "cabin";
      if (has("historical", "design")) return "apartment";
      return "modern";
  }
}

const pick = <T,>(list: readonly T[], n: number) => list[((n % list.length) + list.length) % list.length];

/** Ordered photo set for a listing: cover exterior, then living room, bedroom, kitchen, bath, outdoors… */
export function listingPhotos(listing: { propertyType: string; categories: string[] }, seed: number, count: number) {
  const kind = exteriorKind(listing.propertyType, listing.categories);
  const sequence: number[] = [
    pick(EXTERIORS[kind], seed),
    pick(ROOMS.living, seed),
    pick(ROOMS.bedroom, seed),
    pick(ROOMS.kitchen, seed),
    pick(ROOMS.bath, seed),
    pick(ROOMS.outdoor, seed),
    pick(EXTERIORS[kind], seed + 1),
    pick(ROOMS.bedroom, seed + 3),
    pick(ROOMS.living, seed + 2),
  ];
  return Array.from(new Set(sequence)).slice(0, Math.max(5, count)).map((id) => pexels(id));
}

/** A random but realistic set used by the host wizard's "use sample photos" shortcut. */
export function samplePhotos(seed: number) {
  return listingPhotos({ propertyType: "House", categories: [] }, seed, 5);
}

export const PLACEHOLDER_PHOTO = "/placeholder-home.svg";
