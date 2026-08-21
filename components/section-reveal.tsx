'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type SectionRevealProps = {
  children: ReactNode;
  as?: 'div' | 'section' | 'ul' | 'li' | 'article';
  /** true ⇒ direct element children animate individually. Default false. */
  stagger?: boolean;
  /** Delay between siblings (mandated 60–90ms). Default 75. */
  staggerMs?: 60 | 75 | 90;
  /** Base delay before this group starts. Default 0. */
  delayMs?: number;
  /** Translate distance (mandated 12–24px). Default 16. */
  translatePx?: 12 | 16 | 20 | 24;
  /** Transition duration (mandated 300–500ms). Default 400. */
  durationMs?: 300 | 400 | 500;
  /** IntersectionObserver visibility fraction. Default 0.15. */
  threshold?: number;
  className?: string;
};

/**
 * Scroll-reveal wrapper built on IntersectionObserver (no motion library). The hidden
 * state lives in globals.css, gated by BOTH `html.js` AND
 * `@media (prefers-reduced-motion: no-preference)`, so content is fully visible with
 * JavaScript disabled and completely static under reduced motion — this component still
 * renders, it just never hides anything. Reveals happen once and never re-animate.
 *
 * Both modes are hidden from first paint via SERVER-RENDERED attributes (no
 * hydration-time flash): non-stagger renders `data-reveal` on the container itself;
 * stagger renders `data-reveal-stagger`, whose CSS hides the container's direct element
 * children. The --reveal-* custom properties sit on the container and are inherited by
 * the children; only each child's individual --reveal-delay is stamped on mount, which
 * is always before the first reveal because the observer is created in the same effect.
 */
export function SectionReveal({
  children,
  as = 'div',
  stagger = false,
  staggerMs = 75,
  delayMs = 0,
  translatePx = 16,
  durationMs = 400,
  threshold = 0.15,
  className,
}: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // In stagger mode, give each direct child its own delay (base + index * step).
    if (stagger) {
      (Array.from(el.children) as HTMLElement[]).forEach((child, i) => {
        child.style.setProperty('--reveal-delay', `${delayMs + i * staggerMs}ms`);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (stagger) {
            Array.from(el.children).forEach((child) => child.classList.add('is-revealed'));
          } else {
            el.classList.add('is-revealed');
          }
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger, staggerMs, delayMs, translatePx, durationMs, threshold]);

  const Tag = as as 'div';
  const style = {
    '--reveal-translate': `${translatePx}px`,
    '--reveal-duration': `${durationMs}ms`,
    '--reveal-delay': `${delayMs}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      data-reveal={stagger ? undefined : ''}
      data-reveal-stagger={stagger ? '' : undefined}
      style={style}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
