import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";
import { DEFAULT_LAUNCH, type LaunchSettings } from "./launch-config";

/**
 * Settings the shop can change without a deploy.
 *
 * Launch day used to be a constant in the bundle, which meant moving it — or
 * opening early because the kitchens were ready — needed a code change, a
 * build and a deploy. It is a document now, so the person running the service
 * can do it from their phone.
 *
 * The constants stay as the fallback and are still the source of truth until
 * someone saves over them. If Firestore is unreachable the site must not fall
 * open, so an unread setting means "whatever the code said", never "we are
 * open".
 */

export { DEFAULT_LAUNCH, type LaunchSettings } from "./launch-config";

/** Read once per page and shared, so every screen agrees on the same answer. */
let cached: LaunchSettings | null = null;
let inFlight: Promise<LaunchSettings> | null = null;

export function loadLaunchSettings(): Promise<LaunchSettings> {
  if (cached) return Promise.resolve(cached);
  if (!db) return Promise.resolve(DEFAULT_LAUNCH);
  inFlight ??= getDoc(doc(db, "settings", "launch"))
    .then((snapshot) => {
      const data = snapshot.exists() ? (snapshot.data() as Partial<LaunchSettings>) : {};
      const settings: LaunchSettings = {
        openNow: typeof data.openNow === "boolean" ? data.openNow : null,
        launchAt: Number(data.launchAt) || DEFAULT_LAUNCH.launchAt,
        label: typeof data.label === "string" && data.label ? data.label : DEFAULT_LAUNCH.label,
      };
      cached = settings;
      return settings;
    })
    .catch((error) => {
      console.error("Could not read launch settings", error);
      return DEFAULT_LAUNCH;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export function useLaunchSettings(): LaunchSettings {
  const [settings, setSettings] = useState<LaunchSettings>(cached ?? DEFAULT_LAUNCH);

  useEffect(() => {
    let cancelled = false;
    void loadLaunchSettings().then((next) => {
      if (!cancelled) setSettings(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}

export async function saveLaunchSettings(settings: LaunchSettings): Promise<void> {
  if (!db) throw new Error("Not configured");
  await setDoc(doc(db, "settings", "launch"), { ...settings, updatedAt: serverTimestamp() });
  // The page that just saved should see its own change without a reload.
  cached = settings;
}
