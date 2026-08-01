import { useEffect, useState } from "react";
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db, isFirebaseConfigured } from "./firebase";

/** The saved details we prefill the order form with. */
export type Profile = {
  fullName: string | null;
  phone: string | null;
  address: string | null;
};

const EMPTY_PROFILE: Profile = { fullName: null, phone: null, address: null };

// Firebase's email-link flow returns to the page without telling us who it is
// for, so the address is stashed before the link is sent and read back here.
const PENDING_EMAIL_KEY = "poba:pending-email";

/**
 * Session plus saved profile. Accounts are optional: signed out, everything
 * below is null and the order form behaves exactly as it did without Firebase.
 */
export function useAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  // Complete a sign-in if we arrived back from an email link.
  useEffect(() => {
    if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return;
    const email = window.localStorage.getItem(PENDING_EMAIL_KEY);
    if (!email) return; // Opened on a different device; nothing to complete with.

    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        window.localStorage.removeItem(PENDING_EMAIL_KEY);
        // Strip the credential out of the address bar so it is not shared or
        // replayed from history.
        window.history.replaceState({}, "", window.location.pathname + "#order");
      })
      .catch((error) => console.error("Could not complete sign-in", error));
  }, []);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
      if (!next) setProfile(null);
    });
  }, []);

  // Load saved details whenever a user appears.
  useEffect(() => {
    if (!db || !user) return;
    let cancelled = false;
    getDoc(doc(db, "profiles", user.uid))
      .then((snapshot) => {
        if (cancelled) return;
        setProfile(snapshot.exists() ? { ...EMPTY_PROFILE, ...snapshot.data() } : EMPTY_PROFILE);
      })
      .catch((error) => console.error("Could not load profile", error));
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { user, profile, loading };
}

/** Emails a one-time sign-in link. Returns an error message, or null on success. */
export async function sendMagicLink(email: string): Promise<string | null> {
  if (!auth) return "Accounts aren't set up yet.";
  const address = email.trim();
  try {
    await sendSignInLinkToEmail(auth, address, {
      // Must be on the Authorized domains list in the Firebase console.
      url: `${window.location.origin}/#order`,
      handleCodeInApp: true,
    });
    window.localStorage.setItem(PENDING_EMAIL_KEY, address);
    return null;
  } catch (error) {
    console.error("Could not send sign-in link", error);
    return error instanceof Error ? error.message : "Could not send the link.";
  }
}

export async function signOut() {
  if (auth) await firebaseSignOut(auth);
}

/** Stores the details entered on an order so the next one is prefilled. */
export async function saveProfile(uid: string, profile: Profile) {
  if (!db) return;
  try {
    await setDoc(
      doc(db, "profiles", uid),
      { ...profile, updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (error) {
    console.error("Could not save profile", error);
  }
}
