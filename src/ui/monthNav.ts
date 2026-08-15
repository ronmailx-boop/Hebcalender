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
