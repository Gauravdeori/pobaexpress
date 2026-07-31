import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional. The site was built to work with no backend at all —
 * ordering goes through WhatsApp — so every feature here is additive. When the
 * environment variables are absent the client is null and callers fall back to
 * the original behaviour rather than throwing.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: {
        // Magic links come back as a URL fragment that must be exchanged for a
        // session on load.
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
      },
    })
  : null;

/** Storage bucket holding prescription photos. Private; read via signed URLs. */
export const PRESCRIPTION_BUCKET = "prescriptions";

/** How long a prescription link stays valid, in seconds (7 days). */
export const PRESCRIPTION_LINK_TTL = 60 * 60 * 24 * 7;
