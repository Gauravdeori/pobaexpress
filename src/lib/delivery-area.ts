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
 * half: the same boundary as a circle around the counter, so a dropped pin can
 * be checked against it.
 */

import type { Coords } from "./location";

/**
 * The counter Poba Express delivers from, and the point every distance is
 * measured against.
 *
 * Given as a map pin rather than a place name, so it is exact:
 * https://maps.app.goo.gl/1uCZK8pwjh9CA4PbA
 *
 * Deliberately its own constant rather than the `JONAI` point the weather is
 * read for. Those two used to be the same value and are 21 km apart on the
 * map — which meant a customer standing at this counter was told they were
 * 21 km outside the delivery area. One number answering two different
 * questions is what made that possible, so they are now separate.
 */
export const CENTRE = { latitude: 27.8244433, longitude: 95.2256841 } as const;

/**
 * How far a rider will go, in kilometres.
 *
 * A fixed figure, measured from `CENTRE` — not an estimate to be revised in
 * the field. Nothing outside it is delivered to.
 */
export const RADIUS_KM = 2.8;

export const AREA_EDGES = {
  north: "Ruskin Gate",
  south: "Jonai P.H.C.",
  east: "Torajan Side",
  west: "Rotkey Playground",
} as const;

/**
 * One line naming the boundary, for anywhere that has room for a sentence.
 *
 * Names the landmarks and the distance both. The landmarks are how the town
 * says where it is; the radius is the figure the pin check actually applies,
 * and stating it is what stops the words and the boundary drifting apart.
 */
export const AREA_SUMMARY =
  `We deliver within ${RADIUS_KM} km of our Jonai counter — north to ${AREA_EDGES.north}, ` +
  `south to ${AREA_EDGES.south}, east to ${AREA_EDGES.east} and west to ${AREA_EDGES.west}.`;

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
   * nothing useful about a 2.8 km boundary, and refusing someone on that basis
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
    // 3 km out that is accurate to ±400 m could well be inside the 2.8. The
    // boundary is fixed; what is uncertain is where the phone thinks it is,
    // and that doubt should not cost someone their dinner.
    inside: km - coords.accuracy / 1000 <= RADIUS_KM,
    distanceKm: km,
    uncertain: coords.accuracy >= UNRELIABLE_ACCURACY_M,
  };
}

/**
 * Whether this pin should stop the order.
 *
 * Narrower than `!check.inside` on purpose, and the difference is the whole
 * point of having one function for it:
 *
 *   - No pin is not a refusal. Sharing a location is optional and always has
 *     been; someone who types their address is served exactly as before.
 *   - A fix too vague to judge is not a refusal either. Refusing on a reading
 *     that could be a kilometre out is refusing on noise.
 *
 * Both order paths ask this rather than reading `inside` themselves, so the
 * form and the checkout cannot come to different answers about the same pin.
 */
export function blocksOrder(coords: Coords | null): boolean {
  if (!coords) return false;
  const check = checkArea(coords);
  return !check.inside && !check.uncertain;
}

/** What to tell someone whose pin landed outside. Never an accusation. */
export function outsideAreaMessage(check: AreaCheck): string {
  return (
    `That pin looks about ${check.distanceKm.toFixed(1)} km from our counter, and we deliver ` +
    `within ${RADIUS_KM} km. ${AREA_SUMMARY}`
  );
}
