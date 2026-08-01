import { useState } from "react";
import { LogIn, LogOut, Mail, UserRound } from "lucide-react";
import type { User } from "firebase/auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sendMagicLink, signOut } from "@/lib/account";

/**
 * Sign-in control for the header. Purely optional — ordering never requires an
 * account, so this is a convenience that saves your details for next time.
 *
 * `onDark` styles it for the transparent header over the hero photo.
 */
export function AccountMenu({ user, onDark = false }: { user: User | null; onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    const error = await sendMagicLink(email);
    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }
    setStatus("sent");
    setMessage(null);
  };

  const triggerClass = cn(
    "flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors",
    onDark
      ? "text-primary-foreground/90 hover:bg-white/10 hover:text-primary-foreground"
      : "text-foreground hover:bg-secondary hover:text-primary",
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Reopening after a sent link should offer the form again, not the
        // stale confirmation.
        if (!next) setStatus("idle");
      }}
    >
      <DialogTrigger className={triggerClass} aria-label={user ? "Your account" : "Sign in"}>
        {user ? <UserRound className="size-4" /> : <LogIn className="size-4" />}
        <span className="hidden sm:inline">{user ? "Account" : "Sign in"}</span>
      </DialogTrigger>

      <DialogContent className="rounded-3xl sm:max-w-md">
        {user ? (
          <>
            <DialogHeader>
              <DialogTitle>Your account</DialogTitle>
              <DialogDescription>
                Signed in as <span className="font-medium text-primary">{user.email}</span>. Your
                name, phone and address are filled in automatically when you order.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="outline"
              className="mt-2 h-12 w-full rounded-2xl"
              onClick={async () => {
                await signOut();
                setOpen(false);
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </>
        ) : status === "sent" ? (
          <>
            <DialogHeader>
              <DialogTitle>Check your inbox</DialogTitle>
              <DialogDescription>
                We sent a sign-in link to <span className="font-medium text-primary">{email}</span>.
                Open it on this device. You can carry on and order in the meantime — an account is
                never required.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="accent"
              className="mt-2 h-12 w-full rounded-2xl"
              onClick={() => setOpen(false)}
            >
              Got it
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                Optional — you can order without an account. Signing in saves your name, phone and
                address so you don&apos;t retype them next time. No password: we email you a link.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 rounded-2xl"
              />
              <Button
                variant="accent"
                className="h-12 w-full rounded-2xl"
                disabled={status === "sending"}
                onClick={handleSend}
              >
                <Mail className="size-4" />
                {status === "sending" ? "Sending…" : "Email me a sign-in link"}
              </Button>
              {status === "error" && message && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {message}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
