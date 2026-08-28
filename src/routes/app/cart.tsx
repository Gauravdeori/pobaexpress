import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, Minus, PackageX, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { useSoldOut } from "@/lib/availability";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/menu";
import { useDeliveryQuote } from "@/lib/use-delivery";

export const Route = createFileRoute("/app/cart")({
  component: CartScreen,
});

function CartScreen() {
  const { cart, subtotal, setQuantity, clear } = useCart();
  // The same quote checkout uses, so the total does not move between
  // this screen and the one that takes the order.
  const quote = useDeliveryQuote(cart.category);
  const total = subtotal + quote.fee + quote.platformFee;
  const { user, loading: authLoading } = useAccount();
  const needsSignIn = !authLoading && !user;
  // A cart can be filled at seven and paid for at eight, and the kitchen can
  // run out in between. Checked here rather than only at checkout so the news
  // arrives on the screen where the line can be removed.
  const soldOut = useSoldOut();
  const goneLines = cart.lines.filter((line) => soldOut.has(line.id));

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
              {soldOut.has(line.id) && (
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                  <PackageX className="size-3" />
                  Sold out — remove to continue
                </p>
              )}
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
                disabled={soldOut.has(line.id)}
                onClick={() => setQuantity(line.id, line.quantity + 1)}
                aria-label={`Add one more ${line.name}`}
                className="flex size-9 items-center justify-center rounded-full bg-gradient-accent text-accent-foreground disabled:opacity-40"
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
          <span>{rupees(quote.fee)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Platform fee</span>
          <span>{rupees(quote.platformFee)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-primary">
          <span>Total</span>
          <span>{rupees(total)}</span>
        </div>
      </div>

      {goneLines.length > 0 && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-destructive">
            <PackageX className="size-4 shrink-0" />
            {goneLines.length === 1 ? "One item has sold out" : "Some items have sold out"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {goneLines.map((line) => line.name).join(", ")} — the kitchen has run out. Remove{" "}
            {goneLines.length === 1 ? "it" : "them"} and the rest of your order is fine.
          </p>
          <button
            type="button"
            onClick={() => {
              for (const line of goneLines) setQuantity(line.id, 0);
            }}
            className="mt-3 h-10 w-full rounded-xl bg-destructive text-xs font-bold text-destructive-foreground transition-opacity hover:opacity-90"
          >
            Remove {goneLines.length === 1 ? "it" : `all ${goneLines.length}`}
          </button>
        </div>
      )}

      {/* Sent to sign-in first rather than into a form they cannot submit.
          The cart is in storage, so it is still here afterwards. */}
      {goneLines.length > 0 ? (
        <Button variant="accent" className="mt-4 h-12 w-full rounded-2xl" disabled>
          Remove sold-out items to continue
        </Button>
      ) : needsSignIn ? (
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
