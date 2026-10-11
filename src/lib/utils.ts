import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

export function formatRating(r: number) {
  if (r >= 4.995) return "5.0";
  const s = r.toFixed(2);
  return s.endsWith("0") ? s.slice(0, -1) : s;
}
