import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

export type ProjectCardProps = {
  title: string;
  oneLiner: string;
  /** Mono meta row items, rendered joined with ' · '. */
  meta: string[];
  /** Absent ⇒ non-clickable static card (project has no link yet). */
  href?: string;
  /** true ⇒ target="_blank" rel="noreferrer" + an external-link affordance. Default false. */
  external?: boolean;
  /** Optional second paragraph. */
  description?: string;
  className?: string;
};

export function ProjectCard({
  title,
  oneLiner,
  meta,
  href,
  external = false,
  description,
  className,
}: ProjectCardProps) {
  const clickable = Boolean(href);
  const classes = cn(
    'group block border bg-surface p-6 shadow-sm transition duration-200 ease-out dark:shadow-none',
    clickable &&
      'hover:-translate-y-1 hover:border-accent focus-visible:border-accent motion-reduce:transform-none',
    className,
  );

  const content = (
    <>
      <h3 className="flex items-start gap-1 font-display text-xl font-medium text-text">
        <span>{title}</span>
        {external && (
          <ArrowUpRightIcon
            className="h-5 w-5 shrink-0 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        )}
      </h3>
      <p className="mt-2 text-base text-text-muted">{oneLiner}</p>
      {description && <p className="mt-3 max-w-[70ch] text-sm text-text-muted">{description}</p>}
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-text-muted">
        {meta.join(' · ')}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
