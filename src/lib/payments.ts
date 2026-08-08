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

/**
 * The same account, as a number to type into a UPI app.
 *
 * Offered because a deep link cannot be: a prefilled payment handed to a UPI
 * app for a personal address is refused under NPCI's risk policy, and the apps
 * tell the customer to use the number or the QR instead. Derived from the VPA
 * so the two can never drift apart.
 */
export const UPI_MOBILE = UPI_VPA.split("@")[0];

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

/**
 * Percent-encoding a UPI app will actually accept.
 *
 * `URLSearchParams` is the wrong tool here, twice over. It writes spaces as
 * `+`, which is form encoding rather than URI encoding, and several UPI apps
 * take the `+` literally — the payee reads "Mr+Bijit+Pegu". Worse, it escapes
 * the `@` in the payment address to `%40`, and apps that look the address up
 * without decoding it search for `7099728406%40slc`, find nothing, and refuse
 * the payment. `@` is a legal sub-delimiter in a query string, so it stays.
 */
function encodeUpiValue(value: string): string {
  return encodeURIComponent(value).replace(/%40/g, "@");
}

/** Query string shared by every UPI scheme. */
function upiParams({ amount, reference }: PaymentRequest): string {
  const fields: Array<[string, string]> = [
    ["pa", UPI_VPA],
    ["pn", UPI_PAYEE],
    ["am", amount.toFixed(2)],
    ["cu", "INR"],
    ["tn", `Poba Express ${reference}`],
    ["tr", reference],
  ];
  return fields.map(([key, value]) => `${key}=${encodeUpiValue(value)}`).join("&");
}

/** The canonical `upi://` URI, which is also what the QR encodes. */
export function upiUri(request: PaymentRequest): string {
  return `upi://pay?${upiParams(request)}`;
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
