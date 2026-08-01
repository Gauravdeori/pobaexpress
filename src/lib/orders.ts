import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage, PRESCRIPTION_PREFIX } from "./firebase";

export type OrderLine = {
  id: string;
  label: string;
  quantity: number;
  price: number;
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
  prescriptionPath: string | null;
};

export type PrescriptionUpload = {
  /** Storage path, always present — open it from the Firebase console. */
  path: string;
  /**
   * Download URL, only for signed-in customers. Guests cannot read back from
   * storage (see storage.rules), so this stays null for them.
   *
   * Note: a Firebase download URL carries a token and does not expire. Anyone
   * the link is forwarded to can open it, so it goes only to the WhatsApp
   * thread with the order it belongs to.
   */
  url: string | null;
};

/**
 * The order opens WhatsApp only once the upload settles, so a stalled request
 * would hold the customer on a spinner. Give it a generous window — a photo on
 * a rural mobile connection is legitimately slow — then carry on without it.
 */
const UPLOAD_TIMEOUT_MS = 20_000;

function withTimeout<T>(work: Promise<T>, label: string): Promise<T | null> {
  return Promise.race([
    work,
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.error(`${label} timed out after ${UPLOAD_TIMEOUT_MS}ms`);
        resolve(null);
      }, UPLOAD_TIMEOUT_MS),
    ),
  ]);
}

function fileExtension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : "jpg";
}

/**
 * Uploads a prescription to Storage. Returns null (rather than throwing) if
 * Firebase is not configured or the upload fails — a failed upload must never
 * block the WhatsApp order, which is the real delivery path.
 */
export async function uploadPrescription(
  file: File,
  uid: string | null,
): Promise<PrescriptionUpload | null> {
  if (!storage) return null;

  // Signed-in uploads live under the user's uid so the rules can match on it;
  // guests get an unguessable folder.
  const folder = uid ?? `guest/${crypto.randomUUID()}`;
  const path = `${PRESCRIPTION_PREFIX}/${folder}/${Date.now()}.${fileExtension(file.name)}`;
  const target = ref(storage, path);

  try {
    const result = await withTimeout(
      uploadBytes(target, file, { contentType: file.type || undefined }),
      "Prescription upload",
    );
    if (!result) return null;
  } catch (error) {
    console.error("Prescription upload failed", error);
    return null;
  }

  if (!uid) return { path, url: null };

  try {
    return { path, url: await getDownloadURL(target) };
  } catch (error) {
    console.error("Could not read back the prescription URL", error);
    return { path, url: null };
  }
}

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
