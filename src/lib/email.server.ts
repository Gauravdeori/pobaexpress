/**
 * Sending the sign-in code.
 *
 * Resend over HTTP rather than SMTP, so there is nothing to keep open and it
 * works the same on Node and on an edge runtime. Server-only: it reads the API
 * key.
 */

import { NotConfiguredError } from "./google-admin.server";

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Resend's shared sender. It only delivers to the address that owns the Resend
 * account, which is enough to test the flow but not to serve customers — set
 * OTP_FROM_EMAIL to an address on a domain you have verified before launch.
 */
const FALLBACK_FROM = "Poba Express <onboarding@resend.dev>";

function body(code: string, name: string): { html: string; text: string } {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return {
    text: `${greeting}\n\nYour Poba Express sign-in code is ${code}.\nIt expires in 10 minutes.\n\nIf you didn't ask for it, you can ignore this email — nobody can sign in without the code.`,
    html: `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0B3D1B">
  <p style="font-size:15px;margin:0 0 20px">${greeting}</p>
  <p style="font-size:15px;margin:0 0 8px">Your Poba Express sign-in code is</p>
  <p style="font-size:34px;font-weight:700;letter-spacing:8px;margin:0 0 8px;color:#FF6A00">${code}</p>
  <p style="font-size:13px;color:#5b6b60;margin:0 0 24px">It expires in 10 minutes.</p>
  <p style="font-size:13px;color:#5b6b60;margin:0">If you didn't ask for this, you can ignore this email — nobody can sign in without the code.</p>
</div>`,
  };
}

export async function sendCodeEmail(to: string, code: string, name: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new NotConfiguredError("RESEND_API_KEY is not set");

  const { html, text } = body(code, name);
  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.OTP_FROM_EMAIL?.trim() || FALLBACK_FROM,
      to: [to],
      subject: `${code} is your Poba Express code`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    // The body carries the real reason — an unverified sender, a bad key — and
    // it is worth having in the server log, never in the browser.
    throw new Error(`Resend rejected the email: ${response.status} ${await response.text()}`);
  }
}
