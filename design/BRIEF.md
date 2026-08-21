# Design Brief

This document defines WHAT the site is and HOW it should feel. Every design agent reads
this first. Where a section is marked `>> FILL IN`, Ian must complete it before the
redesign fleet runs. Everything else is settled and should be treated as decided.

## Purpose

A personal portfolio for Ian Smith presenting three creative domains under one roof:

1. **Software engineering / web development** — professional experience and personal projects
2. **Music** — recordings, performances, or compositions
3. **Visual art** — drawing, painting, photography

It also carries professional experience and education, kept brief. The governing
principle is **show, don't tell**: the work is the content; writing exists only to
frame it. Headlines and one-liners, not paragraphs.

## Audience

Primary: potential employers and collaborators evaluating Ian's engineering skill and taste.
Secondary: fellow artists/musicians and curious visitors.
The site must read as credible to a senior engineer within 10 seconds AND reward
exploration with personality and art.

## The feeling (decided)

**Sleek, dark, technical — with playful creative-studio energy.**

The tension between those two IS the identity: an engineer's precision holding an
artist's mischief. The dark, exact, grid-driven base signals craft; color, type, and
motion moments provide the play. Neither side wins completely.

Vibe words agents should design toward:
- **precise** — aligned grids, consistent spacing, nothing accidental
- **alive** — motion that responds to you, moments of unexpected color
- **crafted** — details (hover states, focus rings, easing curves) that reward attention
- **curious** — the fractal-explorer spirit: interactive, mathematical, a little nerdy
- **warm** — despite the dark palette, never cold or corporate

Anti-vibes (design away from these):
- corporate SaaS landing page (gradient blobs, floating UI screenshots, "Get Started" energy)
- template portfolio (generic hero + card grid + footer with zero personality)
- crypto/gamer dark mode (harsh neons everywhere, aggressive glow)
- sterile minimalism (so restrained there is no personality left)

## Tone of voice (for interface copy and headings)

First person, plain language, confident without bragging. Short sentences. Dry humor
allowed in small doses (empty states, 404, footer). Never buzzwordy: no "passionate",
"leverage", "solutions".

Copy is minimal everywhere. If a section seems to need three paragraphs, the answer is
a better layout, not more words. No page on this site contains a long piece of writing.

Personal statement (Ian's own voice — sits on the home page; agents echo its cadence
in other copy):

Technical problems, designed solutions. I make apps tick, designs pop, and work flow. Whether you're greenfielding new projects, maintaining existing ones, or looking for a stunning facelift, I'm here to help.

Three works whose PERSONALITY feels like Ian (design toward this energy):

1. FromSoftware game studio: vision, attention to detail, passion, storytelling
2. Cowboy Bebop: storytelling, unity of sound and visuals, effortless
3. Blender: flexibility, open source, collaboration, expansive toolkit

## Site structure (information architecture)

Decided starting point — the fleet's design phase may refine details but not the spirit.
Three destinations, no more. Work first, writing minimal:

- **Home** — the personal statement, entry points into the three domains, featured work.
  Most of the page is work, not words.
- **Projects** — split into three dedicated domain pages, one per domain:
  - **Software** (`/projects/software`) — engineering and web projects; includes the
    existing interactive Mandelbrot fractal explorer, which MUST survive the redesign
    as a working feature
  - **Art** (`/projects/art`) — drawing, painting, photography, presented as a
    gallery: an image-first grid of works where each piece's title appears on hover
    (with keyboard and touch equivalents) — no metadata rows, no visible text blocks
    beside the images. Clicking a piece opens it at full image size in a popover
    over a dimmed backdrop (lightbox spec in STYLE-GUIDE.md). Works are served from
    a database (see CONTENT.md) — new pieces appear without redeploying the site
  - **Music** (`/projects/music`)

  The nav exposes all three domains directly. If a `/projects` index exists at all,
  it is a minimal signpost into the three domains, not a content page.
- **About** — ONE page, fact-dense and scannable: short bio, professional experience,
  education, skills, and contact (email + links) all live here. No essays. Experience
  entries read like well-typeset data, not prose.

## Hard constraints

- Tech stack stays: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, npm. No CMS.
- Light AND dark theme with a user toggle (details in STYLE-GUIDE.md). Dark is the
  primary/default design target; light must be equally finished, not an afterthought.
- Fully responsive, mobile through wide desktop.
- Accessible: WCAG AA contrast (a web accessibility standard — body text must have at
  least a 4.5:1 contrast ratio against its background), keyboard navigable, honors
  reduced-motion preferences.
- Fast: static generation wherever possible, no heavyweight dependencies without a
  written justification. The art gallery is the deliberate exception: it is
  data-driven (database + object storage, provider not yet chosen) with periodic
  revalidation, and must build and render from local fixtures when no database is
  configured.
