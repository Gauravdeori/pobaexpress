import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";

/**
 * Which dishes are off today.
 *
 * A kitchen runs out of momos at eight in the evening and has them again at
 * eleven the next morning. That is not a menu change and it is certainly not a
 * deploy, so it lives in the same `settings` collection the launch switch does
 * — readable by everyone, writable only by an admin, and already covered by
 * the rules as they stand.
 *
 * Held as a list of item ids rather than a flag on each dish, because the menu
 * itself is code: `PRARTHONA_MENU` and the rest are the shop's price list and
 * should not be rewritten from a browser. What a counter can change is which
 * of them are available right now.
 *
 * Watched, not fetched, for the same reason the launch switch is: marking
 * something sold out has to reach the customer already staring at it, not the
 * next person to reload.
 *
 * If the read fails, everything stays available. Falling the other way would
 * empty every menu in Jonai the moment the connection blinked, which is a
 * worse failure than briefly offering a dish that has run out — one loses a
 * sale you can apologise for, the other loses all of them.
 */

/** The last thing the server said, shared by every hook in the tab. */
let current: ReadonlySet<string> | null = null;

const subscribers = new Set<(soldOut: ReadonlySet<string>) => void>();
let stop: (() => void) | null = null;

const NONE: ReadonlySet<string> = new Set();

/** Never trusts the document's shape: a bad field must not empty the menu. */
function parse(data: { soldOut?: unknown } | undefined): ReadonlySet<string> {
  const list = data?.soldOut;
  if (!Array.isArray(list)) return NONE;
  return new Set(list.filter((id): id is string => typeof id === "string"));
}

function publish(soldOut: ReadonlySet<string>) {
  current = soldOut;
  for (const notify of subscribers) notify(soldOut);
}

/** One listener per tab, opened on the first hook and closed with the last. */
function start() {
  if (stop || !db) return;
  stop = onSnapshot(
    doc(db, "settings", "availability"),
    (snapshot) => {
      publish(parse(snapshot.exists() ? (snapshot.data() as { soldOut?: unknown }) : {}));
    },
    (error) => {
      console.error("Could not read availability", error);
      // Deliberately does not publish: overwriting a good answer with "nothing
      // is sold out" the moment the connection blinks would put a dish that
      // has run out back on the menu.
    },
  );
}

/** The ids that are off right now. Empty until the first snapshot arrives. */
export function useSoldOut(): ReadonlySet<string> {
  const [soldOut, setSoldOut] = useState<ReadonlySet<string>>(current ?? NONE);

  useEffect(() => {
    subscribers.add(setSoldOut);
    start();
    // A hook mounting after the first snapshot would otherwise sit on the
    // empty set until the document next changed.
    if (current) setSoldOut(current);

    return () => {
      subscribers.delete(setSoldOut);
      if (subscribers.size === 0) {
        stop?.();
        stop = null;
      }
    };
  }, []);

  return soldOut;
}

/**
 * Turn one dish off or back on.
 *
 * Writes the whole list rather than an arrayUnion, so the document has one
 * shape and the parse above is the only thing that has to understand it.
 */
export async function setItemSoldOut(itemId: string, soldOut: boolean): Promise<void> {
  if (!db) throw new Error("Not configured");

  const next = new Set(current ?? NONE);
  if (soldOut) next.add(itemId);
  else next.delete(itemId);

  await setDoc(doc(db, "settings", "availability"), {
    soldOut: [...next],
    updatedAt: serverTimestamp(),
  });
  // The snapshot says the same thing a moment later, but the counter that
  // pressed the button should not wait for the round trip to see it.
  publish(next);
}
