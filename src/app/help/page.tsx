import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Help Centre" };

const FAQ = [
  { q: "Is this a real booking site?", a: "No. Nestly is a demo: listings, hosts and reviews are generated, and checkout never charges a card." },
  { q: "How do I change my trip dates?", a: "Open the place, pick new dates in the booking card and reserve again. Editing a confirmed reservation isn't supported in the demo." },
  { q: "When can I leave a review?", a: "After your checkout date, open Trips → Where you've been and choose “Write a review”." },
  { q: "How do I list my home?", a: "Choose “Host your home” in the header. The guided flow takes a few minutes and your listing goes live immediately." },
  { q: "Which accounts can I use?", a: "Every seeded account uses the password password123 — try guest@nestly.dev or marta@nestly.dev (a host)." },
];

export default function HelpPage() {
  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow min-h-[60vh] pb-16 pt-14">
        <h1 className="text-[32px] font-semibold leading-9">Help Centre</h1>
        <p className="mt-2 text-base text-muted">Quick answers about using Nestly.</p>
        <div className="mt-10 max-w-[760px] divide-y divide-divider border-y border-divider">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold">
                {f.q}
                <span className="text-2xl font-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-base text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
