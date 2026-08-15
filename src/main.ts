import { getMonthGrid } from "./lib/hebcal";
import { isoDate } from "./lib/format";
import { LOCATIONS } from "./config";
import { store } from "./state";
import { renderDowRow, renderGrid, renderMonthTitle } from "./ui/grid";
import { renderDetail } from "./ui/detailPanel";
import { prevMonth, nextMonth, arrowKeyToStep, detectSwipeDirection } from "./ui/monthNav";
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

function stepMonth(step: "prev" | "next"): void {
  const { year, gregMonth } = store.get();
  const m = step === "prev" ? prevMonth(year, gregMonth) : nextMonth(year, gregMonth);
  goToMonth(m.year, m.gregMonth);
}

let suppressNextClick = false;

gridEl.addEventListener("click", (e) => {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  const btn = (e.target as HTMLElement).closest<HTMLElement>(".compact-cell");
  if (!btn) return;
  store.set({ selectedIso: btn.dataset.iso ?? null });
});

let touchStartX = 0;
let touchStartY = 0;

gridEl.addEventListener(
  "touchstart",
  (e) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  },
  { passive: true },
);

gridEl.addEventListener(
  "touchend",
  (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    const step = detectSwipeDirection(t.clientX - touchStartX, t.clientY - touchStartY);
    if (!step) return;
    // Most browsers don't fire a click after a real drag, so this flag would
    // never get consumed and could wrongly swallow a later, unrelated tap —
    // the timeout is a safety net that always clears it shortly after.
    suppressNextClick = true;
    setTimeout(() => {
      suppressNextClick = false;
    }, 400);
    stepMonth(step);
  },
  { passive: true },
);

prevBtn.addEventListener("click", () => stepMonth("prev"));
nextBtn.addEventListener("click", () => stepMonth("next"));

todayBtn.addEventListener("click", () => {
  const now = new Date();
  store.set({ year: now.getFullYear(), gregMonth: now.getMonth(), selectedIso: isoDate(now) });
});

document.addEventListener("keydown", (e) => {
  const step = arrowKeyToStep(e.key);
  if (!step) return;
  stepMonth(step);
});

downloadBtn.addEventListener("click", () => downloadIcs(store.get().locationKey));

subscribeLink.href = getGoogleSubscribeUrl();
locationLabelEl.textContent = LOCATIONS[store.get().locationKey]?.label ?? "";

store.subscribe(render);

// Select today by default; this also triggers the first render via the subscription above.
store.set({ selectedIso: isoDate(new Date()) });
