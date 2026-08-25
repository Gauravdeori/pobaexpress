import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "./firebase";
import { EMPTY_TERMS, normaliseCode, type OfferTerms } from "./promo-rules";
import type { OrderDraft, OrderRecord } from "./orders";

/**
 * Who counts as an admin.
 *
 * A document at admins/{uid} — no field on it matters, only that it exists.
 * Firebase's own answer is a custom claim on the token, but setting one needs
 * the Admin SDK, which needs a server or a service-account key. There is
 * neither here, so the rules check for this document instead.
 *
 * A signed-in user can read their own entry and nothing else: `get` by id is
 * allowed, `list` and every write are refused (see firestore.rules). So this
 * check works, the collection still cannot be enumerated, and nobody can add
 * themselves. Create the document by hand in the Firebase console.
 */
export function useIsAdmin(user: User | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  // "Not on the list" and "the rules refused the question" both end with the
  // door shut, and they used to be indistinguishable — so a rules file that
  // was never deployed looked exactly like a missing document, and you could
  // spend a long time creating the document again.
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!db || !user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    setDenied(false);

    getDoc(doc(db, "admins", user.uid))
      .then((snapshot) => {
        if (!cancelled) setIsAdmin(snapshot.exists());
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setIsAdmin(false);
        const code = (error as { code?: string })?.code ?? "";
        setDenied(code === "permission-denied");
        console.error("Admin check failed", error);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { isAdmin, checking, denied };
}

// ------------------------------------------------------------------ orders --

/**
 * The life of an order, in the order it happens.
 *
 * The customer's screen has always been able to render "Being prepared" and
 * "On the way" — this list is what an admin could actually set, and it was
 * missing both, so those two states could never be reached. Adding them here
 * and to firestore.rules is what makes the screen tell the truth.
 */
export const ORDER_FLOW = ["new", "confirmed", "preparing", "on-the-way", "delivered"] as const;

/** Every state, including the one that is not part of the happy path. */
export const ORDER_STATUSES = [...ORDER_FLOW, "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** What the button that advances an order says, per current state. */
export const NEXT_STEP: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  new: { to: "confirmed", label: "Accept order" },
  confirmed: { to: "preparing", label: "Start preparing" },
  preparing: { to: "on-the-way", label: "Out for delivery" },
  "on-the-way": { to: "delivered", label: "Mark delivered" },
};

/** Quick ETA choices, in minutes. Anything else is typed in. */
export const ETA_PRESETS = [15, 20, 30, 45, 60] as const;

/**
 * Every order, newest first, kept live.
 *
 * A live subscription rather than a fetch: this is the screen someone leaves
 * open on the counter while orders come in, and one that needs refreshing to
 * show a new order is worse than useless.
 */
export function useAllOrders(enabled: boolean) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!db || !enabled) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setOrders(
          snapshot.docs.map((entry) => {
            const data = entry.data() as OrderDraft & {
              status?: string;
              createdAt?: Timestamp;
              etaAt?: number;
            };
            return {
              ...data,
              id: entry.id,
              status: data.status ?? "new",
              placedAt: data.createdAt?.toDate() ?? null,
              etaAt: typeof data.etaAt === "number" ? data.etaAt : null,
            };
          }),
        );
        setError(null);
        setLoading(false);
      },
      (cause) => {
        console.error("Could not read orders", cause);
        setError(cause.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [enabled]);

  return { orders, error, loading };
}

/** Rules allow an admin to change status, the ETA, and nothing else. */
export async function setOrderStatus(orderId: string, status: OrderStatus) {
  if (!db) return;
  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
}

/**
 * "About 30 minutes", stored as the moment that lands on.
 *
 * Pass null to clear it — an order that has arrived should stop advertising a
 * time it no longer has, and so should one that was cancelled.
 */
export async function setOrderEta(orderId: string, minutesFromNow: number | null) {
  if (!db) return;
  await updateDoc(doc(db, "orders", orderId), {
    etaAt: minutesFromNow === null ? null : Date.now() + minutesFromNow * 60_000,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Advance an order and give it a time in one write.
 *
 * One write rather than two because they are one decision: "out for delivery,
 * twenty minutes" should not be able to half-succeed and leave a rider on the
 * road with yesterday's estimate showing.
 */
export async function setOrderProgress(
  orderId: string,
  status: OrderStatus,
  minutesFromNow?: number | null,
) {
  if (!db) return;
  const patch: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  // Delivered and cancelled orders are done moving, so any estimate on them is
  // stale by definition.
  if (status === "delivered" || status === "cancelled") patch.etaAt = null;
  else if (minutesFromNow !== undefined) {
    patch.etaAt = minutesFromNow === null ? null : Date.now() + minutesFromNow * 60_000;
  }
  await updateDoc(doc(db, "orders", orderId), patch);
}

/** Delete one order. Irreversible, and it takes the customer's copy with it. */
export async function deleteOrder(orderId: string) {
  if (!db) return;
  await deleteDoc(doc(db, "orders", orderId));
}

/** Firestore refuses a batch past this, so the work is cut into chunks. */
const BATCH_LIMIT = 500;

/**
 * Clear the order book, or just the part of it that is finished.
 *
 * `finishedOnly` is the one to reach for: delivered and cancelled orders are
 * done being useful to anyone, while a live order still has a customer
 * watching its status. Deleting the lot is offered because it was asked for,
 * but it is the second option in the console and it asks first.
 *
 * Returns how many rows went, so the console can say so rather than just
 * emptying the screen.
 */
export async function deleteOrders(finishedOnly: boolean): Promise<number> {
  if (!db) return 0;

  const snapshot = await getDocs(collection(db, "orders"));
  const doomed = snapshot.docs.filter((entry) => {
    if (!finishedOnly) return true;
    const status = (entry.data() as { status?: string }).status ?? "new";
    return status === "delivered" || status === "cancelled";
  });

  for (let index = 0; index < doomed.length; index += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const entry of doomed.slice(index, index + BATCH_LIMIT)) batch.delete(entry.ref);
    await batch.commit();
  }

  return doomed.length;
}

// ------------------------------------------------------------------ offers --

export type Offer = OfferTerms & {
  id: string;
  /** The line a customer reads first. */
  headline: string;
  /** The supporting line under it. */
  detail: string;
  createdAt: Date | null;
};

export type OfferDraft = Pick<
  Offer,
  | "headline"
  | "detail"
  | "code"
  | "active"
  | "kind"
  | "value"
  | "maxDiscount"
  | "minSubtotal"
  | "category"
  | "expiresAt"
>;

function toOffer(id: string, data: Record<string, unknown>): Offer {
  // Every term is defaulted: offers written before discounts existed have none
  // of these fields, and a missing `value` read as NaN would price an order.
  return {
    ...EMPTY_TERMS,
    id,
    headline: String(data.headline ?? ""),
    detail: String(data.detail ?? ""),
    code: (data.code as string | null) ?? null,
    active: data.active === true,
    kind: data.kind === "flat" ? "flat" : "percent",
    value: Number(data.value) || 0,
    maxDiscount: Number(data.maxDiscount) || 0,
    minSubtotal: Number(data.minSubtotal) || 0,
    category: (["all", "food", "cake", "medicine"] as const).includes(
      data.category as "all" | "food" | "cake" | "medicine",
    )
      ? (data.category as Offer["category"])
      : "all",
    expiresAt: Number(data.expiresAt) || 0,
    createdAt: (data.createdAt as Timestamp | undefined)?.toDate() ?? null,
  };
}

/** All offers including inactive ones — the admin list. */
export function useOffers(enabled: boolean) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!db || !enabled) {
      setOffers([]);
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      query(collection(db, "offers"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setOffers(snapshot.docs.map((entry) => toOffer(entry.id, entry.data())));
        setLoading(false);
      },
      (cause) => {
        console.error("Could not read offers", cause);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [enabled]);

  return { offers, loading };
}

/**
 * Active offers for the public site. Read once rather than subscribed — a
 * customer does not need an offer to change under them mid-scroll, and a
 * listener on every visitor is a cost with nothing to show for it.
 */
export async function listActiveOffers(): Promise<Offer[]> {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, "offers"));
    return snapshot.docs
      .map((entry) => toOffer(entry.id, entry.data()))
      .filter((offer) => offer.active)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  } catch (error) {
    console.error("Could not read offers", error);
    return [];
  }
}

export async function createOffer(draft: OfferDraft) {
  if (!db) return;
  await addDoc(collection(db, "offers"), { ...draft, createdAt: serverTimestamp() });
}

export async function setOfferActive(offerId: string, active: boolean) {
  if (!db) return;
  await updateDoc(doc(db, "offers", offerId), { active });
}

export async function deleteOffer(offerId: string) {
  if (!db) return;
  await deleteDoc(doc(db, "offers", offerId));
}

/**
 * The active offer a customer's typed code refers to, if any.
 *
 * Read straight from the browser, which is safe to do because `offers` is
 * public — it is what the banners are drawn from. The discount it produces is
 * therefore only as trustworthy as the client, which is fine here and nowhere
 * near enough for prepaid: every order is confirmed by a person on WhatsApp
 * before anyone cooks, and that is where a tampered total would be caught.
 */
export async function findOfferByCode(code: string): Promise<Offer | null> {
  const wanted = normaliseCode(code);
  if (!wanted || !db) return null;
  const offers = await listActiveOffers();
  return offers.find((offer) => offer.code && normaliseCode(offer.code) === wanted) ?? null;
}
