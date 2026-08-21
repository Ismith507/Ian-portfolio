'use client';

import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';

type ContactFormProps = {
  className?: string;
};

// Square inputs with an always-visible 2px accent focus ring (self-contained,
// so the field shows a keyboard-focus indicator regardless of any global style).
const inputClasses =
  'bg-surface border px-3 py-2 text-base text-text ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

const labelClasses = 'font-mono text-xs uppercase tracking-widest text-text-muted';

export function ContactForm({ className }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClasses}>
          Name
        </label>
        <input type="text" id="name" name="name" autoComplete="name" className={inputClasses} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input type="email" id="email" name="email" autoComplete="email" className={inputClasses} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={labelClasses}>
          Message
        </label>
        <textarea id="message" name="message" rows={5} className={inputClasses} />
      </div>
      <button
        type="submit"
        className="mt-1 self-start bg-accent-fill px-5 py-2.5 font-medium text-white transition duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Submit
      </button>
      {submitted && (
        <p className="font-mono text-sm text-text-muted">
          Told you. →{' '}
          <a
            href="mailto:ianpayntar@gmail.com"
            className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            ianpayntar@gmail.com
          </a>
        </p>
      )}
    </form>
  );
}
