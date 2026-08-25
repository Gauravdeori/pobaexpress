import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bike,
  Check,
  ClipboardList,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Plus,
  Tag,
  Timer,
  PartyPopper,
  Eye,
  Rocket,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAccount, accountLabel } from "@/lib/account";
import { rupees } from "@/lib/menu";
import { timeUntil } from "@/lib/launch";
import { saveLaunchSettings, useLaunchSettings } from "@/lib/settings";
import { LiveAnnouncementModal } from "@/components/poba/LiveAnnouncementModal";
import {
  ETA_PRESETS,
  NEXT_STEP,
  ORDER_STATUSES,
  createOffer,
  deleteOffer,
  setOfferActive,
  setOrderProgress,
  useAllOrders,
  useIsAdmin,
  useOffers,
  type Offer,
  type OrderStatus,
} from "@/lib/admin";
import {
  applyOffer,
  normaliseCode,
  offerSummary,
  type DiscountKind,
  type OfferTerms,
} from "@/lib/promo-rules";
import type { OrderRecord } from "@/lib/orders";

export const Route = createFileRoute("/admin")({
  head: () => ({
    // Never index the back office, and don't preview it in a link either.
    meta: [{ title: "Admin — Poba Express" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Admin,
});

const STATUS_STYLES: Record<string, string> = {
  new: "bg-accent/10 text-accent",
  confirmed: "bg-blue-500/10 text-blue-700",
  preparing: "bg-amber-500/10 text-amber-700",
  "on-the-way": "bg-violet-500/10 text-violet-700",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  new: "new",
  confirmed: "accepted",
  preparing: "preparing",
  "on-the-way": "on the way",
  delivered: "delivered",
  cancelled: "cancelled",
};

/** "in about 25 min", or that it is overdue, from a stored arrival time. */
function etaLabel(etaAt: number): string {
  const minutes = Math.round((etaAt - Date.now()) / 60_000);
  if (minutes < -1) return `${Math.abs(minutes)} min overdue`;
  if (minutes <= 1) return "due now";
  return `in about ${minutes} min`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <span className="flex items-center gap-2 font-semibold text-primary">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent/10">
              <Lock className="size-4 text-accent" />
            </div>
            Poba Express admin
          </span>
          <div className="flex items-center gap-2">
            {/* An admin who got here from the app's account screen wants to go
                back to the app, not to the marketing page. Both, then. */}
            <Link
              to="/app"
              className="flex min-h-9 items-center gap-2 rounded-full border border-border/50 bg-card px-4 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
            >
              <ShoppingBag className="size-4" />
              Order in the app
            </Link>
            <Link
              to="/"
              className="flex min-h-9 items-center gap-2 rounded-full border border-border/50 bg-card px-4 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
            >
              <ArrowLeft className="size-4" />
              Site
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {children}
      </main>
    </div>
  );
}

function Admin() {
  const { user, loading: authLoading } = useAccount();
  const { isAdmin, checking, denied } = useIsAdmin(user);
  const [tab, setTab] = useState<"orders" | "offers" | "launch">("orders");
  const [copied, setCopied] = useState(false);

  if (authLoading || checking) {
    return (
      <Shell>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Checking your access…
        </p>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-primary">Sign in required</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Sign in with your Poba Express account, then come back to this page. Use the{" "}
          <span className="font-medium text-primary">Sign in</span> button in the site header.
        </p>
      </Shell>
    );
  }

  if (!isAdmin) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-primary">
          {denied ? "Access check refused" : "Not an admin account"}
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          You&apos;re signed in as{" "}
          <span className="font-medium text-primary">{accountLabel(user)}</span>
          {denied
            ? ", but Firestore refused the permission check itself — which usually means the rules in this repo have not been deployed yet."
            : ", which isn't on the admin list."}
        </p>

        {denied ? (
          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-primary">Deploy the rules first</p>
            <p className="mt-1 text-sm text-muted-foreground">
              From the project folder, then reload this page:
            </p>
            <code className="mt-3 block overflow-x-auto rounded-xl bg-secondary px-3 py-2 text-xs text-primary">
              npx firebase deploy --only firestore:rules
            </code>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-primary">To grant yourself access</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>
                Firebase console → Firestore Database → <b>Start collection</b>, id{" "}
                <code className="rounded bg-secondary px-1 text-primary">admins</code>
              </li>
              <li>
                Document ID: the id below, copied exactly. Fields don&apos;t matter — add any one,
                or none.
              </li>
              <li>Save, then reload this page.</li>
            </ol>

            {/* Copyable, because this is the whole point of the screen and a
                28-character id cannot be selected out of a paragraph on a
                phone, which is the device the shop is run from. */}
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Your account id
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-secondary px-3 py-2 font-mono text-xs text-primary">
                {user.uid}
              </code>
              <Button
                variant="outline"
                className="h-10 shrink-0 rounded-xl px-4"
                onClick={() => {
                  void navigator.clipboard.writeText(user.uid).then(
                    () => setCopied(true),
                    () => setCopied(false),
                  );
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
            Signed in as <span className="font-medium text-foreground">{accountLabel(user)}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(
          [
            ["orders", "Orders", ClipboardList],
            ["offers", "Offers", Tag],
            ["launch", "Launch", Rocket],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex min-h-11 items-center gap-2.5 rounded-full px-5 text-sm font-medium transition-all",
              tab === key
                ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/10"
                : "border border-border/50 bg-card text-muted-foreground hover:border-border hover:bg-accent/5 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tab === "orders" ? <Orders /> : tab === "offers" ? <Offers /> : <LaunchControl />}
      </div>
      <LiveAnnouncementModal />
    </Shell>
  );
}

function Orders() {
  const { orders, error, loading } = useAllOrders(true);
  const [busy, setBusy] = useState<string | null>(null);

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

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading orders…
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <p className="font-medium text-destructive">Couldn&apos;t load orders</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          If this says the query needs an index, open the link in the browser console — Firestore
          builds it for you.
        </p>
      </div>
    );
  }

  if (!orders.length) {
    return <p className="text-muted-foreground">No orders yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <OrderCard order={order} busy={busy === order.id} onChange={change} />
        </li>
      ))}
    </ul>
  );
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

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-primary">
            {order.customerName}{" "}
            <span className="font-normal text-muted-foreground">· {order.category}</span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 hover:text-accent">
              <Phone className="size-3.5" />
              {order.phone}
            </a>
            {order.location?.url && (
              <a
                href={order.location.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-accent"
              >
                <MapPin className="size-3.5" />
                Map pin
              </a>
            )}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{order.address}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-primary">{rupees(order.total)}</p>
          <p className="text-xs text-muted-foreground">
            {order.placedAt
              ? order.placedAt.toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "just now"}
          </p>
          {order.payment && (
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {order.payment.method === "cod" ? "Cash on delivery" : "UPI"}
              {order.payment.status === "awaiting-verification" && " · unverified"}
            </p>
          )}
        </div>
      </div>

      {order.lines.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          {order.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {line.label} × {line.quantity}
              </span>
              <span className="shrink-0 text-primary">{rupees(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      {(order.extraRequest || order.notes) && (
        <p className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
          {order.extraRequest}
          {order.extraRequest && order.notes ? " — " : ""}
          {order.notes}
        </p>
      )}

      {order.prescriptionUrl && (
        <a
          href={order.prescriptionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
        >
          View prescription
        </a>
      )}

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              STATUS_STYLES[order.status] ?? "bg-secondary text-muted-foreground",
            )}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>

          {order.etaAt !== null && !settled && (
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              <Timer className="size-3.5" />
              {etaLabel(order.etaAt)}
            </span>
          )}

          {/* The one button that matters, sized like it: accept, then start,
              then out, then done. Everything else on this card is a detour. */}
          {next && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onChange(order.id, next.to)}
              className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-xs font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {next.to === "on-the-way" ? (
                <Bike className="size-3.5" />
              ) : (
                <Check className="size-3.5" />
              )}
              {next.label}
            </button>
          )}
        </div>

        {/* Estimated arrival. Hidden once the order is delivered or cancelled,
            where a time is no longer a promise about anything. */}
        {!settled && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Timer className="size-3.5" />
              Arriving in
            </span>
            {ETA_PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                disabled={busy}
                onClick={() => onChange(order.id, order.status as OrderStatus, minutes)}
                className="min-h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {minutes} min
              </button>
            ))}
            {order.etaAt !== null && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(order.id, order.status as OrderStatus, null)}
                className="min-h-9 rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                clear
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">or move to</span>
          {ORDER_STATUSES.filter((status) => status !== order.status && status !== next?.to).map(
            (status) => (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => onChange(order.id, status)}
                className={cn(
                  "min-h-9 rounded-full border border-border px-3 text-xs font-medium transition-colors disabled:opacity-50",
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
      </div>
    </>
  );
}

function Offers() {
  const { offers, loading } = useOffers(true);
  const [headline, setHeadline] = useState("");
  const [detail, setDetail] = useState("");
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<DiscountKind>("percent");
  const [value, setValue] = useState("10");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [category, setCategory] = useState<Offer["category"]>("all");
  const [expires, setExpires] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // What the customer will see on their bill, computed by the same function
  // the checkout uses — so this preview cannot promise a figure the cart then
  // refuses to give.
  const terms: OfferTerms = {
    kind,
    value: Number(value) || 0,
    maxDiscount: Number(maxDiscount) || 0,
    minSubtotal: Number(minSubtotal) || 0,
    category,
    expiresAt: expires ? new Date(expires).getTime() : 0,
    active: true,
    code: code.trim() || null,
  };

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!headline.trim() || !detail.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createOffer({
        headline: headline.trim(),
        detail: detail.trim(),
        code: code.trim() ? normaliseCode(code) : null,
        active: true,
        kind,
        value: terms.value,
        maxDiscount: terms.maxDiscount,
        minSubtotal: terms.minSubtotal,
        category,
        expiresAt: terms.expiresAt,
      });
      setHeadline("");
      setDetail("");
      setCode("");
      setValue("10");
      setMaxDiscount("");
      setMinSubtotal("");
      setExpires("");
    } catch (cause) {
      console.error("Could not save the offer", cause);
      setError(cause instanceof Error ? cause.message : "Could not save the offer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-semibold text-primary">New offer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Live offers appear on the app home. Anything you promise here, the kitchen has to honour —
          a customer who taps through and finds no such deal has been misled by their own app.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Headline — e.g. ₹20 off your first order"
            className="h-12 rounded-2xl sm:col-span-2"
          />
          <Input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Detail — e.g. On orders above ₹199"
            className="h-12 rounded-2xl"
          />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code (optional) — e.g. POBA20"
            className="h-12 rounded-2xl"
          />
        </div>

        {/* The terms. Without these a code is a promise the bill does not
            keep: the customer types it, nothing comes off, and the app has
            lied to them. */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            <span className="font-medium text-primary">Discount type</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as DiscountKind)}
              className="mt-1.5 h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm"
            >
              <option value="percent">Percent off</option>
              <option value="flat">Flat ₹ off</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-primary">
              {kind === "percent" ? "Percent off" : "Rupees off"}
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="numeric"
              className="mt-1.5 h-12 rounded-2xl"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-primary">Max discount ₹</span>
            <Input
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              inputMode="numeric"
              placeholder="0 = no cap"
              className="mt-1.5 h-12 rounded-2xl"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-primary">Minimum order ₹</span>
            <Input
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
              inputMode="numeric"
              placeholder="0 = any"
              className="mt-1.5 h-12 rounded-2xl"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-primary">Applies to</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Offer["category"])}
              className="mt-1.5 h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm"
            >
              <option value="all">Everything</option>
              <option value="food">Food only</option>
              <option value="cake">Cake only</option>
              <option value="medicine">Medicine only</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-primary">Expires (optional)</span>
            <Input
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="mt-1.5 h-12 rounded-2xl"
            />
          </label>
        </div>

        {code.trim() && (
          <div className="mt-4 rounded-2xl bg-secondary/70 p-3 text-sm">
            <p className="font-semibold text-primary">
              {normaliseCode(code)} — {offerSummary(terms)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              On a ₹500 food order that takes off{" "}
              <span className="font-semibold text-primary">
                {rupees(applyOffer(terms, 500, "food").discount)}
              </span>
              {applyOffer(terms, 500, "food").error
                ? ` — ${applyOffer(terms, 500, "food").error}`
                : "."}
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="accent"
          disabled={saving || !headline.trim() || !detail.trim()}
          className="mt-4 h-12 rounded-2xl"
        >
          <Plus className="size-4" />
          {saving ? "Saving…" : "Add offer"}
        </Button>
      </form>

      <div>
        <h2 className="font-semibold text-primary">All offers</h2>
        {loading ? (
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </p>
        ) : offers.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            No offers yet. The app home shows real dishes until there are some.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {offers.map((offer) => (
              <li
                key={offer.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-primary">{offer.headline}</p>
                  <p className="text-sm text-muted-foreground">
                    {offer.detail}
                    {offer.code && (
                      <>
                        {" · code "}
                        <span className="font-medium text-primary">{offer.code}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOfferActive(offer.id, !offer.active)}
                    className={cn(
                      "min-h-9 rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                      offer.active
                        ? "bg-accent/10 text-accent"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {offer.active ? "Live" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete offer: ${offer.headline}`}
                    onClick={() => deleteOffer(offer.id)}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Turns a stored millisecond timestamp into the value a datetime-local wants. */
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

/**
 * Opening day, without a deploy.
 *
 * Three states rather than a switch, because "open" and "closed" are not the
 * whole story: most of the time the honest answer is "go by the date", and an
 * override is something you turn on deliberately and turn off again.
 */
function LaunchControl() {
  const settings = useLaunchSettings();
  const [openNow, setOpenNow] = useState<boolean | null>(settings.openNow);
  const [when, setWhen] = useState(() => toLocalInput(settings.launchAt));
  const [label, setLabel] = useState(settings.label);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The settings arrive after the first render; adopt them once.
  const [adopted, setAdopted] = useState(false);
  useEffect(() => {
    if (adopted) return;
    setOpenNow(settings.openNow);
    setWhen(toLocalInput(settings.launchAt));
    setLabel(settings.label);
    setAdopted(true);
  }, [settings, adopted]);

  const launchAt = new Date(when).getTime();
  const preview = timeUntil({ openNow, launchAt: launchAt || settings.launchAt, label });

  const save = async (overrideOpenNow?: boolean | null) => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const targetOpenNow = overrideOpenNow !== undefined ? overrideOpenNow : openNow;
    try {
      await saveLaunchSettings({
        openNow: targetOpenNow,
        launchAt: launchAt || settings.launchAt,
        label: label.trim() || settings.label,
      });
      if (overrideOpenNow !== undefined) {
        setOpenNow(overrideOpenNow);
      }
      setSaved(true);
      // On the Save button as well as the shortcut, because "Live now" then
      // Save is the same decision as tapping Launch now and has to do the same
      // thing. Settings are watched, so the site itself has already turned
      // over by the time this fires.
      if (targetOpenNow === true) {
        window.dispatchEvent(new CustomEvent("poba:trigger_live_modal"));
      }
    } catch (cause) {
      console.error("Could not save launch settings", cause);
      setError(cause instanceof Error ? cause.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  /** Straight to open, skipping the state buttons. `save` raises the modal. */
  const triggerLaunchAndModal = async () => {
    await save(true);
  };

  const previewModal = () => {
    window.dispatchEvent(new CustomEvent("poba:trigger_live_modal"));
  };

  const states: Array<[boolean | null, string, string]> = [
    [
      null,
      "Count down, don't open",
      "Runs the countdown to the date below and then waits for you. Nothing opens by itself.",
    ],
    [true, "Live now", "Takes orders immediately, whatever the date says."],
    [false, "Hold closed", "Refuses orders and shows no countdown."],
  ];

  return (
    <div className="space-y-6">
      {/* Quick Launch & Pop-up Action Card */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-card to-card p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <PartyPopper className="size-3.5" />
              Official Launch Action
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-foreground">Launch Site & Pop-up</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-lg">
              Tap <strong className="text-foreground">&quot;Launch Now&quot;</strong> to make Poba
              Express live immediately and trigger the launch celebration pop-up modal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="accent"
              size="lg"
              disabled={saving}
              onClick={() => void triggerLaunchAndModal()}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-lg h-12 rounded-2xl gap-2 px-6"
            >
              <Rocket className="size-5 fill-emerald-950" />
              <span>Launch Now & Show Pop-up</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={previewModal}
              className="h-12 rounded-2xl gap-2 border-border/80 text-foreground hover:bg-accent/10"
            >
              <Eye className="size-4" />
              <span>Preview Pop-up</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-semibold text-primary">Ordering Mode</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is the switch the whole site reads — the countdown, the order form, the sticky bar
          and the checkout. Nothing needs a deploy.
        </p>

        <div className="mt-4 grid gap-2.5">
          {states.map(([value, title, hint]) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setOpenNow(value)}
              aria-pressed={openNow === value}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                openNow === value ? "border-accent bg-accent/5" : "border-border bg-background",
              )}
            >
              <span className="block text-sm font-semibold text-primary">{title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-semibold text-primary">Launch date</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-primary">Opens at</span>
            <Input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="mt-1.5 h-12 rounded-2xl"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-primary">Shown as</span>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="27 August 2026"
              className="mt-1.5 h-12 rounded-2xl"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {preview.done
            ? "Right now: ordering is OPEN."
            : openNow === false
              ? "Right now: ordering is held CLOSED."
              : `Right now: opens in ${preview.days}d ${preview.hours}h ${preview.minutes}m — countdown reads “${label}”.`}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button
        variant="accent"
        className="h-12 rounded-2xl"
        disabled={saving}
        onClick={() => void save()}
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save Settings"}
      </Button>
    </div>
  );
}
