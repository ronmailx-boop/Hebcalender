export const DOW_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
export const DOW_LABELS_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
export const MONTH_LABELS_GREG = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

/** "תחילת הצום: 05:09" -> "תחילת הצום" — strips the trailing ": HH:MM" hebcal appends to generic timed-event renders. */
export function stripTrailingTime(rendered: string): string {
  return rendered.replace(/:\s*\d{1,2}:\d{2}\s*$/, "").trim();
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
