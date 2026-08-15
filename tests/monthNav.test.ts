import { describe, it, expect } from "vitest";
import { prevMonth, nextMonth, arrowKeyToStep, detectSwipeDirection } from "../src/ui/monthNav";

describe("prevMonth / nextMonth", () => {
  it("wraps across year boundaries", () => {
    expect(prevMonth(2026, 0)).toEqual({ year: 2025, gregMonth: 11 });
    expect(nextMonth(2026, 11)).toEqual({ year: 2027, gregMonth: 0 });
  });

  it("steps within a year otherwise", () => {
    expect(prevMonth(2026, 5)).toEqual({ year: 2026, gregMonth: 4 });
    expect(nextMonth(2026, 5)).toEqual({ year: 2026, gregMonth: 6 });
  });
});

describe("arrowKeyToStep", () => {
  it("maps ArrowRight to prev and ArrowLeft to next (RTL reading direction)", () => {
    expect(arrowKeyToStep("ArrowRight")).toBe("prev");
    expect(arrowKeyToStep("ArrowLeft")).toBe("next");
  });

  it("ignores unrelated keys", () => {
    expect(arrowKeyToStep("ArrowUp")).toBeNull();
    expect(arrowKeyToStep("Enter")).toBeNull();
  });
});

describe("detectSwipeDirection", () => {
  it("maps a rightward swipe to prev and leftward to next, matching arrow-key convention", () => {
    expect(detectSwipeDirection(80, 0)).toBe("prev");
    expect(detectSwipeDirection(-80, 0)).toBe("next");
  });

  it("ignores a swipe shorter than the minimum distance", () => {
    expect(detectSwipeDirection(20, 0)).toBeNull();
    expect(detectSwipeDirection(-20, 0)).toBeNull();
  });

  it("ignores a drag that's mostly vertical (a page scroll, not a swipe)", () => {
    expect(detectSwipeDirection(50, 60)).toBeNull();
    expect(detectSwipeDirection(-50, -60)).toBeNull();
  });

  it("still registers a horizontal swipe with a little vertical drift", () => {
    expect(detectSwipeDirection(80, 20)).toBe("prev");
  });

  it("treats a near-stationary tap as no swipe", () => {
    expect(detectSwipeDirection(2, 1)).toBeNull();
  });
});
