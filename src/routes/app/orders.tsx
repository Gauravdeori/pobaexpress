import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, LogIn, MapPin, Package, Paperclip } from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { rupees } from "@/lib/menu";
import { listOrders, type OrderRecord } from "@/lib/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/orders")({
  component: OrdersScreen,
});

/**
 * Statuses the console can move an order through, in plain words.
 *
 * Anything unrecognised falls through to the raw value rather than a blank —
 * a status invented in the console later should still read as something.
 */
const STATUS: Record<string, { label: string; tone: "open" | "done" | "off" }> = {
  new: { label: "Order placed", tone: "open" },
  confirmed: { label: "Confirmed", tone: "open" },
  preparing: { label: "Being prepared", tone: "open" },
  "on-the-way": { label: "On the way", tone: "open" },
  delivered: { label: "Delivered", tone: "done" },
  cancelled: { label: "Cancelled", tone: "off" },
};

function StatusPill({ status }: { status: string }) {
  const known = STATUS[status];
  const tone = known?.tone ?? "open";
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        tone === "done" && "bg-accent text-accent-foreground",
        tone === "off" && "bg-secondary text-muted-foreground",
        tone === "open" && "bg-accent/10 text-accent",
      )}
    >
      {known?.label ?? status}
    </span>
  );
}

function placedLabel(date: Date | null): string {
  if (!date) return "Just now";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function OrderCard({ order }: { order: OrderRecord }) {
  const title =
    order.category === "medicine" ? "Medicine" : order.category === "cake" ? "Cake" : "Food";

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-primary">{title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {placedLabel(order.placedAt)}
          </p>
        </div>
        <StatusPill status={order.status} />
      </div>

      {order.lines.length > 0 && (
        <ul className="mt-3 grid gap-1 border-t border-border pt-3 text-sm">
          {order.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 text-muted-foreground">
              <span className="min-w-0 truncate">
                {line.label} × {line.quantity}
              </span>
              <span className="shrink-0">{rupees(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Medicine has no priced lines, so the request itself is the order. */}
      {order.extraRequest && (
        <p className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-sm text-muted-foreground">
          {order.extraRequest}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          {order.category === "medicine" ? "Total confirmed on WhatsApp" : "Total"}
        </span>
        {order.category !== "medicine" && (
          <span className="font-bold text-primary">{rupees(order.total)}</span>
        )}
      </div>

      {(order.location || order.prescriptionUrl) && (
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium">
          {order.location && (
            <a
              href={order.location.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent underline"
            >
              <MapPin className="size-3.5" />
              Map pin sent
            </a>
          )}
          {order.prescriptionUrl && (
            <a
              href={order.prescriptionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent underline"
            >
              <Paperclip className="size-3.5" />
              Prescription
            </a>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * The shape of the list before the list arrives.
 *
 * A word like "Loading…" tells someone to wait without telling them what for.
 * Cards in the right places make the wait feel like the screen arriving rather
 * than the screen being broken, and stop the layout jumping when it does.
 */
function OrderSkeletons() {
  return (
    <ul aria-hidden className="grid gap-3">
      {[0, 1].map((row) => (
        <li key={row} className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full min-w-0 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
            </div>
            <div className="h-6 w-24 shrink-0 animate-pulse rounded-full bg-secondary" />
          </div>
          <div className="mt-4 space-y-2 border-t border-border/70 pt-3">
            <div className="h-3 w-full animate-pulse rounded bg-secondary" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrdersScreen() {
  const { user, loading: authLoading } = useAccount();
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders(null);
      return;
    }
    let cancelled = false;
    setFailed(false);
    listOrders(user.uid)
      .then((found) => !cancelled && setOrders(found))
      .catch((error) => {
        console.error("Could not load orders", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading title="Your orders" subtitle="Everything you've ordered, newest first." />

      {authLoading ? (
        <OrderSkeletons />
      ) : !user ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Sign in to see your orders. They&apos;re kept against your account, so they follow you
            to any phone.
          </p>
          <Button variant="accent" className="mt-4 h-11 w-full rounded-2xl" asChild>
            <Link to="/app/account">
              <LogIn className="size-4" /> Sign in
            </Link>
          </Button>
        </div>
      ) : failed ? (
        // Deliberately not an empty state: telling someone who has ordered that
        // they have no orders is worse than admitting the list would not load.
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Couldn&apos;t load your orders just now. Check your connection and pull the page again.
        </p>
      ) : orders === null ? (
        <OrderSkeletons />
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Package className="size-6" />
          </span>
          <p className="mt-3 text-sm font-medium text-primary">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your first one will show up here the moment you place it.
          </p>
          <Button variant="accent" className="mt-5 h-11 rounded-2xl px-8" asChild>
            <Link to="/app">Browse the menu</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}
