import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, Check, ClipboardList, Loader2, Lock, MapPin, Phone, Timer, X } from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { useAccount } from "@/lib/account";
import {
  ETA_PRESETS,
  NEXT_STEP,
  ORDER_STATUSES,
  setOrderProgress,
  useAllOrders,
  useIsAdmin,
  type OrderStatus,
} from "@/lib/admin";
import { rupees } from "@/lib/menu";
import type { OrderRecord } from "@/lib/orders";
import { cn } from "@/lib/utils";

/**
 * The counter, on a phone.
 *
 * The console at /admin is a desk screen: a 5xl page with tables of offers and
 * launch settings beside the orders. Whoever is actually taking orders is
 * holding the installed app, and asking them to leave it for a wide layout in
 * a browser tab is asking them not to bother. So the part of the job that
 * happens minute to minute — accept it, start it, send it out, say when it
 * will land — lives here, inside the app shell, under the tab bar, at the
 * width it will really be used at.
 *
 * Everything else stays at /admin. Offers and launch dates are written once in
 * a sitting, which is a desk job, and duplicating them here would be two
 * places to keep the same rules in step.
 */

export const Route = createFileRoute("/app/manage")({
  head: () => ({
    meta: [{ title: "Orders — Poba Express" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ManageScreen,
});

const STATUS_STYLES: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  confirmed: "bg-blue-500/15 text-blue-700",
  preparing: "bg-amber-500/15 text-amber-700",
  "on-the-way": "bg-violet-500/15 text-violet-700",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-secondary text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  confirmed: "Accepted",
  preparing: "Preparing",
  "on-the-way": "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Still being worked on — what the screen opens to. */
const OPEN_STATUSES = ["new", "confirmed", "preparing", "on-the-way"];

function etaLabel(etaAt: number): string {
  const minutes = Math.round((etaAt - Date.now()) / 60_000);
  if (minutes < -1) return `${Math.abs(minutes)} min over`;
  if (minutes <= 1) return "due now";
  return `${minutes} min`;
}

function placedLabel(date: Date | null): string {
  if (!date) return "just now";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function OrderCard({
  order,
  busy,
  onChange,
}: {
  order: OrderRecord;
  busy: boolean;
  onChange: (id: string, status: OrderStatus, eta?: number | null) => void;
}) {
  const next = NEXT_STEP[order.status as OrderStatus];
  const settled = order.status === "delivered" || order.status === "cancelled";
  const [more, setMore] = useState(false);

  return (
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-primary">{order.customerName}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {order.category} · {placedLabel(order.placedAt)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-primary">{rupees(order.total)}</p>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              STATUS_STYLES[order.status] ?? "bg-secondary text-muted-foreground",
            )}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {/* Call and navigate are the two things a rider does from this card, so
          they are targets rather than text. */}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`tel:${order.phone}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-primary"
        >
          <Phone className="size-3.5" />
          {order.phone}
        </a>
        {order.location?.url && (
          <a
            href={order.location.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-primary"
          >
            <MapPin className="size-3.5" />
            Map pin
          </a>
        )}
        {order.etaAt !== null && !settled && (
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-bold text-primary">
            <Timer className="size-3.5" />
            {etaLabel(order.etaAt)}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{order.address}</p>

      {order.lines.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
          {order.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">
                {line.label} × {line.quantity}
              </span>
              <span className="shrink-0 font-medium text-primary">
                {rupees(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {order.extraRequest && (
        <p className="mt-2 rounded-xl bg-secondary p-2.5 text-xs text-muted-foreground">
          {order.extraRequest}
        </p>
      )}
      {order.notes && (
        <p className="mt-2 rounded-xl bg-secondary p-2.5 text-xs text-muted-foreground">
          Note: {order.notes}
        </p>
      )}
      {order.prescriptionUrl && (
        <a
          href={order.prescriptionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-accent underline"
        >
          View prescription
        </a>
      )}

      {next && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onChange(order.id, next.to)}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : next.to === "on-the-way" ? (
            <Bike className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
          {next.label}
        </button>
      )}

      {!settled && (
        <div className="mt-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Timer className="size-3" />
            Arriving in
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ETA_PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                disabled={busy}
                onClick={() => onChange(order.id, order.status as OrderStatus, minutes)}
                className="min-h-9 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {minutes}m
              </button>
            ))}
            {order.etaAt !== null && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(order.id, order.status as OrderStatus, null)}
                className="min-h-9 rounded-full px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* The rest of the states are a tap away rather than on screen: on a
          phone card, six buttons of equal weight hide the one that is right. */}
      <button
        type="button"
        onClick={() => setMore((open) => !open)}
        className="mt-3 text-xs font-semibold text-muted-foreground underline"
      >
        {more ? "Hide other states" : "Move to another state"}
      </button>

      {more && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ORDER_STATUSES.filter((status) => status !== order.status && status !== next?.to).map(
            (status) => (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => onChange(order.id, status)}
                className={cn(
                  "min-h-9 rounded-full border border-border px-3 text-xs font-semibold transition-colors disabled:opacity-50",
                  status === "cancelled"
                    ? "text-muted-foreground hover:border-destructive hover:text-destructive"
                    : "text-muted-foreground hover:border-accent hover:text-accent",
                )}
              >
                {status === "cancelled" && <X className="mr-1 inline size-3" />}
                {STATUS_LABELS[status] ?? status}
              </button>
            ),
          )}
        </div>
      )}
    </li>
  );
}

function ManageScreen() {
  const { user, loading: authLoading } = useAccount();
  const { isAdmin, checking, denied } = useIsAdmin(user);
  // Live, because this is the screen left open while orders come in. Only
  // subscribed once the admin check passes, so a customer's app never opens a
  // listener the rules would refuse anyway.
  const { orders, error, loading } = useAllOrders(isAdmin);
  const [busy, setBusy] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const change = async (id: string, status: OrderStatus, eta?: number | null) => {
    setBusy(id);
    try {
      await setOrderProgress(id, status, eta);
    } catch (cause) {
      console.error("Could not update the order", cause);
    } finally {
      setBusy(null);
    }
  };

  const open = useMemo(
    () => orders.filter((order) => OPEN_STATUSES.includes(order.status)),
    [orders],
  );
  const shown = showAll ? orders : open;
  const newCount = orders.filter((order) => order.status === "new").length;

  if (authLoading || checking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ScreenHeading title="Orders" />
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Checking your access…
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ScreenHeading title="Orders" />
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Lock className="size-5" />
          </span>
          <p className="mt-3 font-semibold text-primary">This screen is for staff</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {denied
              ? "The database refused the check, which usually means the security rules have not been deployed yet."
              : "Your own orders are under the Orders tab."}
          </p>
          <Link
            to="/app/orders"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
          >
            Go to my orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading title="Orders" />

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">
          {newCount > 0 ? (
            <span className="text-accent">{newCount} waiting to be accepted</span>
          ) : (
            `${open.length} in progress`
          )}
        </p>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {showAll ? "Show open only" : "Show all"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">Couldn&apos;t load orders</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading orders…
        </p>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <ClipboardList className="size-5" />
          </span>
          <p className="mt-3 font-semibold text-primary">
            {showAll ? "No orders yet" : "Nothing in progress"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {showAll
              ? "New orders land here as they come in."
              : "Everything is delivered or closed."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((order) => (
            <OrderCard key={order.id} order={order} busy={busy === order.id} onChange={change} />
          ))}
        </ul>
      )}

      <Link
        to="/admin"
        className="mt-6 flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-semibold text-muted-foreground"
      >
        Offers and launch settings
      </Link>
    </div>
  );
}
