import { mkdirSync, writeFileSync } from "node:fs";
import { getEventsInRange } from "../src/lib/hebcal";
import { eventsToIcs, defaultIcsWindow } from "../src/lib/ics";
import { LOCATIONS, DEFAULT_LOCATION_KEY } from "../src/config";

const cfg = LOCATIONS[DEFAULT_LOCATION_KEY]!;
const { start, end } = defaultIcsWindow();
const events = getEventsInRange(start, end, DEFAULT_LOCATION_KEY);
const ics = eventsToIcs(events, {
  calName: "לוח החגים — ישראל",
  tzid: cfg.tzid,
  uidDomain: "hebcalender.ronmailx-boop.github.io",
});

mkdirSync("public", { recursive: true });
writeFileSync("public/hebcal-israel.ics", ics, "utf8");

console.log(`Wrote public/hebcal-israel.ics — ${events.length} events, ${start.toDateString()} → ${end.toDateString()}`);
