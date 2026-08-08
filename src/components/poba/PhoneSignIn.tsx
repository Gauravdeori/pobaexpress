import { useEffect, useId, useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { ArrowLeft, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { clearPhoneVerifier, confirmPhoneCode, sendPhoneCode, toE164 } from "@/lib/account";

const CODE_LENGTH = 6;

/**
 * Sign in with a mobile number and a name.
 *
 * Two steps in one component, because they are one decision to the customer:
 * type who you are, then prove the number is yours. The name is collected up
 * front rather than after the code — a phone account has no display name of
 * its own, and asking on the far side of a one-time code is a second form
 * nobody expects.
 *
 * `onDone` fires once the customer is signed in, so a dialog can close itself.
 */
export function PhoneSignIn({ onDone }: { onDone?: () => void }) {
  // reCAPTCHA needs a real element to mount into, and this form renders in
  // both the header dialog and the account screen — a fixed id would collide.
  const recaptchaId = `recaptcha-${useId().replace(/:/g, "")}`;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The widget outlives this component unless it is told not to, and a stale
  // one blocks the next attempt.
  useEffect(() => clearPhoneVerifier, []);

  const e164 = toE164(phone);
  const ready = name.trim().length > 1 && e164 !== null;

  const send = async () => {
    setBusy(true);
    setError(null);
    const { confirmation: next, error: failed } = await sendPhoneCode(phone, recaptchaId);
    setBusy(false);
    if (failed || !next) {
      setError(failed ?? "Could not send the code.");
      return;
    }
    setConfirmation(next);
  };

  const verify = async () => {
    if (!confirmation) return;
    setBusy(true);
    setError(null);
    const failed = await confirmPhoneCode(confirmation, code, name);
    setBusy(false);
    if (failed) {
      setError(failed);
      return;
    }
    onDone?.();
  };

  const startOver = () => {
    setConfirmation(null);
    setCode("");
    setError(null);
  };

  return (
    <div className="space-y-3">
      {confirmation ? (
        <>
          <p className="text-sm text-muted-foreground">
            Code sent to <span className="font-semibold text-primary">{e164}</span>. It can take a
            few seconds to arrive.
          </p>

          <div className="flex justify-center py-1">
            <InputOTP
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(next) => {
                setCode(next);
                setError(null);
              }}
              autoFocus
              aria-label="Six-digit code"
            >
              <InputOTPGroup>
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} className="size-11 text-base" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="button"
            variant="accent"
            className="h-12 w-full rounded-2xl"
            disabled={busy || code.length < CODE_LENGTH}
            onClick={() => void verify()}
          >
            {busy ? "Checking…" : "Verify and sign in"}
          </Button>

          <button
            type="button"
            onClick={startOver}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground underline"
          >
            <ArrowLeft className="size-3" />
            Use a different number
          </button>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor={`${recaptchaId}-name`}>Your name</Label>
            <Input
              id={`${recaptchaId}-name`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Ritu Pegu"
              autoComplete="name"
              className="mt-1.5 h-12 rounded-2xl"
            />
          </div>

          <div>
            <Label htmlFor={`${recaptchaId}-phone`}>Mobile number</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="flex h-12 shrink-0 items-center rounded-2xl border border-input bg-secondary px-3 text-sm font-semibold text-muted-foreground">
                +91
              </span>
              <Input
                id={`${recaptchaId}-phone`}
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                placeholder="98765 43210"
                autoComplete="tel-national"
                className="h-12 rounded-2xl"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="accent"
            className="h-12 w-full rounded-2xl"
            disabled={busy || !ready}
            onClick={() => void send()}
          >
            <Smartphone className="size-4" />
            {busy ? "Sending…" : "Send code"}
          </Button>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {/* Invisible reCAPTCHA mounts here. Firebase requires the element to
          exist before the first send, so it is rendered, not conditional. */}
      <div id={recaptchaId} />
    </div>
  );
}
