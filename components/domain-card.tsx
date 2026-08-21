import Link from 'next/link';
import { cn } from '@/lib/utils';

export type DomainCardProps = {
  title: string;
  oneLiner: string;
  /** Single mono line, e.g. "03 PROJECTS". */
  meta: string;
  /** Required — domain cards are always doors. */
  href: string;
  /** Ornament like "01"; omitted ⇒ not rendered. */
  index?: string;
  className?: string;
};

export function DomainCard({ title, oneLiner, meta, href, index, className }: DomainCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex min-h-[180px] flex-col border bg-surface p-6 shadow-sm transition duration-200 ease-out dark:shadow-none hover:-translate-y-1 hover:border-accent focus-visible:border-accent motion-reduce:transform-none',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="h-2 w-6 bg-accent-fill" aria-hidden="true" />
        {index && <span className="font-mono text-xs text-text-muted">{index}</span>}
      </div>
      <h3 className="mt-8 font-display text-2xl font-medium text-text">{title}</h3>
      <p className="mt-1 text-base text-text-muted">{oneLiner}</p>
      <p className="mt-auto pt-8 font-mono text-xs uppercase tracking-widest text-text-muted">
        {meta}{' '}
        <span
          className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
          aria-hidden="true"
        >
          →
        </span>
      </p>
    </Link>
  );
}
