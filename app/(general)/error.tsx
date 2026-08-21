'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // `error` is part of the required error-boundary signature; nothing to surface to the
  // visitor beyond the friendly message below.
  void error;

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted">ERROR</p>
      <h1 className="font-display text-3xl font-medium tracking-tight text-text md:text-4xl">
        Something broke.
      </h1>
      <p className="text-base leading-relaxed text-text-muted">
        It wasn&apos;t you. Try again, or head home.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="bg-accent-fill px-5 py-2.5 font-medium text-white transition duration-200 hover:opacity-90"
        >
          Try again
        </button>
        <Link href="/" className="text-accent underline-offset-4 hover:underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
