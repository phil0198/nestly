# Nestly — build plan

Nestly is a pixel-level functional replica of a well-known home-sharing marketplace UI, with original
branding (name, logo, violet accent). This file captures the data model and route structure decided
before building.

## Stack
Next.js 15 (App Router, RSC) · TypeScript · Tailwind CSS 3 · Prisma 6 + SQLite · NextAuth (Auth.js v4,
credentials + JWT sessions) · Leaflet + OpenStreetMap tiles · Zod · date-fns.

## Data model (prisma/schema.prisma)

| Model          | Key fields |
| -------------- | ---------- |
| `User`         | id, name, email (unique), passwordHash, image, bio, work, languages, location, isSuperhost, responseRate, responseTime, createdAt |
| `Listing`      | id, hostId → User, title, description, propertyType, roomType, categories (comma list), city, region, country, lat, lng, guests, bedrooms, beds, baths, price, cleaningFee, amenities (JSON array), highlights (JSON), ratingAvg/reviewCount (denormalised), guestFavorite, createdAt |
| `ListingImage` | id, listingId → Listing, url, position |
| `Reservation`  | id, listingId, guestId, checkIn, checkOut, adults, children, infants, pets, nightlyPrice, nights, cleaningFee, serviceFee, totalPrice, status, createdAt |
| `Review`       | id, listingId, authorId, reservationId (unique, optional), rating + 6 category scores, comment, createdAt |
| `Wishlist`     | id, ownerId, name, createdAt |
| `WishlistItem` | wishlistId + listingId (composite PK), createdAt |

SQLite has no array/enum types, so categories are a comma-delimited string and amenities/highlights are
JSON strings; `src/lib/listings.ts` parses them. Ratings are denormalised onto `Listing` and recomputed
whenever a review is written so browse/search can sort and badge cheaply.

Availability = all non-cancelled reservations. Double booking is prevented inside a transaction that
checks for overlapping ranges (`checkIn < requestedOut && checkOut > requestedIn`).

## Routes

| Route | Type | Purpose |
| ----- | ---- | ------- |
| `/` | RSC | Browse: category row + listing grid (`?category=`) |
| `/s` | RSC + client | Search results: list + Leaflet price-pin map, filters, guest picker |
| `/rooms/[id]` | RSC + client | Listing detail with photo tour, calendar, reviews, map, booking card |
| `/book/[id]` | RSC + client | Confirm and pay (mock payment) |
| `/trips` | RSC | Upcoming / past trips, leave a review |
| `/trips/[id]` | RSC | Trip (reservation) detail + confirmation |
| `/trips/[id]/review` | client | Review form with category ratings |
| `/wishlists`, `/wishlists/[id]` | RSC | Wishlist collections with cover mosaics |
| `/become-a-host` | client | Multi-step listing wizard |
| `/host/listings` | RSC | Host listings dashboard |
| `/host/reservations` | RSC | Host reservations (upcoming / completed) |
| `/account` | RSC | Profile / account hub (mobile "Profile" tab) |
| `/api/auth/[...nextauth]` | API | NextAuth |
| `/api/register`, `/api/auth/email-exists` | API | Sign-up flow |
| `/api/listings` (POST), `/api/listings/count` (GET) | API | Create listing, live filter count |
| `/api/reservations` (POST) | API | Book (transactional overlap check) |
| `/api/reviews` (POST) | API | Leave review after a past stay |
| `/api/wishlists`, `/api/wishlists/toggle` | API | Wishlist CRUD |
| `/api/upload` | API | Save photo uploads to `public/uploads` |

## Build order
1. Browse → 2. Search + map + filters → 3. Listing detail → 4. Booking → 5. Auth → 6. Trips/Wishlists →
7. Host wizard + dashboards → 8. Reviews. Then typecheck/lint/click-through polish, README.
