import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { startAnalytics } from "../lib/firebase";
import { UpdateBanner } from "../components/app/UpdateBanner";

// Defaults for every route; individual routes override them in their own `head`.
const siteTitle = "Poba Express — Jonai's Own Delivery Service";
const siteDescription =
  "Food, cake and medicine delivery in Jonai, Assam. Order on WhatsApp — flat delivery from ₹5, no app, no signup.";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Tears down the service worker and every cache it owns, then reloads.
 *
 * The escape hatch for the one failure a customer cannot otherwise get out of:
 * a worker holding a cache that no longer matches the deployed build serves
 * that mismatch on every visit, including this error screen, and "try again"
 * loads it straight back. Clearing site data is the only other cure and it
 * lives four levels deep in browser settings.
 */
async function resetApp() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // Reload regardless: a partial teardown still beats the wedged state.
  }
  window.location.replace("/app");
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
        <button
          onClick={() => void resetApp()}
          className="mt-6 text-xs font-medium text-muted-foreground underline"
        >
          Still broken? Reset the app
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      // `viewport-fit=cover` is what makes `env(safe-area-inset-*)` return real
      // numbers. Without it every safe-area padding in this app computes to 0,
      // and the translucent iOS status bar below sits on top of the header.
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: siteTitle },
      { name: "description", content: siteDescription },
      { name: "author", content: "Poba Express" },
      { name: "theme-color", content: "#0B3D1B" },
      // Installed-app behaviour on iOS, which ignores the web manifest.
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Poba Express" },
      // `default`, not `black-translucent`. Translucent is the only value that
      // draws the page under the status bar, and iOS pairs it with white status
      // text — which on this app's cream header is white on cream. The bottom
      // home-indicator inset still comes through, because that is viewport-fit.
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { property: "og:site_name", content: "Poba Express" },
      { property: "og:title", content: siteTitle },
      { property: "og:description", content: siteDescription },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      // iOS only accepts a raster image here; an SVG silently falls back to a
      // screenshot of the page.
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* The hero illustration, blurred, carried behind every page so the
            scroll stays in one scene rather than dropping to flat cream.
            The blur is baked into a 4KB file rather than applied in CSS —
            blurring a full-size fixed image repaints on every scroll frame
            and janks on phones. */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
          <img src="/hero-blur.jpg" alt="" className="h-full w-full object-cover opacity-50" />
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // The worker is registered, kept current and swapped by useAppUpdate.
  //
  // In dev it must not exist at all. Skipping registration is not enough: a
  // worker installed by a production build — `vite preview`, or a deploy on
  // the same host — outlives that build and keeps intercepting the origin,
  // serving anything ending in .js or .css cache-first. Point a dev server at
  // that origin afterwards and the page loads the old build's chunks against
  // the new modules, which crashes the app with nothing wrong in the source.
  // So in dev, tear it down rather than ignore it.
  useEffect(() => {
    if (!("serviceWorker" in navigator) || import.meta.env.PROD) return;

    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
      .catch(() => {
        // Nothing registered, or the browser refused — either way, no worker
        // is going to interfere.
      });
    if (typeof caches !== "undefined") {
      void caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((k) => k.startsWith("poba-")).map((k) => caches.delete(k))),
        )
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    void startAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      {/* At the root so it reaches the marketing page and the app alike, and
          renders nothing at all until there is genuinely a new build waiting. */}
      <UpdateBanner />
    </QueryClientProvider>
  );
}
