import { describe, it, expect } from "vitest";
import { flags } from "@hebcal/core";
import { classifyDay, isChagTimedEvent } from "../src/lib/dayType";

describe("classifyDay", () => {
  it("classifies Yom Kippur (CHAG + MAJOR_FAST) as chag, per product decision", () => {
    const dayFlags = flags.CHAG | flags.YOM_TOV_ENDS | flags.MAJOR_FAST;
    expect(classifyDay(dayFlags, 1)).toBe("chag");
  });

  it("classifies a pure fast day (Tzom Gedaliah) as fast", () => {
    expect(classifyDay(flags.MINOR_FAST, 1)).toBe("fast");
  });

  it("classifies Erev [chag] candle-lighting day as chag even without the CHAG flag itself", () => {
    const dayFlags = flags.LIGHT_CANDLES | flags.EREV | flags.IL_ONLY;
    expect(classifyDay(dayFlags, 5)).toBe("chag");
  });

  it("classifies Chol HaMoed as cholhamoed", () => {
    expect(classifyDay(flags.IL_ONLY | flags.CHOL_HAMOED, 2)).toBe("cholhamoed");
  });

  it("classifies a plain Friday/Saturday with no other flags as shabbat", () => {
    expect(classifyDay(flags.LIGHT_CANDLES, 5)).toBe("shabbat"); // Friday
    expect(classifyDay(flags.LIGHT_CANDLES_TZEIS, 6)).toBe("shabbat"); // Saturday
  });

  it("does not let a Special Shabbat name override the shabbat classification", () => {
    const dayFlags = flags.SPECIAL_SHABBAT;
    expect(classifyDay(dayFlags, 6)).toBe("shabbat");
  });

  it("classifies minor holidays (Chanukah, Purim, Tu BiShvat, Rosh Chodesh) as minor", () => {
    expect(classifyDay(flags.MINOR_HOLIDAY, 2)).toBe("minor");
    expect(classifyDay(flags.MODERN_HOLIDAY, 3)).toBe("minor");
    expect(classifyDay(flags.ROSH_CHODESH, 4)).toBe("minor");
    expect(classifyDay(flags.CHANUKAH_CANDLES | flags.MINOR_HOLIDAY, 0)).toBe("minor");
  });

  it("classifies an ordinary weekday with no events as plain", () => {
    expect(classifyDay(0, 2)).toBe("plain");
  });
});

describe("isChagTimedEvent", () => {
  it("is true when the timed event carries CHAG or EREV", () => {
    expect(isChagTimedEvent(flags.CHAG | flags.YOM_TOV_ENDS)).toBe(true);
    expect(isChagTimedEvent(flags.LIGHT_CANDLES | flags.EREV)).toBe(true);
  });

  it("is false for a plain Shabbat candle-lighting/havdalah", () => {
    expect(isChagTimedEvent(flags.LIGHT_CANDLES)).toBe(false);
    expect(isChagTimedEvent(flags.LIGHT_CANDLES_TZEIS)).toBe(false);
  });
});
