import { useEffect, useState } from "react";

import {
  DEFAULT_LAUNCH,
  isAnnounced,
  OPEN_FOR_TESTING,
  isAnnouncementDay,
  timeUntil,
  type Remaining,
} from "./launch-config";
import { HOURS_LABEL, serviceHours, type ServiceHours } from "./service-hours";
import { useLaunchSettings } from "./settings";

export {
  HOURS_LABEL,
  OPEN_HOUR,
  CLOSE_HOUR,
  serviceHours,
  type ServiceHours,
} from "./service-hours";

export {
  ANNOUNCED_AT,
  DEFAULT_LAUNCH,
  isAnnounced,
  isAnnouncementDay,
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

/**
 * Whether Poba Express has been announced, and whether that happened today.
 *
 * Both are read off the clock, so both are seeded from the first render and
 * corrected in an effect — the same shape as `useLaunched`, and for the same
 * reason: the server and the client must agree about the first paint even when
 * it is rendered either side of IST midnight.
 */
export function useAnnouncement(): { announced: boolean; today: boolean } {
  const [state, setState] = useState(() => ({
    announced: isAnnounced(),
    today: isAnnouncementDay(),
  }));

  useEffect(() => {
    const check = () => setState({ announced: isAnnounced(), today: isAnnouncementDay() });
    check();
    // Once a minute is enough: the only thing that changes here is the word
    // "today", and it changes at midnight.
    const timer = setInterval(check, 60_000);
    return () => clearInterval(timer);
  }, []);

  return state;
}

/**
 * Today's opening hours, ticking.
 *
 * Coarse on purpose — `open` and the hour it next changes, and no live
 * countdown to either. A minute counter would render one number on the server
 * and a different one a moment later in the browser, which React reports as a
 * hydration mismatch; and a shop's hours are something people want stated
 * plainly, not timed to the second.
 */
export function useServiceHours(): ServiceHours {
  const [hours, setHours] = useState(() => serviceHours());

  useEffect(() => {
    const check = () => setHours(serviceHours());
    check();
    // The boundary is a whole hour, so a check every half minute closes the
    // counter within thirty seconds of 11 PM without spinning.
    const timer = setInterval(check, 30_000);
    return () => clearInterval(timer);
  }, []);

  return hours;
}

export type OrderStatus = {
  /** The service has started at all. A one-off, decided on launch day. */
  launched: boolean;
  /** Inside today's delivery hours. */
  withinHours: boolean;
  /** The only thing that should ever enable an order button. */
  canOrder: boolean;
  /** The launch date as the admin panel words it, for copy that names the day. */
  label: string;
  /**
   * Why not, ready to print on the disabled button — null when orders are
   * being taken.
   *
   * Written here rather than at each call site so the order form, the checkout
   * and the sticky bar cannot drift into giving three different reasons for
   * the same shut door.
   */
  reason: string | null;
};

/**
 * Whether an order can be placed right now, and what to say if it cannot.
 *
 * Two gates, in order: the service has to have launched, and it has to be
 * inside the day's hours. They are asked separately because the answers read
 * completely differently — "ordering opens 28 August" is the right thing to
 * say in July and a badly stale one at two in the morning in December.
 */
export function useOrderStatus(): OrderStatus {
  const launched = useLaunched();
  const { open, nextChangeLabel } = useServiceHours();
  const label = useLaunchSettings().label;

  // The build-time escape hatch opens the hours too. It exists to walk the
  // order flow end to end, and half of that flow is unreachable at midnight.
  const withinHours = open || OPEN_FOR_TESTING;

  if (!launched) {
    return {
      launched,
      withinHours,
      canOrder: false,
      label,
      reason: `Ordering opens ${label}`,
    };
  }

  if (!withinHours) {
    return {
      launched,
      withinHours,
      canOrder: false,
      label,
      reason: `Closed — we open at ${nextChangeLabel}`,
    };
  }

  return { launched, withinHours, canOrder: true, label, reason: null };
}

/** The hours, for anywhere that just wants to print them. */
export const DELIVERY_HOURS_LABEL = HOURS_LABEL;

/** Kept for callers that only want the date the code was built with. */
export function timeUntilLaunch(now: number = Date.now()): Remaining {
  return timeUntil(DEFAULT_LAUNCH, now);
}
