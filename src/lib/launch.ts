import { useEffect, useState } from "react";

/**
 * Launch date for Poba Express deliveries.
 *
 * Fixed to IST (+05:30) rather than the visitor's timezone, so everyone counts
 * down to the same moment. Change the time here to launch at a business hour
 * instead of midnight — for example `2026-08-14T09:00:00+05:30`.
 *
 * These two are the only place the date is written down; the countdown, the
 * order form, the sticky bar and the checkout all read them, so they can never
 * disagree about the day.
 */
export const LAUNCH_AT = new Date("2026-08-14T00:00:00+05:30");

/** Shown alongside the countdown. Must name the same day as `LAUNCH_AT`. */
export const LAUNCH_DATE_LABEL = "14 August 2026";

/**
 * Opens ordering now, whatever the date says. TEMPORARY — for testing the
 * order flow end to end before launch day.
 *
 * ⚠️ While this is `true` the deployed site takes real orders: the countdown
 * reads "We're live", the WhatsApp button sends, and checkout submits. Set it
 * back to `false` to hand control to `LAUNCH_AT` again — this line is the only
 * thing to change, because everything that asks whether we are open goes
 * through `timeUntilLaunch` below.
 */
const OPEN_FOR_TESTING = false;

export type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the launch moment has passed. */
  done: boolean;
};

/**
 * True once deliveries have started. Seeded from the same clock on the server
 * and the client so the first paint matches, then re-checked on a timer so a
 * tab left open across the launch moment updates itself.
 */
export function useLaunched(): boolean {
  const [launched, setLaunched] = useState(() => timeUntilLaunch().done);

  useEffect(() => {
    if (launched) return;
    const timer = setInterval(() => {
      if (timeUntilLaunch().done) setLaunched(true);
    }, 1000);
    return () => clearInterval(timer);
  }, [launched]);

  return launched;
}

export function timeUntilLaunch(now: number = Date.now()): Remaining {
  // The single choke point: every screen decides whether we are open by asking
  // this, so the testing override belongs here and nowhere else.
  if (OPEN_FOR_TESTING) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };

  const ms = LAUNCH_AT.getTime() - now;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };

  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  };
}
