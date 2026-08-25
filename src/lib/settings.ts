import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";
import { DEFAULT_LAUNCH, type LaunchSettings } from "./launch-config";

/**
 * Settings the shop can change without a deploy.
 *
 * Launch day used to be a constant in the bundle, which meant moving it — or
 * opening because the kitchens are ready — needed a code change, a build and a
 * deploy. It is a document now, so the person running the service can do it
 * from their phone.
 *
 * Watched rather than fetched. This used to read once per page load and hold
 * the answer in a module-level cache, which meant pressing "Launch now" opened
 * the shop for nobody: the admin's own screen kept its cached "closed" until
 * they reloaded, and so did every customer sitting on the site waiting for it.
 * One document, one listener per tab, and the whole app turns over together.
 *
 * The constants stay as the fallback and are still the source of truth until
 * someone saves over them. If Firestore is unreachable the site must not fall
 * open, so an unread setting means "whatever the code said", never "we are
 * open".
 */

export { DEFAULT_LAUNCH, type LaunchSettings } from "./launch-config";

/** The last thing the server said, shared by every hook in the tab. */
let current: LaunchSettings | null = null;

const subscribers = new Set<(settings: LaunchSettings) => void>();
let stop: (() => void) | null = null;

/** Never trusts the document's shape: a bad field must not open the shop. */
function parse(data: Partial<LaunchSettings> | undefined): LaunchSettings {
  return {
    openNow: typeof data?.openNow === "boolean" ? data.openNow : null,
    launchAt: Number(data?.launchAt) || DEFAULT_LAUNCH.launchAt,
    label: typeof data?.label === "string" && data.label ? data.label : DEFAULT_LAUNCH.label,
  };
}

function publish(settings: LaunchSettings) {
  current = settings;
  for (const notify of subscribers) notify(settings);
}

/** One listener per tab, opened on the first hook and closed with the last. */
function start() {
  if (stop || !db) return;
  stop = onSnapshot(
    doc(db, "settings", "launch"),
    (snapshot) => {
      publish(parse(snapshot.exists() ? (snapshot.data() as Partial<LaunchSettings>) : {}));
    },
    (error) => {
      console.error("Could not read launch settings", error);
      // Deliberately does not publish: falling back here would overwrite a
      // good answer with the defaults the moment the connection blinked, and
      // on a closed shop that reads as opening and closing at random.
    },
  );
}

export function useLaunchSettings(): LaunchSettings {
  const [settings, setSettings] = useState<LaunchSettings>(current ?? DEFAULT_LAUNCH);

  useEffect(() => {
    subscribers.add(setSettings);
    start();
    // A hook mounting after the first snapshot has already arrived would
    // otherwise sit on the defaults until the document next changed.
    if (current) setSettings(current);

    return () => {
      subscribers.delete(setSettings);
      if (subscribers.size === 0) {
        stop?.();
        stop = null;
      }
    };
  }, []);

  return settings;
}

export async function saveLaunchSettings(settings: LaunchSettings): Promise<void> {
  if (!db) throw new Error("Not configured");
  await setDoc(doc(db, "settings", "launch"), { ...settings, updatedAt: serverTimestamp() });
  // The snapshot will say the same thing a moment later, but the screen that
  // pressed the button should not have to wait for the round trip to see it.
  publish(settings);
}
