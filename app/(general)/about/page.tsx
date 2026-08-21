import Image from 'next/image';
import { SectionReveal } from '@/components/section-reveal';
import { ContactForm } from './contact-form';

const experience = [
  {
    role: 'Software Engineer',
    company: 'Firstland Services',
    dates: 'February 2024 - Present',
    location: 'Detroit, MI',
    bullets: [
      'RDF graph driven data solutions',
      'GIS data processing and visualization',
      'AI integrated website generation and publication',
      'Zero code website editor and publisher',
    ],
    tech: 'Typescript, React, Cloudflare, Next.js, SQL, Postgres, AI',
  },
  {
    role: 'Software Engineer',
    company: 'Proactive Technology Management',
    dates: 'November 2025 - Present',
    location: 'Detroit, MI',
    bullets: [
      'HIPAA compliant healthcare applications',
      'Single application IT resource manager and data visualizer',
    ],
    tech: 'Typescript, React, Azure, Next.js, SQL, Postgres, AI',
  },
];

const educationNotes = [
  'Computer Science',
  'Numerical Computation',
  'Mathematical Analysis',
  'Differential Equations',
];

const skillGroups = [
  { label: 'Frameworks', items: ['Next.js', 'React'] },
  { label: 'Database & Hosting', items: ['Azure', 'Cloudflare', 'Docker', 'Postgres'] },
  { label: 'Languages', items: ['Typescript', 'C++', 'Rust'] },
  { label: 'Tools', items: ['Vscode', 'Blender', 'Adobe Creative Cloud'] },
];

export default function AboutPage() {
  return (
    <main>
      {/* Section 1 — Header */}
      <SectionReveal as="section" className="py-16 md:py-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 sm:flex-row sm:px-6">
          <Image
            src="/avatar.jpeg"
            alt="Ian Smith"
            width={160}
            height={160}
            priority
            className="h-40 w-40 shrink-0 border object-cover"
          />
          <div>
            <h1 className="font-display font-medium tracking-tight text-3xl md:text-4xl">Ian Smith</h1>
            <p className="mt-2 text-base text-text-muted">Software engineer. Musician. Visual artist.</p>
            <p className="mt-4 max-w-[70ch] text-base leading-relaxed">
              Hi, I&apos;m Ian, a software engineer and web designer with a passion for music and art.
              I have 4 years experience in the software business and an extensive portfolio of paid
              work and personal projects in the software, music, and visual art domains. Above all,
              I&apos;m looking to create new and stunning experiences.
            </p>
          </div>
        </div>
      </SectionReveal>

      {/* Section 2 — Experience */}
      <section className="border-t py-16 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionReveal>
            <h2 className="font-display font-medium text-2xl">Experience</h2>
          </SectionReveal>
          <SectionReveal stagger delayMs={150} className="mt-8">
            {experience.map((entry) => (
              <article
                key={entry.company}
                className="grid grid-cols-1 gap-x-6 gap-y-2 border-t py-8 first:border-t-0 first:pt-0 md:grid-cols-12"
              >
                <div className="font-mono text-sm text-text-muted md:col-span-3">
                  <p>{entry.dates}</p>
                  <p>{entry.location}</p>
                </div>
                <div className="md:col-span-9">
                  <h3 className="font-display font-medium text-xl">
                    {entry.role} — {entry.company}
                  </h3>
                  <ul className="mt-3 list-inside list-disc space-y-1 text-base">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <p className="mt-3 font-mono text-sm text-text-muted">Tech: {entry.tech}</p>
                </div>
              </article>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* Section 3 — Education */}
      <section className="border-t py-16 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionReveal>
            <h2 className="font-display font-medium text-2xl">Education</h2>
          </SectionReveal>
          <SectionReveal delayMs={150} className="mt-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-12">
              <div className="font-mono text-sm text-text-muted md:col-span-3">
                <p>2021 - 2025</p>
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display font-medium text-xl">
                  Bachelors in Mathematics — Wayne State University
                </h3>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-text-muted">
                  {educationNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Section 4 — Skills */}
      <section className="border-t py-16 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionReveal>
            <h2 className="font-display font-medium text-2xl">Skills</h2>
          </SectionReveal>
          <SectionReveal stagger delayMs={150} className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  {group.label}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="border bg-surface px-2.5 py-1 font-mono text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* Section 5 — Contact */}
      <section id="contact" className="border-t py-16 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionReveal>
            <h2 className="font-display font-medium text-2xl">Contact</h2>
            <p className="mt-3 font-mono text-sm text-text-muted">
              Honesty first: this form doesn&apos;t send anywhere yet. Email me instead.
            </p>
          </SectionReveal>
          <SectionReveal delayMs={150} className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="order-1">
              <a
                href="mailto:ianpayntar@gmail.com"
                className="font-display text-xl font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ianpayntar@gmail.com
              </a>
              <div className="mt-3">
                <a
                  href="https://github.com/ismith507"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sm text-text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  github.com/ismith507
                </a>
              </div>
            </div>
            <div className="order-2">
              <ContactForm />
            </div>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
