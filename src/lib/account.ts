import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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

/**
 * Session plus saved profile. Accounts are optional: signed out, everything
 * below is null and the order form behaves exactly as it did without Firebase.
 */
export function useAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

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

/** Firebase throws FirebaseError, whose `code` is what we branch on. */
function authErrorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
}

export async function signInWithPassword(email: string, password: string): Promise<string | null> {
  if (!auth) return "Accounts aren't set up yet.";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return null;
  } catch (error) {
    console.error("Sign-in failed", error);
    if (authErrorCode(error) === "auth/invalid-credential") {
      return "Incorrect email or password.";
    }
    return error instanceof Error ? error.message : "Could not sign in.";
  }
}

export async function signUpWithPassword(email: string, password: string): Promise<string | null> {
  if (!auth) return "Accounts aren't set up yet.";
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return null;
  } catch (error) {
    console.error("Sign-up failed", error);
    const code = authErrorCode(error);
    if (code === "auth/email-already-in-use") {
      return "An account with this email already exists.";
    }
    if (code === "auth/weak-password") {
      return "Password should be at least 6 characters.";
    }
    return error instanceof Error ? error.message : "Could not create account.";
  }
}

export async function signInWithGoogle(): Promise<string | null> {
  if (!auth) return "Accounts aren't set up yet.";
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return null;
  } catch (error) {
    console.error("Google sign-in failed", error);
    // Closing the popup is a deliberate cancel, not something to report.
    if (authErrorCode(error) === "auth/popup-closed-by-user") return null;
    return error instanceof Error ? error.message : "Could not sign in with Google.";
  }
}

export async function signOut() {
  if (auth) await firebaseSignOut(auth);
}

/**
 * What to call someone on screen.
 *
 * Google supplies a name, a password account may only ever have the email, so
 * this falls through rather than printing an empty line where an identity
 * should be.
 */
export function accountLabel(user: User): string {
  return user.displayName || user.email || "your account";
}

/**
 * Stores the details entered on an order so the next one is prefilled.
 *
 * Partial on purpose: a caller that knows only a name must be able to save
 * just that, since a merge writing `address: null` would wipe one already
 * saved.
 */
export async function saveProfile(uid: string, profile: Partial<Profile>) {
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
