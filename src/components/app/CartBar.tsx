import { Link } from "@tanstack/react-router";
import { ChevronRight, ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/menu";

/**
 * Floating "n items · ₹x — View cart" bar.
 *
 * Sits above the tab bar rather than replacing it, so the nav never moves
 * under the thumb mid-order.
 */
export function CartBar() {
  const { count, subtotal } = useCart();
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 px-4 pb-2">
      <Link
        to="/app/cart"
        className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl bg-gradient-accent px-5 py-3.5 text-accent-foreground shadow-lift"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ShoppingBag className="size-4" />
          {count} {count === 1 ? "item" : "items"} · {rupees(subtotal)}
        </span>
        <span className="flex items-center gap-1 text-sm font-bold">
          View cart
          <ChevronRight className="size-4" />
        </span>
      </Link>
    </div>
  );
}
