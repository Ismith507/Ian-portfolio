import { getArtPieces } from '@/lib/art';
import { SectionReveal } from '@/components/section-reveal';
import { Gallery } from './gallery';

// ISR (incremental static regeneration): Next.js rebuilds this page in the
// background at most every 300 seconds. Once a real provider is connected, new
// pieces appear within five minutes of landing in the database, with no redeploy.
// No other page reads lib/art (COUPLING RULE), so no other page needs this.
export const revalidate = 300;

export default async function ArtPage() {
  const pieces = await getArtPieces();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 md:py-24">
      {/* Top-to-bottom entrance: header first, gallery follows. */}
      <SectionReveal>
        <header>
          <h1 className="font-display font-medium tracking-tight text-3xl md:text-4xl text-text">
            Art
          </h1>
          <p className="mt-2 text-base text-text-muted">
            Drawing, painting, photography.
          </p>
        </header>
      </SectionReveal>

      <SectionReveal delayMs={200} className="mt-10 md:mt-14">
        <Gallery pieces={pieces} />
      </SectionReveal>
    </main>
  );
}
