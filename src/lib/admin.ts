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

  useEffect(() => {
    if (!db || !user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    
    console.log("--- ADMIN CHECK DEBUG ---");
    console.log("Checking UID:", `"${user.uid}"`);
    console.log("Expected Document Path: admins/" + user.uid);
    
    getDoc(doc(db, "admins", user.uid))
      .then((snapshot) => {
        console.log("Document fetch successful. Does it exist?", snapshot.exists());
        if (!cancelled) setIsAdmin(snapshot.exists());
      })
      .catch((err) => {
        console.error("Document fetch failed with error:", err.message);
        // A denied read means not an admin, which is the same outcome.
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { isAdmin, checking };
}

// ------------------------------------------------------------------ orders --

export const ORDER_STATUSES = ["new", "confirmed", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

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
            };
            return {
              ...data,
              id: entry.id,
              status: data.status ?? "new",
              placedAt: data.createdAt?.toDate() ?? null,
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

/** Rules allow an admin to change status and nothing else on an order. */
export async function setOrderStatus(orderId: string, status: OrderStatus) {
  if (!db) return;
  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
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
