"use client";

import { useMemo, useState } from "react";
import { differenceInYears, format } from "date-fns";
import { REVIEW_CATEGORIES } from "@/lib/constants";
import { cn, formatRating } from "@/lib/utils";
import { Icon, StarSolid } from "../../icons";
import { Avatar } from "../../ui/Avatar";
import { Modal } from "../../ui/Modal";

export interface ReviewData {
  id: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
  createdAt: string;
  author: { name: string; image: string | null; location: string | null; createdAt: string };
}

function Laurel({ flip }: { flip?: boolean }) {
  // Original wreath glyph used for the Guest favourite badge.
  return (
    <svg width="34" height="64" viewBox="0 0 34 64" aria-hidden style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="M26 60C12 52 6 40 6 28S10 8 16 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {[10, 20, 30, 40, 50].map((y, i) => (
        <ellipse key={y} cx={i < 2 ? 12 + i : 9 + i * 1.5} cy={y} rx="6" ry="3" fill="currentColor" transform={`rotate(${-50 + i * 12} ${i < 2 ? 12 + i : 9 + i * 1.5} ${y})`} />
      ))}
    </svg>
  );
}

function stars(n: number, size = 9) {
  return (
    <span className="flex items-center gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarSolid key={i} size={size} className={i < n ? "text-ink" : "text-hairline"} />
      ))}
    </span>
  );
}

function memberFor(createdAt: string) {
  const years = differenceInYears(new Date(), new Date(createdAt));
  return years >= 1 ? `${years} year${years === 1 ? "" : "s"} on Nestly` : "New to Nestly";
}

function ReviewCard({ r, clamp = true, onMore }: { r: ReviewData; clamp?: boolean; onMore?: () => void }) {
  const long = r.comment.length > 180;
  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar name={r.author.name} src={r.author.image} size={48} />
        <div>
          <div className="text-base font-semibold">{r.author.name.split(" ")[0]}</div>
          <div className="text-sm text-muted">{r.author.location ?? memberFor(r.author.createdAt)}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        {stars(r.rating)}
        <span className="text-ink">·</span>
        <span className="font-semibold">{format(new Date(r.createdAt), "MMMM yyyy")}</span>
      </div>
      <p className={cn("mt-1 text-base leading-6", clamp && "line-clamp-3")}>{r.comment}</p>
      {clamp && long && onMore && (
        <button type="button" onClick={onMore} className="mt-2 text-base font-semibold underline">
          Show more
        </button>
      )}
    </div>
  );
}

function Breakdown({ reviews, avg, vertical }: { reviews: ReviewData[]; avg: Record<string, number>; vertical?: boolean }) {
  const dist = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.rating === s).length / Math.max(1, reviews.length));
  return (
    <div className={cn(vertical ? "space-y-4" : "grid grid-cols-7 divide-x divide-divider")}>
      <div className={cn(vertical ? "border-b border-divider pb-4" : "pr-6")}>
        <div className="text-sm font-semibold">Overall rating</div>
        <div className="mt-2 space-y-0.5">
          {dist.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2">{5 - i}</span>
              <div className="h-1 flex-1 rounded-full bg-hairline">
                <div className="h-1 rounded-full bg-ink" style={{ width: `${d * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {REVIEW_CATEGORIES.map((c) =>
        vertical ? (
          <div key={c.key} className="flex items-center justify-between border-b border-divider pb-4 text-sm last:border-0">
            <span className="flex items-center gap-3">
              <Icon name={c.icon} size={24} />
              {c.label}
            </span>
            <span className="font-semibold">{avg[c.key].toFixed(1)}</span>
          </div>
        ) : (
          <div key={c.key} className="flex flex-col justify-between px-6">
            <div>
              <div className="text-sm font-semibold">{c.label}</div>
              <div className="text-lg font-semibold">{avg[c.key].toFixed(1)}</div>
            </div>
            <Icon name={c.icon} size={32} strokeWidth={1.3} className="mt-6" />
          </div>
        ),
      )}
    </div>
  );
}

export function Reviews({ reviews, rating, guestFavorite }: { reviews: ReviewData[]; rating: number; guestFavorite: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "high" | "low">("recent");

  const avg = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of REVIEW_CATEGORIES) {
      out[c.key] = reviews.length ? reviews.reduce((s, r) => s + r[c.key], 0) / reviews.length : 0;
    }
    return out;
  }, [reviews]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? reviews.filter((r) => r.comment.toLowerCase().includes(q)) : [...reviews];
    if (sort === "high") list.sort((a, b) => b.rating - a.rating);
    if (sort === "low") list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, query, sort]);

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="border-b border-divider py-12">
        <h2 className="flex items-center gap-2 text-[22px] font-semibold leading-[26px]">
          <StarSolid size={18} /> No reviews (yet)
        </h2>
        <p className="mt-4 max-w-[480px] text-base text-muted">
          This host has a great track record elsewhere on Nestly. Be one of the first guests to stay here and leave a review.
        </p>
      </section>
    );
  }

  return (
    <section id="reviews" className="border-b border-divider py-12">
      {guestFavorite ? (
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-1">
            <Laurel />
            <span className="text-[64px] font-semibold leading-none tracking-tight sm:text-[88px]">{formatRating(rating)}</span>
            <Laurel flip />
          </div>
          <div className="mt-2 text-[22px] font-semibold">Guest favourite</div>
          <p className="mt-1 max-w-[300px] text-base text-muted">One of the most loved homes on Nestly based on ratings, reviews and reliability</p>
        </div>
      ) : (
        <h2 className="mb-8 flex items-center gap-2 text-[22px] font-semibold leading-[26px]">
          <StarSolid size={18} />
          {formatRating(rating)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </h2>
      )}

      <div className="hidden pb-10 md:block">
        <Breakdown reviews={reviews} avg={avg} />
      </div>
      <div className="scrollbar-none -mx-6 mb-8 flex gap-3 overflow-x-auto px-6 md:hidden">
        {REVIEW_CATEGORIES.map((c) => (
          <div key={c.key} className="w-[130px] shrink-0 rounded-xl border border-hairline p-4">
            <div className="text-sm font-semibold">{c.label}</div>
            <div className="text-sm">{avg[c.key].toFixed(1)}</div>
            <Icon name={c.icon} size={28} strokeWidth={1.3} className="mt-6" />
          </div>
        ))}
      </div>

      <div className="grid gap-x-24 gap-y-10 md:grid-cols-2">
        {reviews.slice(0, 6).map((r) => (
          <ReviewCard key={r.id} r={r} onMore={() => setOpen(true)} />
        ))}
      </div>
      {reviews.length > 6 && (
        <button type="button" onClick={() => setOpen(true)} className="btn-outline mt-10">
          Show all {reviews.length} reviews
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} width="max-w-[1032px]" bodyClassName="px-6 pb-8 sm:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-16">
          <div className="md:sticky md:top-0 md:self-start">
            <div className="flex items-center gap-2 pt-2 text-[26px] font-semibold sm:text-[32px]">
              <StarSolid size={24} />
              {formatRating(rating)}
            </div>
            <div className="mt-8">
              <Breakdown reviews={reviews} avg={avg} vertical />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[26px] font-semibold">{reviews.length} reviews</h2>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold outline-none hover:border-ink"
                aria-label="Sort reviews"
              >
                <option value="recent">Most recent</option>
                <option value="high">Highest rated</option>
                <option value="low">Lowest rated</option>
              </select>
            </div>
            <label className="mt-6 flex h-11 items-center gap-3 rounded-full border border-[#B0B0B0] px-4 focus-within:border-ink focus-within:shadow-ring">
              <Icon name="search" size={16} strokeWidth={2} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reviews" className="w-full bg-transparent text-sm outline-none" />
            </label>
            <div className="mt-8 space-y-10">
              {filtered.length === 0 && <p className="text-base text-muted">No reviews mention &ldquo;{query}&rdquo;.</p>}
              {filtered.map((r) => (
                <ReviewCard key={r.id} r={r} clamp={false} />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
}
