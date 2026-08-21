'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { BadgeMark } from './badge-mark';
import { ThemeToggle } from './theme-toggle';

const LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/projects/software', label: 'SOFTWARE' },
  { href: '/projects/art', label: 'ART' },
  { href: '/projects/music', label: 'MUSIC' },
  { href: '/about', label: 'ABOUT' },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  // The live fractal explorer belongs to the Software domain.
  if (href === '/projects/software') {
    return pathname.startsWith('/projects/software') || pathname.startsWith('/projects/fractals');
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export function Nav() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-surface/90 backdrop-blur">
      {/* Full-width bar: badge hugs the viewport's left edge, links its right
          edge — independent of the page's content column. The badge navigates
          home; when already on home it smooth-scrolls to the top instead. */}
      <div className="w-full px-12 sm:px-20">
        <div className="flex h-14 items-center justify-between">
          <BadgeMark size="sm" />

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {LINKS.map(({ href, label }) => {
              const active = isActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'font-mono text-xs uppercase tracking-widest transition-colors duration-200',
                    active
                      ? 'border-b-2 border-accent pb-0.5 text-accent'
                      : 'text-text-muted hover:text-text',
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <ThemeToggle />
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center border text-text"
            >
              {open ? (
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile panel — not a modal, no focus trap */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="absolute inset-x-0 top-full border-b bg-surface md:hidden"
        >
          {LINKS.map(({ href, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors duration-200',
                  active
                    ? 'border-l-2 border-accent text-accent'
                    : 'text-text-muted hover:text-text',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
