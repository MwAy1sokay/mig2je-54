// Simple key-value store with change listeners
const KEY = 'ytMusic_v50';
const defaults = { playlists: [], history: [], prefs: { mode: 'normal' } };

let state;
try { state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
catch { state = { ...defaults }; }

const listeners = new Set();
const emit      = () => listeners.forEach(l => l(state));

export const Store = {
  /** subscribe(fn(state)) → unsubscribe */
  sub(fn)   { listeners.add(fn); fn(state); return () => listeners.delete(fn); },
  /** immutable update */
  patch(p)  { state = structuredClone({ ...state, ...p }); save(); emit(); },
  /** deep mutable tweak (fn gets draft) */
  mutate(fn){ fn(state); save(); emit(); },
  get       : () => state
};

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
