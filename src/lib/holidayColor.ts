import type { DayKind } from "./dayType";

/**
 * One solid, distinct color per named holiday/fast, keyed by hebcal's
 * `basename()` — which already collapses "Erev X", "X II", and "X (Chol
 * HaMoed)" down to the same family name (verified against @hebcal/core
 * directly, e.g. "Sukkot" covers Erev Sukkot through Hoshana Rabbah).
 * Colors are fixed hex values (not light/dark tokens): each is rendered as
 * a solid circle behind white text, so it carries its own contrast
 * regardless of the surrounding page theme — the same way a colored event
 * dot in a calendar app doesn't change with system theme.
 */
const HOLIDAY_COLORS: Record<string, string> = {
  "Rosh Hashana": "#C08A2E",
  "Yom Kippur": "#7A2340",
  Sukkot: "#C1662A",
  "Shmini Atzeret": "#7B4FA6",
  Chanukah: "#1C7293",
  "Tu BiShvat": "#2F6B46",
  Purim: "#C23B7A",
  "Shushan Purim": "#C23B7A",
  Pesach: "#6FA33F",
  Shavuot: "#A98F2E",
  "Yom HaAtzma'ut": "#1F6FEB",
  "Yom Yerushalayim": "#A8813C",
  "Yom HaZikaron": "#4A5568",
  "Yom HaShoah": "#3D3540",
  "Tzom Gedaliah": "#8A2A45",
  "Asara B'Tevet": "#7A3B3B",
  "Ta'anit Esther": "#9B4F6B",
  "Tzom Tammuz": "#6E4A6E",
  "Tish'a B'Av": "#3A1620",
};

const SHABBAT_COLOR = "#22587F";
const FALLBACK_BY_KIND: Record<DayKind, string | null> = {
  shabbat: SHABBAT_COLOR,
  chag: "#A4650E",
  cholhamoed: "#187767",
  fast: "#8A2A45",
  minor: "#5B4A8A",
  plain: null,
};

/**
 * Resolves the solid badge color for a day. `basename` is the title
 * event's hebcal basename (e.g. "Sukkot"); pass null for a plain weekday.
 * Falls back to a shared per-category color for holidays not individually
 * named above (e.g. Rosh Chodesh, Ben-Gurion Day) rather than leaving the
 * day uncolored.
 */
export function getHolidayColor(basename: string | null, kind: DayKind): string | null {
  if (kind === "shabbat") return SHABBAT_COLOR;
  if (basename && HOLIDAY_COLORS[basename]) return HOLIDAY_COLORS[basename];
  return FALLBACK_BY_KIND[kind];
}
