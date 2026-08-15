import { getMonthGrid } from "./lib/hebcal";
import { isoDate } from "./lib/format";
import { LOCATIONS } from "./config";
import { store } from "./state";
import { renderDowRow, renderGrid, renderMonthTitle } from "./ui/grid";
import { renderDetail } from "./ui/detailPanel";
import { prevMonth, nextMonth, arrowKeyToStep } from "./ui/monthNav";
import { getGoogleSubscribeUrl, downloadIcs } from "./ui/icsButton";

const monthTitleEl = document.getElementById("monthTitle")!;
const dowRowEl = document.getElementById("dowRow")!;
const gridEl = document.getElementById("compactGrid")!;
const detailEl = document.getElementById("detailPanel")!;
const prevBtn = document.getElementById("prevMonth")!;
const nextBtn = document.getElementById("nextMonth")!;
const todayBtn = document.getElementById("todayBtn")!;
const subscribeLink = document.getElementById("subscribeLink") as HTMLAnchorElement;
const downloadBtn = document.getElementById("downloadIcsBtn")!;
const locationLabelEl = document.getElementById("locationLabel")!;

dowRowEl.innerHTML = renderDowRow();

function render(): void {
  const { year, gregMonth, selectedIso, locationKey } = store.get();
  const cells = getMonthGrid(year, gregMonth, locationKey);

  monthTitleEl.textContent = renderMonthTitle(year, gregMonth);
  gridEl.innerHTML = renderGrid(cells, selectedIso);

  const selectedCell = selectedIso ? (cells.find((c) => c.iso === selectedIso) ?? null) : null;
  detailEl.innerHTML = renderDetail(selectedCell);
}

function goToMonth(year: number, gregMonth: number): void {
  store.set({ year, gregMonth, selectedIso: null });
}

gridEl.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>(".compact-cell");
  if (!btn) return;
  store.set({ selectedIso: btn.dataset.iso ?? null });
});

prevBtn.addEventListener("click", () => {
  const { year, gregMonth } = store.get();
  const m = prevMonth(year, gregMonth);
  goToMonth(m.year, m.gregMonth);
});

nextBtn.addEventListener("click", () => {
  const { year, gregMonth } = store.get();
  const m = nextMonth(year, gregMonth);
  goToMonth(m.year, m.gregMonth);
});

todayBtn.addEventListener("click", () => {
  const now = new Date();
  store.set({ year: now.getFullYear(), gregMonth: now.getMonth(), selectedIso: isoDate(now) });
});

document.addEventListener("keydown", (e) => {
  const step = arrowKeyToStep(e.key);
  if (!step) return;
  const { year, gregMonth } = store.get();
  const m = step === "prev" ? prevMonth(year, gregMonth) : nextMonth(year, gregMonth);
  goToMonth(m.year, m.gregMonth);
});

downloadBtn.addEventListener("click", () => downloadIcs(store.get().locationKey));

subscribeLink.href = getGoogleSubscribeUrl();
locationLabelEl.textContent = LOCATIONS[store.get().locationKey]?.label ?? "";

store.subscribe(render);

// Select today by default; this also triggers the first render via the subscription above.
store.set({ selectedIso: isoDate(new Date()) });
