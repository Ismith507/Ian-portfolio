import { BadgeMark } from './badge-mark';

export function Footer() {
  return (
    <footer className="border-t bg-bg">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:px-6">
        <p className="font-mono text-sm">
          <a
            href="mailto:ianpayntar@gmail.com"
            className="text-text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            ianpayntar@gmail.com
          </a>
          <span className="text-text-muted"> · </span>
          <a
            href="https://github.com/ismith507"
            target="_blank"
            rel="noreferrer"
            className="text-text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            github.com/ismith507
          </a>
        </p>
        <BadgeMark size="md" behavior="scroll-top" />
      </div>
    </footer>
  );
}
