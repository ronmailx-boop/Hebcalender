import type { DayCell, TimeEntry } from "../lib/hebcal";
import { MONTH_LABELS_GREG } from "../lib/format";

function timeRow(entry: TimeEntry, icon: string): string {
  return (
    `<div class="timerow"><span class="icon">${icon}</span>` +
    `<span class="tlabel">${entry.label}</span><span class="tval">${entry.time}</span></div>`
  );
}

export function renderDetail(cell: DayCell | null): string {
  if (!cell) {
    return `<div class="detail-empty">בחר/י יום ברשת כדי לראות את הפרטים המלאים.</div>`;
  }

  const dateLine = `${cell.dnum} ב${MONTH_LABELS_GREG[cell.date.getMonth()]} · ${cell.heb}`;

  if (cell.kind === "plain") {
    return `<div class="dp-date">${dateLine}</div><div class="detail-empty">יום חול, ללא אירוע מיוחד.</div>`;
  }

  const times: string[] = [];
  if (cell.entry) times.push(timeRow(cell.entry, "🕯️"));
  if (cell.exit) times.push(timeRow(cell.exit, "✨"));

  const dot = cell.color ? `<span class="dp-dot" style="background:${cell.color}"></span>` : "";

  return (
    `<div class="dp-date">${dateLine}</div>` +
    `<div class="dp-title">${dot}${cell.title ?? ""}</div>` +
    (times.length ? `<div class="dp-times">${times.join("")}</div>` : "")
  );
}
