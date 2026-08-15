import {
  HebrewCalendar,
  HDate,
  Location,
  Event as HebcalEvent,
  CandleLightingEvent,
  HavdalahEvent,
  TimedEvent,
} from "@hebcal/core";
import { LOCATIONS, DEFAULT_LOCATION_KEY, type LocationConfig } from "../config";
import { classifyDay, isChagTimedEvent, type DayKind } from "./dayType";
import { isoDate, stripTrailingTime } from "./format";
import { getHolidayColor } from "./holidayColor";

export interface TimeEntry {
  label: string;
  time: string;
}

export interface DayCell {
  iso: string;
  date: Date;
  dnum: number;
  dow: number;
  isOutside: boolean;
  heb: string;
  kind: DayKind;
  title: string | null;
  /** Solid per-holiday badge color (e.g. Sukkot vs. Chanukah get different colors), null for a plain day. */
  color: string | null;
  entry: TimeEntry | null;
  exit: TimeEntry | null;
}

const locationCache = new Map<string, Location>();

function resolveLocation(cfg: LocationConfig): Location {
  const cached = locationCache.get(cfg.lookupName);
  if (cached) return cached;
  const found = Location.lookup(cfg.lookupName);
  const loc = found ?? new Location(cfg.lat, cfg.lon, true, cfg.tzid, cfg.label);
  locationCache.set(cfg.lookupName, loc);
  return loc;
}

/** Only entry/exit-bearing badge types show candle-lighting/havdalah/fast times. */
const TIMED_KINDS: DayKind[] = ["shabbat", "chag", "fast"];

function buildCell(date: Date, gregMonth: number, events: HebcalEvent[]): DayCell {
  const dow = date.getDay();
  let dayFlags = 0;
  for (const ev of events) dayFlags |= ev.getFlags();
  const kind = classifyDay(dayFlags, dow);

  let title: string | null = null;
  let entry: TimeEntry | null = null;
  let exit: TimeEntry | null = null;

  const titleEvent = events.find((ev) => !(ev instanceof TimedEvent));
  if (titleEvent) title = titleEvent.render("he-x-nonikud");
  else if (kind === "shabbat") title = "שבת";

  // Friday only carries candle-lighting into Shabbat, not Shabbat itself — leave it
  // uncolored unless a chag/fast/Chol HaMoed already claimed the day (classifyDay's
  // precedence means those cases already have kind !== "shabbat" here).
  const isPlainFriday = kind === "shabbat" && dow === 5;
  const color = isPlainFriday ? null : getHolidayColor(titleEvent ? titleEvent.basename() : null, kind);

  if (TIMED_KINDS.includes(kind)) {
    for (const ev of events) {
      if (ev instanceof CandleLightingEvent) {
        entry = { label: kind === "chag" ? "כניסת חג" : "כניסת שבת", time: String(ev.eventTimeStr) };
      } else if (ev instanceof HavdalahEvent) {
        exit = {
          label: isChagTimedEvent(ev.getFlags()) ? "יציאת חג" : "יציאת שבת",
          time: String(ev.eventTimeStr),
        };
      } else if (ev instanceof TimedEvent) {
        const label = stripTrailingTime(ev.render("he-x-nonikud"));
        if (ev.basename() === "Fast begins") entry = { label, time: String(ev.eventTimeStr) };
        else if (ev.basename() === "Fast ends") exit = { label, time: String(ev.eventTimeStr) };
      }
    }
  }

  return {
    iso: isoDate(date),
    date,
    dnum: date.getDate(),
    dow,
    isOutside: date.getMonth() !== gregMonth,
    heb: new HDate(date).renderGematriya(true),
    kind,
    title,
    color,
    entry,
    exit,
  };
}

const gridCache = new Map<string, DayCell[]>();

/**
 * Full 6-week (42 day) grid covering `gregMonth` (0-indexed) padded with
 * adjacent-month days, so boundary events (e.g. candle-lighting on the last
 * cell of a row that belongs to next month) are never missing data.
 */
export function getMonthGrid(
  year: number,
  gregMonth: number,
  locationKey: string = DEFAULT_LOCATION_KEY,
): DayCell[] {
  const cacheKey = `${year}-${gregMonth}-${locationKey}`;
  const cached = gridCache.get(cacheKey);
  if (cached) return cached;

  const cfg = LOCATIONS[locationKey] ?? LOCATIONS[DEFAULT_LOCATION_KEY]!;
  const location = resolveLocation(cfg);

  const firstOfMonth = new Date(year, gregMonth, 1);
  const gridStart = new Date(year, gregMonth, 1 - firstOfMonth.getDay());
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + 41);

  const events = HebrewCalendar.calendar({
    start: gridStart,
    end: gridEnd,
    il: true,
    location,
    candlelighting: true,
    candleLightingMins: cfg.candleLightingMins,
    havdalahMins: cfg.havdalahMins,
  });

  const byDate = new Map<string, HebcalEvent[]>();
  for (const ev of events) {
    const key = isoDate(ev.getDate().greg());
    const list = byDate.get(key);
    if (list) list.push(ev);
    else byDate.set(key, [ev]);
  }

  const cells: DayCell[] = [];
  const cursor = new Date(gridStart);
  for (let i = 0; i < 42; i++) {
    const dayEvents = byDate.get(isoDate(cursor)) ?? [];
    cells.push(buildCell(new Date(cursor), gregMonth, dayEvents));
    cursor.setDate(cursor.getDate() + 1);
  }

  gridCache.set(cacheKey, cells);
  return cells;
}

/** All events in a Gregorian date range, for ICS export — unfiltered, includes every category hebcal produces for Israel. */
export function getEventsInRange(start: Date, end: Date, locationKey: string = DEFAULT_LOCATION_KEY): HebcalEvent[] {
  const cfg = LOCATIONS[locationKey] ?? LOCATIONS[DEFAULT_LOCATION_KEY]!;
  const location = resolveLocation(cfg);
  return HebrewCalendar.calendar({
    start,
    end,
    il: true,
    location,
    candlelighting: true,
    candleLightingMins: cfg.candleLightingMins,
    havdalahMins: cfg.havdalahMins,
  });
}
