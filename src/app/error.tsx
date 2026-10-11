"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-narrow py-24">
      <h1 className="text-[32px] font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-base text-muted">We hit a snag loading this page. Please try again — if it keeps happening, head back home.</p>
      <div className="mt-8 flex gap-4">
        <button type="button" onClick={reset} className="btn-dark">Try again</button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </main>
  );
}
