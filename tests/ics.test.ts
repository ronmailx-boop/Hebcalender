import { describe, it, expect } from "vitest";
import { getEventsInRange } from "../src/lib/hebcal";
import { eventsToIcs } from "../src/lib/ics";

const OPTS = { calName: "לוח החגים — ישראל", tzid: "Asia/Jerusalem", uidDomain: "example.test" };

function build() {
  const events = getEventsInRange(new Date(2026, 8, 1), new Date(2026, 9, 10));
  return eventsToIcs(events, OPTS);
}

describe("eventsToIcs", () => {
  it("wraps the calendar and uses CRLF line endings", () => {
    const ics = build();
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics.includes("\n") && !ics.includes("\r\n")).toBe(false);
  });

  it("has balanced BEGIN:VEVENT / END:VEVENT pairs", () => {
    const ics = build();
    const begins = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    const ends = (ics.match(/END:VEVENT/g) ?? []).length;
    expect(begins).toBeGreaterThan(0);
    expect(begins).toBe(ends);
  });

  it("never emits a physical line longer than 75 octets", () => {
    const ics = build();
    const lines = ics.split("\r\n");
    const encoder = new TextEncoder();
    for (const line of lines) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("gives every VEVENT a UID, DTSTAMP, DTSTART and SUMMARY", () => {
    const ics = build();
    // Unfold continuation lines before splitting into events, since a folded
    // SUMMARY/UID can legitimately span multiple physical lines.
    const unfolded = ics.replace(/\r\n /g, "");
    const veventBlocks = unfolded.split("BEGIN:VEVENT").slice(1);
    expect(veventBlocks.length).toBeGreaterThan(0);
    for (const block of veventBlocks) {
      expect(block).toMatch(/UID:\S+/);
      expect(block).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
      expect(block).toMatch(/DTSTART/);
      expect(block).toMatch(/SUMMARY:/);
    }
  });

  it("produces stable UIDs across independent runs for the same event set", () => {
    const icsA = build();
    const icsB = build();
    const unfold = (s: string) => s.replace(/\r\n /g, "");
    const uidsA = [...unfold(icsA).matchAll(/UID:(\S+)/g)].map((m) => m[1]);
    const uidsB = [...unfold(icsB).matchAll(/UID:(\S+)/g)].map((m) => m[1]);
    expect(uidsA).toEqual(uidsB);
    expect(new Set(uidsA).size).toBe(uidsA.length);
  });
});
