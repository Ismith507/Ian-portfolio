'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';
import {
  THEME_ORDER,
  getServerThemePref,
  getThemePref,
  setThemePref,
  subscribeTheme,
} from './theme-store';

export type ThemeToggleProps = { className?: string };

/**
 * Three-way theme cycle button: light -> dark -> system -> light. Persists to
 * localStorage['ian-theme'] and re-applies live on OS theme changes while the
 * preference is 'system'. State lives in the shared theme store (components/
 * theme-store.ts), so every mounted instance — the Nav renders one for desktop
 * and one for mobile — always shows, announces, and cycles from the SAME
 * preference. Keyboard accessible (native button); announces changes via aria-live.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const pref = useSyncExternalStore(subscribeTheme, getThemePref, getServerThemePref);
  const [mounted, setMounted] = useState(false);

  // Mount gate: the icon and stateful label render only on the client, so the
  // server-rendered HTML (which cannot know the stored preference) never mismatches.
  useEffect(() => {
    setMounted(true);
  }, []);

  const next = THEME_ORDER[(THEME_ORDER.indexOf(pref) + 1) % THEME_ORDER.length];
  const label = mounted ? `Theme: ${pref}. Switch to ${next}.` : 'Theme';
  const Icon = pref === 'light' ? SunIcon : pref === 'dark' ? MoonIcon : ComputerDesktopIcon;

  return (
    <button
      type="button"
      onClick={() => setThemePref(next)}
      aria-label={label}
      className={cn(
        'h-9 w-9 border bg-surface hover:bg-surface-2 hover:border-accent flex items-center justify-center transition-colors duration-200',
        className,
      )}
    >
      {mounted && <Icon className="h-5 w-5 text-text" aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {mounted ? `Theme set to ${pref}` : ''}
      </span>
    </button>
  );
}
