import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase is optional. The site was built to work with no backend at all —
 * ordering goes through WhatsApp — so everything here is additive. With the
 * environment variables absent these exports are null and callers fall back to
 * the original behaviour rather than throwing.
 *
 * The config below is not secret. Firebase web config is designed to ship in
 * the browser bundle; access is controlled by the rules in firestore.rules and
 * storage.rules, never by hiding these values.
 */

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

// The app renders on the server too, where the SDK has nothing to talk to and
// analytics would throw outright.
const isBrowser = typeof window !== "undefined";

let app: FirebaseApp | null = null;
if (isFirebaseConfigured && isBrowser) {
  app = getApps()[0] ?? initializeApp(config as Required<typeof config>);
}

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;

// Cloud Storage is deliberately absent: it requires the Blaze plan, so
// prescription photos go to Cloudinary instead. See src/lib/uploads.ts.

/**
 * Analytics is loaded lazily and only where it is actually supported, so it
 * can never break the render or the initial payload. Fails silently: metrics
 * are not worth an error on someone's order.
 */
export async function startAnalytics() {
  if (!app || !isBrowser || !config.measurementId) return;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) getAnalytics(app);
  } catch {
    // Blocked by an extension, unsupported browser — not worth reporting.
  }
}
