'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { ArtPiece } from '@/lib/art';
import { cn } from '@/lib/utils';

export type GalleryPieceProps = {
  piece: ArtPiece;
  /** Parent opens the lightbox. */
  onOpen: (piece: ArtPiece) => void;
  /** true for the first ~3 pieces (above the fold). Default false. */
  priority?: boolean;
  className?: string;
};

export function GalleryPiece({ piece, onOpen, priority = false, className }: GalleryPieceProps) {
  const [revealed, setRevealed] = useState(false);
  // On touch, the first tap reveals the caption; the browser still fires a click
  // afterward, so swallow that one click to keep the tap from opening the lightbox.
  const suppressClick = useRef(false);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    if (!revealed) {
      e.preventDefault();
      setRevealed(true);
      suppressClick.current = true;
    }
  };

  const handleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onOpen(piece);
  };

  return (
    <button
      type="button"
      aria-label={piece.title}
      onClick={handleClick}
      onPointerUp={handlePointerUp}
      onBlur={() => setRevealed(false)}
      className={cn(
        'group relative mb-4 block w-full overflow-hidden border bg-surface break-inside-avoid',
        className,
      )}
    >
      <Image
        src={piece.imageUrl}
        alt={piece.altText}
        width={piece.width}
        height={piece.height}
        className="h-auto w-full"
        unoptimized={piece.imageUrl.endsWith('.svg')}
        priority={priority}
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-3 pt-10 text-left opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none',
          revealed && 'opacity-100',
        )}
      >
        <span className="font-display text-sm text-white">{piece.title}</span>
        {piece.description && (
          <span className="font-mono text-xs text-white/80">{piece.description}</span>
        )}
      </span>
    </button>
  );
}
