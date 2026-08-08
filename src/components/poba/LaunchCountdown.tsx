import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PartyPopper, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LAUNCH_DATE_LABEL, timeUntilLaunch, type Remaining } from "@/lib/launch";

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
  const [remaining, setRemaining] = useState<Remaining | null>(() => {
    const now = timeUntilLaunch();
    return now.done ? now : null;
  });

  useEffect(() => {
    const tick = () => setRemaining(timeUntilLaunch());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const launched = remaining?.done ?? false;

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
          {launched ? <PartyPopper className="size-4" /> : <Rocket className="size-4" />}
          {launched ? "We're live" : "Launching soon"}
        </span>

        <h2 className="mt-5 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
          {launched ? (
            <>
              Poba Express is <span className="text-accent-light">now delivering</span>
            </>
          ) : (
            <>
              Deliveries begin <span className="text-accent-light">{LAUNCH_DATE_LABEL}</span>
            </>
          )}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
          {launched
            ? "Food, cake and medicine delivered across Jonai. Place your order on WhatsApp — no app, no signup."
            : "We're getting our riders and partner kitchens ready. Browse the menu and prices now — ordering switches on by itself that morning."}
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
          className="mt-9 flex flex-wrap justify-center gap-3"
        >
          <Button variant="onGreen" size="xl" asChild>
            <a href="#order">{launched ? "Order Now" : "See the menu & prices"}</a>
          </Button>
          <Button variant="ghostOnGreen" size="xl" asChild>
            <a href="#partners">Partner With Us</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
