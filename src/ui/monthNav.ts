export function prevMonth(year: number, gregMonth: number): { year: number; gregMonth: number } {
  return gregMonth === 0 ? { year: year - 1, gregMonth: 11 } : { year, gregMonth: gregMonth - 1 };
}

export function nextMonth(year: number, gregMonth: number): { year: number; gregMonth: number } {
  return gregMonth === 11 ? { year: year + 1, gregMonth: 0 } : { year, gregMonth: gregMonth + 1 };
}

/**
 * In this RTL layout, time reads right-to-left like the page's text, so the
 * visual "forward" direction is left, not right — ArrowRight steps to the
 * previous month, ArrowLeft to the next. Returns null for any other key.
 */
export function arrowKeyToStep(key: string): "prev" | "next" | null {
  if (key === "ArrowRight") return "prev";
  if (key === "ArrowLeft") return "next";
  return null;
}

const SWIPE_MIN_DISTANCE = 45;
/** Vertical drift allowed before a gesture stops counting as a horizontal swipe. */
const SWIPE_MAX_VERTICAL_RATIO = 0.6;

/**
 * Classifies a touch gesture's total movement as a month-changing swipe.
 * Same RTL convention as arrowKeyToStep: a swipe to the right (finger moves
 * toward positive X, deltaX > 0) is "backward" in reading direction → prev
 * month; a swipe left → next month. Returns null for taps, vertical scrolls,
 * or anything below the minimum horizontal distance.
 */
export function detectSwipeDirection(deltaX: number, deltaY: number): "prev" | "next" | null {
  if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE) return null;
  if (Math.abs(deltaY) > Math.abs(deltaX) * SWIPE_MAX_VERTICAL_RATIO) return null;
  return deltaX > 0 ? "prev" : "next";
}
