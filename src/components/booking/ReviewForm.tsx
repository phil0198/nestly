"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { REVIEW_CATEGORIES, type ReviewCategoryKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Icon, StarSolid } from "../icons";

const LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Great"];

function StarInput({ value, onChange, size = 28, label }: { value: number; onChange: (n: number) => void; size?: number; label: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <StarSolid size={size} className={n <= shown ? "text-ink" : "text-hairline"} />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({
  reservationId,
  listing,
  eligible,
  reason,
}: {
  reservationId: string;
  listing: { title: string; city: string; image: string; host: string };
  eligible: boolean;
  reason: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [scores, setScores] = useState<Record<ReviewCategoryKey, number>>({
    cleanliness: 0, accuracy: 0, checkIn: 0, communication: 0, location: 0, value: 0,
  });
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const complete = rating > 0 && Object.values(scores).every((s) => s > 0) && comment.trim().length >= 10;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return setError("Rate every category and write at least 10 characters.");
    setBusy(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId, rating, ...scores, comment }),
    });
    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Something went wrong.");
      setBusy(false);
      return;
    }
    router.push(`/trips/${reservationId}`);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-[640px] px-6 pb-16 pt-10">
      <Link href={`/trips/${reservationId}`} className="mb-6 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint" aria-label="Back">
        <Icon name="chevron-left" size={16} strokeWidth={2.5} />
      </Link>
      <div className="flex items-center gap-4">
        <img src={listing.image} alt="" className="h-16 w-16 rounded-lg bg-[#EBEBEB] object-cover text-transparent" />
        <div>
          <h1 className="text-[26px] font-semibold leading-[30px]">How was your stay in {listing.city}?</h1>
          <p className="text-sm text-muted">{listing.title} · hosted by {listing.host}</p>
        </div>
      </div>

      {!eligible ? (
        <div className="mt-10 rounded-xl border border-hairline p-6 text-base">
          {reason}
          <div className="mt-4">
            <Link href="/trips" className="font-semibold underline">Back to trips</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10">
          <section className="border-b border-divider pb-8">
            <h2 className="text-lg font-semibold">Overall rating</h2>
            <div className="mt-3 flex items-center gap-4">
              <StarInput value={rating} onChange={setRating} size={36} label="Overall rating" />
              <span className="text-base font-semibold">{LABELS[rating]}</span>
            </div>
          </section>
          <section className="border-b border-divider py-8">
            <h2 className="text-lg font-semibold">Rate the details</h2>
            <div className="mt-4 divide-y divide-divider">
              {REVIEW_CATEGORIES.map((c) => (
                <div key={c.key} className="flex items-center justify-between py-4">
                  <span className="flex items-center gap-3 text-base">
                    <Icon name={c.icon} size={22} />
                    {c.label}
                  </span>
                  <StarInput value={scores[c.key]} onChange={(n) => setScores((s) => ({ ...s, [c.key]: n }))} size={20} label={c.label} />
                </div>
              ))}
            </div>
          </section>
          <section className="py-8">
            <h2 className="text-lg font-semibold">Write a public review</h2>
            <p className="mt-1 text-sm text-muted">Share what you loved and anything future guests should know.</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={6}
              className="field-input mt-4 resize-none"
              placeholder="The view from the terrace was…"
            />
            <div className={cn("mt-1 text-right text-xs", comment.length > 950 ? "text-[#C13515]" : "text-muted")}>{comment.length}/1000</div>
          </section>
          {error && (
            <p role="alert" className="mb-4 text-sm text-[#C13515]">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between border-t border-divider pt-6">
            <Link href={`/trips/${reservationId}`} className="text-base font-semibold underline">
              Cancel
            </Link>
            <button type="submit" disabled={busy || !complete} className="btn-dark">
              {busy ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
