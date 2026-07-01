import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface DateRange {
  from: string;
  to: string;
}

/**
 * The app's fixed timezone — Nicaragua (UTC-6, no daylight saving).
 * All "current date" calculations use this so a server running in UTC
 * shows the correct month for the user.
 */
export const APP_TIMEZONE = "America/Managua";

/**
 * Returns a Date whose UTC fields mirror the local wall-clock time in
 * APP_TIMEZONE.  date-fns operates on UTC internally, so passing this
 * value to startOfMonth / endOfMonth / format gives results that
 * correspond to the correct local date rather than the server's UTC date.
 */
export function getLocalNow(timeZone: string = APP_TIMEZONE): Date {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  // Build a Date using Date.UTC so JS doesn't apply its own local-offset.
  return new Date(
    Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  );
}

export function getCurrentMonthRange(): DateRange {
  const now = getLocalNow();
  return {
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export interface MonthBucket extends DateRange {
  /** Short month label, e.g. "jun" */
  short: string;
}

export function getLastNMonths(n: number): MonthBucket[] {
  const now = getLocalNow();
  return Array.from({ length: n }, (_, i) => {
    const d = subMonths(now, n - 1 - i);
    return {
      short: format(d, "MMM"),
      from: format(startOfMonth(d), "yyyy-MM-dd"),
      to: format(endOfMonth(d), "yyyy-MM-dd"),
    };
  });
}
