"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/host/listings", label: "Listings" },
  { href: "/host/reservations", label: "Reservations" },
];

export function HostNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-8 flex gap-2 border-b border-divider">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "-mb-px border-b-2 px-3 pb-3 text-base font-semibold transition-colors",
            pathname.startsWith(t.href) ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
