/**
 * The moment the countdown points at — the first order Poba Express ever takes.
 *
 * Set to the hour the counter opens rather than the stroke of midnight, so the
 * countdown ends when someone can actually order rather than nine hours early.
 * See `service-hours`, which keeps that hour every day after this one.
 *
 * Fixed to IST (+05:30) rather than the visitor's timezone, so everyone counts
 * down to the same moment.
 *
 * This is when the countdown reaches zero — it is NOT when the shop opens.
 * Opening is `openNow`, set from the admin panel by someone who can see that
 * the kitchens are lit and a rider is awake. See `timeUntil`.
 *
 * These two are the only place the opening time is written down; the countdown,
 * the order form, the sticky bar and the checkout all read them, so they can
 * never disagree about it.
 */
export const LAUNCH_AT = new Date("2026-08-28T10:00:00+05:30");

/** Shown alongside the countdown. Must name the same moment as `LAUNCH_AT`. */
export const LAUNCH_DATE_LABEL = "28 August, 10 AM";

/**
 * The day Poba Express itself went public — the site, the app, the partner
 * list and the prices.
 *
 * Deliberately a different date from `LAUNCH_AT`, because these are two real
 * and separate events: the service was announced on the 27th, and the kitchens
 * start taking orders at 7 AM the next morning. Folding them into one date
 * would force a choice between claiming we deliver a day early and saying
 * nothing about the launch at all.
 */
export const ANNOUNCED_AT = new Date("2026-08-27T00:00:00+05:30");

const DAY_MS = 24 * 60 * 60 * 1000;

/** True once the service has been announced publicly. */
export function isAnnounced(now: number = Date.now()): boolean {
  return now >= ANNOUNCED_AT.getTime();
}

/**
 * True only during the calendar day of the announcement, in IST.
 *
 * Guards the word "today", which is the one part of the launch copy that stops
 * being true at midnight — and a page still saying "launched today" a week
 * later is exactly the stale-site signal the rest of this file avoids.
 */
export function isAnnouncementDay(now: number = Date.now()): boolean {
  const start = ANNOUNCED_AT.getTime();
  return now >= start && now < start + DAY_MS;
}

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
