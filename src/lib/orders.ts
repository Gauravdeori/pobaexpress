import { addDoc, collection, serverTimestamp } from "firebase/firestore";

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
  /** Absent on orders placed through the marketing page's WhatsApp form. */
  payment?: Payment;
};

/**
 * Keeps a record of the order beyond the WhatsApp thread. Best-effort: a
 * failure here is logged, never surfaced, and never stops the order.
 */
export async function recordOrder(draft: OrderDraft, uid: string | null): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, "orders"), {
      ...draft,
      userId: uid,
      status: "new",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Could not record order", error);
  }
}
