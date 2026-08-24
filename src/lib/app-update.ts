import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeping the installed app on the current build.
 *
 * A service worker does not update the app on its own. Left alone it will hand
 * someone the build they installed weeks ago — old prices, old menu — until
 * they happen to clear their data. This hook checks for a new one, and swaps
 * to it at a moment that cannot break the page.
 *
 * The swap is the delicate part. The worker no longer calls skipWaiting() on
 * install, because taking over while a page is still running the previous
 * build swaps the cache underneath it, and the next lazy-loaded chunk that the
 * new deploy dropped takes the app down. Instead the new worker waits, and the
 * page tells it to activate and reloads in the same breath — so the code and
 * the assets it asks for always come from the same build.
 */

/** Deployments are occasional, so this is about being unobtrusive, not quick. */
const POLL_MS = 30 * 60 * 1000;

export type AppUpdate = {
  /** A new build is installed and waiting. */
  ready: boolean;
  /** Activate it and reload. */
  apply: () => void;
};

export function useAppUpdate(): AppUpdate {
  const [ready, setReady] = useState(false);
  const waiting = useRef<ServiceWorker | null>(null);
  // A reload guard: controllerchange can fire more than once, and reloading
  // from inside its own handler is how you build a refresh loop.
  const reloading = useRef(false);

  const apply = useCallback(() => {
    const worker = waiting.current;
    if (!worker || reloading.current) return;
    reloading.current = true;
    worker.postMessage({ type: "SKIP_WAITING" });
    // If the swap never lands — an unsupported browser, a worker that failed
    // to activate — reload anyway rather than leaving a button that did
    // nothing. The fresh navigation picks up the new build either way.
    window.setTimeout(() => window.location.reload(), 2000);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;

    const onControllerChange = () => {
      if (reloading.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const markWaiting = (worker: ServiceWorker | null) => {
      // `controller` is null on the very first visit, when the worker that just
      // installed is the only one there has ever been. That is not an update,
      // and prompting for it would ask a first-time visitor to refresh.
      if (!worker || !navigator.serviceWorker.controller) return;
      waiting.current = worker;
      setReady(true);
    };

    void navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (cancelled) return;
        registration = reg;

        // One may already be waiting from a previous visit.
        markWaiting(reg.waiting);

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed") markWaiting(installing);
          });
        });
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });

    // Browsers only check for a new worker on their own schedule, which can be
    // a full day. Ask on a timer, and whenever the app is brought back to the
    // front — the moment someone returns is the moment a stale menu matters.
    const check = () => {
      if (document.visibilityState !== "visible") return;
      void registration?.update().catch(() => {
        // Offline, or the server is down. Nothing to update to.
      });
    };
    const timer = window.setInterval(check, POLL_MS);
    document.addEventListener("visibilitychange", check);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  // Applied without asking once the app is out of sight. Someone who has
  // switched away is not mid-order, so there is nothing to interrupt and no
  // reason to make them tap a button for it. Anyone still looking at the
  // screen gets the prompt instead.
  useEffect(() => {
    if (!ready) return;
    const onHide = () => {
      if (document.visibilityState === "hidden") apply();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [ready, apply]);

  return { ready, apply };
}
