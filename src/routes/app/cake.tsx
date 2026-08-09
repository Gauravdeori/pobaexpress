import { createFileRoute } from "@tanstack/react-router";

import { CartBar } from "@/components/app/CartBar";
import { MenuList, ScreenHeading } from "@/components/app/Shared";
import { useCart } from "@/lib/cart";
import { CAKE_ITEMS, CAKE_SOURCE } from "@/lib/restaurants";

export const Route = createFileRoute("/app/cake")({
  component: CakeScreen,
});

function CakeScreen() {
  const { cart, add, setQuantity } = useCart();
  const mine = cart.source === CAKE_SOURCE;
  const quantityOf = (id: string) => cart.lines.find((line) => line.id === id)?.quantity ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading
        title="Cakes from Dcakery"
        subtitle="Baked to order, so allow a few hours. Write the message you want on top at checkout."
      />
      <MenuList
        items={CAKE_ITEMS}
        quantityOf={(id) => (mine ? quantityOf(id) : 0)}
        onAdd={(item) => add(item, "cake", CAKE_SOURCE)}
        onSetQuantity={setQuantity}
      />
      <CartBar />
    </div>
  );
}
