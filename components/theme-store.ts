'use client';

/**
 * Theme system: one module-scoped store shared by every ThemeToggle instance
 * (the Nav mounts two — desktop and mobile — and both must stay in sync).
 *
 * Why a shared store and not per-component state: with private state, the
 * instance the user did NOT click keeps a stale preference. Its OS-theme
 * listener would then silently revert an explicit 'dark'/'light' choice when
 * the OS auto-switches, and after a resize across the md breakpoint the newly
 * visible toggle would show and announce the wrong state. Here there is exactly
 * ONE preference, ONE matchMedia listener (guarded by the current preference),
 * and every subscribed component re-renders on every change.
 *
 * Persistence: localStorage['ian-theme'] = 'light' | 'dark' | 'system'
 * (missing/invalid ⇒ 'system'). The resolved theme is the `.dark` class on
 * <html>, applied pre-paint by the inline head script in app/(general)/layout.tsx
 * and kept current here afterwards. A 'storage' listener syncs across tabs.
 */

export type ThemePref = 'light' | 'dark' | 'system';

const KEY = 'ian-theme';

export const THEME_ORDER: ThemePref[] = ['light', 'dark', 'system'];

let pref: ThemePref = 'system';
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function parse(value: string | null): ThemePref {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function readStoredPref(): ThemePref {
  try {
    return parse(localStorage.getItem(KEY));
  } catch {
    return 'system'; // localStorage unavailable
  }
}

/** Resolve a preference to the .dark class on <html> — same logic as the inline head script. */
function applyPref(p: ThemePref) {
  const dark =
    p === 'dark' ||
    (p !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

/** Lazy, client-only, once. Runs on first subscribe (i.e. first toggle mount). */
function init() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  pref = readStoredPref();

  // ONE OS-theme listener for the whole app, attached for its whole life but
  // guarded by the CURRENT shared preference — it can never act on a stale one.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (pref === 'system') {
        applyPref('system');
        emit(); // resolved theme changed; let subscribers re-announce if they wish
      }
    });

  // Another tab changed the stored preference — follow it.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    pref = parse(e.newValue);
    applyPref(pref);
    emit();
  });
}

/** useSyncExternalStore subscribe. */
export function subscribeTheme(listener: () => void): () => void {
  init();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** useSyncExternalStore client snapshot. */
export function getThemePref(): ThemePref {
  // Before init (first client render, pre-subscribe) read storage directly so
  // the very first painted icon already matches the persisted preference.
  if (!initialized && typeof window !== 'undefined') return readStoredPref();
  return pref;
}

/** useSyncExternalStore server snapshot (also used while hydrating). */
export function getServerThemePref(): ThemePref {
  return 'system';
}

/** Persist + apply + notify every subscribed component. */
export function setThemePref(next: ThemePref) {
  init();
  pref = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // localStorage unavailable — theme still applies for this page's lifetime
  }
  applyPref(next);
  emit();
}
