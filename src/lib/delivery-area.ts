/**
 * Where Poba Express delivers, and how to tell whether a pin is inside it.
 *
 * The area is bounded by four landmarks the town knows by name:
 *
 *   North  Ruskin Gate
 *   South  Jonai P.H.C.
 *   East   Torajan Side
 *   West   Rotkey Playground
 *
 * Those names are the definition customers read, and they are what the
 * coverage map in the hero already states. This module is the machine-readable
 * half: the same boundary as a circle around the town centre, so a dropped pin
 * can be checked against it.
 *
 * ---------------------------------------------------------------------------
 * `RADIUS_KM` IS AN ESTIMATE AND SHOULD BE CONFIRMED ON THE GROUND.
 *
 * The four landmarks were given by name, not by coordinate. A circle wide
 * enough to hold all four is the honest approximation of them, but the exact
 * figure has not been measured. Getting it wrong in one direction turns away a
 * customer who is genuinely inside the area, so the check is deliberately
 * generous and deliberately advisory: `checkArea` reports what it found, and
 * nothing refuses an order on the strength of it alone.
 *
 * To tighten it: stand at the furthest of the four landmarks, read the
 * coordinates off any maps app, and set `RADIUS_KM` to that distance from
 * `CENTRE` rounded up.
 * ---------------------------------------------------------------------------
 */

import { JONAI } from "./delivery-conditions";
import type { Coords } from "./location";

/** Jonai town centre — the same point the weather is read for. */
export const CENTRE = JONAI;

/** See the note above: an estimate, not a measurement. */
export const RADIUS_KM = 3;

export const AREA_EDGES = {
  north: "Ruskin Gate",
  south: "Jonai P.H.C.",
  east: "Torajan Side",
  west: "Rotkey Playground",
} as const;

/** One line naming the boundary, for anywhere that has room for a sentence. */
export const AREA_SUMMARY =
  `We deliver across Jonai town — north to ${AREA_EDGES.north}, south to ${AREA_EDGES.south}, ` +
  `east to ${AREA_EDGES.east} and west to ${AREA_EDGES.west}.`;

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance. Over a few kilometres this is exact enough to trust. */
export function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export type AreaCheck = {
  inside: boolean;
  /** How far the pin is from the town centre, in kilometres. */
  distanceKm: number;
  /**
   * Whether the fix is too vague to judge. A pin accurate to 800 m says
   * nothing useful about a 3 km boundary, and refusing someone on that basis
   * would be refusing them on noise.
   */
  uncertain: boolean;
};

/** Past this, the fix itself is the problem rather than the location. */
const UNRELIABLE_ACCURACY_M = 1000;

export function checkArea(coords: Coords): AreaCheck {
  const km = distanceKm(CENTRE, coords);
  return {
    // The fix's own error is allowed to count in the customer's favour: a pin
    // 3.2 km out that is accurate to ±400 m could well be inside.
    inside: km - coords.accuracy / 1000 <= RADIUS_KM,
    distanceKm: km,
    uncertain: coords.accuracy >= UNRELIABLE_ACCURACY_M,
  };
}

/** What to tell someone whose pin landed outside. Never an accusation. */
export function outsideAreaMessage(check: AreaCheck): string {
  return (
    `That pin looks about ${check.distanceKm.toFixed(1)} km from Jonai town centre, which may be ` +
    `outside where we deliver. ${AREA_SUMMARY} Send the order anyway if you are inside it and ` +
    `we will confirm — the pin can be wrong indoors.`
  );
}
