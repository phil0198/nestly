# Nestly

Nestly is a working holiday-rental marketplace. Its layout, interaction patterns and user flows follow
the big home-sharing sites closely. The branding is entirely original: the name, the nest-and-roofline
logo, the violet accent (`#6B4EFF`), the line-icon set and all copy were made for this project.

Built with Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · NextAuth (Auth.js)
credentials · Leaflet + OpenStreetMap · Zod · date-fns.

## Quick start

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Then open <http://localhost:3000>. Requires Node 18.18+ (tested on Node 22).

- `.env` is committed with safe local defaults (`DATABASE_URL="file:./dev.db"`, a dev-only
  `NEXTAUTH_SECRET`), so nothing needs configuring. Set your own secret before deploying anywhere.
- `npm run seed` is idempotent: it wipes and re-creates all data.
- Other scripts: `npm run typecheck`, `npm run lint`, `npm run build && npm start`.

## Deploy (public URL on Railway)

The repo is ready for [Railway](https://railway.com). `railway.json` sets the build and start commands,
and `npm run start:prod` (`scripts/start.mjs`) does the rest on every boot:

- puts the SQLite database, uploaded photos and an auto-generated login secret on Railway's persistent volume
- applies database migrations
- loads the demo data the first time only, so redeploys never wipe bookings or listings
- sets the sign-in URL from the domain Railway gives you

No environment variables are required.

1. Sign in at <https://railway.com> with your GitHub account.
2. **New Project → Deploy from GitHub repo → `phil0198/nestly`**. Allow Railway access to the repo if asked.
   If the deploy uses the wrong branch, open the service's **Settings → Source** and choose
   `claude/peaceful-ride-lt7ntb`.
3. Add storage: right-click the service (or open the command palette with ⌘K / Ctrl+K) → **Add Volume**,
   and set the mount path to `/data`.
4. Get a URL: **Settings → Networking → Generate Domain**.
5. Wait for the deploy to turn green (the first build takes a few minutes), then open the domain.
   Log in with `guest@nestly.dev` / `password123`.

Railway's trial credit covers trying it out; keeping it running needs the Hobby plan (about $5/month).

Without a volume the site still works, but the database resets to the demo data on every redeploy.

The same start script works on any host with a persistent disk (Render, Fly.io, a VPS): set
`DATA_DIR` to the disk's path and `NEXTAUTH_URL` to the site's public URL.

## Test accounts

All seeded accounts use the password **`password123`**.

| Role | Email | Notes |
| ---- | ----- | ----- |
| Guest | `guest@nestly.dev` | Has 1 upcoming trip, 3 past trips (reviewable), 2 wishlists |
| Host  | `marta@nestly.dev` | Superhost with listings in Lisbon and the Scottish Highlands |
| Host  | `daniel@nestly.dev`, `yuki@nestly.dev`, `elena@nestly.dev`, … | 10 hosts in total |
| Guests | `priya@nestly.dev`, `jonas@nestly.dev`, … | 16 guests in total |

The login modal also has a **Continue with demo guest account** shortcut.

## Seed data

- 26 users (10 hosts, 16 guests)
- 74 listings across 12 destinations in 10 countries: Malibu, Lake Tahoe, Lisbon, Kyoto, Ubud (Bali),
  Santorini, Banff, Tulum, Reykjavík, Cape Town, Amalfi, and the Scottish Highlands
- About 520 reservations (past and upcoming, which block calendar dates) and about 380 reviews with
  category scores

The seed uses a fixed random seed, so it produces the same data on every run. Photos are stable
`https://picsum.photos/seed/<id>/1200/800` URLs, with 6–9 per listing. Avatars come from `i.pravatar.cc`,
with initials as a fallback.

## What's implemented

**Browse (`/`)**
- Sticky 80px header.
- Pill search bar (`Anywhere | Any week | Add guests`). Clicking it expands the header to 168px with the
  large segmented bar (Where / Check in / Check out / Who). Each segment has its own dropdown:
  destination suggestions with typeahead, a two-month range calendar with flexibility chips, and guest
  steppers. The page dims behind it, and it collapses on scroll, Esc or an outside click.
- A horizontally scrolling category row (23 categories) with scroll arrows and edge fades. It filters
  listings.
- Filters button with an active-count badge, and a "Display total before taxes" toggle.
- Responsive grid with 1→2→3→4→5→6 columns at 550/950/1128/1640/1880px.
- Cards have 20:19 image carousels with dots and hover arrows, a heart button, a Guest favourite badge,
  rating, host, the next available dates and the nightly price.

**Search (`/s`)**
- Split view: results on the left and a Leaflet map with price pins on the right.
- Hovering a card highlights its pin. Clicking a pin opens a mini card with a carousel and a heart.
  Visited pins are greyed.
- "Search as I move the map" re-queries by map bounds.
- Pagination at 18 results per page.
- Filters modal:
  - type of place
  - price range with a live histogram and a draggable two-thumb slider, plus min/max inputs
  - bedrooms/beds/baths steppers
  - amenities chips
  - Guest favourite
  - property types
  - a live **Show N places** count, debounced against `/api/listings/count`
- Guest picker for adults, children, infants and pets. Selected dates show the total stay price on cards
  and pins.

**Listing (`/rooms/[id]`)**
- Five-photo mosaic with **Show all photos**, which opens a photo tour, then a full-screen lightbox with
  keyboard navigation.
- Share modal (copy link and others) and Save.
- Title, room summary, Guest favourite banner or rating line, host summary and highlights.
- Description clamped with a **Show more** modal.
- Where you'll sleep.
- Amenities preview plus a grouped modal.
- Availability calendar: two months, past and booked nights disabled, booked nights struck through, and
  checkout capped at the next booked night.
- Reviews: overall rating (laurel treatment for Guest favourites), rating histogram, six category scores
  and review cards. **Show all reviews** opens a modal with search and sort.
- Location map with an approximate-area pin.
- Meet your host card, and a Things to know section.
- Sticky booking card: date popover, guest dropdown capped at the listing's capacity, and a live price
  breakdown (nightly × nights, cleaning fee, service fee, total).
- Dates and guests sync to the URL.

**Booking (`/book/[id]`)**
- Confirm and pay: trip summary with **Edit** modals for dates and guests, a mock card form with
  formatting and validation, cancellation policy and a price summary card.
- The reservation is created in a transaction that re-checks for overlapping stays, so double-booking
  returns `409`. Prices are always recomputed on the server.
- Redirects to a confirmation page at `/trips/[id]`.

**Auth**
- "Log in or sign up" modal. Entering an email looks up whether the account exists, then shows either a
  password step or a sign-up form.
- Credentials are hashed with bcrypt and sessions use JWTs.
- User menu dropdown with different contents for signed-in and signed-out users.
- Pages that need an account open the login modal automatically.

**Guest dashboard**
- `/trips`: upcoming cards and a "Where you've been" list. Trip detail shows a receipt, map and host.
- `/wishlists`: named collections with three-photo cover mosaics. A wishlist's detail page has a list
  and map, plus rename and delete.
- Hearts open a "Save to wishlist" modal where you can pick a list or create one. Toasts confirm each
  change.

**Host mode**
- `/become-a-host` is a 15-screen wizard: property type, place type, location (click or drag a map pin,
  or use quick-pick cities), basics steppers, amenities, photos, title, description, categories, price,
  then review and publish.
- Photos are uploaded to local disk with drag-and-drop, set-cover and remove. A "use sample photos"
  shortcut is also available.
- Three-segment progress bar with a Back/Next footer. The draft is saved to `localStorage`, so
  **Save & exit** resumes where you left off.
- `/host/listings` dashboard.
- `/host/reservations` with Upcoming, Currently hosting, Completed and All tabs, and payouts.

**Reviews**
- After checkout, guests can review a stay with an overall rating and six category ratings.
- The listing's average, count and Guest favourite status are recomputed when a review is saved.

**Mobile (<744px)**
- The search collapses into a single "Where to?" pill that opens a full-screen sheet with stacked
  Where/When/Who cards.
- Bottom tab bar (Explore / Wishlists / Trips / Profile or Log in) that hides while scrolling down.
- Floating **Show map / Show list** toggle on search.
- Swipeable photo carousel with a counter on listing pages.
- A bottom Reserve bar that opens a dates and guests sheet.

**States**
- Skeleton loaders for browse, search and listing pages.
- Empty states for trips, wishlists, no search results, no reviews and no host listings.
- Friendly 404 and error pages, and inline error messages on every form.

## Mocked or simplified

- **Payments:** the card form is validated but nothing is charged or stored. Any 13–19 digit number
  works.
- **Messaging:** the "Message host" button and the Messages menu item are placeholders.
- **Experiences tab, Months/Flexible date tabs, language/currency globe:** visual only. Flexibility
  chips are selectable but don't widen the search.
- **Geocoding:** no external geocoder. Text search matches city, region and country, and hosts place
  their pin on the map.
- **Listing editing and cancelling reservations** are not implemented. Hosts can create listings but not
  edit them.
- **Taxes** are not modelled. The guest service fee is a flat 14% of the nightly subtotal.
- **Help Centre** is a short FAQ page. Footer links mostly point to it.

## Design decisions

- **Typeface:** Inter Variable is self-hosted through `@fontsource-variable/inter`, so there is no
  Google Fonts request at build time.
- **Tokens:**
  - Breakpoints: 550/744/950/1128/1440/1640/1880px.
  - Colours: text `#222`, secondary `#6A6A6A`, borders `#DDDDDD`/`#EBEBEB`.
  - Radii: 12px cards, 32px search panels, pill buttons.
  - Shadows: menu `0 2px 16px rgba(0,0,0,.12)`, booking card `0 6px 16px rgba(0,0,0,.12)`, floating
    panels `0 6px 20px rgba(0,0,0,.2)`.
  - Motion: 200ms `cubic-bezier(.2,0,0,1)` transitions, and a 400ms slide-up for modals.
- **Images:** plain `<img>` with lazy loading instead of `next/image`, so remote picsum photos and
  local uploads need no loader configuration.
- **Uploads** are written to `./uploads` (gitignored) and served by `/api/uploads/[file]`, which only
  accepts UUID filenames. They work the same way in `next dev` and `next start`. Uploads must be images,
  at most 8 MB each and at most 20 per request.
- **SQLite limitations:** SQLite has no arrays, so categories are stored as a comma-separated string and
  amenities/highlights as JSON strings. Ratings are denormalised onto `Listing` so browse and search
  queries stay cheap.
- **Map tiles** come straight from `tile.openstreetmap.org` with attribution, slightly desaturated with
  CSS for a calmer look. Heavy use should move to a dedicated tile provider.
- **Auth.js:** this uses NextAuth v4, the stable Auth.js release for the App Router, with a credentials
  provider and JWT sessions.

## Project layout

```
prisma/            schema, migration, deterministic seed
src/app/           routes (see PLAN.md for the full route table) and API handlers
src/components/    header/, search/, listing/, listing/detail/, booking/, host/, map/, ui/, auth/
src/lib/           prisma client, auth options, search-param parsing, listing queries, pricing
```
