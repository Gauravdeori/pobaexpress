import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BadgeIndianRupee, Banknote, Check, Loader2, ShieldAlert } from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile, useAccount } from "@/lib/account";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/contact";
import { isFirebaseConfigured } from "@/lib/firebase";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";
import { deliveryFee, rupees } from "@/lib/menu";
import { recordOrder, type OrderLine, type Payment } from "@/lib/orders";
import { paymentReference, UPI_APPS, upiAppLink, upiQrDataUrl } from "@/lib/payments";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/checkout")({
  // Returning the key unconditionally would make ?kind= required on every link
  // into checkout, so the medicine case adds it and everything else omits it.
  validateSearch: (search: Record<string, unknown>): { kind?: "medicine" } =>
    search.kind === "medicine" ? { kind: "medicine" } : {},
  component: CheckoutScreen,
});

type Method = "cod" | "upi";

function CheckoutScreen() {
  const { kind } = Route.useSearch();
  const navigate = useNavigate();
  const { cart, subtotal, fee, total, clear } = useCart();
  const { user, profile } = useAccount();
  const launched = useLaunched();

  const medicine = kind === "medicine";
  const [request, setRequest] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<Method>("cod");
  const [customerReference, setCustomerReference] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable for the life of the screen: regenerating it per render would hand
  // the customer a different code than the one encoded in the QR they scanned.
  const reference = useMemo(() => paymentReference(), []);

  // Medicine has no priced lines, so its total is settled on WhatsApp.
  const payable = medicine ? 0 : total;

  useEffect(() => {
    if (!medicine) return;
    try {
      setRequest(window.sessionStorage.getItem("poba.medicine.v1") ?? "");
    } catch {
      setRequest("");
    }
  }, [medicine]);

  useEffect(() => {
    if (!profile) return;
    if (profile.fullName) setName((v) => v || profile.fullName!);
    if (profile.phone) setPhone((v) => v || profile.phone!);
    if (profile.address) setAddress((v) => v || profile.address!);
  }, [profile]);

  // Only meaningful once there is an amount to collect.
  useEffect(() => {
    if (method !== "upi" || payable <= 0) {
      setQr(null);
      return;
    }
    let cancelled = false;
    upiQrDataUrl({ amount: payable, reference })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [method, payable, reference]);

  const empty = medicine ? !request.trim() : cart.lines.length === 0;

  if (empty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-lg font-bold text-primary">Nothing to check out</h1>
        <Button variant="accent" className="mt-6 h-12 rounded-2xl px-8" asChild>
          <Link to="/app">Browse</Link>
        </Button>
      </div>
    );
  }

  // Matches the marketing form, which requires an account to order. Without
  // this the app would simply be a way around that rule.
  const needsSignIn = isFirebaseConfigured && !user;

  const placeOrder = async () => {
    if (!launched || needsSignIn) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Name, phone and address are all needed so the rider can find you.");
      return;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(phone.trim())) {
      setError("That phone number doesn't look right.");
      return;
    }
    setError(null);
    setSending(true);

    const payment: Payment = {
      method,
      status: method === "cod" ? "cod" : "awaiting-verification",
      reference: method === "upi" ? reference : null,
      customerReference: method === "upi" ? customerReference.trim() || null : null,
    };

    const lines: OrderLine[] = cart.lines.map((line) => ({
      id: line.id,
      label: line.variant ? `${line.name} (${line.variant})` : line.name,
      quantity: line.quantity,
      price: line.price,
    }));

    await recordOrder(
      {
        category: medicine ? "medicine" : cart.category,
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        lines: medicine ? [] : lines,
        subtotal: medicine ? 0 : subtotal,
        deliveryFee: medicine ? deliveryFee("medicine") : fee,
        total: payable,
        extraRequest: medicine ? request.trim() : null,
        notes: notes.trim() || null,
        prescriptionId: null,
        prescriptionUrl: null,
        payment,
      },
      user?.uid ?? null,
    );

    if (user) {
      void saveProfile(user.uid, {
        fullName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
    }

    const message = [
      `*Poba Express order*`,
      ``,
      medicine ? `Medicine request:` : `From: ${cart.source ?? "Poba Express"}`,
      medicine
        ? request.trim()
        : lines
            .map((l) => `• ${l.label} x${l.quantity} — ${rupees(l.price * l.quantity)}`)
            .join("\n"),
      ``,
      medicine ? `Delivery: ${rupees(deliveryFee("medicine"))}` : `Subtotal: ${rupees(subtotal)}`,
      medicine ? `` : `Delivery: ${rupees(fee)}`,
      medicine ? `Total: confirmed after the pharmacy quotes` : `*Total: ${rupees(total)}*`,
      ``,
      method === "cod"
        ? `Payment: Cash on delivery`
        : `Payment: UPI (paid online) — ref ${reference}${customerReference.trim() ? `, txn ${customerReference.trim()}` : ""}`,
      ``,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Address: ${address.trim()}`,
      notes.trim() ? `Notes: ${notes.trim()}` : ``,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const url = whatsappLink(message);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;

    if (!medicine) clear();
    setSending(false);
    void navigate({ to: "/app" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading title="Checkout" />

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        {medicine ? (
          <p className="whitespace-pre-wrap text-muted-foreground">{request}</p>
        ) : (
          <>
            {cart.lines.map((line) => (
              <div key={line.id} className="flex justify-between gap-3 text-muted-foreground">
                <span className="min-w-0 truncate">
                  {line.name} × {line.quantity}
                </span>
                <span className="shrink-0">{rupees(line.price * line.quantity)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{rupees(fee)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-primary">
              <span>Total</span>
              <span>{rupees(total)}</span>
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="mt-5 grid gap-4">
        <div>
          <Label htmlFor="co-name">Name</Label>
          <Input
            id="co-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="co-phone">Phone</Label>
          <Input
            id="co-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="co-address">Delivery address</Label>
          <Textarea
            id="co-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House, lane, nearest landmark"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="co-notes">Notes (optional)</Label>
          <Input
            id="co-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Less spicy, call on arrival…"
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Payment */}
      <h2 className="mb-3 mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        Payment
      </h2>

      {medicine ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Medicine is cash on delivery — the total depends on what the pharmacy has in stock, so we
          confirm it on WhatsApp before the rider collects.
        </p>
      ) : (
        <>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <MethodButton
              active={method === "cod"}
              onClick={() => setMethod("cod")}
              icon={Banknote}
              title="Cash on delivery"
              hint="Pay the rider"
            />
            <MethodButton
              active={method === "upi"}
              onClick={() => setMethod("upi")}
              icon={BadgeIndianRupee}
              title="Pay now by UPI"
              hint="GPay, PhonePe, Paytm"
            />
          </div>

          {method === "upi" && (
            <div className="mt-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-primary">
                Pay {rupees(payable)} — reference{" "}
                <span className="font-mono font-bold">{reference}</span>
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {UPI_APPS.map((app) => (
                  <a
                    key={app.id}
                    href={upiAppLink(app, { amount: payable, reference })}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-3 text-sm font-semibold text-primary transition-colors hover:border-accent"
                  >
                    {app.label}
                  </a>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                The buttons open a UPI app on a phone. On a computer, scan the code instead.
              </p>

              {qr && (
                <div className="mt-4 flex flex-col items-center">
                  <img
                    src={qr}
                    alt={`UPI QR code to pay ${rupees(payable)} to Poba Express`}
                    className="size-44 rounded-xl border border-border"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Amount is already filled in — nothing to type.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Label htmlFor="co-txn">UPI reference number (after paying)</Label>
                <Input
                  id="co-txn"
                  value={customerReference}
                  onChange={(e) => setCustomerReference(e.target.value)}
                  placeholder="12-digit number from your UPI app"
                  inputMode="numeric"
                  className="mt-1.5"
                />
              </div>

              <p className="mt-3 flex gap-2 rounded-xl bg-secondary/70 p-3 text-xs text-muted-foreground">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  Your order is placed straight away, but it is only confirmed once we&apos;ve
                  checked the payment landed. We&apos;ll message you on WhatsApp either way.
                </span>
              </p>
            </div>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {needsSignIn ? (
        <Button variant="accent" className="mt-5 h-12 w-full rounded-2xl" asChild>
          <Link to="/app/account">Sign in to order</Link>
        </Button>
      ) : (
        <Button
          variant="accent"
          className="mt-5 h-12 w-full rounded-2xl"
          disabled={sending || !launched}
          onClick={placeOrder}
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Placing…
            </>
          ) : !launched ? (
            `Ordering opens ${LAUNCH_DATE_LABEL}`
          ) : (
            <>
              <Check className="size-4" /> Place order
            </>
          )}
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {needsSignIn
          ? "An account is needed to place an order. Your cart is kept."
          : "Sending the order opens WhatsApp so we can confirm it with you."}
      </p>
    </div>
  );
}

function MethodButton({
  active,
  onClick,
  icon: Icon,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Banknote;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
        active ? "border-accent bg-accent/5" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          active
            ? "bg-gradient-accent text-accent-foreground"
            : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-primary">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
