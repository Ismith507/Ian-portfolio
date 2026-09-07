# Fractal rendering review — September 6, 2026

The comparison uses the working copy at the start of this refinement as the
baseline, including the earlier broad-gradient and page-destination changes.
It does not compare against Git HEAD.

## Changes

- Replace two independently eased camera legs with a continuous van Wijk–Nuij
  zoom path. Precompute the path on navigation. Apply one quintic easing function for gentle
  departure and arrival; duration is 1.8–3.6 seconds based on travel length.
  The equations follow [D3's zoom interpolation](https://d3js.org/d3-interpolate/zoom),
  with stable `asinh` evaluation and aspect-ratio normalization. The applicable
  ISC notice is retained in `D3-LICENSE.txt`.
- Correct the frame deadline so a requestAnimationFrame callback fractionally
  below 16.667 ms doesn't cause a skipped navigation frame.
- Drive the ambient zoom by elapsed time, with smooth reversals, at 30 renders
  per second; navigation targets 60. Keep the same backing resolution.
- Build a 1,024-entry palette texture from ten smoothly interpolated shades.
  Cache gamma conversion and texture upload until the theme changes. The CPU
  renderer uses the same table. Smooth escape-time shading adds internal
  contours while distance coloring retains the broad exterior halo.
- Use native float arithmetic when the complex-plane width per backing pixel
  is at least 0.000008. Retain double-float arithmetic for deeper views.
- Reuse the first antialiasing sample: two samples during navigation and four
  when settled, only close to the boundary. Skip extra samples well inside
  the analytically identified cardioid and period-2 bulb.
- Cache CSS width on resize and omit the redundant framebuffer clear.

## Local GPU measurements

In-app browser, WebGL 1, 2400 × 1350 backing pixels, 1200 × 675 CSS pixels, dark
theme. Ten draws per page with small scale changes; discard two warmups and
report the middle measured sample. GPU execution was measured with
[`EXT_disjoint_timer_query`](https://developer.mozilla.org/en-US/docs/Web/API/EXT_disjoint_timer_query),
checking result availability and disjoint status. The synchronous readback used
to validate completed frames is excluded from the GPU values below.

| Base page view | Before, GPU ms | After, settled GPU ms | After, transition sampling GPU ms |
| --- | ---: | ---: | ---: |
| Home | 4.6 | 1.6 | 0.9 |
| Software | 33.7 | 28.7 | 15.6 |
| Art | 4.4 | 1.6 | 0.9 |
| Music | 13.1 | 3.8 | 1.7 |
| About | 46.0 | 11.5 | 5.2 |

These are per-frame measurements at the page's base view, not a complete flight
or browser FPS measurement. Actual pacing also depends on the viewport, driver,
compositor, page activity, and the fractal region visible during a transition.

## CPU fallback measurements

Node.js, full synchronous keyframe at 960 × 540 pixels, five draws per page,
discarding the first warmup. Times below are the middle measured sample in ms.
The normal animation path continues to compute rows in 6 ms time slices.

| Base page view | Before | After |
| --- | ---: | ---: |
| Home | 67.8 | 31.0 |
| Software | 208.3 | 135.1 |
| Art | 103.5 | 48.5 |
| Music | 90.7 | 55.4 |
| About | 232.7 | 177.4 |

## Quality and regression checks

- Compared the native-float path against the same updated shader forced to use
  double-float arithmetic at 2400 × 1350. Mean RGBA channel difference on the
  four wide base views was 0.0028–0.0541 out of 255; fewer than 0.18% of channels
  differed by more than 8. Software retains double-float at this resolution.
- Compared GPU and CPU output at base and 10× ambient depth for all five views.
  Both use identical palette entries and smooth escape-time shading; remaining
  differences include GPU subpixel antialiasing and floating-point precision.
- Automated checks cover distinct destinations, exact transition endpoints,
  continuity through the pullback, gentle departure/arrival, rapid navigation,
  reduced motion, frame deadlines, ambient render frequency, retained detail
  throughout the zoom range, resizing, theme changes, and iteration limits.
- Run regressions with `node --test tests/fractal-backdrop.test.cjs`.

## Remaining limits

The CPU fallback still synchronously completes keyframes on mount, static
redraws, and navigation arrival. Moving that work to a Web Worker is the next
larger improvement if no-WebGL devices become a priority. Deep, dense GPU views
remain the most expensive frames; the current optimization preserves their
precision and full resolution instead of lowering the iteration limit.
