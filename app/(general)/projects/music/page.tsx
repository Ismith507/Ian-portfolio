import type { Metadata } from 'next';
import { SectionReveal } from '@/components/section-reveal';
import { MusicLinkCard } from '@/components/music-link-card';

export const metadata: Metadata = {
	title: 'Music — Ian Smith',
	description: 'Music from Ian Smith. Nothing to hear yet — recordings are on the way.',
};

// Local shape mirrors MusicLinkCard's props (minus className) so real pieces can slot in
// later as a data-only change. Music is links-out-only — no on-site playback, ever.
type MusicPiece = {
	title: string;
	meta: string;
	href: string;
	note?: string;
};

// CONTENT.md: "WORK IN PROGRES, MUSIC PAGE STARTS EMPTY". No pieces have been published yet.
// When Ian fills the Music section of CONTENT.md, add entries here — they render as a
// single-column list of MusicLinkCards above the empty state, which should then be removed.
const musicPieces: MusicPiece[] = [];

export default function MusicPage() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 md:py-24">
			<SectionReveal>
				<header>
					<h1 className="font-display font-medium tracking-tight text-3xl md:text-4xl">
						Music
					</h1>
				</header>
			</SectionReveal>

			{musicPieces.length > 0 ? (
				<SectionReveal as="ul" stagger delayMs={200} className="mt-8 space-y-4">
					{musicPieces.map((piece) => (
						<li key={piece.href}>
							<MusicLinkCard
								title={piece.title}
								meta={piece.meta}
								href={piece.href}
								note={piece.note}
							/>
						</li>
					))}
				</SectionReveal>
			) : (
				<SectionReveal delayMs={200} className="mt-8 flex justify-center">
					<div className="relative w-full max-w-xl border bg-surface px-6 py-16">
						<div
							aria-hidden="true"
							className="absolute inset-x-0 top-0 h-0.5 bg-accent-fill"
						/>
						<p className="text-center font-mono text-xs uppercase tracking-widest text-text-muted">
							STATUS: IN THE STUDIO
						</p>
						<h2 className="mt-4 text-center font-display font-medium text-2xl">
							Nothing to hear yet.
						</h2>
						<p className="mx-auto mt-4 max-w-[40ch] text-center text-text-muted">
							Recordings are on the way. Until then, the music happens offline.
						</p>
					</div>
				</SectionReveal>
			)}
		</div>
	);
}
