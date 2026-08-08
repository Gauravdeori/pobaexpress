import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  Banknote,
  Check,
  Copy,
  Loader2,
  LogIn,
  Paperclip,
  ShieldAlert,
} from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile, useAccount } from "@/lib/account";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/contact";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";
import { deliveryFee, rupees } from "@/lib/menu";
import {
  clearMedicineRequest,
  readMedicineRequest,
  type MedicineRequest,
} from "@/lib/medicine-request";
import { recordOrder, type OrderLine, type Payment } from "@/lib/orders";
import { paymentReference, UPI_MOBILE, UPI_PAYEE, UPI_VPA, upiQrDataUrl } from "@/lib/payments";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/checkout")({
  // Returning the key unconditionally would make ?kind= required on every link
  // into checkout, so the medicine case adds it and everything else omits it.
  validateSearch: (search: Record<string, unknown>): { kind?: "medicine" } =>
    search.kind === "medicine" ? { kind: "medicine" } : {},
  component: CheckoutScreen,
});

type Method = "cod" | "upi";

/** Everything the confirmation needs, captured before the cart is emptied. */
type PlacedOrder = {
  medicine: boolean;
  method: Method;
  reference: string | null;
  total: number;
  whatsappUrl: string;
};

/**
 * What the customer sees the moment the order is in.
 *
 * The order is already recorded and WhatsApp has already been opened by this
 * point, but a tab that opens behind the app — or a popup blocker — used to
 * leave someone staring at the home screen with no idea whether anything
 * happened. This says so, and keeps the link in reach if the tab never showed.
 */
function OrderPlaced({ medicine, method, reference, total, whatsappUrl }: PlacedOrder) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Check className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-primary">Order placed</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;ve opened WhatsApp with your order. Send that message and we&apos;ll confirm it,
          usually within a few minutes.
        </p>
      </div>

      <div className="mt-7 grid gap-2.5 rounded-2xl border border-border bg-card p-4 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-primary">
            {medicine ? "Confirmed after the pharmacy quotes" : rupees(total)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Payment</span>
          <span className="font-semibold text-primary">
            {medicine ? "Cash on delivery" : method === "cod" ? "Cash on delivery" : "UPI"}
          </span>
        </div>
        {reference && (
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Payment reference</span>
            <span className="font-mono font-semibold text-primary">{reference}</span>
          </div>
        )}
      </div>

      {/* Said plainly rather than shown as a tick: nothing here has checked a
          bank account, and telling someone their payment is confirmed when
          nobody has looked would be a lie they act on. */}
      {reference && (
        <p className="mt-3 flex gap-2 rounded-2xl bg-secondary/70 p-3 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>
            If you&apos;ve paid, quote <span className="font-mono font-semibold">{reference}</span>{" "}
            in the chat. We check the payment landed before the rider sets off.
          </span>
        </p>
      )}

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        <Button variant="accent" className="h-12 rounded-2xl" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Open WhatsApp again
          </a>
        </Button>
        <Button variant="outline" className="h-12 rounded-2xl" asChild>
          <Link to="/app">Back to menu</Link>
        </Button>
      </div>
    </div>
  );
}

/** What the WhatsApp message says about the prescription, if anything. */
function prescriptionLine(medicine: MedicineRequest): string {
  if (medicine.prescriptionUrl) return `Prescription: ${medicine.prescriptionUrl}`;
  if (medicine.photoName)
    return `Prescription: photo to follow in this chat (${medicine.photoName})`;
  return `Prescription: no photo attached`;
}

function CheckoutScreen() {
  const { kind } = Route.useSearch();
  const { cart, subtotal, fee, total, clear } = useCart();
  const { user, profile, loading: authLoading } = useAccount();
  const launched = useLaunched();

  const medicine = kind === "medicine";
  const [medicineRequest, setMedicineRequest] = useState<MedicineRequest>({
    request: "",
    prescriptionId: null,
    prescriptionUrl: null,
    photoName: null,
  });
  const request = medicineRequest.request;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<Method>("cod");
  const [customerReference, setCustomerReference] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Stable for the life of the screen: regenerating it per render would hand
  // the customer a different code than the one encoded in the QR they scanned.
  const reference = useMemo(() => paymentReference(), []);

  // Medicine has no priced lines, so its total is settled on WhatsApp.
  const payable = medicine ? 0 : total;

  useEffect(() => {
    if (!medicine) return;
    setMedicineRequest(readMedicineRequest());
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

  // Checked before `empty`, because placing an order clears the cart and the
  // confirmation must not be mistaken for an empty basket.
  if (placed) return <OrderPlaced {...placed} />;

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

  // An account is required to order, matching the marketing form — otherwise
  // the app is just a way around that rule.
  //
  // Deliberately not gated on isFirebaseConfigured: a deploy that lost its env
  // vars would quietly turn the requirement off, which is exactly the failure
  // you would not notice. If auth is unavailable, ordering stops rather than
  // falling open.
  const needsSignIn = !authLoading && !user;

  const placeOrder = async () => {
    // Re-checked here rather than trusting the button being hidden.
    if (!launched || !user) return;
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
        prescriptionId: medicine ? medicineRequest.prescriptionId : null,
        prescriptionUrl: medicine ? medicineRequest.prescriptionUrl : null,
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
      // Only ever claims a photo is attached when there is a link to it. A
      // failed upload asks for it in the chat rather than leaving the pharmacy
      // waiting on something that never arrives.
      medicine ? prescriptionLine(medicineRequest) : ``,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    // Captured before the cart is emptied, since the confirmation outlives it.
    const confirmation: PlacedOrder = {
      medicine,
      method,
      reference: method === "upi" ? reference : null,
      total: payable,
      whatsappUrl: whatsappLink(message),
    };

    const opened = window.open(confirmation.whatsappUrl, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = confirmation.whatsappUrl;

    if (medicine) clearMedicineRequest();
    else clear();
    setSending(false);
    setPlaced(confirmation);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading title="Checkout" />

      {/* Said up front rather than only on the button, so nobody fills in the
          whole form before finding out an account is needed. */}
      {needsSignIn && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <LogIn className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm text-primary">
            <span className="font-semibold">Sign in to place this order.</span> Your cart is kept
            while you do —{" "}
            <Link to="/app/account" className="font-semibold text-accent underline">
              sign in or create an account
            </Link>
            .
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        {medicine ? (
          <>
            <p className="whitespace-pre-wrap text-muted-foreground">{request}</p>
            {/* Shown so nobody re-attaches a photo that is already on the
                order, or assumes one is there when the upload did not land. */}
            {(medicineRequest.prescriptionUrl || medicineRequest.photoName) && (
              <p className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
                <Paperclip className="size-3.5 shrink-0 text-accent" />
                {medicineRequest.prescriptionUrl
                  ? "Prescription attached"
                  : `Prescription couldn't upload — send ${medicineRequest.photoName} in the chat`}
              </p>
            )}
          </>
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

              {/* No "open GPay" buttons here on purpose. A link that hands a
                  UPI app a prefilled payment to a personal address is refused
                  under NPCI's risk policy — Paytm says so outright and offers
                  the number or the QR instead. Those two are what this shows,
                  because they are what works. */}
              {qr && (
                <div className="mt-4 flex flex-col items-center">
                  <img
                    src={qr}
                    alt={`UPI QR code to pay ${rupees(payable)} to ${UPI_PAYEE}`}
                    className="size-44 rounded-xl border border-border"
                  />
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Amount is already filled in. Scan from another phone, or press and hold to save
                    it and use your UPI app&apos;s{" "}
                    <span className="font-medium">scan from gallery</span>.
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Or pay this number in any UPI app
                </p>
                <CopyRow label="UPI ID" value={UPI_VPA} />
                <CopyRow label="Mobile number" value={UPI_MOBILE} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Pays to <span className="font-medium text-primary">{UPI_PAYEE}</span>. Enter{" "}
                  {rupees(payable)} and put{" "}
                  <span className="font-mono font-semibold">{reference}</span> in the note.
                </p>
              </div>

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

      {authLoading ? (
        <Button variant="accent" className="mt-5 h-12 w-full rounded-2xl" disabled>
          <Loader2 className="size-4 animate-spin" /> Checking your account…
        </Button>
      ) : needsSignIn ? (
        <Button variant="accent" className="mt-5 h-12 w-full rounded-2xl" asChild>
          <Link to="/app/account">
            <LogIn className="size-4" /> Sign in to order
          </Link>
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

/**
 * A payment detail with a copy button.
 *
 * Copying beats reading a UPI ID off one screen and typing it into another,
 * which is where a wrong digit sends someone else's money away.
 */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Denied clipboard permission, or an insecure origin. The value is on
      // screen either way, so there is nothing to report.
    }
  };

  return (
    <div className="mt-2 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm font-semibold text-primary">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-accent"
      >
        {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
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
