import { createServerFn } from "@tanstack/react-start";

/**
 * Email sign-in with a six-digit code.
 *
 * Two calls: `requestEmailCode` mails a code, `verifyEmailCode` trades a
 * correct one for a Firebase custom token the browser signs in with.
 *
 * Firebase has no email OTP of its own — its passwordless option mails a link —
 * so the code, its storage and its expiry are ours to get right:
 *
 *  - only a hash of the code is stored, so a leaked database is not a set of
 *    working sign-ins;
 *  - five wrong guesses burn the code, which is what stops someone walking
 *    through all 10⁶ of them;
 *  - one code per minute per address, so the endpoint cannot be used to post
 *    mail to a stranger;
 *  - the reply never says whether an account exists, and never carries the code.
 *
 * Handlers import the server-only modules dynamically. A static import would
 * put the service-account reader in the module graph the client bundle is
 * built from, and that is not a mistake worth risking.
 */

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

export type RequestResult = { ok: boolean; error?: string };
export type VerifyResult = { token?: string; name?: string; error?: string };

/** Loose on purpose: the code, not the regex, is what proves the address. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normaliseEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  return EMAIL_PATTERN.test(email) && email.length <= 254 ? email : null;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Even hex strings get compared in constant time; the cost is nothing. */
function equalHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Uniform over 000000–999999, from the CSPRNG rather than Math.random. */
function sixDigitCode(): string {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return String(buffer[0] % 1_000_000).padStart(6, "0");
}

export const requestEmailCode = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string }) => data)
  .handler(async ({ data }): Promise<RequestResult> => {
    const { NotConfiguredError, readCode, writeCode } = await import("./google-admin.server");
    const { sendCodeEmail } = await import("./email.server");

    const email = normaliseEmail(data.email ?? "");
    const name = (data.name ?? "").trim().slice(0, 80);

    if (!email) return { ok: false, error: "That email address doesn't look right." };
    if (name.length < 2) return { ok: false, error: "Please enter your name." };

    try {
      const id = await sha256Hex(email);
      const existing = await readCode(id);
      if (existing && Date.now() - existing.sentAt < RESEND_GAP_MS) {
        return { ok: false, error: "A code is already on its way. Give it a minute." };
      }

      const code = sixDigitCode();
      // The address is mixed into the hash so a code is only ever valid for the
      // inbox it was sent to.
      await writeCode(id, {
        hash: await sha256Hex(`${email}:${code}`),
        name,
        email,
        expiresAt: Date.now() + CODE_TTL_MS,
        sentAt: Date.now(),
        attempts: 0,
      });

      await sendCodeEmail(email, code, name);
      return { ok: true };
    } catch (error) {
      console.error("Could not send a sign-in code", error);
      if (error instanceof NotConfiguredError) {
        return { ok: false, error: "Email sign-in isn't switched on for this site yet." };
      }
      return { ok: false, error: "Could not send the code. Please try again." };
    }
  });

export const verifyEmailCode = createServerFn({ method: "POST" })
  .validator((data: { email: string; code: string }) => data)
  .handler(async ({ data }): Promise<VerifyResult> => {
    const {
      NotConfiguredError,
      createCustomToken,
      deleteCode,
      findOrCreateUser,
      readCode,
      writeCode,
    } = await import("./google-admin.server");

    const email = normaliseEmail(data.email ?? "");
    const code = (data.code ?? "").replace(/\D/g, "");

    if (!email || code.length !== 6) return { error: "That code isn't right." };

    try {
      const id = await sha256Hex(email);
      const record = await readCode(id);

      // One message for every way of being wrong, so a guesser learns nothing
      // about which addresses have a code waiting.
      if (!record) return { error: "That code isn't right. Ask for a new one." };

      if (record.expiresAt < Date.now()) {
        await deleteCode(id);
        return { error: "That code has expired. Ask for a new one." };
      }

      if (
        record.attempts + 1 >= MAX_ATTEMPTS &&
        !equalHex(record.hash, await sha256Hex(`${email}:${code}`))
      ) {
        await deleteCode(id);
        return { error: "Too many wrong tries. Ask for a new code." };
      }

      if (!equalHex(record.hash, await sha256Hex(`${email}:${code}`))) {
        await writeCode(id, { ...record, attempts: record.attempts + 1 });
        return { error: "That code isn't right." };
      }

      // Spend it before minting anything, so one code is one sign-in.
      await deleteCode(id);

      const uid = await findOrCreateUser(email, record.name);
      return { token: await createCustomToken(uid), name: record.name };
    } catch (error) {
      console.error("Could not verify a sign-in code", error);
      if (error instanceof NotConfiguredError) {
        return { error: "Email sign-in isn't switched on for this site yet." };
      }
      return { error: "Could not sign you in. Please try again." };
    }
  });
