'use client';

import { useState } from 'react';
import type { ArtPiece } from '@/lib/art';
import { GalleryPiece } from '@/components/gallery-piece';
import { Lightbox } from './lightbox';

type GalleryProps = {
  pieces: ArtPiece[];
};

export function Gallery({ pieces }: GalleryProps) {
  const [open, setOpen] = useState<ArtPiece | null>(null);

  // Empty-provider state: fixtures make this rare, but a real empty database
  // must not look broken.
  if (pieces.length === 0) {
    return (
      <div className="mx-auto max-w-md border bg-surface px-6 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Gallery
        </p>
        <h2 className="mt-3 font-display font-medium text-2xl text-text">
          The gallery is being rehung.
        </h2>
        <p className="mt-2 font-mono text-sm text-text-muted">
          New work is on its way. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* CSS-columns masonry: uniform column width, variable height, no cropping.
          Pieces render in sortOrder ascending (already sorted by getArtPieces). */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {pieces.map((piece, i) => (
          <GalleryPiece
            key={piece.id}
            piece={piece}
            onOpen={setOpen}
            priority={i < 3}
            className="mb-4 break-inside-avoid"
          />
        ))}
      </div>

      <Lightbox piece={open} onClose={() => setOpen(null)} />
    </>
  );
}
