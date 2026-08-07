import { createFileRoute, Link } from "@tanstack/react-router";
import { Cake, Pill, UtensilsCrossed } from "lucide-react";

import { RestaurantCard } from "@/components/app/Shared";
import { restaurantsIn } from "@/lib/restaurants";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

const categories = [
  {
    to: "/app/food",
    label: "Food",
    hint: "Biryani, chowmein, momos, pizza",
    icon: UtensilsCrossed,
  },
  { to: "/app/cake", label: "Cake", hint: "Dcakery — cakes and cheesecakes", icon: Cake },
  { to: "/app/medicine", label: "Medicine", hint: "Send a prescription", icon: Pill },
];

function AppHome() {
  const launched = useLaunched();
  const restaurants = restaurantsIn("food");

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {!launched && (
        <p className="mb-5 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-primary">
          <span className="font-semibold">Opening {LAUNCH_DATE_LABEL}.</span> Browse the menu and
          prices now — ordering switches on that morning.
        </p>
      )}

      <h1 className="text-xl font-bold text-primary">What do you need?</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-accent sm:flex-col sm:items-start"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <c.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-primary">{c.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{c.hint}</span>
            </span>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-base font-bold text-primary">Restaurants in Jonai</h2>
      <div className="grid gap-3">
        {restaurants.map((r) => (
          <RestaurantCard key={r.slug} restaurant={r} />
        ))}
      </div>
    </div>
  );
}
