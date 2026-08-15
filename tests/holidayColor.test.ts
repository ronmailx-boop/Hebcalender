import { describe, it, expect } from "vitest";
import { getHolidayColor } from "../src/lib/holidayColor";

describe("getHolidayColor", () => {
  it("gives Shabbat a fixed color regardless of basename", () => {
    expect(getHolidayColor(null, "shabbat")).toBe(getHolidayColor("Some Special Shabbat Name", "shabbat"));
    expect(getHolidayColor(null, "shabbat")).not.toBeNull();
  });

  it("gives distinct named holidays distinct colors", () => {
    const rh = getHolidayColor("Rosh Hashana", "chag");
    const yk = getHolidayColor("Yom Kippur", "chag");
    const sukkot = getHolidayColor("Sukkot", "chag");
    const shminiAtzeret = getHolidayColor("Shmini Atzeret", "chag");
    const colors = [rh, yk, sukkot, shminiAtzeret];
    expect(new Set(colors).size).toBe(colors.length);
    for (const c of colors) expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("gives distinct fast days distinct colors", () => {
    const tzomGedaliah = getHolidayColor("Tzom Gedaliah", "fast");
    const asaraBTevet = getHolidayColor("Asara B'Tevet", "fast");
    const tishaBav = getHolidayColor("Tish'a B'Av", "fast");
    expect(new Set([tzomGedaliah, asaraBTevet, tishaBav]).size).toBe(3);
  });

  it("falls back to a per-category color for an unnamed/unmapped holiday", () => {
    expect(getHolidayColor("Ben-Gurion Day", "minor")).not.toBeNull();
    expect(getHolidayColor("Some Future Holiday hebcal Might Add", "chag")).not.toBeNull();
  });

  it("returns null for a plain weekday", () => {
    expect(getHolidayColor(null, "plain")).toBeNull();
  });
});
