import Link from "next/link";

/** Original Nestly mark: a rounded roofline cradled by a nest arc. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden fill="none">
      <path
        d="M6 15.5 16 7l10 8.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 18.5c0 5.2 5.4 8.5 12 8.5s12-3.3 12-8.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M9.5 21.5c2 1.3 4.2 1.9 6.5 1.9s4.5-.6 6.5-1.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <circle cx="16" cy="16.5" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Logo({ compactBelow = "md" as "md" | "never" }) {
  return (
    <Link href="/" className="flex h-20 items-center gap-1.5 text-brand" aria-label="Nestly home">
      <LogoMark size={32} />
      <span
        className={
          (compactBelow === "md" ? "hidden md:inline " : "inline ") +
          "text-[22px] font-extrabold leading-none tracking-[-0.04em]"
        }
      >
        nestly
      </span>
    </Link>
  );
}
