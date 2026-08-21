import type { Metadata } from 'next';

import { ProjectCard } from '@/components/project-card';
import { SectionReveal } from '@/components/section-reveal';

export const metadata: Metadata = {
	title: 'Software — Ian Smith',
	description: 'Engineering and web projects by Ian Smith.',
};

export default function SoftwareProjects() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
			<section className="py-16 md:py-24">
				{/* Top-to-bottom entrance cascade: header reveals first, then the
				    project cards stagger in below it — timed alongside the backdrop's
				    zoom into Seahorse Valley on navigation. */}
				<SectionReveal as="div">
					<header>
						<h1 className="font-display font-medium tracking-tight text-3xl md:text-4xl text-text">
							Software
						</h1>
						<p className="mt-2 text-base leading-relaxed text-text-muted">
							Engineering and web projects.
						</p>
					</header>
				</SectionReveal>

				<SectionReveal
					as="div"
					stagger
					delayMs={200}
					className="mt-10 grid gap-4 md:grid-cols-2"
				>
					<ProjectCard
						className="md:col-span-2"
						title="Mandelbrot Fractal Explorer"
						oneLiner="Interactive fractal explorer with keyboard-driven pan and zoom"
						description="2d rendering of mathematical equations generating beautiful images"
						meta={['TypeScript', 'Canvas API', 'React', 'LIVE DEMO']}
						href="/projects/fractals"
					/>
					<ProjectCard
						title="AI Site Builder"
						oneLiner="AI powered site builder; go from prompt -> edit -> publish all in one place"
						description="AI powered suite builder that lets users create reusable website templates. Start with a prompt and your projects information and marketing material and create a template that is fully editable in one page. Hit publish and visit your site!"
						meta={[
							'TypeScript',
							'React',
							'AI',
							'Cloudflare Database',
							'[TODO: repo / live link]',
						]}
					/>
					<ProjectCard
						title="Roguelike RTS game"
						oneLiner="Combining roguelike and rts gameplay"
						description="top down rts with roguelike elements where players compete head to head for resources and try to gain powerful boons on each run."
						meta={['Godot', '[TODO: repo / live link]']}
					/>
				</SectionReveal>
			</section>
		</div>
	);
}
