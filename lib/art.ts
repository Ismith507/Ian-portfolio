/**
 * lib/art.ts — the ONE typed art-data module for the gallery.
 *
 * Display-only: this module reads art pieces for the /projects/art gallery.
 * It NEVER writes, and there is no admin/upload path anywhere in the codebase.
 *
 * ── Provider selection & environment variables ──────────────────────────────
 * The database provider is NOT chosen yet. It is hidden behind the ArtProvider
 * interface below so that switching to a real backend later touches ONLY this
 * file plus configuration — no page, component, or fixture change required.
 *
 *   ART_PROVIDER      Selects the implementation. Unset, empty, or "fixtures"
 *                     resolves to the local fixture provider (the DEFAULT). The
 *                     build NEVER requires credentials — with zero env vars set,
 *                     the gallery renders fully from lib/art-fixtures.json.
 *                     A future value like "postgres" switches to a real provider
 *                     added later behind this same interface.
 *
 *   ART_DATABASE_URL  Reserved: connection string for the future database
 *                     provider. Unused by the fixture provider.
 *
 *   ART_IMAGE_HOST    Reserved: the object-storage hostname (e.g.
 *                     "images.iansmith.example") for real artwork images.
 *                     Consumed by next.config.mjs (images.remotePatterns), not
 *                     here. Unused by the fixture provider.
 *
 * A real provider that throws must NOT be caught here — it should fail loud at
 * revalidation so Next.js keeps serving the last good statically-generated page.
 */

import fixtures from '@/lib/art-fixtures.json';

export type ArtPiece = {
  /** Stable unique key for React lists + lightbox targeting (fixture: slug; DB: row id). */
  id: string;
  /** Piece title — or "Untitled, {year}" when a real record has none. */
  title: string;
  /** Object-storage URL, or /art-fixtures/… for local fixtures. */
  imageUrl: string;
  /** Required — describes the piece, never "image of art". */
  altText: string;
  /** Optional — shown in the hover overlay and the lightbox. */
  description?: string;
  /** Intrinsic pixel width — required by next/image to reserve layout space. */
  width: number;
  /** Intrinsic pixel height — with width, gives the masonry its aspect ratio pre-load. */
  height: number;
  /** Gallery ordering, ascending. */
  sortOrder: number;
  /** Home-page eligibility — kept per schema, UNUSED at launch (Home never reads this module). */
  featured?: boolean;
};

/** Display-only contract: no writes, no admin, ever. */
export interface ArtProvider {
  getArtPieces(): Promise<ArtPiece[]>;
}

/**
 * Local fixture provider — the zero-credential DEFAULT.
 * Static-imports the fixture JSON so no filesystem or network access is needed
 * at request time, and the data is bundled at build.
 */
const fixtureProvider: ArtProvider = {
  async getArtPieces(): Promise<ArtPiece[]> {
    return fixtures as ArtPiece[];
  },
};

/**
 * Resolve the active provider from the environment.
 * Default/unknown falls through to the fixture provider with no warning in
 * production builds. A future real provider is added as another case here.
 */
function resolveProvider(): ArtProvider {
  switch (process.env.ART_PROVIDER) {
    // case 'postgres':
    //   return postgresProvider; // added later behind ArtProvider, reads ART_DATABASE_URL
    case 'fixtures':
    case '':
    case undefined:
    default:
      return fixtureProvider;
  }
}

/** Resolves the provider, returns pieces sorted by sortOrder ascending. */
export async function getArtPieces(): Promise<ArtPiece[]> {
  const pieces = await resolveProvider().getArtPieces();
  return [...pieces].sort((a, b) => a.sortOrder - b.sortOrder);
}
