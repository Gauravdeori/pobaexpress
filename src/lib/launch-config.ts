/**
 * The day the countdown points at.
 *
 * Fixed to IST (+05:30) rather than the visitor's timezone, so everyone counts
 * down to the same moment.
 *
 * This is when the countdown reaches zero — it is NOT when the shop opens.
 * Opening is `openNow`, set from the admin panel by someone who can see that
 * the kitchens are lit and a rider is awake. See `timeUntil`.
 *
 * These two are the only place the date is written down; the countdown, the
 * order form, the sticky bar and the checkout all read them, so they can never
 * disagree about the day.
 */
export const LAUNCH_AT = new Date("2026-08-27T00:00:00+05:30");

/** Shown alongside the countdown. Must name the same day as `LAUNCH_AT`. */
export const LAUNCH_DATE_LABEL = "27 August 2026";

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
export const OPEN_FOR_TESTING = false;

/**
 * What the shop can change from the admin panel.
 *
 * Declared here, with the constants, so the pure clock below has no reason to
 * import Firestore — and can therefore be checked without one.
 */
export type LaunchSettings = {
  /**
   * Whether the shop is open. True is the only thing that opens it.
   *
   * Null means "not decided yet": the countdown runs, and when it reaches zero
   * the site waits rather than opening itself. False holds it shut regardless.
   */
  openNow: boolean | null;
  /** Milliseconds since epoch. */
  launchAt: number;
  /** What the countdown prints. Must name the same day as `launchAt`. */
  label: string;
};

/** The build's own answer, and the fallback when nothing has been saved. */
export const DEFAULT_LAUNCH: LaunchSettings = {
  openNow: null,
  launchAt: LAUNCH_AT.getTime(),
  label: LAUNCH_DATE_LABEL,
};

export type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once we are actually open for orders. */
  done: boolean;
  /**
   * The countdown has run out, but nobody has opened the shop yet.
   *
   * The date is a promise to customers, not a trigger. Reaching it at midnight
   * with no rider awake and no kitchen lit would take real orders nobody is
   * cooking for, so the clock only ever finishes counting — going live is a
   * button someone presses when the shop is genuinely ready.
   */
  awaitingGoLive: boolean;
};

/**
 * How long until we open, given whatever the admin panel last said.
 *
 * Pure, and takes the settings rather than reading them, so the countdown, the
 * order gate and the admin's own preview all agree — and so this can be
 * checked without a database.
 */
export function timeUntil(settings: LaunchSettings, now: number = Date.now()): Remaining {
  const OPEN = { days: 0, hours: 0, minutes: 0, seconds: 0, done: true, awaitingGoLive: false };
  const CLOSED = { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, awaitingGoLive: false };

  // The build-time escape hatch still wins, because it exists for testing a
  // build in isolation and must not depend on anything over the network.
  if (OPEN_FOR_TESTING) return OPEN;

  // Going live is a decision, and this is the only thing that makes it. The
  // date below moves the countdown, never the switch.
  if (settings.openNow === true) return OPEN;
  if (settings.openNow === false) return CLOSED;

  const ms = settings.launchAt - now;
  if (ms <= 0) {
    // Counted all the way down and still nobody has opened the shop. Closed,
    // and saying so — this used to open by itself at midnight, which is how a
    // service starts taking orders while everyone who could cook them is
    // asleep.
    return { ...CLOSED, awaitingGoLive: true };
  }

  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
    awaitingGoLive: false,
  };
}
