import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAccount, accountLabel } from "@/lib/account";
import { rupees } from "@/lib/menu";
import {
  ORDER_STATUSES,
  createOffer,
  deleteOffer,
  setOfferActive,
  setOrderStatus,
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
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <span className="flex items-center gap-2 font-semibold text-primary">
            <Lock className="size-4 text-accent" />
            Poba Express admin
          </span>
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:opacity-80"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}

function Admin() {
  const { user, loading: authLoading } = useAccount();
  const { isAdmin, checking } = useIsAdmin(user);
  const [tab, setTab] = useState<"orders" | "offers">("orders");

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
        <h1 className="text-2xl font-bold text-primary">Not an admin account</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          You&apos;re signed in as{" "}
          <span className="font-medium text-primary">{accountLabel(user)}</span>, which isn&apos;t
          on the admin list.
        </p>
        <p className="mt-4 max-w-prose text-sm text-muted-foreground">
          To grant access, create a document in Firestore at{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-primary">admins/{user.uid}</code>{" "}
          — the fields don&apos;t matter, only that it exists.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-primary sm:text-3xl">Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Signed in as {accountLabel(user)}</p>

      <div className="mt-6 flex gap-2">
        {(
          [
            ["orders", "Orders", ClipboardList],
            ["offers", "Offers", Tag],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
              tab === key
                ? "border-transparent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:text-primary",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">{tab === "orders" ? <Orders /> : <Offers />}</div>
    </Shell>
  );
}

function Orders() {
  const { orders, error, loading } = useAllOrders(true);
  const [busy, setBusy] = useState<string | null>(null);

  const change = async (id: string, status: OrderStatus) => {
    setBusy(id);
    try {
      await setOrderStatus(id, status);
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
  onChange: (id: string, status: OrderStatus) => void;
}) {
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

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            STATUS_STYLES[order.status] ?? "bg-secondary text-muted-foreground",
          )}
        >
          {order.status}
        </span>
        <span className="text-xs text-muted-foreground">move to</span>
        {ORDER_STATUSES.filter((s) => s !== order.status).map((status) => (
          <button
            key={status}
            type="button"
            disabled={busy}
            onClick={() => onChange(order.id, status)}
            className="min-h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {status}
          </button>
        ))}
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
