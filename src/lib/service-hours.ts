/**
 * The hours Poba Express takes orders, every day.
 *
 * Separate from `launch-config`, which answers whether the service has started
 * at all — a one-off, decided once. This is the daily rhythm that outlives it:
 * riders start at 10 in the morning and the counter shuts at 11 at night, and
 * no order can be placed either side of that. Keeping the two apart is what
 * lets the site say "opens at 10 AM" at two in the morning instead of falling
 * back to the launch date, which is by then months in the past.
 *
 * Fixed to IST, like the launch clock, so the hours are the shop's rather than
 * the visitor's — someone opening the site from another timezone is told when
 * the kitchens in Jonai are actually cooking.
 */

/** First order of the day. */
export const OPEN_HOUR = 10;

/** Last. Orders are refused from this hour onward. */
export const CLOSE_HOUR = 23;

/** IST is UTC+05:30 all year — there is no daylight saving to track. */
const IST_OFFSET_MINUTES = 330;

const MINUTES_PER_DAY = 24 * 60;

/** "10 AM", "11 PM" — hours as they are said, not as they are stored. */
export function hourLabel(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve} ${suffix}`;
}

/** What the site prints when it names the window. */
export const HOURS_LABEL = `${hourLabel(OPEN_HOUR)} – ${hourLabel(CLOSE_HOUR)}`;

export type ServiceHours = {
  /** True while orders can be taken. The only thing that should open a button. */
  open: boolean;
  /**
   * The hour it next changes, already written out — "10 AM" while shut, "11 PM"
   * while open. Deliberately not a live countdown: the server and the client
   * would render different minutes and React would call it a hydration
   * mismatch, and a shop's hours are a fact people want stated, not timed.
   */
  nextChangeLabel: string;
};

/** Minutes since midnight in Jonai, whatever clock the visitor is on. */
function istMinutesOfDay(now: number): number {
  return (Math.floor(now / 60_000) + IST_OFFSET_MINUTES) % MINUTES_PER_DAY;
}

/**
 * Whether the counter is open at `now`.
 *
 * Pure and takes the time, so the order gate, the banner and the hours chip
 * all agree, and so this can be checked without waiting for 11 PM.
 */
export function serviceHours(now: number = Date.now()): ServiceHours {
  const minutes = istMinutesOfDay(now);
  const open = minutes >= OPEN_HOUR * 60 && minutes < CLOSE_HOUR * 60;
  return { open, nextChangeLabel: hourLabel(open ? CLOSE_HOUR : OPEN_HOUR) };
}
