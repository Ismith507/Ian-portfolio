import Link from 'next/link';
import type { Metadata } from 'next';

import { FractalCanvas } from '@/components/fractal-canvas';
import { SectionReveal } from '@/components/section-reveal';

export const metadata: Metadata = {
	title: 'Mandelbrot Fractal Explorer — Ian Smith',
	description: 'Interactive fractal explorer with keyboard-driven pan and zoom.',
};

export default function Fractals() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
			<section className="py-16 md:py-24">
				{/* Top-to-bottom entrance: back-link + header first, canvas follows. */}
				<SectionReveal>
					<Link
						href="/projects/software"
						className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors duration-200 hover:text-accent"
					>
						← SOFTWARE
					</Link>

					<header className="mt-6">
						<h1 className="font-display font-medium tracking-tight text-3xl md:text-4xl text-text">
							Mandelbrot Fractal Explorer
						</h1>
						<p className="mt-2 text-base leading-relaxed text-text-muted">
							Interactive fractal explorer with keyboard-driven pan and zoom
						</p>
					</header>
				</SectionReveal>

				<SectionReveal delayMs={200} className="mt-10">
					<FractalCanvas />
				</SectionReveal>
			</section>
		</div>
	);
}
