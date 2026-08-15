import type { DayKind } from "./dayType";

/**
 * One vivid, distinct background color per named holiday/fast, keyed by
 * hebcal's `basename()` — which already collapses "Erev X", "X II", and
 * "X (Chol HaMoed)" down to the same family name (verified against
 * @hebcal/core directly, e.g. "Sukkot" covers Erev Sukkot through Hoshana
 * Rabbah). Rendered as a solid full-cell background, so the whole day
 * square carries the color, not just a badge.
 *
 * Deliberately more subdued: Yom HaShoah, Yom HaZikaron and Tish'a B'Av —
 * these are the year's deepest mourning days, and a bright/celebratory
 * background would misrepresent them even though every other holiday here
 * is intentionally vivid.
 */
const HOLIDAY_COLORS: Record<string, string> = {
  "Rosh Hashana": "#F5A623",
  "Yom Kippur": "#B0225C",
  Sukkot: "#F2711C",
  "Shmini Atzeret": "#8E44E0",
  Chanukah: "#1E88E5",
  "Tu BiShvat": "#16A34A",
  Purim: "#EC4899",
  "Shushan Purim": "#EC4899",
  Pesach: "#65C640",
  Shavuot: "#F4D03F",
  "Yom HaAtzma'ut": "#1565C0",
  "Yom Yerushalayim": "#D4AF37",
  "Yom HaZikaron": "#45566B",
  "Yom HaShoah": "#2E2A38",
  "Tzom Gedaliah": "#C0392B",
  "Asara B'Tevet": "#A63A50",
  "Ta'anit Esther": "#C2547A",
  "Tzom Tammuz": "#8E4585",
  "Tish'a B'Av": "#241019",
};

const SHABBAT_COLOR = "#E5352B";
const FALLBACK_BY_KIND: Record<DayKind, string | null> = {
  shabbat: SHABBAT_COLOR,
  chag: "#E08A1E",
  cholhamoed: "#1FA37A",
  fast: "#A63A50",
  minor: "#7B7F8C",
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

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

const DARK_TEXT = "#1a1420";
const LIGHT_TEXT = "#ffffff";

/**
 * Picks white or dark text for a given background hex by comparing WCAG
 * contrast ratios against both, so a bright background (e.g. a yellow)
 * automatically gets dark text instead of unreadable white-on-yellow.
 */
export function getContrastText(hex: string): string {
  const L = relativeLuminance(hex);
  const whiteContrast = (1.0 + 0.05) / (L + 0.05);
  const darkContrast = (L + 0.05) / (0.02 + 0.05);
  return whiteContrast >= darkContrast ? LIGHT_TEXT : DARK_TEXT;
}
