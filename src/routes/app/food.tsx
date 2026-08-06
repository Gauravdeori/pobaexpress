import { createFileRoute } from "@tanstack/react-router";

import { RestaurantCard, ScreenHeading } from "@/components/app/Shared";
import { restaurantsIn } from "@/lib/restaurants";

export const Route = createFileRoute("/app/food")({
  component: FoodScreen,
});

function FoodScreen() {
  const restaurants = restaurantsIn("food");

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading
        title="Restaurants"
        subtitle={`${restaurants.length} ${restaurants.length === 1 ? "kitchen" : "kitchens"} delivering in Jonai`}
      />
      <div className="grid gap-3">
        {restaurants.map((r) => (
          <RestaurantCard key={r.slug} restaurant={r} />
        ))}
      </div>
    </div>
  );
}
