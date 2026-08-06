import QRCode from "qrcode";

/**
 * UPI collection details, read off the business QR code.
 *
 * Not a secret — a payment address is meant to be handed out, and this one is
 * already printed on the QR displayed at the counter.
 *
 * Note this is a personal (P2P) handle, not a registered merchant VPA: payers
 * see an individual's name rather than a business, and it carries the usual
 * per-day P2P limits. Moving to a merchant VPA is a bank-side change; nothing
 * here needs to change with it beyond the two values below.
 */
export const UPI_VPA = "7099728406@slc";
export const UPI_PAYEE = "Mr Bijit Pegu";

/** UPI apps we offer as one-tap buttons, in the order they're shown. */
export const UPI_APPS = [
  { id: "gpay", label: "Google Pay", scheme: "tez://upi/pay" },
  { id: "phonepe", label: "PhonePe", scheme: "phonepe://pay" },
  { id: "paytm", label: "Paytm", scheme: "paytmmp://pay" },
  { id: "other", label: "Other UPI app", scheme: "upi://pay" },
] as const;

export type UpiApp = (typeof UPI_APPS)[number];

/**
 * Reference we print on the order and ask the customer to quote. UPI has no
 * callback without a payment gateway, so this is what ties a payment seen in
 * the bank app back to an order.
 */
export function paymentReference(): string {
  // Short, unambiguous, and typed by a human under pressure: no 0/O or 1/I.
  const alphabet = "23456789ACDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  const values = new Uint32Array(6);
  crypto.getRandomValues(values);
  for (const value of values) out += alphabet[value % alphabet.length];
  return `PE-${out}`;
}

type PaymentRequest = {
  /** Rupees. Rounded to two decimals — UPI rejects longer fractions. */
  amount: number;
  reference: string;
};

/** Query string shared by every UPI scheme. */
function upiParams({ amount, reference }: PaymentRequest): string {
  return new URLSearchParams({
    pa: UPI_VPA,
    pn: UPI_PAYEE,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Poba Express ${reference}`,
    tr: reference,
  }).toString();
}

/** The canonical `upi://` URI, which is also what the QR encodes. */
export function upiUri(request: PaymentRequest): string {
  return `upi://pay?${upiParams(request)}`;
}

/**
 * Deep link into one specific UPI app. These custom schemes only resolve on a
 * phone with the app installed — on desktop nothing happens, which is why the
 * QR is always shown alongside.
 */
export function upiAppLink(app: UpiApp, request: PaymentRequest): string {
  return `${app.scheme}?${upiParams(request)}`;
}

/**
 * QR encoding the payment, amount included, so there is nothing to type.
 * Returns a data URL. Errors are the caller's to handle — a failed QR must not
 * leave the customer stuck with no way to pay.
 */
export function upiQrDataUrl(request: PaymentRequest): Promise<string> {
  return QRCode.toDataURL(upiUri(request), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#0d3119", light: "#ffffff" },
  });
}
