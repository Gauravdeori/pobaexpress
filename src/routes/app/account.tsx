import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Mail } from "lucide-react";

import { ScreenHeading } from "@/components/app/Shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  accountLabel,
  signInWithGoogle,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  useAccount,
} from "@/lib/account";
import { isFirebaseConfigured } from "@/lib/firebase";
import { PHONE_DISPLAY, PHONE_HREF, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";

export const Route = createFileRoute("/app/account")({
  component: AccountScreen,
});

function AccountScreen() {
  const { user, profile, loading } = useAccount();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const message =
      mode === "in"
        ? await signInWithPassword(email.trim(), password)
        : await signUpWithPassword(email.trim(), password);
    setError(message);
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <ScreenHeading title="Account" />

      {!isFirebaseConfigured ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Accounts aren&apos;t reachable right now, and an account is needed to order. Browsing
          still works — send your order on WhatsApp in the meantime.
        </p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Checking…</p>
      ) : user ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="truncate font-semibold text-primary">{accountLabel(user)}</p>
          {/* The label above is the name once there is one, so the address it
              displaced is worth keeping in view — it is what the next code
              goes to. */}
          {user.displayName && user.email && (
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          )}
          {profile?.address && (
            <p className="mt-3 text-sm text-muted-foreground">
              Saved address: <span className="text-primary">{profile.address}</span>
            </p>
          )}
          <Button
            variant="outline"
            className="mt-4 h-11 w-full rounded-2xl"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Signing in saves your name, phone and address, so the next order fills itself in.
          </p>

          <div className="mt-4 grid gap-3">
            <div>
              <Label htmlFor="ac-email">Email</Label>
              <Input
                id="ac-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ac-password">Password</Label>
              <Input
                id="ac-password"
                type="password"
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            variant="accent"
            className="mt-4 h-11 w-full rounded-2xl"
            disabled={busy || !email.trim() || !password}
            onClick={() => void submit()}
          >
            <Mail className="size-4" />
            {mode === "in" ? "Sign in" : "Create account"}
          </Button>

          <Button
            variant="outline"
            className="mt-2 h-11 w-full rounded-2xl"
            onClick={() => void signInWithGoogle()}
          >
            Continue with Google
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "in" ? "up" : "in"));
              setError(null);
            }}
            className="mt-4 w-full text-center text-xs font-medium text-muted-foreground underline"
          >
            {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        Help
      </h2>
      <div className="grid gap-2.5 text-sm">
        <a
          href={whatsappLink()}
          className="rounded-2xl border border-border bg-card p-4 font-medium text-primary"
        >
          WhatsApp us · {WHATSAPP_DISPLAY}
        </a>
        <a
          href={PHONE_HREF}
          className="rounded-2xl border border-border bg-card p-4 font-medium text-primary"
        >
          Call us · {PHONE_DISPLAY}
        </a>
        <Link
          to="/"
          className="rounded-2xl border border-border bg-card p-4 font-medium text-muted-foreground"
        >
          About Poba Express
        </Link>
      </div>
    </div>
  );
}
