/**
 * Poba Express service worker.
 *
 * Deliberately conservative: the site is server-rendered, so HTML is always
 * fetched fresh when the network allows and only falls back to a cached copy
 * offline. Hashed build assets never change under a given URL, so they are
 * served from cache and refreshed in the background.
 */

// Bumped so installed clients drop the v1 shell, which cached "/" as the
// start_url before the app moved to /app.
const VERSION = "v2";
const SHELL_CACHE = `poba-shell-${VERSION}`;
const ASSET_CACHE = `poba-assets-${VERSION}`;

// Enough to render something useful with no network. /app is the installed
// app's start_url, so it matters more here than the marketing page.
const SHELL_URLS = ["/", "/app", "/manifest.webmanifest", "/icon-192.png", "/poba-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // One missing entry must not fail the whole install.
      .then((cache) => Promise.allSettled(SHELL_URLS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
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
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ?? (await caches.match("/")) ?? Response.error(),
        ),
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
