"use client";

import { Stepper } from "./Stepper";

export interface Guests {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

const ROWS: { key: keyof Guests; label: string; sub: React.ReactNode; max: number }[] = [
  { key: "adults", label: "Adults", sub: "Ages 13 or above", max: 16 },
  { key: "children", label: "Children", sub: "Ages 2 – 12", max: 15 },
  { key: "infants", label: "Infants", sub: "Under 2", max: 5 },
  {
    key: "pets",
    label: "Pets",
    sub: <span className="cursor-pointer font-semibold underline">Travelling with an assistance animal?</span>,
    max: 5,
  },
];

export function GuestPicker({
  value,
  onChange,
  maxGuests = 16,
  allowPets = true,
  compact,
}: {
  value: Guests;
  onChange: (g: Guests) => void;
  /** Cap on adults + children (listing capacity). */
  maxGuests?: number;
  allowPets?: boolean;
  compact?: boolean;
}) {
  const total = value.adults + value.children;
  function set(key: keyof Guests, n: number) {
    const next = { ...value, [key]: n };
    // Adding children/infants/pets implies at least one adult, as on the reference site.
    if (key !== "adults" && n > 0 && next.adults === 0) next.adults = 1;
    onChange(next);
  }
  return (
    <div>
      {ROWS.map((row, i) => {
        const v = value[row.key];
        const max =
          row.key === "adults" || row.key === "children"
            ? Math.min(row.max, v + Math.max(0, maxGuests - total))
            : row.key === "pets" && !allowPets
              ? 0
              : row.max;
        const min = row.key === "adults" && (value.children || value.infants || value.pets) ? 1 : 0;
        return (
          <div
            key={row.key}
            className={`flex items-center justify-between ${compact ? "py-4" : "py-6"} ${i < ROWS.length - 1 ? "border-b border-divider" : ""}`}
          >
            <div>
              <div className="text-base font-semibold">{row.label}</div>
              <div className="text-sm text-muted">{row.key === "pets" && !allowPets ? "This place doesn't allow pets" : row.sub}</div>
            </div>
            <Stepper value={v} min={min} max={max} label={row.label.toLowerCase()} onChange={(n) => set(row.key, n)} />
          </div>
        );
      })}
    </div>
  );
}
