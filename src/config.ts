export interface LocationConfig {
  /** Hebrew label shown in the UI. */
  label: string;
  /** Name to pass to hebcal's built-in city lookup, when available. */
  lookupName: string;
  /** Fallback coordinates used only if lookupName isn't found in hebcal's built-in city table. */
  lat: number;
  lon: number;
  tzid: string;
  /** Minutes before sunset for candle lighting — set explicitly rather than relying on hebcal's internal per-city defaults. */
  candleLightingMins: number;
  /** Minutes after sunset for havdalah. */
  havdalahMins: number;
}

export const LOCATIONS: Record<string, LocationConfig> = {
  jerusalem: {
    label: "ירושלים",
    lookupName: "Jerusalem",
    lat: 31.769,
    lon: 35.216,
    tzid: "Asia/Jerusalem",
    candleLightingMins: 40,
    havdalahMins: 42,
  },
};

export const DEFAULT_LOCATION_KEY = "jerusalem";
