import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase, isSupabaseConfigured } from "./supabase";

/** The saved details we prefill the order form with. */
export type Profile = {
  full_name: string | null;
  phone: string | null;
  address: string | null;
};

const EMPTY_PROFILE: Profile = { full_name: null, phone: null, address: null };

/**
 * Session plus saved profile. Accounts are optional: signed out, everything
 * below is null and the order form behaves exactly as it did before Supabase.
 */
export function useAccount() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load saved details whenever a user appears.
  useEffect(() => {
    const userId = session?.user.id;
    if (!supabase || !userId) return;

    let cancelled = false;
    supabase
      .from("profiles")
      .select("full_name, phone, address")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Could not load profile", error);
          return;
        }
        setProfile(data ?? EMPTY_PROFILE);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  return { session, profile, loading, user: session?.user ?? null };
}

/** Emails a one-time sign-in link. Returns an error message, or null on success. */
export async function sendMagicLink(email: string): Promise<string | null> {
  if (!supabase) return "Accounts aren't set up yet.";
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      // Land back on the order form, where the details are used.
      emailRedirectTo: `${window.location.origin}/#order`,
    },
  });
  return error ? error.message : null;
}

export async function signOut() {
  await supabase?.auth.signOut();
}

/** Stores the details entered on an order so the next one is prefilled. */
export async function saveProfile(userId: string, profile: Profile) {
  if (!supabase) return;
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() });
  if (error) console.error("Could not save profile", error);
}
