import { DEFAULT_LOCATION_KEY } from "./config";

export interface AppState {
  year: number;
  gregMonth: number; // 0-11
  selectedIso: string | null;
  locationKey: string;
}

type Listener = () => void;

export function createStore(initial: AppState) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get(): AppState {
      return state;
    },
    set(patch: Partial<AppState>): void {
      state = { ...state, ...patch };
      for (const l of listeners) l();
    },
    subscribe(l: Listener): () => void {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

const now = new Date();
export const store = createStore({
  year: now.getFullYear(),
  gregMonth: now.getMonth(),
  selectedIso: null,
  locationKey: DEFAULT_LOCATION_KEY,
});
