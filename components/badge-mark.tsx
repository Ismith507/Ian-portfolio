'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type BadgeMarkProps = {
	/** sm = 32px (header), md = 40px (footer). Default 'sm'. */
	size?: 'sm' | 'md';
	/**
	 * 'link' (default) navigates to the site root — except when already on the
	 * home page, where it smooth-scrolls back to the top instead. The header
	 * badge. 'scroll-top' always smooth-scrolls the current page to the top
	 * without navigating — the footer badge.
	 */
	behavior?: 'link' | 'scroll-top';
	className?: string;
};

const scrollToTop = () => {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
};

/**
 * Placeholder monogram mark. Drop-in swap contract: when public/badge.svg
 * lands, replace ONLY the inner <span> with an <Image src="/badge.svg" .../>
 * at the same sizing box — the wrappers and call sites never change.
 */
export function BadgeMark({
	size = 'sm',
	behavior = 'link',
	className,
}: BadgeMarkProps) {
	const pathname = usePathname();
	const box = size === 'md' ? 'h-10 w-10' : 'h-8 w-8';
	const mark = (
		<span
			className={cn(
				'flex items-center justify-center border-2 border-text font-display text-sm font-bold leading-none select-none transition-colors duration-200 group-hover:border-accent group-hover:text-accent',
				box,
			)}
		>
			IS
		</span>
	);

	if (behavior === 'scroll-top') {
		return (
			<button
				type="button"
				aria-label="Back to top"
				className={cn('group inline-flex cursor-pointer', className)}
				onClick={scrollToTop}
			>
				{mark}
			</button>
		);
	}

	return (
		<Link
			href="/"
			aria-label="Ian Smith — home"
			className={cn('group inline-flex', className)}
			onClick={(e) => {
				// Already home: don't re-navigate (which would jump); glide up.
				if (pathname === '/') {
					e.preventDefault();
					scrollToTop();
				}
			}}
		>
			{mark}
		</Link>
	);
}
