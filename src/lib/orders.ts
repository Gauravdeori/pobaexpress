import { supabase, PRESCRIPTION_BUCKET, PRESCRIPTION_LINK_TTL } from "./supabase";

export type OrderLine = {
  id: string;
  label: string;
  quantity: number;
  price: number;
};

export type OrderDraft = {
  category: string;
  customer_name: string;
  phone: string;
  address: string;
  lines: OrderLine[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  extra_request: string | null;
  notes: string | null;
  prescription_path: string | null;
};

export type PrescriptionUpload = {
  /** Storage path, always present — the operator can open this in Supabase. */
  path: string;
  /**
   * Time-limited link, only for signed-in customers. Guests cannot read back
   * from the bucket (see supabase/migrations), so this stays null for them.
   */
  signedUrl: string | null;
};

function fileExtension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name);
  return match ? match[1].toLowerCase() : "jpg";
}

/**
 * Uploads a prescription to the private bucket. Returns null (rather than
 * throwing) if Supabase is not configured or the upload fails — a failed
 * upload must never block the WhatsApp order, which is the real delivery path.
 */
export async function uploadPrescription(
  file: File,
  userId: string | null,
): Promise<PrescriptionUpload | null> {
  if (!supabase) return null;

  // Signed-in uploads live under the user's id so RLS can match on it; guests
  // get an unguessable folder.
  const folder = userId ?? `guest/${crypto.randomUUID()}`;
  const path = `${folder}/${Date.now()}.${fileExtension(file.name)}`;

  const { error } = await supabase.storage
    .from(PRESCRIPTION_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });

  if (error) {
    console.error("Prescription upload failed", error);
    return null;
  }

  if (!userId) return { path, signedUrl: null };

  const { data, error: signError } = await supabase.storage
    .from(PRESCRIPTION_BUCKET)
    .createSignedUrl(path, PRESCRIPTION_LINK_TTL);

  if (signError) {
    console.error("Could not sign prescription URL", signError);
    return { path, signedUrl: null };
  }
  return { path, signedUrl: data.signedUrl };
}

/**
 * Keeps a record of the order beyond the WhatsApp thread. Best-effort: a
 * failure here is logged, never surfaced, and never stops the order.
 */
export async function recordOrder(draft: OrderDraft, userId: string | null): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("orders").insert({ ...draft, user_id: userId });
  if (error) console.error("Could not record order", error);
}
