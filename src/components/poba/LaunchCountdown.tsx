import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PartyPopper, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DELIVERY_HOURS_LABEL,
  useAnnouncement,
  useServiceHours,
  useTimeUntilLaunch,
} from "@/lib/launch";

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Counts down to the first delivery day, then switches itself to a launched
 * message — so nothing needs editing on the day.
 *
 * The clock only starts after mount. Server and client would otherwise render
 * different seconds and React would report a hydration mismatch.
 */
export function LaunchCountdown() {
  // Null means "no clock yet", which is what keeps the server and the client
  // from disagreeing about the seconds. Once we are open there is no clock left
  // to disagree about, so seed it and let the server render the real state
  // instead of a "launching soon" shell the first paint has to take back.
  // Follows the admin panel, so opening early there also stops this counting.
  // Named apart from the per-unit `label` below, which the map shadows.
  const { remaining, label: launchLabel } = useTimeUntilLaunch();
  // Announced but not yet open is a real state and the one we are in on launch
  // day: the service exists, the menu is priced, the kitchens take orders in
  // the morning. "Launching soon" would undersell that to everyone who came
  // because they heard we launched.
  const { announced, today } = useAnnouncement();
  const { open: withinHours, nextChangeLabel } = useServiceHours();

  const launched = remaining?.done ?? false;
  // Counted down, not yet opened. Distinct from "launching soon", because the
  // date has passed and saying otherwise would read as a stale page.
  const waiting = remaining?.awaitingGoLive ?? false;

  return (
    <section
      id="launch"
      className="relative overflow-hidden bg-gradient-green py-16 lg:py-20"
      aria-label={launched ? "Now delivering" : "Launch countdown"}
    >
      <div className="absolute -left-20 -top-24 size-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -bottom-28 -right-16 size-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground backdrop-blur-sm">
          {launched || announced ? (
            <PartyPopper className="size-4" />
          ) : (
            <Rocket className="size-4" />
          )}
          {launched
            ? "We're live"
            : waiting
              ? "Opening any moment"
              : announced
                ? today
                  ? "Officially launched today"
                  : "Officially launched"
                : "Launching soon"}
        </span>

        <h2 className="mt-5 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
          {launched ? (
            <>
              Poba Express is <span className="text-accent-light">live now</span>
            </>
          ) : announced && !waiting ? (
            <>
              Poba Express is{" "}
              <span className="text-accent-light">officially launched{today ? " today" : ""}</span>
            </>
          ) : (
            <>
              Deliveries begin <span className="text-accent-light">{launchLabel}</span>
            </>
          )}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
          {launched
            ? // Once we are live the useful fact is not that we exist, it is
              // whether the counter is staffed at the moment someone is
              // reading — so this says which, and always names the window.
              withinHours
              ? `Food, cake and medicine delivered across Jonai, ${DELIVERY_HOURS_LABEL}. Download the Poba Express app now to order.`
              : `Closed right now — we open at ${nextChangeLabel}. We deliver food, cake and medicine across Jonai, ${DELIVERY_HOURS_LABEL}.`
            : waiting
              ? "The day is here. We're doing the last checks and opening ordering shortly — install the app now so you're ready the moment we do."
              : announced
                ? `Jonai's own delivery service is here. Ordering begins ${launchLabel} — browse the kitchens, bakeries and prices now, and install the app so you're ready.`
                : "We're getting our riders and partner kitchens ready. Browse the menu and prices now."}
        </p>

        {!launched && (
          <ul className="mx-auto mt-9 grid max-w-lg grid-cols-4 gap-2.5 sm:gap-4">
            {UNITS.map(({ key, label }) => (
              <li
                key={key}
                className="rounded-2xl border border-white/15 bg-white/10 px-2 py-4 backdrop-blur-sm sm:rounded-3xl sm:py-5"
              >
                <span
                  // Only the number is announced as it changes, not the label.
                  aria-live={key === "seconds" ? "off" : undefined}
                  className="block font-display text-2xl font-bold tabular-nums text-primary-foreground sm:text-4xl"
                >
                  {remaining ? pad(remaining[key]) : "--"}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-primary-foreground/70 sm:text-xs">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.5 }}
          className="mt-9 flex flex-wrap justify-center items-center gap-3"
        >
          <Button variant="onGreen" size="xl" asChild>
            <a href="#order">{launched && withinHours ? "Order Now" : "See the menu & prices"}</a>
          </Button>

          <Button variant="ghostOnGreen" size="xl" asChild>
            <a href="#partners">Partner With Us</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
