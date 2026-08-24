/**
 * What an offer is worth on a basket.
 *
 * Pure arithmetic, no database, so the cart, the checkout and the admin
 * preview all reach the same figure, and so the numbers a customer is charged
 * can be exercised without a Firebase connection.
 */

export type DiscountKind = "percent" | "flat";

/** The half of an offer that decides money. The rest is the copy around it. */
export type OfferTerms = {
  /** Percent off the subtotal, or a flat rupee amount off it. */
  kind: DiscountKind;
  /** Percent (1–100) or rupees, depending on `kind`. */
  value: number;
  /** Ceiling on a percent discount, in rupees. 0 means no ceiling. */
  maxDiscount: number;
  /** Subtotal the order must reach before the code works, in rupees. */
  minSubtotal: number;
  /** Which menu it applies to. "all" is every category. */
  category: "all" | "food" | "cake" | "medicine";
  /** Milliseconds since epoch. 0 means it never expires. */
  expiresAt: number;
  /** Off means the offer exists but is refused — how an offer is paused. */
  active: boolean;
  /** What the customer types. Null is a banner with nothing to enter. */
  code: string | null;
};

export const EMPTY_TERMS: OfferTerms = {
  kind: "percent",
  value: 10,
  maxDiscount: 0,
  minSubtotal: 0,
  category: "all",
  expiresAt: 0,
  active: true,
  code: null,
};

/** Uppercased and stripped, so "bite 20" and "BITE20" are the same code. */
export function normaliseCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export type DiscountResult = { discount: number; error?: string };

/**
 * The discount, or the reason there isn't one.
 *
 * Never exceeds the subtotal, and never goes negative: an order that pays the
 * customer is not a discount. Rounds down, so a rounding error can only ever
 * be in the shop's favour by a rupee rather than against it.
 */
export function applyOffer(
  offer: OfferTerms | null,
  subtotal: number,
  category: string,
): DiscountResult {
  if (!offer) return { discount: 0, error: "That code isn't recognised." };
  if (!offer.active) return { discount: 0, error: "That code isn't active right now." };
  if (offer.expiresAt && offer.expiresAt < Date.now()) {
    return { discount: 0, error: "That code has expired." };
  }
  if (offer.category !== "all" && offer.category !== category) {
    return { discount: 0, error: `That code only works on ${offer.category} orders.` };
  }
  if (subtotal < offer.minSubtotal) {
    return { discount: 0, error: `Spend ₹${offer.minSubtotal} to use this code.` };
  }

  const raw = offer.kind === "percent" ? (subtotal * offer.value) / 100 : offer.value;
  const capped = offer.maxDiscount > 0 ? Math.min(raw, offer.maxDiscount) : raw;
  const discount = Math.min(Math.floor(capped), subtotal);

  if (discount <= 0) return { discount: 0, error: "That code is worth nothing on this order." };
  return { discount };
}

/** One line describing the terms, for a banner, a list row or the cart. */
export function offerSummary(terms: OfferTerms): string {
  const off = terms.kind === "percent" ? `${terms.value}% off` : `₹${terms.value} off`;
  const cap =
    terms.kind === "percent" && terms.maxDiscount > 0 ? ` up to ₹${terms.maxDiscount}` : "";
  const min = terms.minSubtotal > 0 ? ` on orders above ₹${terms.minSubtotal}` : "";
  const only = terms.category === "all" ? "" : ` (${terms.category} only)`;
  return `${off}${cap}${min}${only}`;
}
