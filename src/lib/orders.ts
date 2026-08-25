import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export type OrderLine = {
  id: string;
  label: string;
  quantity: number;
  price: number;
};

/**
 * How the customer said they would pay.
 *
 * `awaiting-verification` is the honest state for UPI: without a payment
 * gateway nothing tells us the money arrived, so the order is not paid until
 * someone has checked the bank app against `paymentReference`. Never promote a
 * UPI order to paid from the client — the client is exactly what a customer
 * could lie to.
 */
export type Payment = {
  method: "cod" | "upi";
  status: "cod" | "awaiting-verification";
  /** Short code shown to the customer and sent in the UPI note, so a payment
   *  in the bank app can be matched back to this order. */
  reference: string | null;
  /** UPI transaction id, as typed in by the customer. Unverified. */
  customerReference: string | null;
};

export type OrderDraft = {
  category: string;
  customerName: string;
  phone: string;
  address: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  extraRequest: string | null;
  notes: string | null;
  /** Cloudinary public_id, or null when there was no photo or it failed. */
  prescriptionId: string | null;
  prescriptionUrl: string | null;
  /**
   * The pin the customer shared, if they did. Kept alongside `address` rather
   * than instead of it — a fix can be far enough out that the typed address is
   * what settles where the rider knocks.
   */
  location: { latitude: number; longitude: number; accuracy: number; url: string } | null;
  /** The code the customer used, and what it took off. Both null/0 without one. */
  discountCode?: string | null;
  discount?: number;
  /** Absent on orders placed through the marketing page's WhatsApp form. */
  payment?: Payment;
};

/**
 * Keeps a record of the order beyond the WhatsApp thread. Best-effort: a
 * failure here is logged, never surfaced, and never stops the order.
 */
/** A stored order, as the history screen reads it back. */
export type OrderRecord = OrderDraft & {
  id: string;
  /** Set by us on create, moved on from the console as the order progresses. */
  status: string;
  /** Null for the moment between the write and the server stamping it. */
  placedAt: Date | null;
  /**
   * When the rider is expected, as epoch milliseconds, or null until an admin
   * says.
   *
   * An absolute moment rather than "30 minutes", because a duration is only
   * true at the instant it is written: a customer who opens the screen twenty
   * minutes later would read the same thirty minutes again and be told the
   * wrong thing twice. Stored as a plain number so the update rule can check
   * its type without a Timestamp import.
   */
  etaAt: number | null;
};

/** Sorted here rather than with `orderBy` — see `watchOrders`. */
function newestFirst(a: OrderRecord, b: OrderRecord): number {
  return (b.placedAt?.getTime() ?? 0) - (a.placedAt?.getTime() ?? 0);
}

/** One shape for a stored order, so the fetch and the live read cannot drift. */
function toRecord(id: string, raw: unknown): OrderRecord {
  const data = raw as OrderDraft & {
    status?: string;
    createdAt?: Timestamp;
    etaAt?: number;
  };
  return {
    ...data,
    id,
    status: data.status ?? "new",
    placedAt: data.createdAt?.toDate() ?? null,
    etaAt: typeof data.etaAt === "number" ? data.etaAt : null,
  };
}

/**
 * Every order this customer has placed, newest first, kept live.
 *
 * An order changes while the customer is looking at it — accepted, then
 * prepared, then an arrival time, then out for delivery — and all of that
 * happens on someone else's screen. Fetching once on mount meant the status
 * they were watching was only ever as fresh as the moment they opened the tab,
 * and the estimated arrival could sit there being quietly wrong.
 *
 * Sorted here rather than with `orderBy`, because pairing that with the
 * `where` needs a composite index built in the console — one more setup step,
 * for a list that is a handful of rows per person.
 *
 * Reports errors rather than swallowing them: an empty list and a failed read
 * look identical on screen, and "no orders yet" is a lie to tell someone who
 * has ordered.
 *
 * Returns its unsubscribe, so the caller tears it down on sign-out.
 */
export function watchOrders(
  uid: string,
  onChange: (orders: OrderRecord[]) => void,
  onError: (error: Error) => void,
): () => void {
  if (!db) {
    onChange([]);
    return () => {};
  }

  return onSnapshot(
    query(collection(db, "orders"), where("userId", "==", uid)),
    (snapshot) => {
      onChange(snapshot.docs.map((entry) => toRecord(entry.id, entry.data())).sort(newestFirst));
    },
    (cause) => {
      console.error("Could not watch orders", cause);
      onError(cause);
    },
  );
}

export async function recordOrder(draft: OrderDraft, uid: string | null): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, "orders"), {
      ...draft,
      userId: uid,
      status: "new",
      // Written as null rather than left off, so the admin's first update is a
      // change to an existing field instead of adding one the rule would have
      // to allow separately.
      etaAt: null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Could not record order", error);
  }
}
