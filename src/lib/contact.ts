/**
 * Single source of truth for Poba Express contact details.
 * Update the values here and every section of the page follows.
 */

/** WhatsApp number in international format, digits only. */
export const WHATSAPP_NUMBER = "918822015747";

/** The same number, formatted for display. */
export const PHONE_DISPLAY = "+91 88220 15747";

/** The same number as a dialable href. */
export const PHONE_HREF = "tel:+918822015747";

export const EMAIL = "hello@pobaexpress.in";
export const EMAIL_HREF = `mailto:${EMAIL}`;

export const ADDRESS = "Jonai, Assam";

/** Public profiles. Leave a value empty and the footer hides that icon. */
export const SOCIAL = {
  facebook: "",
  instagram: "",
};

/** Builds a wa.me link, optionally pre-filled with a message. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
