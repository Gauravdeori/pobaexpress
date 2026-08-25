import { useEffect, useState } from "react";

import { DEFAULT_LAUNCH, timeUntil, type Remaining } from "./launch-config";
import { useLaunchSettings } from "./settings";

export {
  DEFAULT_LAUNCH,
  LAUNCH_AT,
  LAUNCH_DATE_LABEL,
  timeUntil,
  type LaunchSettings,
  type Remaining,
} from "./launch-config";

/** The countdown for the current settings, ticking. */
export function useTimeUntilLaunch(): { remaining: Remaining | null; label: string } {
  const settings = useLaunchSettings();
  const [remaining, setRemaining] = useState<Remaining | null>(() => {
    // Null while a clock is still running, so the server and the client cannot
    // disagree about the seconds. Once open there is nothing left to disagree
    // about, so it renders the real state on the server too.
    const now = timeUntil(settings);
    return now.done ? now : null;
  });

  useEffect(() => {
    const tick = () => setRemaining(timeUntil(settings));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [settings]);

  return { remaining, label: settings.label };
}

/**
 * True once deliveries have started.
 *
 * Seeded from the code's own constants so the first paint matches on the
 * server and the client, then corrected once the saved settings arrive. It can
 * only ever go from closed to open on that correction — never the reverse in a
 * way that would snatch away a button someone is already pressing.
 */
export function useLaunched(): boolean {
  const settings = useLaunchSettings();
  const [launched, setLaunched] = useState(() => timeUntil(DEFAULT_LAUNCH).done);

  useEffect(() => {
    const check = () => setLaunched(timeUntil(settings).done);
    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [settings]);

  return launched;
}

/** Kept for callers that only want the date the code was built with. */
export function timeUntilLaunch(now: number = Date.now()): Remaining {
  return timeUntil(DEFAULT_LAUNCH, now);
}
