import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  updateProfile,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  type ConfirmationResult,
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

/* ---------------------------------------------------------------- phone --- */

/**
 * Phone sign-in, in two steps: send a code, then confirm it with a name.
 *
 * This is the route most customers here will take — a number is the one thing
 * everyone has, and it is what a rider needs anyway. The name is asked for at
 * the same time because a phone account arrives with no display name at all,
 * and both the order form and the WhatsApp message want one.
 *
 * Needs Phone enabled under Authentication → Sign-in method in the Firebase
 * console, and the site's domain listed under Authorized domains. Without
 * that, Firebase answers `auth/operation-not-allowed` and the message below
 * says so rather than blaming the customer's number.
 */

/** Poba Express delivers in one town, so numbers are Indian mobiles. */
const DIAL_CODE = "+91";

/**
 * A typed number as E.164, or null if it isn't ten digits.
 *
 * Accepts what people actually type: spaces, dashes, a leading 0, or the
 * country code already on the front.
 */
export function toE164(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(local) ? `${DIAL_CODE}${local}` : null;
}

/**
 * One verifier at a time, kept outside React.
 *
 * A reCAPTCHA widget is spent once it has answered, and a re-render must not
 * build a second one over the same container, so it is created on demand and
 * cleared after every attempt, successful or not.
 */
let verifier: RecaptchaVerifier | null = null;

export function clearPhoneVerifier() {
  try {
    verifier?.clear();
  } catch {
    // Already torn down with its container — nothing left to clear.
  }
  verifier = null;
}

export type PhoneCodeResult = { confirmation?: ConfirmationResult; error?: string };

/** Step one: text a six-digit code to `phone`. */
export async function sendPhoneCode(phone: string, containerId: string): Promise<PhoneCodeResult> {
  if (!auth) return { error: "Accounts aren't set up yet." };

  const e164 = toE164(phone);
  if (!e164) return { error: "Enter a 10-digit mobile number." };

  try {
    clearPhoneVerifier();
    verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
    const confirmation = await signInWithPhoneNumber(auth, e164, verifier);
    return { confirmation };
  } catch (error) {
    console.error("Could not send the code", error);
    clearPhoneVerifier();
    switch (authErrorCode(error)) {
      case "auth/invalid-phone-number":
        return { error: "That number doesn't look right." };
      case "auth/too-many-requests":
        return { error: "Too many attempts from this number. Try again in a little while." };
      case "auth/operation-not-allowed":
        return { error: "Phone sign-in isn't switched on for this site yet." };
      case "auth/quota-exceeded":
        return { error: "We've hit today's limit on codes. Please use email for now." };
      default:
        return { error: "Could not send the code. Check the number and try again." };
    }
  }
}

/** Step two: confirm the code and put the name on the account. */
export async function confirmPhoneCode(
  confirmation: ConfirmationResult,
  code: string,
  fullName: string,
): Promise<string | null> {
  const name = fullName.trim();
  try {
    const { user } = await confirmation.confirm(code);

    // Best effort, both of them: the customer is signed in either way, and
    // failing them over a name that can be retyped at checkout would be worse
    // than a profile that fills in one field short.
    if (name) await updateProfile(user, { displayName: name }).catch(() => {});
    await saveProfile(user.uid, { fullName: name || user.displayName, phone: user.phoneNumber });
    return null;
  } catch (error) {
    console.error("Could not confirm the code", error);
    switch (authErrorCode(error)) {
      case "auth/invalid-verification-code":
        return "That code isn't right. Check the message and try again.";
      case "auth/code-expired":
        return "That code has expired. Ask for a new one.";
      default:
        return "Could not verify the code. Ask for a new one.";
    }
  } finally {
    clearPhoneVerifier();
  }
}

/**
 * What to call someone on screen.
 *
 * A phone account has no email and, until they give one, no name — printing
 * `user.email` for them would render an empty line where their identity should
 * be.
 */
export function accountLabel(user: User): string {
  return user.displayName || user.phoneNumber || user.email || "your account";
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
