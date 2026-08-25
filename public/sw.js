/**
 * Poba Express service worker.
 *
 * Deliberately conservative: the site is server-rendered, so HTML is always
 * fetched fresh when the network allows and only falls back to a cached copy
 * offline. Hashed build assets never change under a given URL, so they are
 * served from cache and refreshed in the background.
 */

// v3 rewrites how navigations are cached — see the fetch handler. Installed
// clients holding a v2 shell have a cache keyed the wrong way, so it goes.
const VERSION = "v3";
const SHELL_CACHE = `poba-shell-${VERSION}`;
const ASSET_CACHE = `poba-assets-${VERSION}`;

// Enough to render something useful with no network. /app is the installed
// app's start_url, so it matters more here than the marketing page.
const SHELL_URLS = ["/", "/app", "/manifest.webmanifest", "/icon-192.png", "/poba-logo.png"];

self.addEventListener("install", (event) => {
  // FORCE OVERRIDE: Skip waiting immediately to force the new worker to take over
  self.skipWaiting();
});

// The page asking to be updated now.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          // FORCE OVERRIDE: Delete ALL caches immediately to fix the user's issue
          keys.map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Hashed build output and images: safe to serve from cache. */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    /\.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname)
  );
}

/**
 * The page to show for a URL we have never cached.
 *
 * An app route falls back to the app shell rather than the marketing page,
 * because someone who opened the installed app offline is not asking to read
 * about the service.
 */
function offlineFallbackFor(url) {
  return url.pathname.startsWith("/app") ? "/app" : "/";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Leave cross-origin traffic (fonts, wa.me) to the browser.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cached under its own URL. This used to write every page to the
          // key "/", so going offline served whichever page had been visited
          // last, whatever address you asked for. Only 200s are kept: a 500
          // cached here would be the offline copy of the site.
          if (response.ok) {
            const copy = response.clone();
            void caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match(request)) ??
            (await cache.match(offlineFallbackFor(url))) ??
            Response.error()
          );
        }),
    );
    return;
  }

  if (!isStaticAsset(url)) return;

  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});
