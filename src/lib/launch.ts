import { useEffect, useState } from "react";

/**
 * Launch date for Poba Express deliveries.
 *
 * Fixed to IST (+05:30) rather than the visitor's timezone, so everyone counts
 * down to the same moment. Change the time here to launch at a business hour
 * instead of midnight — for example `2026-08-07T09:00:00+05:30`.
 */
export const LAUNCH_AT = new Date("2026-08-07T00:00:00+05:30");

/** Shown alongside the countdown. */
export const LAUNCH_DATE_LABEL = "7 August 2026";

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
