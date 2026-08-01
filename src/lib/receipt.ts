/**
 * Order reference and timestamp for the WhatsApp receipt.
 *
 * Deliberately not a tax invoice number: references are random, not
 * sequential, and carry no GST fields. If Poba Express registers for GST,
 * invoice numbering has to become sequential and gapless per financial year,
 * which needs a server-side counter rather than this.
 */

const TIMEZONE = "Asia/Kolkata";

// No I, O, 0 or 1 — references get read out over the phone, and those four are
// what people mishear.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChars(count: number): string {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** YYMMDD in IST, so the date matches the shop's day rather than the phone's. */
function istDateStamp(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}${get("month")}${get("day")}`;
}

/** e.g. PBX-260801-K7Q2 — short enough to read aloud, unique enough in practice. */
export function makeOrderReference(date: Date = new Date()): string {
  return `PBX-${istDateStamp(date)}-${randomChars(4)}`;
}

/** e.g. "1 Aug 2026, 3:42 pm" — always in IST. */
export function formatOrderTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
