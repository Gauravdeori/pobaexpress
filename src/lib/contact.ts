/**
 * Single source of truth for Poba Express contact details.
 * Update the values here and every section of the page follows.
 */

/**
 * Two separate numbers, deliberately. Orders and messages go to WhatsApp;
 * calls go to the contact line. Don't collapse them back into one.
 */

/** WhatsApp — messages only, no calls. International format, digits only. */
export const WHATSAPP_NUMBER = "918822015747";

/** The WhatsApp number, formatted for display. */
export const WHATSAPP_DISPLAY = "+91 88220 15747";

/** The number to call. */
export const PHONE_DISPLAY = "+91 70997 28406";

/** The same calling number as a dialable href. */
export const PHONE_HREF = "tel:+917099728406";

export const EMAIL = "pobaparadise@gmail.com";
export const EMAIL_HREF = `mailto:${EMAIL}`;

/** Short form for the footer, where the column is narrow. */
export const ADDRESS = "Jonai, Assam";

/** Registered address, used in the legal policies. */
export const ADDRESS_FULL = "Opposite Jonai Police Station, Jonai, Dhemaji, Assam – 787060";

/** Date the current policies take effect, shown on each legal page. */
export const POLICY_EFFECTIVE_DATE = "28 July 2026";

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
