import Image from 'next/image';
import Link from 'next/link';

import { DomainCard } from '@/components/domain-card';
import { SectionReveal } from '@/components/section-reveal';

export default function Home() {
	return (
		<>
			{/* Section 1 — Hero (the page's single grid-break section). The fractal
			    behind it is the site-wide backdrop rendered by the layout
			    (fractal-backdrop.tsx); the home view pins the fractal's horizontal
			    axis just below this hero text. */}
			<section className="relative py-24 md:py-32">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
					<div className="relative">
						<SectionReveal stagger className="relative z-10">
							<h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
								IAN SMITH
							</h1>
							{/* <p className="mt-4 text-base text-text-muted">
								Software engineer. Musician. Visual artist.
							</p> */}
							<p className="mt-6 max-w-[46ch] font-sans text-lg leading-relaxed md:text-xl">
								Technical problems, designed solutions. I make apps tick,
								designs pop, and work flow. Whether you&apos;re greenfielding new
								projects, maintaining existing ones, or looking for a stunning
								facelift, I&apos;m here to help.
							</p>
							<p className="mt-8 font-mono text-xs uppercase tracking-widest text-text">
								<Link
									href="/projects/software"
									className="underline-offset-4 hover:text-accent hover:underline"
								>
									Software
								</Link>
								<span className="mx-2 text-text-muted" aria-hidden="true">
									·
								</span>
								<Link
									href="/projects/art"
									className="underline-offset-4 hover:text-accent hover:underline"
								>
									Art
								</Link>
								<span className="mx-2 text-text-muted" aria-hidden="true">
									·
								</span>
								<Link
									href="/projects/music"
									className="underline-offset-4 hover:text-accent hover:underline"
								>
									Music
								</Link>
							</p>
						</SectionReveal>
					</div>
				</div>
			</section>

			{/* Section 2 — Work */}
			<section className="py-16 md:py-24">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
					<SectionReveal>
						<h2 className="mb-8 font-display text-2xl font-medium">Work</h2>
					</SectionReveal>
					<SectionReveal stagger delayMs={150} className="grid gap-4 md:grid-cols-3">
						<DomainCard
							index="01"
							title="Software"
							oneLiner="Engineering and web projects"
							meta="03 PROJECTS"
							href="/projects/software"
						/>
						<DomainCard
							index="02"
							title="Art"
							oneLiner="Drawing, painting, photography"
							meta="GALLERY"
							href="/projects/art"
						/>
						<DomainCard
							index="03"
							title="Music"
							oneLiner="Recordings and performances"
							meta="COMING SOON"
							href="/projects/music"
						/>
					</SectionReveal>
				</div>
			</section>

			{/* Section 3 — Featured */}
			<section className="py-16 md:py-24">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
					<SectionReveal>
						<h2 className="mb-8 font-display text-2xl font-medium">Featured</h2>
					</SectionReveal>
					<SectionReveal delayMs={150}>
						<Link
							href="/projects/fractals"
							className="group grid border bg-surface transition duration-200 ease-out hover:border-accent focus-visible:border-accent md:grid-cols-2"
						>
							<div className="order-2 flex flex-col justify-center gap-3 p-6 md:order-1 md:p-8">
								<h3 className="font-display text-xl font-medium text-text">
									Mandelbrot Fractal Explorer
								</h3>
								<p className="text-base text-text-muted">
									Interactive fractal explorer with keyboard-driven pan and zoom
								</p>
								<p className="font-mono text-xs uppercase tracking-widest text-text-muted">
									TypeScript · Canvas API · React
								</p>
								<span className="mt-2 inline-flex w-fit items-center border border-accent px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent transition-colors duration-200 group-hover:bg-accent-fill group-hover:text-white">
									Explore it live
								</span>
							</div>
							<div className="relative order-1 min-h-[220px] md:order-2">
								<Image
									src="/Mandelbrot.jpeg"
									alt="A rendered Mandelbrot set fractal showing its intricate, self-similar boundary."
									fill
									sizes="(min-width: 768px) 50vw, 100vw"
									className="object-cover"
								/>
							</div>
						</Link>
					</SectionReveal>
				</div>
			</section>

			{/* Section 4 — About strip */}
			<section className="py-16 md:py-24">
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
					<SectionReveal>
						<div className="grid gap-8 md:grid-cols-[240px_1fr] md:items-center">
							<div className="order-1 w-40 md:w-full md:max-w-[240px]">
								<Image
									src="/avatar.jpeg"
									alt="Portrait of Ian Smith."
									width={240}
									height={240}
									className="aspect-square w-full border object-cover"
								/>
							</div>
							<div className="order-2">
								<p className="max-w-[70ch] text-base leading-relaxed text-text-muted">
									Hi, I&apos;m Ian, a software engineer and web designer with a
									passion for music and art. I have 4 years experience in the
									software business and an extensive portfolio of paid work and
									personal projects in the software, music, and visual art
									domains. Above all, I&apos;m looking to create new and stunning
									experiences.
								</p>
								<Link
									href="/about"
									className="mt-4 inline-block font-mono text-sm text-accent underline-offset-4 hover:underline"
								>
									More about me →
								</Link>
							</div>
						</div>
					</SectionReveal>
				</div>
			</section>
		</>
	);
}
