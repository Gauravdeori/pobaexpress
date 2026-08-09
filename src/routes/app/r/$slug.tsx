import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, UtensilsCrossed } from "lucide-react";

import { ItemRow, Rating } from "@/components/app/Shared";
import { useCart } from "@/lib/cart";
import { deliveryFee, rupees } from "@/lib/menu";
import { getRestaurant, priceFrom } from "@/lib/restaurants";
import { CartBar } from "@/components/app/CartBar";

export const Route = createFileRoute("/app/r/$slug")({
  loader: ({ params }) => {
    const restaurant = getRestaurant(params.slug);
    if (!restaurant) throw notFound();
    return restaurant;
  },
  component: RestaurantScreen,
});

function RestaurantScreen() {
  const restaurant = Route.useLoaderData();
  const { cart, add, setQuantity } = useCart();

  const quantityOf = (id: string) => cart.lines.find((line) => line.id === id)?.quantity ?? 0;
  const mine = cart.source === restaurant.name;

  return (
    <div className="pb-4">
      {/* Full-bleed header. The photo runs to the edges and the back control
          sits on it, so the shop arrives as a place rather than another row. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary sm:aspect-[21/9]">
        {restaurant.image ? (
          <img src={restaurant.image} alt="" aria-hidden className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center bg-accent/10 text-accent">
            <UtensilsCrossed className="size-12" />
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <Link
          to="/app/food"
          aria-label="Back to restaurants"
          className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/90 text-primary shadow-soft backdrop-blur"
        >
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        {/* Lifted over the photo so the two read as one object. */}
        <div className="-mt-8 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <h1 className="min-w-0 truncate text-xl font-bold text-primary">{restaurant.name}</h1>
            <Rating restaurant={restaurant} />
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">{restaurant.cuisine}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-primary">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              {restaurant.eta[0]}–{restaurant.eta[1]} min
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
              {rupees(deliveryFee(restaurant.category))} delivery
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
              from {rupees(priceFrom(restaurant))}
            </span>
            {/* Only the partners that keep short hours carry this, and it is
                the one chip worth the accent — ordering at 9 PM from a shop
                that shuts at 6 is the mistake worth preventing. */}
            {restaurant.hours && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-accent-foreground">
                {restaurant.hours}
              </span>
            )}
          </div>
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Menu · {restaurant.items.length} items
        </h2>
        <ul className="grid gap-2.5">
          {restaurant.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              quantity={mine ? quantityOf(item.id) : 0}
              onAdd={() => add(item, restaurant.category, restaurant.name)}
              onSetQuantity={(next) => setQuantity(item.id, next)}
            />
          ))}
        </ul>
      </div>

      <CartBar />
    </div>
  );
}
