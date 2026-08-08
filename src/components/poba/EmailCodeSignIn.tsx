import { useEffect, useId, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { requestSignInCode, signInWithCode } from "@/lib/account";

const CODE_LENGTH = 6;

/** Matches the server's 60-second gap between codes for one address. */
const RESEND_SECONDS = 60;

/**
 * Sign in with a name, an email address and a six-digit code.
 *
 * The name is asked for on the same step as the address rather than after the
 * code: an account created this way has no name of its own, and a second form
 * on the far side of a one-time code is one nobody expects. It rides along
 * with the code request and is put on the account when the code checks out.
 *
 * `onDone` fires once the customer is signed in, so a dialog can close itself.
 */
export function EmailCodeSignIn({ onDone }: { onDone?: () => void }) {
  const fieldId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Counts the resend gap down rather than leaving a dead button: without it
  // the only feedback is the server refusing a second code.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((left) => left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const ready = name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const send = async () => {
    setBusy(true);
    setError(null);
    const failed = await requestSignInCode(name, email);
    setBusy(false);
    if (failed) {
      setError(failed);
      return;
    }
    setSent(true);
    setCooldown(RESEND_SECONDS);
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const failed = await signInWithCode(email, code);
    setBusy(false);
    if (failed) {
      setError(failed);
      setCode("");
      return;
    }
    onDone?.();
  };

  return (
    <div className="space-y-3">
      {sent ? (
        <>
          <p className="text-sm text-muted-foreground">
            We sent a code to <span className="font-semibold text-primary">{email.trim()}</span>. It
            expires in 10 minutes — check your spam folder if it isn&apos;t there.
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

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setCode("");
                setError(null);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline"
            >
              <ArrowLeft className="size-3" />
              Change email
            </button>
            <button
              type="button"
              disabled={busy || cooldown > 0}
              onClick={() => void send()}
              className="text-xs font-medium text-primary underline disabled:text-muted-foreground disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Send a new code"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor={`${fieldId}-name`}>Your name</Label>
            <Input
              id={`${fieldId}-name`}
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
            <Label htmlFor={`${fieldId}-email`}>Email address</Label>
            <Input
              id={`${fieldId}-email`}
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-1.5 h-12 rounded-2xl"
            />
          </div>

          <Button
            type="button"
            variant="accent"
            className="h-12 w-full rounded-2xl"
            disabled={busy || !ready}
            onClick={() => void send()}
          >
            <Mail className="size-4" />
            {busy ? "Sending…" : "Send code"}
          </Button>

          <p className="text-xs text-muted-foreground">
            No password to remember — we email you a six-digit code each time.
          </p>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
