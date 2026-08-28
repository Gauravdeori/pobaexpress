import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banknote, Check, Loader2, LogIn, Paperclip } from "lucide-react";

import { LocationShare } from "@/components/app/LocationShare";
import { blocksOrder, checkArea, outsideAreaMessage } from "@/lib/delivery-area";
import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile, useAccount } from "@/lib/account";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/contact";
import { DELIVERY_HOURS_LABEL, useOrderStatus } from "@/lib/launch";
import { mapsLink, type Coords } from "@/lib/location";
import { rupees } from "@/lib/menu";
import { useDeliveryQuote } from "@/lib/use-delivery";
import {
  clearMedicineRequest,
  readMedicineRequest,
  type MedicineRequest,
} from "@/lib/medicine-request";
import { recordOrder, type OrderLine, type Payment } from "@/lib/orders";
import { findOfferByCode, type Offer } from "@/lib/admin";
import { notifyOrder } from "@/lib/notify";
import { applyOffer, normaliseCode } from "@/lib/promo-rules";

export const Route = createFileRoute("/app/checkout")({
  // Returning the key unconditionally would make ?kind= required on every link
  // into checkout, so the medicine case adds it and everything else omits it.
  validateSearch: (search: Record<string, unknown>): { kind?: "medicine" } =>
    search.kind === "medicine" ? { kind: "medicine" } : {},
  component: CheckoutScreen,
});

/** Everything the confirmation needs, captured before the cart is emptied. */
type PlacedOrder = {
  medicine: boolean;
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
function OrderPlaced({ medicine, total, whatsappUrl }: PlacedOrder) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Check className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-primary">Order placed</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;ve opened WhatsApp with your order. Send that message and we&apos;ll confirm it,
          usually within a few minutes. It&apos;s saved under{" "}
          <Link to="/app/orders" className="font-semibold text-accent underline">
            Your orders
          </Link>{" "}
          either way.
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
          <span className="font-semibold text-primary">Cash on delivery</span>
        </div>
      </div>

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        <Button variant="accent" className="h-12 rounded-2xl" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Open WhatsApp again
          </a>
        </Button>
        <Button variant="outline" className="h-12 rounded-2xl" asChild>
          <Link to="/app/orders">Your orders</Link>
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
  const { cart, subtotal, clear } = useCart();
  const { user, profile, loading: authLoading } = useAccount();
  const { canOrder, launched, reason } = useOrderStatus();

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
  const [coords, setCoords] = useState<Coords | null>(null);
  // Derived from the pin rather than stored beside it, so the two cannot
  // disagree. Same predicate the landing page's form uses.
  const outsideArea = blocksOrder(coords);
  const [codeInput, setCodeInput] = useState("");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Delivery moves with the weather and the hour; the platform fee does not.
  const quote = useDeliveryQuote(medicine ? "medicine" : cart.category);

  // The discount comes off the subtotal, never the delivery or platform fee:
  // the delivery fee is what the rider is paid, and a code that ate into it
  // would be the rider funding the offer.
  const discount = medicine ? 0 : applyOffer(offer, subtotal, cart.category).discount;
  const payable = medicine ? 0 : Math.max(0, subtotal + quote.fee + quote.platformFee - discount);

  const applyCode = async () => {
    const typed = normaliseCode(codeInput);
    if (!typed) return;
    setCodeBusy(true);
    setCodeError(null);
    try {
      const found = await findOfferByCode(typed);
      const { error } = applyOffer(found, subtotal, cart.category);
      if (error) {
        setOffer(null);
        setCodeError(error);
      } else {
        setOffer(found);
      }
    } catch (cause) {
      console.error("Could not check that code", cause);
      setCodeError("Could not check that code. Try again.");
    } finally {
      setCodeBusy(false);
    }
  };

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
    if (!canOrder || !user) return;
    if (outsideArea && coords) {
      setError(outsideAreaMessage(checkArea(coords)));
      return;
    }
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

    // Cash only for now. `Payment` still describes UPI because orders already
    // placed that way are in Firestore, and narrowing the type would
    // misdescribe records that exist.
    const payment: Payment = {
      method: "cod",
      status: "cod",
      reference: null,
      customerReference: null,
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
        deliveryFee: quote.fee,
        total: payable,
        extraRequest: medicine ? request.trim() : null,
        notes: notes.trim() || null,
        prescriptionId: medicine ? medicineRequest.prescriptionId : null,
        prescriptionUrl: medicine ? medicineRequest.prescriptionUrl : null,
        location: coords ? { ...coords, url: mapsLink(coords) } : null,
        discountCode: offer?.code ?? null,
        discount,
        payment,
      },
      user?.uid ?? null,
    );

    // Told to the shop without waiting on it, and without letting a failure
    // touch the order: the record is already written, and the customer's
    // WhatsApp message is opened either way.
    void notifyOrder({
      data: {
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        locationUrl: coords ? mapsLink(coords) : null,
        category: medicine ? "medicine" : cart.category,
        lines: medicine ? [request.trim()] : lines.map((l) => `${l.label} x${l.quantity}`),
        total: medicine ? "confirmed after the pharmacy quotes" : rupees(payable),
        discountCode: offer?.code ?? null,
        notes: notes.trim() || null,
        prescriptionUrl: medicine ? medicineRequest.prescriptionUrl : null,
      },
    }).catch(() => {
      // Already logged on the server. Nothing the customer can act on.
    });

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
      medicine ? `Delivery: ${rupees(quote.fee)}` : `Subtotal: ${rupees(subtotal)}`,
      !medicine && discount > 0 ? `Discount (${offer?.code}): -${rupees(discount)}` : ``,
      medicine ? `` : `Delivery: ${rupees(quote.fee)}${quote.reason ? ` (${quote.reason})` : ""}`,
      medicine ? `` : `Platform fee: ${rupees(quote.platformFee)}`,
      medicine ? `Total: confirmed after the pharmacy quotes` : `*Total: ${rupees(payable)}*`,
      ``,
      `Payment: Cash on delivery`,
      ``,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Address: ${address.trim()}`,
      // Straight after the address, because that is what the rider reads.
      coords ? `Location: ${mapsLink(coords)}` : ``,
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
              <span>
                Delivery
                {/* Said next to the number, not in a tooltip. A fee that is
                    higher than usual with no reason given reads as a mistake
                    or a trick. */}
                {quote.reason && (
                  <span className="ml-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {quote.reason}
                  </span>
                )}
              </span>
              <span>{rupees(quote.fee)}</span>
            </div>
            <div className="mt-2 flex justify-between text-muted-foreground">
              <span>Platform fee</span>
              <span>{rupees(quote.platformFee)}</span>
            </div>
            {discount > 0 && (
              <div className="mt-2 flex justify-between font-medium text-accent">
                <span>Discount ({offer?.code})</span>
                <span>−{rupees(discount)}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-primary">
              <span>Total</span>
              <span>{rupees(payable)}</span>
            </div>
          </>
        )}
      </div>

      {/* A code is only offered where there is a priced bill to take it off.
          Medicine has no total until the pharmacy quotes one. */}
      {!medicine && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          {discount > 0 ? (
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Check className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">{offer?.code} applied</p>
                <p className="text-xs text-muted-foreground">{rupees(discount)} off this order</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOffer(null);
                  setCodeInput("");
                  setCodeError(null);
                }}
                className="shrink-0 text-xs font-semibold text-muted-foreground underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <Label htmlFor="co-code">Have a code?</Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id="co-code"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setCodeError(null);
                  }}
                  placeholder="POBA20"
                  autoCapitalize="characters"
                  className="h-11 flex-1 uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 rounded-xl px-5"
                  disabled={codeBusy || !codeInput.trim()}
                  onClick={() => void applyCode()}
                >
                  {codeBusy ? "Checking…" : "Apply"}
                </Button>
              </div>
              {codeError && (
                <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                  {codeError}
                </p>
              )}
            </>
          )}
        </div>
      )}

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
        <LocationShare coords={coords} onChange={setCoords} />
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

      {/* One method, so this states it rather than asking. Prepaid UPI is off
          until there is a merchant account behind it: apps refuse a prefilled
          payment to a personal address, and nothing here could confirm the
          money arrived anyway. */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-accent text-accent-foreground">
          <Banknote className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">Cash on delivery</p>
          <p className="text-xs text-muted-foreground">
            {medicine
              ? "The total depends on what the pharmacy has in stock, so we confirm it on WhatsApp before the rider collects."
              : `Pay the rider ${rupees(payable)} when your order arrives.`}
          </p>
        </div>
      </div>

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
          disabled={sending || !canOrder || outsideArea}
          onClick={placeOrder}
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Placing…
            </>
          ) : !canOrder ? (
            reason
          ) : outsideArea ? (
            "Outside our delivery area"
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
          : outsideArea && coords
            ? outsideAreaMessage(checkArea(coords))
            : launched && !canOrder
              ? // Said here as well as on the button, because this is the last
                // screen before an order and "closed" without an hour is the
                // kind of dead end people read as a broken checkout.
                `We deliver ${DELIVERY_HOURS_LABEL} every day. Your cart is kept until we open.`
              : "Sending the order opens WhatsApp so we can confirm it with you."}
      </p>
    </div>
  );
}
