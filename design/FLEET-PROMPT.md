# Fleet kickoff prompt — portfolio redesign

## How to use

1. Complete every `>> FILL IN` in design/BRIEF.md, design/STYLE-GUIDE.md,
   design/REFERENCES.md, and design/CONTENT.md, and drop assets into public/.
2. Kick off with: **"run /fleet with the prompt in design/FLEET-PROMPT.md"** — the
   orchestrator passes the prompt below as the workflow's goal.

Why the prompt is shaped this way: fleet code tasks run SIMULTANEOUSLY in isolated
copies of the repo, so two tasks editing the same file creates merge conflicts. The
prompt therefore forces the planner to give every shared file exactly one owner, and
makes the shared visual foundation land as one task that everything else codes against.
If the fleet's planner ends up proposing more than ~8 code tasks, prefer splitting into
two runs (foundation run first, pages run second) instead of one giant run.

---

## THE PROMPT (everything below the line is what gets passed to /fleet)

Redesign this portfolio site (Next.js 14 App Router, React 18, TypeScript, Tailwind,
npm) into a modern portfolio showcasing Ian's professional experience, personal
projects, design work, and education across three domains: software engineering/web
development, music, and visual art (drawing, painting, photography). Per BRIEF.md the
site is: Home, About, and three dedicated domain project pages — /projects/software,
/projects/art, /projects/music — all three exposed directly in the nav. There is no
philosophy page and no separate contact page (contact is a section on About).

AUTHORITATIVE DESIGN DOCUMENTS — read before planning, treat as law:
- design/BRIEF.md — purpose, audience, feeling, tone, site structure, hard constraints
- design/STYLE-GUIDE.md — color tokens, typography, spacing, motion spec, component
  rules, accessibility gates. Implementation agents use ONLY its tokens (via the
  Tailwind theme); no hard-coded colors/fonts in components.
- design/REFERENCES.md — Ian's selected reference sites with take/leave notes; design
  tasks must study these and cite which reference informed each significant decision
- design/CONTENT.md — the single source of truth for all facts, copy, and assets.
  Copy content verbatim. NEVER invent facts about Ian, his history, or his work. Any
  content marked ">> FILL IN" or missing ships as a visible "[TODO: …]" placeholder.

REQUIRED DESIGN PHASE (before any code tasks): produce a concrete design specification
covering (a) final token values (validating the style guide's proposals against WCAG AA
contrast and adjusting only with stated reasons), (b) per-page layout descriptions for
every route in BRIEF.md's site structure, (c) the shared component inventory (nav,
footer, the badge/monogram placeholder mark, theme toggle, project/domain cards,
gallery pieces, music link-out cards, section reveal wrapper) with exact prop-level
API and Tailwind class conventions, so page implementers can code against components
they cannot yet see.

ART DATA ARCHITECTURE (decided; the database provider is NOT yet chosen — scaffold
for a pluggable one):
- The art gallery reads pieces from a database at request/revalidation time (Next.js
  incremental static regeneration or a dynamic fetch) so new art appears WITHOUT a
  redeploy. Images live in object storage; database rows carry metadata plus the
  image URL. The working schema is in design/CONTENT.md.
- Display only: no admin interface, no upload path, no database writes.
- Because the provider is undecided, ALL art data access goes through ONE typed
  module (e.g. lib/art.ts exposing getArtPieces()) that hides the provider behind an
  interface. Ship a local fixture implementation (a JSON file plus placeholder images
  in the repo) as the default: the site MUST build and fully render the gallery with
  zero database credentials configured. Choose and document (in code comments) the
  environment variable(s) that will switch to a real provider later — swapping
  providers must touch only that one module plus configuration.
- The art data module belongs to the art page task. next.config.mjs (which will need
  image remotePatterns for the future storage host) belongs to the foundation task;
  the design spec defines its placeholder configuration.

CODE TASK STRUCTURE — the planner MUST enforce single ownership of every file:
- ONE foundation task (opus tier) exclusively owns all shared files: tailwind.config.js,
  app/globals.css, the root layout, fonts via next/font, the theme system
  (light/dark/system toggle, localStorage persistence, no flash of wrong theme via an
  inline head script), and every shared component from the design spec, each matching
  its specified API exactly.
- Page tasks (one per route or tight route group) own ONLY their route files and any
  page-local components. They import shared components per the spec's API and use only
  spec token/class conventions. They MUST NOT create or edit shared files — a missing
  shared component means code to the spec's API anyway; the build check runs at
  integration, after the foundation merges.
- planNotes MUST tell the integrator to merge the foundation task FIRST, then pages.
- The existing Mandelbrot fractal explorer (app/(general)/projects/fractals,
  components/fractal-canvas.tsx, lib/mandelbrot*) must survive as a fully working
  feature, restyled to the new design; its task owner is the only agent who may touch
  those files.

HARD REQUIREMENTS (verification panels: treat violations as grounds for refutation):
- Every route in BRIEF.md's site structure exists and is reachable from the nav.
- Show, don't tell: copy is headlines, one-liners, and short fact rows — never long
  text sections. Layouts lead with work (projects, art, music); a page whose first
  screen is mostly words violates the brief.
- Both themes fully styled; toggle works; body text meets 4.5:1 contrast in BOTH themes.
- Motion follows the style guide's spec, including prefers-reduced-motion support.
- Responsive from 360px mobile through wide desktop.
- All images via next/image with real alt text; artwork never cropped, tinted, or
  overlaid per the style guide's imagery rules.
- No new runtime dependencies without a one-line justification in the task summary;
  no CMS; nothing committed — all changes land uncommitted in the working tree.
- npm run build passes at integration WITH NO database credentials present — the art
  gallery renders from its fixture implementation.

Old pages/components that the new design replaces should be deleted, not left orphaned.
