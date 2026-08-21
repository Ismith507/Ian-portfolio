'use client';

import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ArtPiece } from '@/lib/art';

type LightboxProps = {
  piece: ArtPiece | null; // null ⇒ closed
  onClose: () => void;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function Lightbox({ piece, onClose }: LightboxProps) {
  const reduced = usePrefersReducedMotion();

  // Retain the last non-null piece so its content stays rendered while the
  // fade-out (leave) transition plays after `piece` has already gone null.
  const [shown, setShown] = useState<ArtPiece | null>(piece);
  useEffect(() => {
    if (piece) setShown(piece);
  }, [piece]);

  const open = piece !== null;

  // Panel body — the artwork at natural size, its title, and optional description.
  // Rendered directly on the dimmed backdrop: no frame, no tint.
  const renderBody = (current: ArtPiece) => (
    <>
      {/* Visible close button, fixed top-right. Dialog also closes on Escape and
          backdrop click. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-4 top-4 h-10 w-10 border bg-surface hover:border-accent flex items-center justify-center transition-colors duration-200"
      >
        <XMarkIcon className="h-6 w-6 text-text" aria-hidden="true" />
      </button>

      <Image
        src={current.imageUrl}
        alt={current.altText}
        width={current.width}
        height={current.height}
        sizes="90vw"
        unoptimized={current.imageUrl.endsWith('.svg')}
        // Natural size, scaled DOWN only past ~90% viewport, never upscaled: the
        // pixel max-width cap is what guarantees no upscaling.
        style={{
          maxWidth: `min(90vw, ${current.width}px)`,
          maxHeight: '85vh',
          width: 'auto',
          height: 'auto',
        }}
      />

      <Dialog.Title className="mt-3 font-mono text-sm text-text text-center">
        {current.title}
      </Dialog.Title>
      {current.description ? (
        <p className="font-mono text-xs text-text-muted mt-1 max-w-[60ch] text-center">
          {current.description}
        </p>
      ) : null}
    </>
  );

  // Reduced motion: no Transition wrapper — open/close is instant. Dialog still
  // supplies scroll lock, focus trap, Escape, and focus restore to the piece.
  if (reduced) {
    return (
      <Dialog open={open} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-bg/80" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-0 flex flex-col items-center justify-center p-4 pointer-events-none [&>*]:pointer-events-auto">
          {piece ? renderBody(piece) : null}
        </Dialog.Panel>
      </Dialog>
    );
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-bg/80" aria-hidden="true" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Panel className="fixed inset-0 flex flex-col items-center justify-center p-4 pointer-events-none [&>*]:pointer-events-auto">
            {shown ? renderBody(shown) : null}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
