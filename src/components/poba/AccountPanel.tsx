import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, Mail, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMagicLink, signOut } from "@/lib/account";

/**
 * Optional sign-in strip above the order form. Ordering never depends on it —
 * an account only saves your details for next time.
 */
export function AccountPanel({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
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

  if (user) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/50 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <UserRound className="size-4 shrink-0 text-accent" />
          <span className="truncate">
            Signed in as <span className="font-medium text-primary">{user.email}</span>
          </span>
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-secondary/50 px-4 py-3">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Ordering as a guest — no account needed.</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-11 items-center text-sm font-medium text-accent transition-opacity hover:opacity-80"
          >
            Save my details for next time
          </button>
        </div>
      ) : status === "sent" ? (
        <p className="py-1 text-sm text-primary">
          Check <span className="font-medium">{email}</span> for a sign-in link. You can carry on
          and order in the meantime.
        </p>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-muted-foreground">
              We&apos;ll email you a sign-in link — no password. Your name, phone and address get
              filled in automatically next time.
            </p>
            {/* A nested <form> is invalid HTML, so this submits via the button. */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 flex-1 rounded-2xl bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <Button
                type="button"
                variant="accent"
                className="h-12 rounded-2xl"
                disabled={status === "sending"}
                onClick={handleSend}
              >
                <Mail className="size-4" />
                {status === "sending" ? "Sending…" : "Send link"}
              </Button>
            </div>
            {status === "error" && message && (
              <p role="alert" className="mt-2 text-sm font-medium text-destructive">
                {message}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
