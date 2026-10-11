export interface Category {
  slug: string;
  label: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { slug: "trending", label: "Trending", icon: "trending" },
  { slug: "beachfront", label: "Beachfront", icon: "beachfront" },
  { slug: "cabins", label: "Cabins", icon: "cabins" },
  { slug: "amazing-views", label: "Amazing views", icon: "amazing-views" },
  { slug: "tiny-homes", label: "Tiny homes", icon: "tiny-homes" },
  { slug: "mountains", label: "Mountains", icon: "mountains" },
  { slug: "lakefront", label: "Lakefront", icon: "lakefront" },
  { slug: "amazing-pools", label: "Amazing pools", icon: "amazing-pools" },
  { slug: "countryside", label: "Countryside", icon: "countryside" },
  { slug: "islands", label: "Islands", icon: "islands" },
  { slug: "design", label: "Design", icon: "design" },
  { slug: "tropical", label: "Tropical", icon: "tropical" },
  { slug: "luxe", label: "Luxe", icon: "luxe" },
  { slug: "treehouses", label: "Treehouses", icon: "treehouses" },
  { slug: "skiing", label: "Skiing", icon: "skiing" },
  { slug: "historical", label: "Historical homes", icon: "historical" },
  { slug: "castles", label: "Castles", icon: "castles" },
  { slug: "arctic", label: "Arctic", icon: "arctic" },
  { slug: "camping", label: "Camping", icon: "camping" },
  { slug: "vineyards", label: "Vineyards", icon: "vineyards" },
  { slug: "domes", label: "Domes", icon: "domes" },
  { slug: "farms", label: "Farms", icon: "farms" },
  { slug: "boats", label: "Boats", icon: "boats" },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export interface Amenity {
  id: string;
  label: string;
  icon: string;
  group: string;
}

export const AMENITIES: Amenity[] = [
  { id: "ocean-view", label: "Ocean view", icon: "ocean-view", group: "Scenic views" },
  { id: "mountain-view", label: "Mountain view", icon: "mountain-view", group: "Scenic views" },
  { id: "hair-dryer", label: "Hair dryer", icon: "hair-dryer", group: "Bathroom" },
  { id: "hot-tub", label: "Hot tub", icon: "hot-tub", group: "Bathroom" },
  { id: "washer", label: "Washer", icon: "washer", group: "Bedroom and laundry" },
  { id: "dryer", label: "Dryer", icon: "dryer", group: "Bedroom and laundry" },
  { id: "crib", label: "Crib", icon: "crib", group: "Family" },
  { id: "tv", label: "TV", icon: "tv", group: "Entertainment" },
  { id: "ac", label: "Air conditioning", icon: "ac", group: "Heating and cooling" },
  { id: "heating", label: "Heating", icon: "heating", group: "Heating and cooling" },
  { id: "fireplace", label: "Indoor fireplace", icon: "fireplace", group: "Heating and cooling" },
  { id: "smoke-alarm", label: "Smoke alarm", icon: "smoke-alarm", group: "Home safety" },
  { id: "co-alarm", label: "Carbon monoxide alarm", icon: "co-alarm", group: "Home safety" },
  { id: "first-aid", label: "First aid kit", icon: "first-aid", group: "Home safety" },
  { id: "wifi", label: "Wifi", icon: "wifi", group: "Internet and office" },
  { id: "workspace", label: "Dedicated workspace", icon: "workspace", group: "Internet and office" },
  { id: "kitchen", label: "Kitchen", icon: "kitchen", group: "Kitchen and dining" },
  { id: "coffee", label: "Coffee maker", icon: "coffee", group: "Kitchen and dining" },
  { id: "dishwasher", label: "Dishwasher", icon: "dishwasher", group: "Kitchen and dining" },
  { id: "bbq", label: "BBQ grill", icon: "bbq", group: "Outdoor" },
  { id: "patio", label: "Patio or balcony", icon: "patio", group: "Outdoor" },
  { id: "beach-access", label: "Beach access", icon: "beach-access", group: "Location features" },
  { id: "lake-access", label: "Lake access", icon: "lake-access", group: "Location features" },
  { id: "ski-in", label: "Ski-in/Ski-out", icon: "ski-in", group: "Location features" },
  { id: "pool", label: "Pool", icon: "pool", group: "Parking and facilities" },
  { id: "parking", label: "Free parking on premises", icon: "parking", group: "Parking and facilities" },
  { id: "gym", label: "Gym", icon: "gym", group: "Parking and facilities" },
  { id: "ev-charger", label: "EV charger", icon: "ev-charger", group: "Parking and facilities" },
  { id: "pets", label: "Pets allowed", icon: "pets", group: "Services" },
  { id: "self-check-in", label: "Self check-in", icon: "self-check-in", group: "Services" },
];

export const AMENITY_BY_ID = Object.fromEntries(AMENITIES.map((a) => [a.id, a]));

export const AMENITY_GROUPS = Array.from(new Set(AMENITIES.map((a) => a.group)));

/** Amenities surfaced as quick toggles at the top of the filters modal ("Essentials"). */
export const ESSENTIAL_AMENITIES = ["wifi", "kitchen", "washer", "dryer", "ac", "heating", "workspace", "tv", "pool", "hot-tub", "parking", "ev-charger", "crib", "gym", "bbq", "fireplace", "pets", "self-check-in"];

export const PROPERTY_TYPES = [
  { id: "House", icon: "home" },
  { id: "Apartment", icon: "historical" },
  { id: "Cabin", icon: "cabins" },
  { id: "Villa", icon: "luxe" },
  { id: "Guesthouse", icon: "tiny-homes" },
  { id: "Tiny home", icon: "tiny-homes" },
  { id: "Treehouse", icon: "treehouses" },
  { id: "Dome", icon: "domes" },
  { id: "Castle", icon: "castles" },
  { id: "Boat", icon: "boats" },
  { id: "Farm", icon: "farms" },
  { id: "Tent", icon: "camping" },
] as const;

export const ROOM_TYPES = ["Entire home", "Private room", "Shared room"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_TYPE_DESCRIPTIONS: Record<RoomType, string> = {
  "Entire home": "A place all to yourself",
  "Private room": "Your own room in a home, plus access to shared spaces",
  "Shared room": "A sleeping space and common areas that may be shared with others",
};

export const REVIEW_CATEGORIES = [
  { key: "cleanliness", label: "Cleanliness", icon: "sparkle" },
  { key: "accuracy", label: "Accuracy", icon: "check-circle" },
  { key: "checkIn", label: "Check-in", icon: "key" },
  { key: "communication", label: "Communication", icon: "message" },
  { key: "location", label: "Location", icon: "location" },
  { key: "value", label: "Value", icon: "flag" },
] as const;

export type ReviewCategoryKey = (typeof REVIEW_CATEGORIES)[number]["key"];

/** Destinations offered by the "Where" autocomplete (mirrors the seeded markets). */
export const DESTINATIONS = [
  { label: "Malibu, California", sub: "Sunny coastline and surf breaks", icon: "beachfront", query: "Malibu" },
  { label: "Lake Tahoe, California", sub: "Lakeside cabins in the pines", icon: "lakefront", query: "Lake Tahoe" },
  { label: "Lisbon, Portugal", sub: "Tiled streets and river views", icon: "historical", query: "Lisbon" },
  { label: "Kyoto, Japan", sub: "Temples, gardens and townhouses", icon: "design", query: "Kyoto" },
  { label: "Ubud, Indonesia", sub: "Jungle villas and rice terraces", icon: "tropical", query: "Ubud" },
  { label: "Santorini, Greece", sub: "Caldera sunsets and cave homes", icon: "islands", query: "Santorini" },
  { label: "Banff, Canada", sub: "Rocky Mountain getaways", icon: "mountains", query: "Banff" },
  { label: "Tulum, Mexico", sub: "Cenotes, beaches and domes", icon: "domes", query: "Tulum" },
  { label: "Reykjavík, Iceland", sub: "Northern lights cabins", icon: "arctic", query: "Reykjavík" },
  { label: "Cape Town, South Africa", sub: "Winelands and ocean drives", icon: "vineyards", query: "Cape Town" },
  { label: "Amalfi, Italy", sub: "Lemon groves on the cliffs", icon: "amazing-views", query: "Amalfi" },
  { label: "Scottish Highlands, United Kingdom", sub: "Castles, lochs and bothies", icon: "castles", query: "Scottish Highlands" },
];

export const SUGGESTED_DESTINATIONS = [
  { label: "Nearby", sub: "Find what's around you", icon: "location", query: "" },
  ...DESTINATIONS.slice(0, 7),
];
