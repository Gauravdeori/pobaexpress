import { createFileRoute } from "@tanstack/react-router";

import { CartBar } from "@/components/app/CartBar";
import { ItemRow, ScreenHeading } from "@/components/app/Shared";
import { useCart } from "@/lib/cart";
import { CAKE_ITEMS } from "@/lib/restaurants";

export const Route = createFileRoute("/app/cake")({
  component: CakeScreen,
});

const SOURCE = "Cake";

function CakeScreen() {
  const { cart, add, setQuantity } = useCart();
  const mine = cart.source === SOURCE;
  const quantityOf = (id: string) => cart.lines.find((line) => line.id === id)?.quantity ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading
        title="Cakes"
        subtitle="Baked to order, so allow a few hours. Write the message you want on top at checkout."
      />
      <ul className="grid gap-2.5">
        {CAKE_ITEMS.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            quantity={mine ? quantityOf(item.id) : 0}
            onAdd={() => add(item, "cake", SOURCE)}
            onSetQuantity={(next) => setQuantity(item.id, next)}
          />
        ))}
      </ul>
      <CartBar />
    </div>
  );
}
