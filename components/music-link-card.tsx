import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export type MusicLinkCardProps = {
  title: string;
  /** Mono metadata line, e.g. "2026 · WROTE, PERFORMED". */
  meta: string;
  /** Always external. */
  href: string;
  /** Optional one-liner/story. */
  note?: string;
  className?: string;
};

export function MusicLinkCard({ title, meta, href, note, className }: MusicLinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group flex items-start justify-between gap-4 border bg-surface p-6 shadow-sm transition duration-200 ease-out dark:shadow-none hover:-translate-y-1 hover:border-accent focus-visible:border-accent motion-reduce:transform-none',
        className,
      )}
    >
      <div>
        <h3 className="font-display text-xl font-medium text-text">{title}</h3>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-text-muted">{meta}</p>
        {note && <p className="mt-2 text-sm text-text-muted">{note}</p>}
      </div>
      <ArrowUpRightIcon
        className="h-6 w-6 shrink-0 text-text-muted transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transform-none"
        aria-hidden="true"
      />
    </a>
  );
}
