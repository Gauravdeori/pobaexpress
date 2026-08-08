import { useState } from "react";
import { LogIn, LogOut, Mail, Smartphone, UserRound } from "lucide-react";
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
import { PhoneSignIn } from "./PhoneSignIn";
import {
  accountLabel,
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle,
  signOut,
} from "@/lib/account";

/**
 * Sign-in control for the header. Users are required to be signed in
 * before they can place an order. It also saves user details for convenience.
 *
 * `onDark` styles it for the transparent header over the hero photo.
 */
export function AccountMenu({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  // Phone first: a number is the one thing every customer here has, and it is
  // what the rider needs anyway.
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setStatus("loading");
    const error = isSignUp
      ? await signUpWithPassword(email, password)
      : await signInWithPassword(email, password);

    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }
    setOpen(false); // Close on success
  };

  const handleGoogle = async () => {
    setStatus("loading");
    const error = await signInWithGoogle();
    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }
    setOpen(false); // Close on success
  };

  const triggerClass =
    "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-accent";

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
                Signed in as <span className="font-medium text-primary">{accountLabel(user)}</span>.
                Your name, phone and address are filled in automatically when you order.
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
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {method === "phone" ? "Sign in" : isSignUp ? "Create Account" : "Sign in"}
              </DialogTitle>
              <DialogDescription>
                Signing in is required to place an order. It also saves your name, phone and address
                so you don&apos;t retype them next time.
              </DialogDescription>
            </DialogHeader>

            {/* Two ways in, side by side rather than one behind the other:
                whichever the customer has, it is one tap away. */}
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
              {(["phone", "email"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMethod(option);
                    setStatus("idle");
                    setMessage(null);
                  }}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
                    method === option
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  {option === "phone" ? (
                    <Smartphone className="size-4" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  {option === "phone" ? "Phone" : "Email"}
                </button>
              ))}
            </div>

            {method === "phone" ? (
              <div className="mt-4">
                <PhoneSignIn onDone={() => setOpen(false)} />
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="mt-2 space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-12 rounded-2xl"
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setStatus("idle");
                    }}
                    placeholder="Password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="h-12 rounded-2xl"
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    className="h-12 w-full rounded-2xl"
                    disabled={status === "loading" || !email.trim() || !password.trim()}
                  >
                    {status === "loading"
                      ? "Please wait…"
                      : isSignUp
                        ? "Create Account"
                        : "Sign in"}
                  </Button>
                  {status === "error" && message && (
                    <p role="alert" className="text-sm font-medium text-destructive">
                      {message}
                    </p>
                  )}
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-2xl"
                    disabled={status === "loading"}
                    onClick={handleGoogle}
                  >
                    <svg className="mr-2 size-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  <span className="text-muted-foreground">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  </span>
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setStatus("idle");
                      setMessage(null);
                    }}
                  >
                    {isSignUp ? "Sign in" : "Create one"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
