import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";

/**
 * Which dishes and which restaurants are off today.
 *
 * Managed in `settings/availability` in Firestore — readable by everyone,
 * writable by admins. Real-time updates push status changes immediately
 * to all open customer apps and landing pages.
 */

let currentSoldOut: ReadonlySet<string> | null = null;
let currentClosedRestaurants: ReadonlySet<string> | null = null;

const soldOutSubscribers = new Set<(soldOut: ReadonlySet<string>) => void>();
const closedSubscribers = new Set<(closed: ReadonlySet<string>) => void>();

let stop: (() => void) | null = null;

const NONE: ReadonlySet<string> = new Set();

function parseList(list: unknown): ReadonlySet<string> {
  if (!Array.isArray(list)) return NONE;
  return new Set(list.filter((id): id is string => typeof id === "string"));
}

function publish(soldOut: ReadonlySet<string>, closedRestaurants: ReadonlySet<string>) {
  currentSoldOut = soldOut;
  currentClosedRestaurants = closedRestaurants;
  for (const notify of soldOutSubscribers) notify(soldOut);
  for (const notify of closedSubscribers) notify(closedRestaurants);
}

function start() {
  if (stop || !db) return;
  stop = onSnapshot(
    doc(db, "settings", "availability"),
    (snapshot) => {
      const data = snapshot.exists()
        ? (snapshot.data() as { soldOut?: unknown; closedRestaurants?: unknown })
        : {};
      publish(parseList(data.soldOut), parseList(data.closedRestaurants));
    },
    (error) => {
      console.error("Could not read availability", error);
    },
  );
}

/** The dish ids that are sold out right now. Empty until the snapshot arrives. */
export function useSoldOut(): ReadonlySet<string> {
  const [soldOut, setSoldOut] = useState<ReadonlySet<string>>(currentSoldOut ?? NONE);

  useEffect(() => {
    soldOutSubscribers.add(setSoldOut);
    start();
    if (currentSoldOut) setSoldOut(currentSoldOut);

    return () => {
      soldOutSubscribers.delete(setSoldOut);
      if (soldOutSubscribers.size === 0 && closedSubscribers.size === 0) {
        stop?.();
        stop = null;
      }
    };
  }, []);

  return soldOut;
}

/** The restaurant slugs that are toggled OFF / closed right now. */
export function useClosedRestaurants(): ReadonlySet<string> {
  const [closed, setClosed] = useState<ReadonlySet<string>>(currentClosedRestaurants ?? NONE);

  useEffect(() => {
    closedSubscribers.add(setClosed);
    start();
    if (currentClosedRestaurants) setClosed(currentClosedRestaurants);

    return () => {
      closedSubscribers.delete(setClosed);
      if (soldOutSubscribers.size === 0 && closedSubscribers.size === 0) {
        stop?.();
        stop = null;
      }
    };
  }, []);

  return closed;
}

/** Turn one dish off or back on. */
export async function setItemSoldOut(itemId: string, soldOut: boolean): Promise<void> {
  if (!db) throw new Error("Not configured");

  const nextSoldOut = new Set(currentSoldOut ?? NONE);
  if (soldOut) nextSoldOut.add(itemId);
  else nextSoldOut.delete(itemId);

  const nextClosed = new Set(currentClosedRestaurants ?? NONE);

  await setDoc(
    doc(db, "settings", "availability"),
    {
      soldOut: [...nextSoldOut],
      closedRestaurants: [...nextClosed],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  publish(nextSoldOut, nextClosed);
}

/** Turn an entire restaurant / kitchen ON or OFF. */
export async function setRestaurantClosed(slug: string, closed: boolean): Promise<void> {
  if (!db) throw new Error("Not configured");

  const nextSoldOut = new Set(currentSoldOut ?? NONE);
  const nextClosed = new Set(currentClosedRestaurants ?? NONE);

  if (closed) nextClosed.add(slug);
  else nextClosed.delete(slug);

  await setDoc(
    doc(db, "settings", "availability"),
    {
      soldOut: [...nextSoldOut],
      closedRestaurants: [...nextClosed],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  publish(nextSoldOut, nextClosed);
}
