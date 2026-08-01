/**
 * Prescription uploads via Cloudinary's unsigned upload endpoint.
 *
 * Firebase Storage needs a paid plan, so photos go here instead. Unsigned
 * uploads need no secret in the browser — the upload preset is the credential,
 * and it only grants uploading.
 *
 * Privacy note: a Cloudinary delivery URL is public to anyone holding it. The
 * public_id is random so the URL is unguessable, but it is not access
 * controlled and does not expire. Restrict the preset in the Cloudinary
 * console (formats, max file size) and treat the link like the prescription
 * itself — it goes only into the WhatsApp thread it belongs to.
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isUploadConfigured = Boolean(cloudName && uploadPreset);

export type PrescriptionUpload = {
  /** Cloudinary identifier, stored on the order so you can find the file. */
  publicId: string;
  /** Delivery URL, put into the WhatsApp message. */
  url: string;
};

/**
 * The order does not wait on this, but a request that never settles would keep
 * a pending upload alive indefinitely, so cut it off.
 */
const UPLOAD_TIMEOUT_MS = 30_000;

/**
 * Uploads a prescription. Returns null (rather than throwing) on any failure —
 * a failed upload must never block the WhatsApp order, which is the real
 * delivery path.
 */
export async function uploadPrescription(file: File): Promise<PrescriptionUpload | null> {
  if (!isUploadConfigured) return null;

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset!);
  // Keeps prescriptions together and away from anything else in the account.
  body.append("folder", "poba-prescriptions");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    // `auto` so a PDF prescription is handled as well as a photo.
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body,
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("Prescription upload failed", response.status, await response.text());
      return null;
    }
    const result = (await response.json()) as { public_id?: string; secure_url?: string };
    if (!result.public_id || !result.secure_url) {
      console.error("Prescription upload returned no URL", result);
      return null;
    }
    return { publicId: result.public_id, url: result.secure_url };
  } catch (error) {
    console.error("Prescription upload failed", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
