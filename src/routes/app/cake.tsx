import { createFileRoute } from "@tanstack/react-router";

import { CartBar } from "@/components/app/CartBar";
import { MenuList, ScreenHeading } from "@/components/app/Shared";
import { useCart } from "@/lib/cart";
import { CAKE_ITEMS, CAKE_SOURCE } from "@/lib/restaurants";

import { useClosedRestaurants } from "@/lib/availability";
import { Store } from "lucide-react";

export const Route = createFileRoute("/app/cake")({
  component: CakeScreen,
});

function CakeScreen() {
  const { cart, add, setQuantity } = useCart();
  const closedRestaurants = useClosedRestaurants();
  const isClosed = closedRestaurants.has("dcakery");

  const mine = cart.source === CAKE_SOURCE;
  const quantityOf = (id: string) => cart.lines.find((line) => line.id === id)?.quantity ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading
        title="Cakes from Dcakery"
        subtitle="Baked to order, so allow a few hours. Write the message you want on top at checkout."
      />
      {isClosed && (
        <div className="mt-3 mb-5 flex items-center gap-2 rounded-xl bg-destructive/15 p-3 border border-destructive/30 text-destructive text-xs font-bold">
          <Store className="size-4 shrink-0" />
          <span>
            Dcakery is currently closed today and not accepting online orders.
          </span>
        </div>
      )}
      <MenuList
        items={CAKE_ITEMS}
        quantityOf={(id) => (mine && !isClosed ? quantityOf(id) : 0)}
        onAdd={(item) => !isClosed && add(item, "cake", CAKE_SOURCE)}
        onSetQuantity={(id, qty) => !isClosed && setQuantity(id, qty)}
      />
      <CartBar />
    </div>
  );
}
