import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, PartyPopper } from "lucide-react";

import { useTimeUntilLaunch } from "@/lib/launch";

/**
 * "Poba Express is live now", across the top of the landing page.
 *
 * The countdown further down the page already changes on the day, but a
 * visitor who lands and does not scroll never sees it — and whether the shop
 * is open is the single thing they came to find out. So it is said at the top,
 * the moment it is true.
 *
 * Nothing here is on a timer of its own: it reads the same switch the order
 * form and the checkout read, so the page cannot claim to be open while the
 * buttons refuse. Before launch it renders nothing at all rather than a
 * "not yet" strip, because a banner that only ever says no is one people learn
 * to look past.
 */
export function LiveBanner() {
  const { remaining } = useTimeUntilLaunch();
  const launched = remaining?.done ?? false;
  const waiting = remaining?.awaitingGoLive ?? false;

  if (!launched && !waiting) return null;

  if (waiting) {
    return (
      <div className="mx-auto mb-4 max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-center">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
          </span>
          <p className="text-sm font-bold text-amber-900">
            Launch day — we open for orders shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-4 max-w-6xl px-4 sm:px-6"
    >
      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-gradient-green px-5 py-4 shadow-lift sm:flex-row">
        <div className="flex items-center gap-3">
          {/* A live dot, because "live" is the whole message and a pulse says
              it faster than the sentence does. */}
          <span className="relative flex size-3 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-light opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-accent-light" />
          </span>
          <p className="text-sm font-black tracking-tight text-primary-foreground sm:text-base">
            <PartyPopper className="mr-1.5 inline size-4 align-text-bottom text-accent-light" />
            Poba Express is live now
            <span className="ml-2 font-semibold text-primary-foreground/75">
              — we&apos;re delivering across Jonai.
            </span>
          </p>
        </div>

        <Link
          to="/app"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-accent-light px-5 text-xs font-bold text-primary transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:text-sm"
        >
          Order now
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}
