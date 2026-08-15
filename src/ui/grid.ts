import type { DayCell } from "../lib/hebcal";
import { DOW_LABELS_SHORT, MONTH_LABELS_GREG, isoDate } from "../lib/format";

export function renderDowRow(): string {
  return DOW_LABELS_SHORT.map((d) => `<span>${d}</span>`).join("");
}

export function renderMonthTitle(year: number, gregMonth: number): string {
  return `${MONTH_LABELS_GREG[gregMonth]} ${year}`;
}

function markerFor(cell: DayCell): string {
  if (cell.entry) return "🕯️";
  if (cell.exit) return "✨";
  if (cell.kind === "minor") return "·";
  return "";
}

function ariaLabel(cell: DayCell): string {
  const parts = [`${cell.dnum} ב${MONTH_LABELS_GREG[cell.date.getMonth()]}`, cell.heb];
  if (cell.title) parts.push(cell.title);
  return parts.join(", ");
}

export function renderGrid(cells: DayCell[], selectedIso: string | null): string {
  const todayIso = isoDate(new Date());
  return cells
    .map((cell) => {
      const classes = ["compact-cell"];
      if (cell.kind !== "plain") classes.push(`k-${cell.kind}`);
      if (cell.isOutside) classes.push("is-outside");
      if (cell.iso === todayIso) classes.push("is-today");
      const pressed = cell.iso === selectedIso;
      return (
        `<button type="button" class="${classes.join(" ")}" data-iso="${cell.iso}" ` +
        `aria-pressed="${pressed}" aria-label="${ariaLabel(cell)}">` +
        `<span class="n">${cell.dnum}</span><span class="m">${markerFor(cell)}</span>` +
        `</button>`
      );
    })
    .join("");
}
