import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, UserRound } from "lucide-react";

import { CartProvider, useCart } from "@/lib/cart";
import { LOGO_SRC, logoRef, onLogoError } from "@/lib/assets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Poba Express" },
      { name: "description", content: "Order food, cake and medicine in Jonai." },
      // The shell is a private ordering surface, not a landing page. Keeping it
      // out of search results also keeps the marketing page the single result
      // for the brand.
      { name: "robots", content: "noindex" },
      { name: "theme-color", content: "#0d3119" },
    ],
  }),
  component: AppShell,
});

const tabs = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/cart", label: "Cart", icon: ShoppingBag, exact: false },
  { to: "/app/account", label: "Account", icon: UserRound, exact: false },
];

function AppShell() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-secondary/40">
        <AppHeader />
        {/* Padded for the fixed tab bar plus the home indicator on phones that
            have one, so the last row is never sat under either. */}
        <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          <Outlet />
        </main>
        <TabBar />
      </div>
    </CartProvider>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link to="/app" className="flex items-center gap-2">
          <img
            ref={logoRef}
            src={LOGO_SRC}
            onError={onLogoError}
            alt="Poba Express"
            className="h-9 w-auto"
          />
        </Link>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          Jonai
        </span>
      </div>
    </header>
  );
}

function TabBar() {
  const { count } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-3xl items-stretch pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <tab.icon className="size-5" />
                  {tab.label === "Cart" && count > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
