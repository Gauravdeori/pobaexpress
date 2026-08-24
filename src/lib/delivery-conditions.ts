/**
 * What the rider is actually riding through, and what that adds to the fee.
 *
 * Rain and darkness are the two things that make a delivery in Jonai harder
 * and slower, so the fee moves with them rather than pretending every trip is
 * the same. The surcharge goes to covering that trip — it is not a demand
 * multiplier and it is not applied to the food.
 */

/** Jonai town. The weather that matters is the weather over the road. */
export const JONAI = { latitude: 27.85, longitude: 95.01 } as const;

/** IST, always, so the fee does not depend on a phone's clock being right. */
const IST_OFFSET_MINUTES = 5 * 60 + 30;

/** After this hour, IST, counts as a night ride. */
const NIGHT_FROM_HOUR = 20;
const NIGHT_UNTIL_HOUR = 5;

export type Conditions = {
  night: boolean;
  heavyRain: boolean;
  /** Rupees added to the category's delivery fee. */
  surcharge: number;
  /** Why the fee moved, for the line under it. Empty when it hasn't. */
  reason: string;
};

/**
 * Not additive, because the two together are worse than the sum of each: a
 * night ride in heavy rain on unlit roads is the trip nobody wants, and the
 * fee for it is set deliberately rather than fallen into.
 *
 * On food's ₹20 base this gives exactly the published table — ₹20 / ₹25 / ₹30
 * / ₹40 — and generalises to the categories that charge something else.
 */
export function surchargeFor(night: boolean, heavyRain: boolean): number {
  if (night && heavyRain) return 20;
  if (heavyRain) return 10;
  if (night) return 5;
  return 0;
}

export function reasonFor(night: boolean, heavyRain: boolean): string {
  if (night && heavyRain) return "Night ride in heavy rain";
  if (heavyRain) return "Heavy rain";
  if (night) return "Night ride";
  return "";
}

/** True between 8 PM and 5 AM in Jonai, whatever the device thinks the time is. */
export function isNightIST(now: Date = new Date()): boolean {
  const istMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + IST_OFFSET_MINUTES;
  const hour = Math.floor((istMinutes / 60) % 24);
  return hour >= NIGHT_FROM_HOUR || hour < NIGHT_UNTIL_HOUR;
}

/**
 * Open-Meteo's WMO codes for the wet ones worth charging for.
 *
 * Drizzle and light rain are left out on purpose: a rider gets damp, not
 * delayed, and a fee that jumps on every passing shower reads as opportunism.
 * These are the moderate-and-above rain, rain showers and thunderstorm codes.
 */
const HEAVY_RAIN_CODES = new Set([63, 65, 67, 82, 95, 96, 99]);

/** Millimetres in the last hour that count as heavy regardless of the code. */
const HEAVY_RAIN_MM = 2.5;

export function isHeavyRain(weatherCode: number, precipitationMm: number): boolean {
  return HEAVY_RAIN_CODES.has(weatherCode) || precipitationMm >= HEAVY_RAIN_MM;
}

export function conditionsFrom(night: boolean, heavyRain: boolean): Conditions {
  return {
    night,
    heavyRain,
    surcharge: surchargeFor(night, heavyRain),
    reason: reasonFor(night, heavyRain),
  };
}

/** Fair weather, daytime: what every screen shows until the forecast answers. */
export const CLEAR: Conditions = conditionsFrom(false, false);
