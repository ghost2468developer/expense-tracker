// Currency formatting for South African Rand (ZAR).
// Uses the en-ZA locale so amounts render like "R 12 345,67".
const randFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  currencyDisplay: "symbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as Rands, e.g. 1234.5 -> "R 1 234,50". */
export function formatRands(amount: number): string {
  if (!Number.isFinite(amount)) return "R 0,00";
  return randFormatter.format(amount);
}

/** Format a number as Rands but without the "R" prefix / cents for compact UI. */
export function formatRandsShort(amount: number): string {
  if (!Number.isFinite(amount)) return "0";
  return new Intl.NumberFormat("en-ZA", {
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Safely turn the numeric-string returned by the pg driver into a JS number. */
export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** A date string (YYYY-MM-DD) turned into a friendly South African date. */
export function formatSaDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso + "T00:00:00") : iso;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
