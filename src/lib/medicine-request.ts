/**
 * The medicine request, parked between the medicine screen and checkout.
 *
 * A File cannot survive `sessionStorage` or a navigation, so the photo is
 * uploaded on the way out of the medicine screen and only its link travels.
 * `photoName` is the fallback for when the upload failed or timed out: the
 * order still goes through, and the message asks for the photo in the chat
 * rather than pretending one is attached.
 */
export type MedicineRequest = {
  request: string;
  prescriptionId: string | null;
  prescriptionUrl: string | null;
  photoName: string | null;
};

// v1 held a bare string. Bumped rather than parsed defensively, so a session
// half-way through the old flow starts clean instead of half-read.
const STORAGE_KEY = "poba.medicine.v2";

const EMPTY: MedicineRequest = {
  request: "",
  prescriptionId: null,
  prescriptionUrl: null,
  photoName: null,
};

export function saveMedicineRequest(value: MedicineRequest): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode and full quotas both throw. Checkout falls back to an empty
    // request and the customer retypes it there.
  }
}

/** Cleared once the order is placed, so the next visit starts blank. */
export function clearMedicineRequest(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function readMedicineRequest(): MedicineRequest {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<MedicineRequest>;
    return { ...EMPTY, ...parsed, request: parsed.request ?? "" };
  } catch {
    return EMPTY;
  }
}
