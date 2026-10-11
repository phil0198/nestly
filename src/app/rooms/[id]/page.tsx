import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { differenceInMonths, differenceInYears } from "date-fns";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { Icon, StarSolid } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { PhotoGrid, HeartButtonText } from "@/components/listing/detail/Photos";
import { ShareButton } from "@/components/listing/detail/ShareButton";
import { Description } from "@/components/listing/detail/Description";
import { Amenities } from "@/components/listing/detail/Amenities";
import { Reviews, type ReviewData } from "@/components/listing/detail/Reviews";
import { BookingProvider } from "@/components/listing/detail/BookingContext";
import { AvailabilitySection, BookingCard, MobileBookingBar } from "@/components/listing/detail/BookingCard";
import { LocationMapLazy } from "@/components/map/LocationMapLazy";
import { getListingDetail, locationLabel, parseJson, type Highlight } from "@/lib/listings";
import { formatRating } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingDetail(id);
  if (!listing) return { title: "Listing not found" };
  return { title: `${listing.title} · ${locationLabel(listing)}`, description: listing.description.slice(0, 160) };
}

function hostingFor(since: Date) {
  const years = differenceInYears(new Date(), since);
  if (years >= 1) return `${years} year${years === 1 ? "" : "s"} hosting`;
  const months = Math.max(1, differenceInMonths(new Date(), since));
  return `${months} month${months === 1 ? "" : "s"} hosting`;
}

function bedroomsFor(bedrooms: number, beds: number) {
  const rooms = [];
  let remaining = beds;
  for (let i = 0; i < bedrooms; i++) {
    const n = i === bedrooms - 1 ? remaining : Math.max(1, Math.min(2, remaining - (bedrooms - i - 1)));
    remaining -= n;
    rooms.push({ name: `Bedroom ${i + 1}`, beds: n === 1 ? (i === 0 ? "1 king bed" : "1 queen bed") : `${n} single beds` });
  }
  return rooms;
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListingDetail(id);
  if (!listing) notFound();

  const amenities = parseJson<string[]>(listing.amenities, []);
  const highlights = parseJson<Highlight[]>(listing.highlights, []);
  const images = listing.images.map((i) => i.url);
  const host = listing.host;
  const hostReviews = host.listings.reduce((s, l) => s + l.reviewCount, 0);
  const rated = host.listings.filter((l) => l.reviewCount > 0);
  const hostRating = rated.length ? rated.reduce((s, l) => s + l.ratingAvg * l.reviewCount, 0) / Math.max(1, hostReviews) : 0;
  const hostYears = Math.max(1, differenceInYears(new Date(), host.createdAt));
  const place = locationLabel(listing);
  const reviews: ReviewData[] = listing.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    cleanliness: r.cleanliness,
    accuracy: r.accuracy,
    checkIn: r.checkIn,
    communication: r.communication,
    location: r.location,
    value: r.value,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    author: {
      name: r.author.name,
      image: r.author.image,
      location: r.author.location,
      createdAt: r.author.createdAt.toISOString(),
    },
  }));
  const blocked = listing.reservations.map((r) => ({ checkIn: r.checkIn.toISOString(), checkOut: r.checkOut.toISOString() }));
  const allowPets = amenities.includes("pets");
  const roomLabel =
    listing.roomType === "Entire home"
      ? `Entire ${listing.propertyType.toLowerCase()} in ${place}`
      : `${listing.roomType} in ${listing.propertyType.toLowerCase()} in ${place}`;
  const stats = [
    `${listing.guests} guest${listing.guests === 1 ? "" : "s"}`,
    `${listing.bedrooms} bedroom${listing.bedrooms === 1 ? "" : "s"}`,
    `${listing.beds} bed${listing.beds === 1 ? "" : "s"}`,
    `${listing.baths} bath${listing.baths === 1 ? "" : "s"}`,
  ];

  return (
    <>
      <div className="hidden sm:block">
        <Header variant="listing" wide={false} sticky={false} />
      </div>
      <Suspense fallback={null}>
        <BookingProvider
          listingId={listing.id}
          nightly={listing.price}
          cleaningFee={listing.cleaningFee}
          blocked={blocked}
          maxGuests={listing.guests}
          allowPets={allowPets}
        >
          <main className="container-narrow pb-24 sm:pt-6 lg:pb-0">
            {/* Title row (desktop) */}
            <div className="hidden items-end justify-between gap-6 pb-6 sm:flex">
              <h1 className="text-[26px] font-semibold leading-[30px]">{listing.title}</h1>
              <div className="flex shrink-0 items-center gap-2">
                <ShareButton title={listing.title} subtitle={place} image={images[0]} />
                <HeartButtonText listingId={listing.id} image={images[0]} />
              </div>
            </div>

            <PhotoGrid images={images} title={listing.title} listingId={listing.id} />

            <div className="relative lg:flex lg:gap-[8.33%]">
              {/* Left column */}
              <div className="min-w-0 lg:w-[58.33%]">
                <section className="border-b border-divider pb-8 pt-6 sm:pt-8">
                  <h1 className="mb-4 text-[26px] font-semibold leading-[30px] sm:hidden">{listing.title}</h1>
                  <h2 className="text-[22px] font-semibold leading-[26px]">{roomLabel}</h2>
                  <ol className="mt-1 flex flex-wrap text-base">
                    {stats.map((s, i) => (
                      <li key={s}>
                        {i > 0 && <span className="px-1">·</span>}
                        {s}
                      </li>
                    ))}
                  </ol>
                  {listing.guestFavorite ? (
                    <a href="#reviews" className="mt-6 flex items-center rounded-xl border border-hairline px-6 py-4 hover:bg-faint">
                      <div className="flex items-center gap-2 text-center text-base font-semibold leading-5">
                        <Icon name="medal" size={28} />
                        <span className="w-[86px] text-left text-sm leading-[18px]">Guest favourite</span>
                      </div>
                      <div className="hidden flex-1 px-4 text-sm font-semibold sm:block">One of the most loved homes on Nestly, according to guests</div>
                      <div className="ml-auto flex items-center divide-x divide-hairline text-center">
                        <div className="px-4">
                          <div className="text-lg font-semibold leading-5">{formatRating(listing.ratingAvg)}</div>
                          <div className="flex justify-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarSolid key={i} size={8} />
                            ))}
                          </div>
                        </div>
                        <div className="pl-4">
                          <div className="text-lg font-semibold leading-5">{listing.reviewCount}</div>
                          <div className="text-[10px] font-semibold underline">Reviews</div>
                        </div>
                      </div>
                    </a>
                  ) : listing.reviewCount > 0 ? (
                    <a href="#reviews" className="mt-1 flex items-center gap-1 text-base font-semibold">
                      <StarSolid size={14} />
                      {formatRating(listing.ratingAvg)}
                      <span className="px-0.5">·</span>
                      <span className="underline">
                        {listing.reviewCount} review{listing.reviewCount === 1 ? "" : "s"}
                      </span>
                    </a>
                  ) : (
                    <div className="mt-1 flex items-center gap-1 text-base font-semibold">
                      <StarSolid size={14} /> New
                    </div>
                  )}
                </section>

                <section className="flex items-center gap-6 border-b border-divider py-6">
                  <span className="relative">
                    <Avatar name={host.name} src={host.image} size={40} />
                    {host.isSuperhost && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white ring-2 ring-white">
                        <Icon name="medal" size={11} strokeWidth={2.2} />
                      </span>
                    )}
                  </span>
                  <div>
                    <div className="text-base font-semibold">Hosted by {host.name.split(" ")[0]}</div>
                    <div className="text-sm text-muted">
                      {host.isSuperhost ? "Superhost · " : ""}
                      {hostingFor(host.createdAt)}
                    </div>
                  </div>
                </section>

                <section className="space-y-6 border-b border-divider py-8">
                  {highlights.map((h) => (
                    <div key={h.title} className="flex gap-6">
                      <Icon name={h.icon} size={24} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="text-base font-semibold">{h.title}</div>
                        <div className="text-sm text-muted">{h.body}</div>
                      </div>
                    </div>
                  ))}
                </section>

                <Description text={listing.description} />

                <section className="border-b border-divider py-12">
                  <h2 className="text-[22px] font-semibold leading-[26px]">Where you&rsquo;ll sleep</h2>
                  <div className="scrollbar-none mt-6 flex gap-4 overflow-x-auto">
                    {bedroomsFor(listing.bedrooms, listing.beds).map((room, i) => (
                      <div key={room.name} className="w-[200px] shrink-0">
                        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#EBEBEB]">
                          <img src={images[(i + 2) % images.length]} alt="" className="h-full w-full object-cover text-transparent" />
                        </div>
                        <div className="mt-3 text-base font-semibold">{room.name}</div>
                        <div className="text-sm text-muted">{room.beds}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <Amenities ids={amenities} />

                <AvailabilitySection city={listing.city} />
              </div>

              {/* Right column: sticky booking card */}
              <div className="hidden lg:block lg:w-[33.33%]">
                <div className="sticky top-8 pb-12 pt-8">
                  <BookingCard nightly={listing.price} rating={listing.ratingAvg} reviewCount={listing.reviewCount} />
                  <button type="button" className="mx-auto mt-6 flex items-center gap-3 text-sm text-muted underline">
                    <Icon name="flag" size={16} />
                    Report this listing
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-divider">
              <Reviews reviews={reviews} rating={listing.ratingAvg} guestFavorite={listing.guestFavorite} />
            </div>

            <section className="border-b border-divider py-12">
              <h2 className="text-[22px] font-semibold leading-[26px]">Where you&rsquo;ll be</h2>
              <div className="mt-6 h-[300px] overflow-hidden rounded-xl sm:h-[480px]">
                <LocationMapLazy lat={listing.lat} lng={listing.lng} />
              </div>
              <div className="mt-6 text-base font-semibold">{place}</div>
              <p className="mt-2 text-sm text-muted">The exact address is shared once your booking is confirmed.</p>
            </section>

            <section className="border-b border-divider py-12">
              <h2 className="text-[22px] font-semibold leading-[26px]">Meet your host</h2>
              <div className="mt-8 grid gap-10 md:grid-cols-[380px_1fr] md:gap-16">
                <div>
                  <div className="grid grid-cols-[1fr_auto] items-center rounded-3xl bg-white px-6 py-8 shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-col items-center text-center">
                      <span className="relative">
                        <Avatar name={host.name} src={host.image} size={104} />
                        {host.isSuperhost && (
                          <span className="absolute bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                            <Icon name="medal" size={16} strokeWidth={2} />
                          </span>
                        )}
                      </span>
                      <div className="mt-3 text-[28px] font-bold leading-8">{host.name.split(" ")[0]}</div>
                      {host.isSuperhost && (
                        <div className="mt-1 flex items-center gap-1 text-sm font-semibold">
                          <Icon name="medal" size={14} />
                          Superhost
                        </div>
                      )}
                    </div>
                    <div className="w-[110px] divide-y divide-hairline pl-4">
                      <div className="pb-3">
                        <div className="text-[22px] font-bold leading-6">{hostReviews}</div>
                        <div className="text-[10px] font-semibold">Reviews</div>
                      </div>
                      <div className="py-3">
                        <div className="flex items-center gap-1 text-[22px] font-bold leading-6">
                          {hostRating ? hostRating.toFixed(2) : "–"}
                          <StarSolid size={11} />
                        </div>
                        <div className="text-[10px] font-semibold">Rating</div>
                      </div>
                      <div className="pt-3">
                        <div className="text-[22px] font-bold leading-6">{hostYears}</div>
                        <div className="text-[10px] font-semibold">Year{hostYears === 1 ? "" : "s"} hosting</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4 text-base">
                    {host.work && (
                      <div className="flex items-center gap-3">
                        <Icon name="briefcase" size={24} />
                        My work: {host.work}
                      </div>
                    )}
                    {host.languages && (
                      <div className="flex items-center gap-3">
                        <Icon name="translate" size={24} />
                        Speaks {host.languages.replace(/, ([^,]*)$/, " and $1")}
                      </div>
                    )}
                    {host.location && (
                      <div className="flex items-center gap-3">
                        <Icon name="location" size={24} />
                        Lives in {host.location}
                      </div>
                    )}
                  </div>
                  {host.bio && <p className="mt-6 text-base leading-6">{host.bio}</p>}
                </div>
                <div>
                  {host.isSuperhost && (
                    <>
                      <h3 className="text-lg font-semibold">{host.name.split(" ")[0]} is a Superhost</h3>
                      <p className="mt-3 text-base leading-6">
                        Superhosts are experienced, highly rated hosts who go the extra mile to make every stay memorable.
                      </p>
                    </>
                  )}
                  <h3 className={host.isSuperhost ? "mt-8 text-lg font-semibold" : "text-lg font-semibold"}>Host details</h3>
                  <p className="mt-3 text-base">Response rate: {host.responseRate}%</p>
                  <p className="text-base">Responds {host.responseTime}</p>
                  <button type="button" className="btn-dark mt-8 !px-6 !py-3.5">
                    Message host
                  </button>
                  <div className="mt-8 flex items-start gap-3 border-t border-divider pt-6 text-xs text-muted">
                    <Icon name="shield" size={24} className="shrink-0 text-brand" />
                    To help protect your payment, always use Nestly to send money and communicate with hosts.
                  </div>
                </div>
              </div>
            </section>

            <section className="py-12">
              <h2 className="text-[22px] font-semibold leading-[26px]">Things to know</h2>
              <div className="mt-6 grid gap-8 text-base sm:grid-cols-3">
                <div>
                  <h3 className="mb-3 font-semibold">House rules</h3>
                  <ul className="space-y-3">
                    <li>Check-in after 3:00 pm</li>
                    <li>Checkout before 11:00 am</li>
                    <li>{listing.guests} guests maximum</li>
                    <li>{allowPets ? "Pets allowed" : "No pets"}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-semibold">Safety &amp; property</h3>
                  <ul className="space-y-3">
                    <li>{amenities.includes("co-alarm") ? "Carbon monoxide alarm" : "No carbon monoxide alarm"}</li>
                    <li>{amenities.includes("smoke-alarm") ? "Smoke alarm" : "No smoke alarm"}</li>
                    <li>{amenities.includes("pool") ? "Pool or hot tub without a gate or lock" : "Exterior security cameras on property"}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-semibold">Cancellation policy</h3>
                  <p>Free cancellation for 48 hours after booking. After that, cancel before check-in for a 50% refund.</p>
                  <p className="mt-3">Review the host&rsquo;s full policy before you book.</p>
                </div>
              </div>
            </section>
          </main>
          <MobileBookingBar nightly={listing.price} />
        </BookingProvider>
      </Suspense>
      <Footer />
    </>
  );
}
