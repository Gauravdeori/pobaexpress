import { createFileRoute, Link } from "@tanstack/react-router";
import { Cake, ChevronRight, MapPin, Pill, Search, UtensilsCrossed } from "lucide-react";

import { RestaurantTile } from "@/components/app/Shared";
import { Spotlights } from "@/components/app/Spotlight";
import { useAccount } from "@/lib/account";
import { restaurantsIn } from "@/lib/restaurants";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

const categories = [
  {
    to: "/app/food",
    label: "Food",
    hint: "Biryani, momos, pizza",
    icon: UtensilsCrossed,
  },
  { to: "/app/cake", label: "Cakes", hint: "Dcakery bakes", icon: Cake },
  { to: "/app/medicine", label: "Medicine", hint: "Send a prescription", icon: Pill },
] as const;

function AppHome() {
  const launched = useLaunched();
  const { profile } = useAccount();
  const restaurants = restaurantsIn("food");

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Where we are delivering, said before anything else — it is the first
          thing a customer checks and the one thing that would waste their
          time if it were wrong. The saved address shows once there is one;
          until then the town stands in for it. */}
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Delivering to
          </p>
          <p className="truncate text-sm font-bold text-primary">
            {profile?.address?.trim() || "Jonai, Assam"}
          </p>
        </div>
      </div>

      {/* A link dressed as a search box rather than an input that does nothing
          here: one tap lands on the screen that can actually search. */}
      <Link
        to="/app/food"
        className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-accent"
      >
        <Search className="size-4 shrink-0" />
        Search for food, restaurants, dishes…
      </Link>

      {!launched && (
        <p className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-primary">
          <span className="font-semibold">Opening {LAUNCH_DATE_LABEL}.</span> Browse the menu and
          prices now — ordering switches on that morning.
        </p>
      )}

      <Spotlights />

      <h1 className="mb-3 mt-7 text-base font-bold text-primary">What do you need?</h1>
      <div className="grid grid-cols-3 gap-2.5">
        {categories.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center transition-colors hover:border-accent"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <c.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-primary">{c.label}</span>
              <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                {c.hint}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mb-3 mt-8 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold text-primary">Restaurants in Jonai</h2>
        <Link
          to="/app/food"
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-accent"
        >
          See all
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* A rail rather than a stack: it shows there is more than one kitchen
          without pushing everything else off the screen. Negative margins let
          it run to the edges the way the rest of the page does not. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3">
          {restaurants.map((r) => (
            <RestaurantTile key={r.slug} restaurant={r} />
          ))}
        </div>
      </div>

      <div className="mb-3 mt-8 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold text-primary">Also delivering</h2>
      </div>
      <Link
        to="/app/cake"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Cake className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-primary">Dcakery</p>
          <p className="truncate text-xs text-muted-foreground">Cakes · Cheesecakes · Loaves</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </div>
  );
}
