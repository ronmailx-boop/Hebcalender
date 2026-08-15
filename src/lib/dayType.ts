import { flags } from "@hebcal/core";

export type DayKind = "plain" | "shabbat" | "chag" | "cholhamoed" | "fast" | "minor";

const MINOR_FLAGS =
  flags.MODERN_HOLIDAY | flags.MINOR_HOLIDAY | flags.ROSH_CHODESH | flags.CHANUKAH_CANDLES;

/**
 * Classifies a Gregorian calendar day into one badge category, given the
 * bitwise-OR of every hebcal event flag on that day. Order matters: Yom
 * Kippur carries both CHAG and MAJOR_FAST, and product decision is that it
 * displays as chag (gold), so CHAG is checked first.
 */
export function classifyDay(dayFlags: number, dow: number): DayKind {
  if (dayFlags & flags.CHAG) return "chag";
  if (dayFlags & (flags.MAJOR_FAST | flags.MINOR_FAST)) return "fast";
  // Candle-lighting into a holiday (e.g. "Erev Sukkot") lands on the Gregorian
  // day *before* the chag itself, so it never carries the CHAG flag directly.
  if (dayFlags & flags.LIGHT_CANDLES && dayFlags & flags.EREV) return "chag";
  if (dayFlags & flags.CHOL_HAMOED) return "cholhamoed";
  if (dow === 5 || dow === 6) return "shabbat";
  if (dayFlags & MINOR_FLAGS) return "minor";
  return "plain";
}

/** True if this specific candle-lighting/havdalah event marks a chag boundary rather than a plain Shabbat. */
export function isChagTimedEvent(eventFlags: number): boolean {
  return Boolean(eventFlags & (flags.CHAG | flags.EREV));
}
