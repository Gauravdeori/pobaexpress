import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db, isFirebaseConfigured } from "./firebase";
import { requestEmailCode, verifyEmailCode } from "./auth-otp";

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

/* ----------------------------------------------------------- email code --- */

/**
 * The browser's half of email sign-in. The code itself is checked on the
 * server — see auth-otp.ts — which answers with a short-lived custom token.
 *
 * That token is the whole point of the round trip: it is the only way to turn
 * "this person read a code we mailed them" into a real Firebase session, and
 * it can only be minted by something holding the service-account key.
 */

/** Step one: ask the server to mail a code. */
export async function requestSignInCode(name: string, email: string): Promise<string | null> {
  if (!auth) return "Accounts aren't set up yet.";
  try {
    const result = await requestEmailCode({ data: { name, email } });
    return result.ok ? null : (result.error ?? "Could not send the code.");
  } catch (error) {
    console.error("Could not request a code", error);
    return "Could not reach the server. Check your connection and try again.";
  }
}

/** Step two: trade a correct code for a session. */
export async function signInWithCode(email: string, code: string): Promise<string | null> {
  if (!auth) return "Accounts aren't set up yet.";
  try {
    const result = await verifyEmailCode({ data: { email, code } });
    if (!result.token) return result.error ?? "That code isn't right.";

    const { user } = await signInWithCustomToken(auth, result.token);

    // The account already carries the name; this mirrors it into the profile
    // the order form reads. Best effort — they are signed in either way, and
    // failing them over a prefill would be worse than one empty field.
    const name = result.name?.trim();
    if (name && !user.displayName) await updateProfile(user, { displayName: name }).catch(() => {});
    await saveProfile(user.uid, { fullName: name || user.displayName });
    return null;
  } catch (error) {
    console.error("Could not sign in with the code", error);
    return "Could not sign you in. Ask for a new code.";
  }
}

/**
 * What to call someone on screen.
 *
 * Falls through the identifiers an account might have: a code sign-in always
 * has a name and an email, a Google one has both, and an old password account
 * may have only the email.
 */
export function accountLabel(user: User): string {
  return user.displayName || user.email || user.phoneNumber || "your account";
}

/**
 * Stores the details entered on an order so the next one is prefilled.
 *
 * Partial on purpose: phone sign-in knows a name and a number but no address,
 * and a merge that wrote `address: null` would wipe one already saved.
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
