# Content Inventory

The single source of truth for every fact and asset on the site. Implementation agents
copy content FROM HERE VERBATIM — they never invent facts about Ian, his work, or his
history. Anything not filled in here ships as a clearly-visible `[TODO: …]` placeholder.

Ian: replace every `>> FILL IN` before the fleet runs. Delete sections you don't want
on the site.

## Bio (Home + About)

- **Name as displayed**:  Ian Smith
- **One-line role** (under the name): Software engineer. Musician. Visual artist.
- **Short bio** (2-4 sentences, home page):

  Hi, I'm Ian, a software engineer and web designer with a passion for music and art. I have 4 years experience in the software business and an extensive portfolio of paid work and personal projects in the software, music, and visual art domains. Above all, I'm looking to create new and stunning experiences.

- **About-page bio** (optional — 2-3 sentences MAX; the About page leads with
  experience and facts, not prose. Leave empty to reuse the short bio):

  >> FILL IN (optional)

## Professional experience (About page — newest first)

For each role:

```
### Role title — Company
- Dates: 
- Location (or Remote):
- 2-4 bullets: what you built/owned, with concrete outcomes
- Tech: comma-separated list
```
### Software Engineer — Firstland Services
- Dates: February 2024 - Present
- Location (or Remote): Detroit, MI
- 2-4 bullets: 
  - RDF graph driven data solutions
  - GIS data processing and visualization
  - AI integrated website generation and publication
  - Zero code website editor and publisher
- Tech: Typescript, React, Cloudflare, Next.js, SQL, Postgres, AI

### Software Engineer — Proactive Technology Management
- Dates: November 2025 - Present
- Location (or Remote): Detroit, MI
- 2-4 bullets: 
  - HIPAA compliant healthcare applications
  - Single application IT resource manager and data visualizer
- Tech: Typescript, React, Azure, Next.js, SQL, Postgres, AI

## Education

```
### Degree / program — Institution
- Dates:
- Notes (honors, focus, relevant coursework — optional):
```

### Bachelors in Mathematics — Wayne State University
- Dates: 2021 - 2025
- Notes (honors, focus, relevant coursework — optional):
 - Computer Science
 - Numerical Computation
 - Mathematical Analysis
 - Differential Equations

## Skills (About page, optional)

Grouped, not an alphabet soup. Suggested groups: Languages / Frameworks & tools / Other.

### Frameworks:

- Next.js
- React

### Database & Hosting:

- Azure
- Cloudflare
- Docker
- Postgres

### Languages:

- Typescript
- C++
- Rust

### Tools:

- Vscode
- Blender
- Adobe Creative Cloud

## Projects — Software

For each project:

```
### Project name
- One-liner:
- Description (2-4 sentences):
- Links: repo / live site
- Tech: 
- Media: screenshot path in public/projects/ (optional)
- Featured on home page? yes/no
```

Known existing entries to keep (verify details):

### Mandelbrot Fractal Explorer
- One-liner: Interactive fractal explorer with keyboard-driven pan and zoom
- Description: 2d rendering of mathematical equations generating beautiful images
- Tech: TypeScript, Canvas API, React
- Featured on home page? no

### Chess engine (C++)
- Currently linked from the projects page as an external repo. Keep? Details: MARKED FOR REMOVAL

### AI Site Builder
- One-liner: AI powered site builder; go from prompt -> edit -> publish all in one place
- Description: AI powered suite builder that lets users create reusable website templates. Start with a prompt and your projects information and marketing material and create a template that is fully editable in one page. Hit publish and visit your site!
- Tech: TypeScript, React, AI, Cloudflare Database
- Featured on home page? no

### Roguelike RTS game
- One-liner: Combining roguelike and rts gameplay
- Description: top down rts with roguelike elements where players compete head to head for resources and try to gain powerful boons on each run.
- Tech: Godot
- Featured on home page? no


## Projects — Music

- **How should music be played on the site?** Pick one and fill details:
  - [ ] Embedded players (SoundCloud / Spotify / Bandcamp / YouTube) — paste links per piece
  - [ ] Self-hosted audio files — drop files in `public/music/`, list them below
  - [x] Links out only (no playback on site)

For each piece/release:

```
### Title
- What it is (song, EP, live recording, score…):
- Year:
- Your role (wrote, performed, produced, mixed…):
- Link or file path:
- One-liner or story (optional):
```

>> FILL IN

WORK IN PROGRES, MUSIC PAGE STARTS EMPTY

## Projects — Art (drawing, painting, photography — the /projects/art page)

DECIDED: art is NOT stored in the repo. The gallery pulls from a database at
request/revalidation time, so new pieces appear without redeploying the site. Image
files live in object storage (a file bucket with public URLs); database rows hold the
metadata plus the image URL. The site is display-only — adding and managing art
happens outside this codebase.

The specific database provider has NOT been chosen yet. Agents build the scaffolding
so a provider can be plugged in later — technical requirements in FLEET-PROMPT.md.

Working schema — every piece has these fields (the fleet's design phase may extend
this with a stated reason, never remove fields):

- **title** (or "Untitled, year")
- **imageUrl** (object-storage URL)
- **altText** (describes the piece for screen readers — required)
- **description** (optional — shown in the hover overlay)
- **sortOrder** (gallery ordering) and/or **featured** (home-page eligibility)

Dev fixtures: until the database exists, the gallery renders from a local fixture
file (JSON in the repo) with placeholder images, so layout and hover behavior are
fully testable and the build never depends on the database.

Note: `public/knight.jpg` and `public/Mandelbrot.jpeg` are link-card images for the
software projects — they are NOT art entries.

>> FILL IN (optional) — a few real fixture entries (title / alt text / optional
description) if you want the gallery previewed with your actual pieces before the
database exists.

## Contact (renders as a section on the About page — no separate contact page)

- **Email to display**: ianpayntar@gmail.com
- **Links** (GitHub, LinkedIn, Instagram/art account, SoundCloud/Bandcamp, etc. —
  only ones you actively maintain):

  - Github: https://github.com/ismith507

- The current contact form is front-end only (submits nowhere). Options:
  - [ ] Keep as mailto/link-based contact (no form)
  - [ ] Wire the form to a service — >> FILL IN which (e.g. Formspree, Resend), including any API key setup you'll do
  - [x] Keep the non-functional form for now with an honest "email me instead" note

## Site meta

- **Browser tab title**: Ian Smith
- **Meta description**: Ian Smith's portfolio site
- **Favicon**: keep current, or replace with: >> FILL IN
- **Personal badge/monogram** (appears in header top-left and footer, links to site
  root — see REFERENCES.md mood fragments): drop the file at `public/badge.svg` (or
  similar) when designed. Until then the site uses a placeholder mark. File: >> FILL IN
