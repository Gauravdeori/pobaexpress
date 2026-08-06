import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/menu";

export const Route = createFileRoute("/app/cart")({
  component: CartScreen,
});

function CartScreen() {
  const { cart, subtotal, fee, total, setQuantity, clear } = useCart();
  const { user, loading: authLoading } = useAccount();
  const needsSignIn = !authLoading && !user;

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <ShoppingBag className="size-7" />
        </span>
        <h1 className="mt-4 text-lg font-bold text-primary">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick something from a restaurant and it turns up here.
        </p>
        <Button variant="accent" className="mt-6 h-12 rounded-2xl px-8" asChild>
          <Link to="/app">Browse</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading title="Your order" subtitle={cart.source ?? undefined} />

      <ul className="grid gap-2.5">
        {cart.lines.map((line) => (
          <li
            key={line.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-primary">{line.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {line.variant ? `${line.variant} · ` : ""}
                {rupees(line.price)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setQuantity(line.id, line.quantity - 1)}
                aria-label={`Remove one ${line.name}`}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-primary"
              >
                {line.quantity === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
              </button>
              <span className="w-6 text-center text-sm font-semibold text-primary">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(line.id, line.quantity + 1)}
                aria-label={`Add one more ${line.name}`}
                className="flex size-9 items-center justify-center rounded-full bg-gradient-accent text-accent-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <span className="w-16 shrink-0 text-right text-sm font-semibold text-primary">
              {rupees(line.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{rupees(subtotal)}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-muted-foreground">
          <span>Delivery</span>
          <span>{rupees(fee)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-primary">
          <span>Total</span>
          <span>{rupees(total)}</span>
        </div>
      </div>

      {/* Sent to sign-in first rather than into a form they cannot submit.
          The cart is in storage, so it is still here afterwards. */}
      {needsSignIn ? (
        <Button variant="accent" className="mt-4 h-12 w-full rounded-2xl" asChild>
          <Link to="/app/account">
            <LogIn className="size-4" /> Sign in to order
          </Link>
        </Button>
      ) : (
        <Button variant="accent" className="mt-4 h-12 w-full rounded-2xl" asChild>
          <Link to="/app/checkout">Checkout</Link>
        </Button>
      )}
      <button
        type="button"
        onClick={clear}
        className="mt-3 w-full text-center text-xs font-medium text-muted-foreground underline"
      >
        Empty cart
      </button>
    </div>
  );
}
