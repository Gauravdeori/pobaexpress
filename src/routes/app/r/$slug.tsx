import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { ItemRow, Rating, RestaurantThumb } from "@/components/app/Shared";
import { useCart } from "@/lib/cart";
import { deliveryFee, rupees } from "@/lib/menu";
import { getRestaurant } from "@/lib/restaurants";
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
    <div className="mx-auto max-w-3xl px-4 py-5">
      <Link
        to="/app/food"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Restaurants
      </Link>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <RestaurantThumb restaurant={restaurant} className="size-16" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-primary">{restaurant.name}</h1>
            <Rating restaurant={restaurant} />
          </div>
          <p className="truncate text-xs text-muted-foreground">{restaurant.cuisine}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5" />
            {restaurant.eta[0]}–{restaurant.eta[1]} min · {rupees(deliveryFee(restaurant.category))}{" "}
            delivery
          </p>
          {restaurant.hours && (
            <p className="mt-1 text-xs font-semibold text-accent">Open {restaurant.hours}</p>
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        Menu
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

      <CartBar />
    </div>
  );
}
