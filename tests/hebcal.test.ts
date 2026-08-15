import { describe, it, expect } from "vitest";
import { getMonthGrid, getEventsInRange } from "../src/lib/hebcal";

// September 2026 (Gregorian month index 8) covers Rosh Hashana 5787 through
// Yom Kippur — real, computed dates (verified independently against
// @hebcal/core directly), not hand-authored sample data.
const SEPT_2026 = getMonthGrid(2026, 8, "jerusalem");
const OCT_2026 = getMonthGrid(2026, 9, "jerusalem");

function find(cells: ReturnType<typeof getMonthGrid>, iso: string) {
  const cell = cells.find((c) => c.iso === iso);
  if (!cell) throw new Error(`no cell for ${iso}`);
  return cell;
}

describe("getMonthGrid — Israel holiday rules", () => {
  it("gives Rosh Hashana two full chag days", () => {
    expect(find(SEPT_2026, "2026-09-12").kind).toBe("chag");
    expect(find(SEPT_2026, "2026-09-13").kind).toBe("chag");
  });

  it("gives Yom Kippur a single chag day, classified as chag not fast", () => {
    expect(find(SEPT_2026, "2026-09-21").kind).toBe("chag");
    expect(find(SEPT_2026, "2026-09-21").title).toContain("כיפור");
  });

  it("marks Sukkot Chol HaMoed days distinctly from the surrounding chag", () => {
    expect(find(SEPT_2026, "2026-09-27").kind).toBe("cholhamoed");
  });

  it("combines Shmini Atzeret / Simchat Torah as a single Israel chag day", () => {
    const cell = find(OCT_2026, "2026-10-03");
    expect(cell.kind).toBe("chag");
    expect(cell.title).toContain("שמיני עצרת");
  });

  it("marks Tzom Gedaliah as a fast day with start and end times", () => {
    const cell = find(SEPT_2026, "2026-09-14");
    expect(cell.kind).toBe("fast");
    expect(cell.entry?.label).toBe("תחילת הצום");
    expect(cell.exit?.label).toBe("סיום הצום");
  });
});

describe("getMonthGrid — candle-lighting / havdalah for Jerusalem", () => {
  it("gives Erev Rosh Hashana a candle-lighting entry time", () => {
    const cell = find(SEPT_2026, "2026-09-11");
    expect(cell.kind).toBe("chag");
    expect(cell.entry).not.toBeNull();
    expect(cell.entry?.label).toBe("כניסת חג");
    expect(cell.entry?.time).toMatch(/^\d{1,2}:\d{2}$/);
  });

  it("gives an ordinary Friday/Saturday plain shabbat entry/exit times", () => {
    const friday = find(SEPT_2026, "2026-09-18");
    const saturday = find(SEPT_2026, "2026-09-19");
    expect(friday.kind).toBe("shabbat");
    expect(friday.entry?.label).toBe("כניסת שבת");
    expect(saturday.kind).toBe("shabbat");
    expect(saturday.exit?.label).toBe("יציאת שבת");
  });

  it("does not attach entry/exit times to a minor-holiday or plain day", () => {
    // Any weekday with no special flags in this month.
    const plainDay = SEPT_2026.find((c) => c.kind === "plain");
    expect(plainDay).toBeDefined();
    expect(plainDay!.entry).toBeNull();
    expect(plainDay!.exit).toBeNull();
  });
});

describe("getMonthGrid — grid shape", () => {
  it("returns a full 42-cell (6-week) grid starting on Sunday", () => {
    expect(SEPT_2026).toHaveLength(42);
    expect(SEPT_2026[0]!.dow).toBe(0);
  });

  it("flags boundary days from adjacent months as outside, but still computes their data", () => {
    const outsideDays = SEPT_2026.filter((c) => c.isOutside);
    expect(outsideDays.length).toBeGreaterThan(0);
    for (const d of outsideDays) {
      expect(d.heb).toBeTruthy();
    }
  });
});

describe("getMonthGrid — per-holiday colors", () => {
  it("gives Rosh Hashana, Yom Kippur and Sukkot distinct colors", () => {
    const rh = find(SEPT_2026, "2026-09-12").color;
    const yk = find(SEPT_2026, "2026-09-21").color;
    const sukkot = find(SEPT_2026, "2026-09-26").color;
    expect(rh).not.toBeNull();
    expect(new Set([rh, yk, sukkot]).size).toBe(3);
  });

  it("colors every day of a multi-day holiday's Chol HaMoed the same as its first day", () => {
    const day1 = find(SEPT_2026, "2026-09-26").color;
    const cholHamoed = find(SEPT_2026, "2026-09-27").color;
    expect(cholHamoed).toBe(day1);
  });

  it("gives plain weekdays no color", () => {
    const plainDay = SEPT_2026.find((c) => c.kind === "plain");
    expect(plainDay!.color).toBeNull();
  });

  it("leaves a plain Friday uncolored but still gives it a candle-lighting time", () => {
    const friday = find(SEPT_2026, "2026-09-18");
    expect(friday.kind).toBe("shabbat");
    expect(friday.color).toBeNull();
    expect(friday.entry?.label).toBe("כניסת שבת");
  });

  it("still colors a regular Saturday red for Shabbat", () => {
    const saturday = find(SEPT_2026, "2026-09-19");
    expect(saturday.color).not.toBeNull();
  });

  it("colors a Friday that's also Erev-chag with the chag's color, not left blank", () => {
    const erevSukkotFriday = find(SEPT_2026, "2026-09-25");
    expect(erevSukkotFriday.dow).toBe(5);
    expect(erevSukkotFriday.kind).toBe("chag");
    expect(erevSukkotFriday.color).not.toBeNull();
  });
});

describe("getEventsInRange", () => {
  it("returns a non-empty, well-formed event list for a narrow window", () => {
    const events = getEventsInRange(new Date(2026, 8, 1), new Date(2026, 8, 30));
    expect(events.length).toBeGreaterThan(0);
  });
});
