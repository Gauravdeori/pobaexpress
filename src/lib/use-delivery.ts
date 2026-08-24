import { useEffect, useState } from "react";

import { CLEAR, type Conditions } from "./delivery-conditions";
import { deliveryFee, PLATFORM_FEE } from "./menu";
import { getDeliveryConditions } from "./weather";

/**
 * The live delivery conditions, shared by every screen that quotes a fee.
 *
 * Fetched once per mount and held in a module-level cache, so moving from the
 * shop page to the cart to checkout does not ask three times — and, more
 * importantly, cannot quote three different fees on the way to paying.
 *
 * Starts at fair weather. A screen that rendered a surcharge before the
 * forecast came back would be charging on a guess, and the number would then
 * change under the customer.
 */

let shared: Conditions | null = null;
let inFlight: Promise<Conditions> | null = null;

function load(): Promise<Conditions> {
  if (shared) return Promise.resolve(shared);
  inFlight ??= getDeliveryConditions()
    .then((conditions) => {
      shared = conditions;
      return conditions;
    })
    .catch(() => CLEAR)
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function useDeliveryConditions(): Conditions {
  const [conditions, setConditions] = useState<Conditions>(shared ?? CLEAR);

  useEffect(() => {
    let cancelled = false;
    void load().then((next) => {
      if (!cancelled) setConditions(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return conditions;
}

export type DeliveryQuote = Conditions & {
  /** The category's own fee, before any surcharge. */
  base: number;
  /** What the customer is charged for delivery. */
  fee: number;
  /** Flat, per order, on top of delivery. */
  platformFee: number;
};

/** Everything a bill needs to state a delivery charge and explain it. */
export function useDeliveryQuote(category: string): DeliveryQuote {
  const conditions = useDeliveryConditions();
  const base = deliveryFee(category);
  return {
    ...conditions,
    base,
    fee: base + conditions.surcharge,
    platformFee: PLATFORM_FEE,
  };
}
