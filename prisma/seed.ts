import { PrismaClient, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, startOfDay, subDays } from "date-fns";
import { listingPhotos } from "../src/lib/photos";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Deterministic PRNG so every seed run produces the same data set.
// ---------------------------------------------------------------------------
let state = 20251011;
function rand() {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
}
const between = (min: number, max: number) => min + rand() * (max - min);
const int = (min: number, max: number) => Math.floor(between(min, max + 1));
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
function sample<T>(arr: readonly T[], n: number) {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
}

const PASSWORD = "password123";

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------
const HOSTS = [
  { name: "Marta Oliveira", email: "marta@nestly.dev", location: "Lisbon, Portugal", work: "Architect", languages: "English, Portuguese, Spanish", superhost: true },
  { name: "Daniel Brooks", email: "daniel@nestly.dev", location: "Los Angeles, California", work: "Surf instructor", languages: "English", superhost: true },
  { name: "Yuki Tanaka", email: "yuki@nestly.dev", location: "Kyoto, Japan", work: "Tea ceremony teacher", languages: "English, Japanese", superhost: true },
  { name: "Elena Papadakis", email: "elena@nestly.dev", location: "Santorini, Greece", work: "Hotelier", languages: "English, Greek, Italian", superhost: false },
  { name: "Ketut Wirawan", email: "ketut@nestly.dev", location: "Ubud, Indonesia", work: "Woodworker", languages: "English, Indonesian", superhost: true },
  { name: "Claire Fontaine", email: "claire@nestly.dev", location: "Banff, Canada", work: "Mountain guide", languages: "English, French", superhost: false },
  { name: "Sofía Ramírez", email: "sofia@nestly.dev", location: "Tulum, Mexico", work: "Yoga teacher", languages: "English, Spanish", superhost: true },
  { name: "Gunnar Sigurðsson", email: "gunnar@nestly.dev", location: "Reykjavík, Iceland", work: "Photographer", languages: "English, Icelandic", superhost: false },
  { name: "Thabo Nkosi", email: "thabo@nestly.dev", location: "Cape Town, South Africa", work: "Winemaker", languages: "English, Zulu, Afrikaans", superhost: true },
  { name: "Luca Bianchi", email: "luca@nestly.dev", location: "Amalfi, Italy", work: "Chef", languages: "English, Italian", superhost: false },
];

const GUESTS = [
  { name: "Alex Morgan", email: "guest@nestly.dev", location: "Chicago, Illinois" },
  { name: "Priya Shah", email: "priya@nestly.dev", location: "London, United Kingdom" },
  { name: "Jonas Weber", email: "jonas@nestly.dev", location: "Berlin, Germany" },
  { name: "Chloé Martin", email: "chloe@nestly.dev", location: "Paris, France" },
  { name: "Mateo García", email: "mateo@nestly.dev", location: "Madrid, Spain" },
  { name: "Hannah Lee", email: "hannah@nestly.dev", location: "Seoul, South Korea" },
  { name: "Olivia Chen", email: "olivia@nestly.dev", location: "Vancouver, Canada" },
  { name: "Noah Williams", email: "noah@nestly.dev", location: "Austin, Texas" },
  { name: "Emma Johansson", email: "emma@nestly.dev", location: "Stockholm, Sweden" },
  { name: "Liam O'Connor", email: "liam@nestly.dev", location: "Dublin, Ireland" },
  { name: "Ava Rossi", email: "ava@nestly.dev", location: "Milan, Italy" },
  { name: "Ethan Kim", email: "ethan@nestly.dev", location: "San Francisco, California" },
  { name: "Mia Novak", email: "mia@nestly.dev", location: "Prague, Czechia" },
  { name: "Lucas Silva", email: "lucas@nestly.dev", location: "São Paulo, Brazil" },
  { name: "Grace Taylor", email: "grace@nestly.dev", location: "Sydney, Australia" },
  { name: "Omar Haddad", email: "omar@nestly.dev", location: "Dubai, UAE" },
];

// ---------------------------------------------------------------------------
// Destinations: centre point, spread (degrees) and flavour for generated copy.
// ---------------------------------------------------------------------------
interface Destination {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  spread: number;
  host: number;
  priceRange: [number, number];
  categories: string[];
  types: string[];
  amenities: string[];
  vibe: string[];
  nouns: string[];
  count: number;
}

const DESTINATIONS: Destination[] = [
  {
    city: "Malibu", region: "California", country: "United States", lat: 34.0259, lng: -118.7798, spread: 0.08, host: 1,
    priceRange: [280, 1100], categories: ["beachfront", "amazing-views", "amazing-pools", "luxe", "design", "trending"],
    types: ["House", "Villa", "Guesthouse"], amenities: ["ocean-view", "beach-access", "pool", "hot-tub", "bbq", "patio", "ac"],
    vibe: ["Oceanfront", "Cliffside", "Sunset", "Modern", "Breezy"], nouns: ["Beach House", "Retreat", "Villa", "Hideaway", "Surf Shack"], count: 7,
  },
  {
    city: "Lake Tahoe", region: "California", country: "United States", lat: 39.0968, lng: -120.0324, spread: 0.12, host: 1,
    priceRange: [160, 620], categories: ["lakefront", "cabins", "skiing", "mountains", "trending"],
    types: ["Cabin", "House", "Tiny home"], amenities: ["lake-access", "fireplace", "hot-tub", "mountain-view", "ski-in", "heating", "bbq"],
    vibe: ["Lakeside", "Alpine", "Cozy", "Pine-shaded", "Rustic"], nouns: ["Cabin", "Lodge", "A-Frame", "Chalet", "Hideout"], count: 6,
  },
  {
    city: "Lisbon", region: "Lisbon District", country: "Portugal", lat: 38.7223, lng: -9.1393, spread: 0.035, host: 0,
    priceRange: [70, 260], categories: ["historical", "design", "trending", "amazing-views"],
    types: ["Apartment", "Guesthouse", "House"], amenities: ["workspace", "ac", "patio", "coffee", "washer"],
    vibe: ["Sunny", "Tiled", "Riverside", "Historic", "Bright"], nouns: ["Loft", "Apartment", "Studio", "Townhouse", "Flat"], count: 7,
  },
  {
    city: "Kyoto", region: "Kyoto Prefecture", country: "Japan", lat: 35.0116, lng: 135.7681, spread: 0.04, host: 2,
    priceRange: [90, 420], categories: ["historical", "design", "tiny-homes", "trending"],
    types: ["House", "Guesthouse", "Apartment"], amenities: ["workspace", "ac", "heating", "coffee", "washer"],
    vibe: ["Traditional", "Zen", "Garden", "Quiet", "Restored"], nouns: ["Machiya", "Townhouse", "Ryokan Suite", "Tea House", "Studio"], count: 6,
  },
  {
    city: "Ubud", region: "Bali", country: "Indonesia", lat: -8.5069, lng: 115.2625, spread: 0.06, host: 4,
    priceRange: [60, 380], categories: ["tropical", "amazing-pools", "treehouses", "design", "amazing-views"],
    types: ["Villa", "Treehouse", "Guesthouse"], amenities: ["pool", "ac", "patio", "mountain-view", "coffee"],
    vibe: ["Jungle", "Bamboo", "Rice-terrace", "Tropical", "Open-air"], nouns: ["Villa", "Treehouse", "Bungalow", "Retreat", "Hut"], count: 7,
  },
  {
    city: "Santorini", region: "South Aegean", country: "Greece", lat: 36.4167, lng: 25.4318, spread: 0.06, host: 3,
    priceRange: [150, 900], categories: ["islands", "amazing-views", "amazing-pools", "luxe", "beachfront"],
    types: ["Villa", "House", "Guesthouse"], amenities: ["ocean-view", "pool", "hot-tub", "patio", "ac"],
    vibe: ["Caldera", "Whitewashed", "Cave", "Sunset", "Cliffside"], nouns: ["Cave House", "Suite", "Villa", "Retreat", "Hideaway"], count: 6,
  },
  {
    city: "Banff", region: "Alberta", country: "Canada", lat: 51.1784, lng: -115.5708, spread: 0.07, host: 5,
    priceRange: [140, 560], categories: ["mountains", "cabins", "skiing", "amazing-views", "lakefront"],
    types: ["Cabin", "House", "Tiny home"], amenities: ["mountain-view", "fireplace", "hot-tub", "heating", "ski-in", "parking"],
    vibe: ["Rocky Mountain", "Timber", "Snowy", "Glacier-view", "Woodland"], nouns: ["Cabin", "Chalet", "Lodge", "Cottage", "A-Frame"], count: 6,
  },
  {
    city: "Tulum", region: "Quintana Roo", country: "Mexico", lat: 20.2114, lng: -87.4654, spread: 0.06, host: 6,
    priceRange: [90, 520], categories: ["tropical", "beachfront", "amazing-pools", "design", "domes", "trending"],
    types: ["Villa", "House", "Dome", "Treehouse"], amenities: ["pool", "beach-access", "ac", "patio", "ocean-view"],
    vibe: ["Cenote-side", "Jungle", "Boho", "Beachfront", "Earthen"], nouns: ["Casa", "Dome", "Villa", "Cabana", "Treehouse"], count: 6,
  },
  {
    city: "Reykjavík", region: "Capital Region", country: "Iceland", lat: 64.1466, lng: -21.9426, spread: 0.25, host: 7,
    priceRange: [120, 480], categories: ["arctic", "amazing-views", "domes", "countryside", "tiny-homes"],
    types: ["Cabin", "Dome", "Tiny home", "House"], amenities: ["heating", "hot-tub", "mountain-view", "ocean-view", "parking"],
    vibe: ["Aurora", "Lava-field", "Fjord", "Glass", "Nordic"], nouns: ["Cabin", "Dome", "Cottage", "Hut", "Lodge"], count: 6,
  },
  {
    city: "Cape Town", region: "Western Cape", country: "South Africa", lat: -33.9249, lng: 18.4241, spread: 0.12, host: 8,
    priceRange: [80, 450], categories: ["vineyards", "amazing-views", "beachfront", "amazing-pools", "farms"],
    types: ["House", "Villa", "Farm", "Apartment"], amenities: ["pool", "ocean-view", "mountain-view", "bbq", "patio", "parking"],
    vibe: ["Table Mountain", "Winelands", "Atlantic", "Fynbos", "Coastal"], nouns: ["Villa", "Farmhouse", "Cottage", "Apartment", "Estate"], count: 6,
  },
  {
    city: "Amalfi", region: "Campania", country: "Italy", lat: 40.634, lng: 14.6027, spread: 0.05, host: 9,
    priceRange: [130, 700], categories: ["amazing-views", "historical", "beachfront", "castles", "luxe"],
    types: ["Villa", "Apartment", "Castle", "House"], amenities: ["ocean-view", "patio", "ac", "coffee", "pool"],
    vibe: ["Lemon-grove", "Clifftop", "Seaside", "Frescoed", "Terraced"], nouns: ["Villa", "Palazzo Suite", "Tower", "Apartment", "Casa"], count: 6,
  },
  {
    city: "Scottish Highlands", region: "Highland", country: "United Kingdom", lat: 57.12, lng: -4.71, spread: 0.4, host: 0,
    priceRange: [95, 480], categories: ["castles", "countryside", "lakefront", "camping", "historical", "farms"],
    types: ["Castle", "Cabin", "Farm", "Tent"], amenities: ["fireplace", "heating", "mountain-view", "lake-access", "parking", "pets"],
    vibe: ["Loch-side", "Heather", "Baronial", "Glen", "Highland"], nouns: ["Castle", "Bothy", "Croft", "Lodge", "Glamping Tent"], count: 5,
  },
];

const BASE_AMENITIES = ["wifi", "kitchen", "smoke-alarm", "co-alarm", "first-aid", "hair-dryer", "tv", "heating", "self-check-in", "dryer", "dishwasher", "crib", "gym", "ev-charger", "pets", "parking", "workspace", "washer"];

const HIGHLIGHT_POOL = [
  { icon: "door", title: "Self check-in", body: "Check yourself in with the keypad." },
  { icon: "location", title: "Great location", body: "95% of recent guests gave the location a 5-star rating." },
  { icon: "key", title: "Great check-in experience", body: "Recent guests loved the smooth start to this stay." },
  { icon: "message", title: "Great communication", body: "Recent guests rated the host's replies 5 stars." },
  { icon: "free-cancel", title: "Free cancellation for 48 hours", body: "Get a full refund if you change your mind." },
  { icon: "workspace", title: "Dedicated workspace", body: "A common area with wifi that's well-suited for working." },
  { icon: "pool", title: "Dive right in", body: "This is one of the few places in the area with a pool." },
  { icon: "mountain-view", title: "Room with a view", body: "Guests say the views are worth the trip alone." },
  { icon: "pets", title: "Furry friends welcome", body: "Bring your pets along for the stay." },
];

const DESCRIPTION_OPENERS = [
  "Wake up to soft morning light and slow mornings in this thoughtfully designed",
  "Settle into this calm, light-filled",
  "Escape the everyday at this one-of-a-kind",
  "Slow down and recharge in our lovingly restored",
  "Make memories in this airy, characterful",
];

const DESCRIPTION_MIDDLES = [
  "Every corner was put together with local makers, natural materials and plenty of places to curl up with a book.",
  "The open-plan living space flows onto a private terrace that's perfect for long dinners and stargazing.",
  "You'll find a fully stocked kitchen, fast wifi, and beds dressed in crisp, breathable linen.",
  "It's an easy walk to cafés, markets and the best local swimming spot — ask us for our favourites.",
  "Large windows frame the landscape so the view follows you from room to room.",
];

const SPACE_PARAGRAPHS = [
  "The space\nThe main bedroom has a king-size bed and blackout curtains. The second bedroom has two singles that can be pushed together. The bathroom has a rainfall shower, organic toiletries and fluffy towels.",
  "The space\nDownstairs is one big living area with a sofa, dining table for six and a wood stove. Upstairs, the sleeping loft looks out over the treetops.",
  "The space\nA private entrance opens onto a bright lounge. The kitchen includes an espresso machine, oven, induction hob and everything you need to cook a proper meal.",
];

const ACCESS_PARAGRAPHS = [
  "Guest access\nYou'll have the whole place to yourself, including the garden and outdoor shower.",
  "Guest access\nGuests have private use of the home, terrace and parking space. The pool is shared with one other unit.",
  "Guest access\nThe entire property is yours. Self check-in is via a smart lock — we'll send the code the day before arrival.",
];

const NOTE_PARAGRAPHS = [
  "Other things to note\nThe final stretch of road is gravel; any car can manage it slowly.",
  "Other things to note\nThere are a few stairs to reach the entrance, so the home may not suit guests with limited mobility.",
  "Other things to note\nQuiet hours are from 10pm to 8am out of respect for our neighbours.",
];

const REVIEW_SNIPPETS = [
  "Absolutely stunning place. Photos don't do it justice — we didn't want to leave.",
  "The host was incredibly responsive and gave us great local tips. Spotless and cozy.",
  "Perfect location for exploring the area. Beds were super comfortable and the kitchen had everything.",
  "One of the best stays we've had. Thoughtful touches everywhere and the views were unreal.",
  "Great value for the location. Check-in was seamless and the place was exactly as described.",
  "We came for a week and it felt like home by day two. Would book again in a heartbeat.",
  "Beautiful design, peaceful and quiet. The outdoor space was our favourite part of the trip.",
  "Lovely home with a very warm welcome. Small kitchen but it had all the essentials.",
  "The sunsets from the terrace were the highlight of our trip. Highly recommend!",
  "Clean, comfortable, and well-equipped. Communication was excellent from start to finish.",
  "Charming spot with lots of character. A little noisy at night but nothing major.",
  "We loved every minute. The host left a welcome basket with local treats — such a nice touch.",
  "Ideal for remote work: fast wifi, a great desk and plenty of light.",
  "Exactly what we needed for a quiet getaway. The hot tub under the stars was magical.",
  "Super easy to get to and walking distance to great restaurants. Would stay again.",
  "The place was nice but the stairs were tough with luggage. Otherwise a lovely stay.",
  "Our kids loved the garden and we loved the peace. Thank you for having us!",
  "Gorgeous property, impeccably clean, and the host thought of everything.",
];

const REVIEW_TAILS = [
  "", "", "",
  " Already planning our next visit.",
  " Thanks again for a wonderful stay!",
  " Bring good walking shoes — the area is made for exploring.",
  " The coffee setup was a lovely bonus.",
  " Highly recommended for couples.",
  " Great for families too.",
];


async function main() {
  console.log("Seeding Nestly…");
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const today = startOfDay(new Date());

  const hosts: User[] = [];
  for (const [i, h] of HOSTS.entries()) {
    hosts.push(
      await prisma.user.create({
        data: {
          name: h.name,
          email: h.email,
          passwordHash,
          image: `https://i.pravatar.cc/240?img=${(i * 3 + 11) % 70}`,
          bio: `Hi, I'm ${h.name.split(" ")[0]}! I love sharing my corner of ${h.location.split(",")[0]} with travellers and helping them find the spots locals love.`,
          work: h.work,
          languages: h.languages,
          location: h.location,
          isSuperhost: h.superhost,
          responseRate: h.superhost ? 100 : int(88, 99),
          responseTime: h.superhost ? "within an hour" : "within a few hours",
          createdAt: subDays(today, int(400, 3200)),
        },
      }),
    );
  }

  const guests: User[] = [];
  for (const [i, g] of GUESTS.entries()) {
    guests.push(
      await prisma.user.create({
        data: {
          name: g.name,
          email: g.email,
          passwordHash,
          image: i === 0 ? null : `https://i.pravatar.cc/240?img=${(i * 4 + 1) % 70}`,
          location: g.location,
          createdAt: subDays(today, int(200, 2800)),
        },
      }),
    );
  }

  const everyone = [...hosts, ...guests];
  let listingCount = 0;
  let reviewCount = 0;
  let reservationCount = 0;

  for (const dest of DESTINATIONS) {
    for (let n = 0; n < dest.count; n++) {
      listingCount++;
      const propertyType = pick(dest.types);
      const roomType = rand() < 0.82 ? "Entire home" : rand() < 0.85 ? "Private room" : "Shared room";
      const bedrooms = roomType === "Entire home" ? int(1, 5) : 1;
      const beds = bedrooms + int(0, 2);
      const baths = roomType === "Entire home" ? Math.max(1, Math.round(bedrooms * between(0.6, 1.1) * 2) / 2) : pick([1, 1.5]);
      const guestsMax = Math.min(16, beds * 2);
      const [lo, hi] = dest.priceRange;
      const price = Math.round((lo + (hi - lo) * Math.pow(rand(), 1.6) + bedrooms * 15) / 5) * 5;
      const cats = sample(dest.categories, int(1, 3));
      if (propertyType === "Tiny home" && !cats.includes("tiny-homes")) cats.push("tiny-homes");
      if (propertyType === "Treehouse" && !cats.includes("treehouses")) cats.push("treehouses");
      if (propertyType === "Dome" && !cats.includes("domes")) cats.push("domes");
      if (propertyType === "Castle" && !cats.includes("castles")) cats.push("castles");
      if (propertyType === "Cabin" && !cats.includes("cabins")) cats.push("cabins");
      if (propertyType === "Farm" && !cats.includes("farms")) cats.push("farms");
      if (propertyType === "Tent" && !cats.includes("camping")) cats.push("camping");
      const amenities = Array.from(new Set([
        "wifi", "kitchen", "smoke-alarm", "co-alarm", "heating",
        ...sample(dest.amenities, int(2, dest.amenities.length)),
        ...sample(BASE_AMENITIES, int(4, 10)),
      ]));
      const title = `${pick(dest.vibe)} ${pick(dest.nouns)}${rand() < 0.35 ? ` with ${pick(["Pool", "View", "Terrace", "Hot Tub", "Garden", "Fireplace"])}` : ""}`;
      const description = [
        `${pick(DESCRIPTION_OPENERS)} ${propertyType.toLowerCase()} in ${dest.city}. ${pick(DESCRIPTION_MIDDLES)} ${pick(DESCRIPTION_MIDDLES)}`,
        pick(SPACE_PARAGRAPHS),
        pick(ACCESS_PARAGRAPHS),
        pick(NOTE_PARAGRAPHS),
      ].join("\n\n");
      const highlights = sample(HIGHLIGHT_POOL, 3);
      const lat = dest.lat + between(-dest.spread, dest.spread);
      const lng = dest.lng + between(-dest.spread, dest.spread) * 1.3;
      const hostIdx = n % 3 === 2 ? (dest.host + 1 + n) % hosts.length : dest.host;
      const imageCount = int(6, 9);
      const photos = listingPhotos({ propertyType, categories: cats }, listingCount * 7 + n, imageCount);

      const listing = await prisma.listing.create({
        data: {
          hostId: hosts[hostIdx].id,
          title,
          description,
          propertyType,
          roomType,
          categories: cats.join(","),
          city: dest.city,
          region: dest.region,
          country: dest.country,
          lat,
          lng,
          guests: guestsMax,
          bedrooms,
          beds,
          baths,
          price,
          cleaningFee: Math.round((price * between(0.15, 0.45)) / 5) * 5,
          amenities: JSON.stringify(amenities),
          highlights: JSON.stringify(highlights),
          createdAt: subDays(today, int(30, 900)),
          images: {
            create: photos.map((url, position) => ({ url, position })),
          },
        },
      });

      // Past stays (each produces a review) + upcoming reservations that block calendar dates.
      const reviewTarget = n === 0 && dest.count > 6 ? 0 : int(2, 9);
      let cursor = subDays(today, int(30, 60));
      const ratings: number[] = [];
      for (let r = 0; r < reviewTarget; r++) {
        const nights = int(2, 7);
        const checkOut = cursor;
        const checkIn = subDays(checkOut, nights);
        cursor = subDays(checkIn, int(4, 40));
        const guest = pick(everyone.filter((u) => u.id !== hosts[hostIdx].id));
        const subtotal = price * nights;
        const cleaningFee = listing.cleaningFee;
        const serviceFee = Math.round(subtotal * 0.14);
        const reservation = await prisma.reservation.create({
          data: {
            listingId: listing.id, guestId: guest.id, checkIn, checkOut,
            adults: int(1, Math.min(4, guestsMax)), nightlyPrice: price, nights, cleaningFee, serviceFee,
            totalPrice: subtotal + cleaningFee + serviceFee, createdAt: subDays(checkIn, int(10, 60)),
          },
        });
        reservationCount++;
        const quality = between(0, 1);
        const score = () => (quality > 0.2 ? (rand() < 0.9 ? 5 : 4) : pick([3, 4, 4, 5, 5, 5]));
        const cat = { cleanliness: score(), accuracy: score(), checkIn: score(), communication: score(), location: score(), value: score() };
        const overall = Math.round((cat.cleanliness + cat.accuracy + cat.checkIn + cat.communication + cat.location + cat.value) / 6);
        ratings.push(overall);
        await prisma.review.create({
          data: {
            listingId: listing.id, authorId: guest.id, reservationId: reservation.id, rating: overall, ...cat,
            comment: pick(REVIEW_SNIPPETS) + pick(REVIEW_TAILS),
            createdAt: addDays(checkOut, int(1, 6)),
          },
        });
        reviewCount++;
      }

      const upcoming = int(1, 3);
      let next = addDays(today, int(3, 20));
      for (let u = 0; u < upcoming; u++) {
        const nights = int(2, 6);
        const checkIn = next;
        const checkOut = addDays(checkIn, nights);
        next = addDays(checkOut, int(3, 25));
        const guest = pick(guests.slice(1));
        const subtotal = price * nights;
        await prisma.reservation.create({
          data: {
            listingId: listing.id, guestId: guest.id, checkIn, checkOut, adults: 2, nightlyPrice: price, nights,
            cleaningFee: listing.cleaningFee, serviceFee: Math.round(subtotal * 0.14),
            totalPrice: subtotal + listing.cleaningFee + Math.round(subtotal * 0.14),
          },
        });
        reservationCount++;
      }

      const agg = await prisma.review.aggregate({
        where: { listingId: listing.id },
        _avg: { cleanliness: true, accuracy: true, checkIn: true, communication: true, location: true, value: true },
      });
      const parts = Object.values(agg._avg).filter((x): x is number => x != null);
      const ratingAvg = parts.length ? Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) / 100 : 0;
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          ratingAvg,
          reviewCount: ratings.length,
          guestFavorite: ratings.length >= 5 && ratingAvg >= 4.85,
        },
      });
    }
  }

  // ---- Demo guest: trips (past + upcoming) and wishlists ----
  const demo = guests[0];
  const all = await prisma.listing.findMany({ select: { id: true, price: true, cleaningFee: true }, orderBy: { createdAt: "asc" } });

  const pastPicks = [all[3], all[20], all[41]];
  for (const [i, l] of pastPicks.entries()) {
    const checkOut = subDays(today, 10 + i * 45);
    const checkIn = subDays(checkOut, 4);
    const subtotal = l.price * 4;
    await prisma.reservation.create({
      data: {
        listingId: l.id, guestId: demo.id, checkIn, checkOut, adults: 2, nightlyPrice: l.price, nights: 4,
        cleaningFee: l.cleaningFee, serviceFee: Math.round(subtotal * 0.14),
        totalPrice: subtotal + l.cleaningFee + Math.round(subtotal * 0.14), createdAt: subDays(checkIn, 30),
      },
    });
    reservationCount++;
  }
  // An upcoming trip far enough out not to collide with generated bookings.
  const up = all[12];
  {
    const checkIn = addDays(today, 120);
    const checkOut = addDays(checkIn, 5);
    const subtotal = up.price * 5;
    await prisma.reservation.create({
      data: {
        listingId: up.id, guestId: demo.id, checkIn, checkOut, adults: 2, children: 1, nightlyPrice: up.price, nights: 5,
        cleaningFee: up.cleaningFee, serviceFee: Math.round(subtotal * 0.14),
        totalPrice: subtotal + up.cleaningFee + Math.round(subtotal * 0.14),
      },
    });
    reservationCount++;
  }

  await prisma.wishlist.create({
    data: {
      ownerId: demo.id, name: "Summer by the sea",
      items: { create: [all[0], all[1], all[37], all[50]].map((l) => ({ listingId: l.id })) },
    },
  });
  await prisma.wishlist.create({
    data: {
      ownerId: demo.id, name: "Cabin weekends",
      items: { create: [all[7], all[9], all[39]].map((l) => ({ listingId: l.id })) },
    },
  });

  console.log(`✔ ${hosts.length + guests.length} users, ${listingCount} listings, ${reservationCount} reservations, ${reviewCount} reviews`);
  console.log(`  Demo guest: guest@nestly.dev / ${PASSWORD}`);
  console.log(`  Demo host:  marta@nestly.dev / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
