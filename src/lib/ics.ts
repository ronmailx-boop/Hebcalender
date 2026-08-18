import { Event as HebcalEvent, TimedEvent } from "@hebcal/core";
import { isoDate, stripTrailingTime } from "./format";

export interface IcsOptions {
  calName: string;
  tzid: string;
  /** Domain used to build stable per-event UIDs. */
  uidDomain: string;
}

/** RFC5545 §3.3.11 TEXT escaping. */
function escapeText(s: string): string {
  return s.replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

function icsDateTime(d: Date, hh: number, mm: number): string {
  return `${icsDate(d)}T${pad2(hh)}${pad2(mm)}00`;
}

function icsUtcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  );
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Adds minutes to a HH:MM time-of-day on date `d`, rolling over midnight if needed. */
function addMinutesToTime(d: Date, hh: number, mm: number, deltaMin: number): { date: Date; hh: number; mm: number } {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm);
  base.setMinutes(base.getMinutes() + deltaMin);
  return { date: base, hh: base.getHours(), mm: base.getMinutes() };
}

/**
 * Folds a property line to RFC5545 §3.1's 75-octet limit (UTF-8 byte-safe —
 * Hebrew text is multi-byte, so folding must never split inside a character).
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) return line;
  const decoder = new TextDecoder();
  const parts: string[] = [];
  let start = 0;
  let first = true;
  while (start < bytes.length) {
    const limit = first ? 75 : 74;
    let end = Math.min(start + limit, bytes.length);
    while (end > start && (bytes[end]! & 0xc0) === 0x80) end--;
    parts.push(decoder.decode(bytes.slice(start, end)));
    start = end;
    first = false;
  }
  return parts.join("\r\n ");
}

/** Rolling window used for both the build-time feed and the on-demand download: recent past through a few years out. */
export function defaultIcsWindow(now: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear() + 3, now.getMonth(), 1);
  return { start, end };
}

/**
 * Serializes hebcal events into an RFC5545 ICS calendar. Pure/isomorphic —
 * no DOM, no filesystem — used by scripts/build-ics.ts (Node, build time)
 * to publish the static hebcal-israel.ics feed.
 */
export function eventsToIcs(events: HebcalEvent[], opts: IcsOptions): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${opts.uidDomain}//Luach HaChagim//HE`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(opts.calName)}`,
    `X-WR-TIMEZONE:${opts.tzid}`,
  ];

  const dtstamp = icsUtcStamp(new Date());

  for (const ev of events) {
    const d = ev.getDate().greg();
    const isTimed = ev instanceof TimedEvent;

    lines.push("BEGIN:VEVENT");

    if (isTimed) {
      const [hh, mm] = ev.eventTimeStr.split(":").map(Number) as [number, number];
      const summary = stripTrailingTime(ev.render("he-x-nonikud"));
      const uid = `${isoDate(d)}-${slug(ev.basename())}-${pad2(hh)}${pad2(mm)}@${opts.uidDomain}`;
      const end = addMinutesToTime(d, hh, mm, 15);
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;TZID=${opts.tzid}:${icsDateTime(d, hh, mm)}`);
      lines.push(`DTEND;TZID=${opts.tzid}:${icsDateTime(end.date, end.hh, end.mm)}`);
      lines.push(`SUMMARY:${escapeText(summary)}`);
    } else {
      const summary = ev.render("he-x-nonikud");
      const uid = `${isoDate(d)}-${slug(ev.basename())}@${opts.uidDomain}`;
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;VALUE=DATE:${icsDate(d)}`);
      lines.push(`DTEND;VALUE=DATE:${icsDate(addDays(d, 1))}`);
      lines.push(`SUMMARY:${escapeText(summary)}`);
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
