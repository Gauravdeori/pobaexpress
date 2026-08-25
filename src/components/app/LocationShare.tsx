import { useEffect, useState } from "react";
import { Crosshair, MapPin, TriangleAlert, X } from "lucide-react";

import {
  accuracyLabel,
  captureLocation,
  isLocationSupported,
  mapsLink,
  type Coords,
} from "@/lib/location";
import { AREA_SUMMARY, checkArea, outsideAreaMessage } from "@/lib/delivery-area";
import { cn } from "@/lib/utils";

/**
 * "Share my location", and what came back.
 *
 * Shared by the app's checkout and the landing page's order form so the two
 * ask for the same thing in the same words — a rider following a link from one
 * should not find it behaves differently from the other.
 *
 * The pin is an addition to the typed address, never a replacement: a fix can
 * be hundreds of metres out indoors, and a rider who arrives at the wrong gate
 * with no address to fall back on is worse off than one with only an address.
 */
export function LocationShare({
  coords,
  onChange,
  className,
}: {
  coords: Coords | null;
  onChange: (coords: Coords | null) => void;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Kept apart from `error`: a pin outside the area is a note about where the
  // order is going, not a failure to get a fix, and the pin still attaches.
  const [areaWarning, setAreaWarning] = useState<string | null>(null);
  // Whether geolocation exists can only be answered in a browser, and
  // answering it during render would have the server draw nothing and the
  // client draw a box — a hydration mismatch. So both start with nothing and
  // it appears once mounted.
  const [available, setAvailable] = useState(false);

  useEffect(() => setAvailable(isLocationSupported()), []);

  // Hidden rather than shown broken where the browser has no geolocation at
  // all — over plain http, for one, where it is blocked outright.
  if (!available) return null;

  const share = async () => {
    setBusy(true);
    setError(null);
    const { coords: found, error: failed } = await captureLocation();
    setBusy(false);
    if (failed || !found) {
      setError(failed ?? "Couldn't get your location.");
      return;
    }

    // Checked against the delivery area, and only ever as a warning. The
    // boundary is drawn from four landmarks rather than surveyed, and a fix
    // indoors can be hundreds of metres out, so refusing an order on the
    // strength of those two together would turn away real customers.
    const check = checkArea(found);
    setAreaWarning(!check.inside && !check.uncertain ? outsideAreaMessage(check) : null);
    onChange(found);
  };

  return (
    <div
      className={cn("rounded-2xl border border-dashed border-accent/50 bg-accent/5 p-4", className)}
    >
      {coords ? (
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <MapPin className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary">Location attached</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{accuracyLabel(coords.accuracy)}</p>
            <a
              href={mapsLink(coords)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-medium text-accent underline"
            >
              Check the pin on the map
            </a>
          </div>
          <button
            type="button"
            aria-label="Remove location"
            onClick={() => {
              setAreaWarning(null);
              onChange(null);
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-accent transition-colors hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-primary">Share your location</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sends a map pin with your order so the rider can navigate straight to you. Optional —
            the address above is what we go by.
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">{AREA_SUMMARY}</p>
          <button
            type="button"
            onClick={() => void share()}
            disabled={busy}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Crosshair className={cn("size-4", busy && "animate-spin")} />
            {busy ? "Finding you…" : "Use my current location"}
          </button>
        </>
      )}

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      {areaWarning && (
        <p
          role="status"
          className="mt-3 flex gap-2 rounded-xl bg-amber-500/10 p-2.5 text-xs font-medium text-amber-900"
        >
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{areaWarning}</span>
        </p>
      )}
    </div>
  );
}
