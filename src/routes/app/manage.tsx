import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bike,
  Check,
  ClipboardList,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Rocket,
  Timer,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { LiveAnnouncementModal } from "@/components/poba/LiveAnnouncementModal";
import { useAccount } from "@/lib/account";
import {
  ETA_PRESETS,
  NEXT_STEP,
  ORDER_STATUSES,
  deleteOrders,
  setOrderProgress,
  useAllOrders,
  useIsAdmin,
  type OrderStatus,
} from "@/lib/admin";
import { useTimeUntilLaunch } from "@/lib/launch";
import { saveLaunchSettings, useLaunchSettings } from "@/lib/settings";
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

/**
 * "Launch now", for the person who can see the kitchen.
 *
 * The countdown reaching zero no longer opens anything (see `timeUntil`), so
 * this is the switch. One tap while closed, one tap to close again — no form
 * and no save button, because the moment you want it is the moment you are
 * standing in the shop deciding.
 */
function GoLivePanel() {
  const settings = useLaunchSettings();
  const { remaining } = useTimeUntilLaunch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = remaining?.done ?? false;
  const waiting = remaining?.awaitingGoLive ?? false;

  const set = async (openNow: boolean | null) => {
    setBusy(true);
    setError(null);
    try {
      await saveLaunchSettings({ ...settings, openNow });
      // No reload: settings are watched, so this screen and every open
      // customer's turn over on the same snapshot. Announce it to whatever
      // is listening on this page, since the person who just opened the shop
      // should see the thing their customers are about to see.
      if (openNow === true) window.dispatchEvent(new CustomEvent("poba:trigger_live_modal"));
      setBusy(false);
    } catch (cause) {
      console.error("Could not change the launch switch", cause);
      setError(cause instanceof Error ? cause.message : "Could not save.");
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        "mb-4 rounded-2xl border p-4",
        live ? "border-accent/40 bg-accent/5" : "border-amber-500/30 bg-amber-500/5",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex size-2.5 shrink-0">
          {live && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
          )}
          <span
            className={cn(
              "relative inline-flex size-2.5 rounded-full",
              live ? "bg-accent" : "bg-amber-500",
            )}
          />
        </span>
        <p className="text-sm font-bold text-primary">
          {live ? "Poba Express is live" : waiting ? "Ready to launch" : "Not open yet"}
        </p>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {live
          ? "The site says you are live and orders are going through."
          : waiting
            ? "The countdown has finished. Nothing opens until you tap below."
            : "The countdown is still running. You can open early whenever the kitchens are ready."}
      </p>

      {!live ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void set(true)}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
          Launch now
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void set(false)}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
          Stop taking orders
        </button>
      )}

      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Clearing the order book.
 *
 * Two buttons rather than one, and the safe one first: delivered and cancelled
 * orders are finished with, while a live order still has a customer watching
 * its status. Both confirm, because this collection is also what the customer
 * reads under their own Orders tab — deleting here deletes their copy, and
 * there is no undo.
 */
function ClearOrders({ total, finished }: { total: number; finished: number }) {
  const [confirming, setConfirming] = useState<"finished" | "all" | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (finishedOnly: boolean) => {
    setBusy(true);
    setError(null);
    try {
      setDone(await deleteOrders(finishedOnly));
      setConfirming(null);
    } catch (cause) {
      console.error("Could not clear orders", cause);
      setError(cause instanceof Error ? cause.message : "Could not clear orders.");
    } finally {
      setBusy(false);
    }
  };

  if (total === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Clear the order book
      </p>

      {done !== null && (
        <p className="mt-2 rounded-xl bg-accent/10 p-2.5 text-xs font-semibold text-accent">
          Deleted {done} order{done === 1 ? "" : "s"}.
        </p>
      )}
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}

      {confirming ? (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <p className="flex gap-2 text-xs font-semibold text-destructive">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {confirming === "all"
                ? `Delete all ${total} orders, including any still in progress?`
                : `Delete ${finished} finished order${finished === 1 ? "" : "s"}?`}{" "}
              This also removes them from the customers&apos; own order history, and it cannot be
              undone.
            </span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(confirming === "finished")}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-destructive text-xs font-bold text-white disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Yes, delete
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(null)}
              className="h-10 flex-1 rounded-xl border border-border text-xs font-semibold text-muted-foreground disabled:opacity-50"
            >
              Keep them
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            disabled={finished === 0}
            onClick={() => {
              setDone(null);
              setConfirming("finished");
            }}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
          >
            <Trash2 className="size-3.5" />
            Delete finished orders ({finished})
          </button>
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setConfirming("all");
            }}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
          >
            Delete all orders ({total})
          </button>
        </div>
      )}
    </div>
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

      <GoLivePanel />

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

      <ClearOrders
        total={orders.length}
        finished={
          orders.filter((order) => order.status === "delivered" || order.status === "cancelled")
            .length
        }
      />

      <Link
        to="/admin"
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-semibold text-muted-foreground"
      >
        Offers and launch settings
      </Link>

      {/* Mounted so the person who presses Launch now sees the announcement
          their customers are seeing, rather than having to go and check. */}
      <LiveAnnouncementModal />
    </div>
  );
}
