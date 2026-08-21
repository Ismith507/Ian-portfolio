import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import FractalBackdrop from './fractal-backdrop';
import '../globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Ian Smith',
  description: "Ian Smith's portfolio site",
};

// Runs before first paint: plants the `js` class (SectionReveal depends on it) and sets
// the `.dark` class from localStorage['ian-theme'] (or the OS setting for system/first
// visit), so there is no flash of the wrong theme.
const themeScript = `(function(){try{document.documentElement.classList.add('js');var t=localStorage.getItem('ian-theme');var d=t==='dark'||((t===null||t==='system'||t!=='light')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(spaceGrotesk.variable, inter.variable, jetbrainsMono.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Sticky-footer structure: the body is a min-viewport-height column and
          the page content flexes to fill it, so the footer sits at the bottom
          of the viewport even on short pages (music's empty state) instead of
          floating mid-screen with the backdrop showing beneath it. */}
      <body className="flex min-h-screen flex-col">
        {/* Persistent site-wide fractal backdrop: fixed behind all content,
            visually bounded by the opaque Nav and Footer; the camera moves to
            each page's view on navigation (see fractal-shared.ts). */}
        <FractalBackdrop />
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
