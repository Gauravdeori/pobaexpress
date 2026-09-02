import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ClipboardList, ChevronDown, Home, Package, ShoppingBag, UserRound } from "lucide-react";

import { useAccount } from "@/lib/account";
import { useIsAdmin } from "@/lib/admin";
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
  // Most people order from a phone and come straight back to check on it, so
  // the order list is a tab rather than something to find inside Account.
  { to: "/app/orders", label: "Orders", icon: Package, exact: false },
  { to: "/app/account", label: "Account", icon: UserRound, exact: false },
];

/**
 * The counter tab, for staff only.
 *
 * Appended rather than woven in, so a customer's tab bar is byte-for-byte what
 * it was. Whoever is taking orders is holding the installed app, and the whole
 * point is that they never have to leave it to work.
 */
const MANAGE_TAB = {
  to: "/app/manage",
  label: "Counter",
  icon: ClipboardList,
  exact: false,
} as const;

function AppShell() {
  return (
    <CartProvider>
      <div className="flex min-h-[100dvh] flex-col bg-secondary/40">
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
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link to="/app" className="flex items-center gap-2">
          <img
            ref={logoRef}
            src={LOGO_SRC}
            onError={onLogoError}
            alt="Poba Express"
            className="h-9.5 w-auto"
          />
        </Link>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 shadow-sm transition-all hover:bg-secondary active:scale-95"
        >
          <span>Jonai</span>
          <ChevronDown className="size-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
}

function TabBar() {
  const { count } = useCart();
  const { user } = useAccount();
  const { isAdmin } = useIsAdmin(user);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // The check answers false until it has run, so the tab appears rather than
  // disappears — a bar that loses a tab under the thumb is how a mis-tap
  // happens.
  const visible = isAdmin ? [...tabs, MANAGE_TAB] : tabs;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-3xl items-stretch pb-[env(safe-area-inset-bottom)]">
        {visible.map((tab) => {
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
