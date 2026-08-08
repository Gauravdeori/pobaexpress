/**
 * The customer's pin, for the rider.
 *
 * A typed address in Jonai is often a landmark rather than a street and a
 * number — "behind the weekly market, blue gate" — which is enough for someone
 * who knows the town and not much use to anyone else. A dropped pin is what
 * actually gets a rider to the door, so it rides along with the order as a
 * maps link anyone can tap.
 *
 * Always optional and never silent: the browser prompts, the customer answers,
 * and an order without a pin goes through exactly as before.
 */

export type Coords = {
  latitude: number;
  longitude: number;
  /** Metres. A wifi-derived fix can be hundreds of them, which is worth saying. */
  accuracy: number;
};

export type LocationResult = { coords?: Coords; error?: string };

const OPTIONS: PositionOptions = {
  // The whole point is a doorstep, so wait for GPS rather than take the fast
  // network-derived guess.
  enableHighAccuracy: true,
  timeout: 15_000,
  // A fix from the last minute is still the same doorstep, and reusing it
  // avoids a second wait when someone taps twice.
  maximumAge: 60_000,
};

/** Six decimals is about 10 cm — past that it is noise, and noise in a URL. */
function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export function isLocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * Asks the browser for a fix. Resolves with an error string rather than
 * rejecting, because every caller wants to show the message and carry on.
 *
 * Must be called from a tap: browsers only prompt on a user gesture, and a
 * permission asked for out of nowhere is one people refuse.
 */
export function captureLocation(): Promise<LocationResult> {
  if (!isLocationSupported()) {
    return Promise.resolve({ error: "This browser can't share a location." });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          coords: {
            latitude: round(position.coords.latitude),
            longitude: round(position.coords.longitude),
            accuracy: Math.round(position.coords.accuracy),
          },
        }),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            return resolve({
              error:
                "Location permission was refused. You can allow it in your browser settings, or just type the address.",
            });
          case error.POSITION_UNAVAILABLE:
            return resolve({
              error: "Couldn't get a fix. Try again outdoors or near a window.",
            });
          case error.TIMEOUT:
            return resolve({ error: "That took too long. Try again in a moment." });
          default:
            return resolve({ error: "Couldn't get your location." });
        }
      },
      OPTIONS,
    );
  });
}

/**
 * A link any phone opens in its maps app, and any desktop opens on the web.
 *
 * `google.com/maps?q=` rather than a `geo:` URI: the rider might be on a
 * laptop, in a WhatsApp in-app browser, or on a phone with no Google Maps, and
 * this one degrades to a web page instead of a dead link.
 */
export function mapsLink({ latitude, longitude }: Coords): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/** How precise the fix is, in words the customer can act on. */
export function accuracyLabel(accuracy: number): string {
  if (accuracy <= 30) return "Accurate to about " + accuracy + " m";
  if (accuracy <= 150) return `Roughly accurate — within ${accuracy} m`;
  return `Only accurate to about ${accuracy} m, so keep the address filled in too`;
}
