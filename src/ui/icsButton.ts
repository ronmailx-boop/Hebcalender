import { getEventsInRange } from "../lib/hebcal";
import { eventsToIcs, defaultIcsWindow } from "../lib/ics";
import { LOCATIONS, DEFAULT_LOCATION_KEY } from "../config";

const ICS_FILENAME = "hebcal-israel.ics";
const UID_DOMAIN = "hebcalender.ronmailx-boop.github.io";

/** Absolute URL of the build-time-generated static feed, resolved from wherever this page is actually served. */
export function getStaticIcsUrl(): string {
  return new URL(ICS_FILENAME, document.baseURI).href;
}

export function getGoogleSubscribeUrl(): string {
  const httpsUrl = getStaticIcsUrl();
  const webcalUrl = httpsUrl.replace(/^https?:/, "webcal:");
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;
}

export function downloadIcs(locationKey: string = DEFAULT_LOCATION_KEY): void {
  const cfg = LOCATIONS[locationKey] ?? LOCATIONS[DEFAULT_LOCATION_KEY]!;
  const { start, end } = defaultIcsWindow();
  const events = getEventsInRange(start, end, locationKey);
  const ics = eventsToIcs(events, { calName: "לוח החגים — ישראל", tzid: cfg.tzid, uidDomain: UID_DOMAIN });

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = ICS_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
