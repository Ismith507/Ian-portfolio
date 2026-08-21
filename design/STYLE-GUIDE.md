# Style Guide

The visual law of the site. Design agents PROPOSE within these bounds; implementation
agents OBEY them exactly. Values marked **(proposal)** are Ian-approved starting points
that the fleet's design phase may tune — but only with a stated reason, and final values
must pass the accessibility checks at the bottom. Values marked `>> FILL IN` need Ian.

## 1. Color

Dark theme is the default and primary design target. Every token exists in both themes.
Tokens are consumed as Tailwind theme extensions (single source of truth in
`tailwind.config.js` — implementation agents never hard-code hex values in components).

The palette is four voices: **bold red, white, muted gray, black** — nothing else.
Red is THE accent and it is used sparingly; everything else is neutral. The
finish is MATTE: warm paper/charcoal neutrals (never pure white or blue-black),
a dusty brick red rather than neon, and a subtle site-wide grain overlay (see
§6a) providing texture between the clean lines.

### Dark theme (implemented)

| Token          | Value     | Use |
|----------------|-----------|-----|
| `bg`           | `#121210` | page background — warm charcoal, not blue-black |
| `surface`      | `#1A1A17` | cards, panels, nav |
| `surface-2`    | `#232320` | hover states, nested surfaces |
| `border`       | `#34342F` | hairline borders, dividers |
| `text`         | `#E7E5E0` | primary text — warm off-white, the "white" voice |
| `text-muted`   | `#9B968C` | secondary text, captions, metadata — warm muted gray |
| `accent`       | `#DD635A` | THE red — dusty terracotta; links, active states, focus rings |
| `accent-fill`  | `#A83832` | red as a FILL holding white text (deep enough to pass contrast) |

### Light theme (implemented)

| Token          | Value     | Use |
|----------------|-----------|-----|
| `bg`           | `#F5F4F0` | page background — warm paper, not white |
| `surface`      | `#FBFAF7` | cards, panels, nav — near-white, never pure |
| `surface-2`    | `#ECEAE4` | hover states, nested surfaces |
| `border`       | `#D8D5CC` | hairline borders, dividers |
| `text`         | `#1D1C19` | primary text — warm near-black |
| `text-muted`   | `#5D5A52` | secondary text, captions, metadata |
| `accent`       | `#A93B38` | dusty brick red (the dark-theme red fails 4.5:1 on paper) |
| `accent-fill`  | `#A93B38` | same red for fills holding white text |

All pairings are WCAG AA verified: text, muted, and accent ≥ 4.5:1 on both
`bg` and `surface`; white on `accent-fill` ≥ 4.5:1.

### Color rules

- Red is seasoning, not sauce: any given viewport is ~90% neutrals (black/white/gray),
  with red drawing the eye to at most one or two moments per screen.
- Red never appears as long body text — links, underlines, active marks, small fills.
- NO additional accent hues. Emphasis beyond red comes from weight, size, the mono
  face, or inverted neutrals (white-on-black / black-on-white blocks). If a rare
  second voice is truly needed, it is a tint or shade of the red — never a new hue.
- Red fills always carry white text and always use `accent-fill` so contrast passes.
- Glow/shadow effects using the red are allowed at low opacity for the "alive" feeling,
  but max one glowing element per viewport.
- Artwork and photography are shown on neutral `surface` — never tint, filter, or place
  colored overlays on Ian's art.

## 2. Typography (proposal)

Three faces, loaded via `next/font` (self-hosted at build time, no external requests):

| Role | Face | Why |
|------|------|-----|
| Display / headings | **Space Grotesk** | geometric grotesque with personality — technical but not sterile |
| Body | **Inter** | disappears into readability |
| Mono (labels, metadata, code, dates, nav accents) | **JetBrains Mono** | the "engineer's voice" — used SMALL and sparingly |

Scale (desktop → mobile scale down one step):

- Display: 56-72px / tight leading (page heroes only)
- H1 32-40px · H2 24-28px · H3 20px
- Body 16-17px / 1.6-1.7 line height · Small/meta 13-14px mono

Rules: max ~70 characters per line for body text; headings in sentence case (not ALL
CAPS, except tiny mono labels where uppercase + letter-spacing is the label style).

## 3. Space, layout, shape

- Spacing follows Tailwind's default 4px-based scale; section vertical rhythm 96-128px
  desktop, 64-80px mobile.
- Content max-width: ~1200px for grids, ~720px for any prose block (prose blocks are
  rare by design — see BRIEF.md: show, don't tell).
- Grid discipline: 12-column mental model; alignment is part of the "precise" vibe.
  Playfulness comes from CONTROLLED breaks — one element per section may break the grid
  (overlap, rotate ≤2deg, offset) — never more.
- Corners: RIGHT ANGLES (0px radius) — Ian's call, and it suits the bold-blocking
  reference direction. No rounded cards, no pill buttons. A 1-2px radius is tolerated
  only where a hard corner visibly renders poorly (e.g. tiny chips), never as a default.
- Borders over shadows in dark theme; soft shadows allowed in light theme.

## 4. Motion (decided: moderate, scroll-aware)

- Micro-interactions (hover, focus, toggle): 150-250ms, ease-out.
- Scroll reveals: sections fade/rise in once (12-24px translate, 300-500ms, stagger
  60-90ms between siblings). Elements never re-animate on scroll-up.
- One "hero moment" per page maximum (e.g. animated fractal-inspired canvas accent on
  the home hero). The existing fractal explorer page IS the rich-interaction showcase.
- Implementation: CSS transitions + IntersectionObserver (a browser API that reports
  when an element scrolls into view). A motion library (e.g. framer-motion) may be added
  ONLY if the design phase documents why CSS cannot achieve the spec.
- `prefers-reduced-motion` (the operating-system "reduce motion" setting) must disable
  all non-essential animation.

## 5. Theme toggle behavior

- Three-way preference: light / dark / system, persisted in `localStorage`.
- Default for first-time visitors: follow system.
- No flash of the wrong theme on load (set the theme class in a tiny inline script in
  the document head before first paint).
- Toggle lives in the site nav; keyboard accessible; announces its state.

## 6. Imagery & media treatment

- Drawings/paintings/photos: image-first. In the Art gallery grid, titles/descriptions
  live in the hover/focus/tap overlay (see Gallery piece in §7) — no visible captions
  beside the works. Aspect handling: never crop artwork to fit a grid; use a grid that
  respects each piece's aspect ratio (masonry-style columns) or letterbox on `surface`.
- Photography may use full-bleed rows; paintings/drawings never full-bleed.
- Music: links out only, no on-site playback (decided in CONTENT.md). Pieces render
  as link cards — title, mono metadata line (year, role), external-link affordance —
  in `surface` styling. The music page starts EMPTY: it ships with a designed empty
  state in the site's voice (dry humor allowed), never a bare or broken-looking page.
- All images through `next/image` with proper `alt` text; art alt text describes the
  piece, not "image of art".

## 7. Component notes

- **Nav**: persistent, slim, `surface` with hairline border; active section marked with
  `accent`; mono for the wordmark or section labels — pick one, not both.
- **Badge**: Ian is designing a personal badge/monogram (see REFERENCES.md mood
  fragments). It appears top-left in the header and in the footer below the
  contact/socials, and clicking it always returns to the site root. Until the real
  asset lands (file slot in CONTENT.md), implement with a placeholder mark sized and
  positioned per the design spec so the swap is drop-in.
- **Cards** (project/domain): title + one-line description + mono meta row (year, stack,
  medium); whole card clickable; hover = border brightens to `accent` + 2-4px lift.
- **Buttons/links**: primary = `accent-fill` red with white text, or an `accent`
  outline; text links underlined on hover minimum. Focus ring: 2px `accent`, always
  visible on keyboard focus.
- **Gallery piece (Art page)**: image-first — at rest, the grid shows only the works.
  Hovering a piece reveals a bottom-anchored scrim (a dark gradient behind the text so
  contrast passes on any image) showing the TITLE ONLY — plus the piece's description
  in mono small when it has one. No other metadata (no medium, year, or tag rows).
  Fades in per the micro-interaction timing. Equivalents are required: keyboard focus
  shows the same overlay, and on touch screens the first tap reveals it (second tap
  opens the lightbox). The overlay never tints the whole artwork — the scrim covers
  only the caption zone.
- **Lightbox (Art page)**: clicking a gallery piece opens it in a modal popover.
  The image displays at its NATURAL size — scaled down only if it exceeds ~90% of the
  viewport, never scaled up to fill the screen. Everything behind it is dimmed (`bg`
  at ~80% opacity) so the piece is the only thing in focus. Title in mono small
  beneath the image (description too, if present); nothing else. Closes via Escape,
  clicking the dimmed backdrop, or a visible close button. While open: page scroll
  locked, keyboard focus trapped inside, and focus returns to the originating piece
  on close. Open/close is a fade per micro-interaction timing (instant under
  reduced motion). Keyboard: Enter on a focused piece opens its lightbox.
- **Footer**: quiet, mono, small; one line of dry humor permitted.

## 8. Accessibility gates (non-negotiable, checked at review)

- Body text ≥ 4.5:1 contrast ratio against its background; large headings ≥ 3:1.
  (Contrast ratio measures how distinguishable text is from its background —
  WCAG AA is the standard mid-tier compliance level.)
- All interactive elements reachable and operable by keyboard, visible focus state.
- Reduced-motion honored (see §4).
- Theme toggle and nav usable with a screen reader.

## 9. Ian's non-negotiables (law)

- No emojis, no clip art, no art sourced from another artist — beyond industry
  standard icons.
