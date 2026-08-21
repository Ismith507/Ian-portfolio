'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { createCpuBackend } from './fractal-cpu';
import { createGlBackend } from './fractal-gl';
import {
	AXIS_Y_PX,
	MAX_BITMAP,
	MAX_BITMAP_GL,
	viewSpecForPath,
	type FractalColors,
	type FractalView,
	type Rgb,
	type ViewSpec,
} from './fractal-shared';

// Site-wide fractal backdrop. Lives in the root layout so it persists across
// client-side navigation; spans the viewport (fixed, behind all content —
// the opaque nav and footer bound it visually).
//
// Camera behavior:
// - Each page owns a base view (fractal-shared.ts PAGE_VIEWS). Navigating
//   animates a zoom/pan to the destination page's view.
// - On top of the base view, an AMBIENT BREATHING ZOOM runs continuously:
//   it dives slowly to AMBIENT_RANGE× deeper than the page view, then
//   reverses and climbs back out — a ping-pong, never a fade/reset, since
//   the backdrop persists. The per-frame re-render is what makes the red
//   boundary pixels twinkle as iteration bands drift.
// - Navigation transitions interrupt the breath and it restarts fresh (from
//   the page view, diving) on arrival. Reduced motion disables all of it —
//   each page gets a static view.
const ANIM_MS = 1400; // navigation zoom duration
const FRAME_MS = 1000 / 60; // throttle to ~60fps
const AMBIENT_ZOOM = true; // master switch for the breathing zoom
const AMBIENT_ZOOM_PER_FRAME = 0.99986; // breath rate (per ~60fps frame)
const AMBIENT_RANGE = 10; // breathe this many × deeper than the page view

function parseChannels(channels: string, fallback: Rgb): Rgb {
	// CSS custom properties hold space-separated RGB channels, e.g. "154 154 162".
	const parts = channels.trim().split(/\s+/).map(Number);
	if (parts.length === 3 && parts.every((p) => Number.isFinite(p))) {
		return [parts[0], parts[1], parts[2]];
	}
	return fallback;
}

const easeInOutCubic = (p: number): number =>
	p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

type Sys = { goTo(spec: ViewSpec): void };

export default function FractalBackdrop() {
	const pathname = usePathname();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const sysRef = useRef<Sys | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const backend = createGlBackend(canvas) ?? createCpuBackend(canvas);
		if (!backend) return;

		const colors: FractalColors = {
			muted: [155, 150, 140],
			accent: [221, 99, 90],
		};
		const readColors = () => {
			const styles = getComputedStyle(document.documentElement);
			colors.muted = parseChannels(
				styles.getPropertyValue('--color-text-muted'),
				colors.muted,
			);
			colors.accent = parseChannels(
				styles.getPropertyValue('--color-accent'),
				colors.accent,
			);
		};
		readColors();

		const reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		let targetSpec: ViewSpec = viewSpecForPath(window.location.pathname);
		let base: FractalView | null = null; // the page's resolved view
		let m = 1; // ambient zoom multiplier on base.scale (1 = at the page view)
		let dir: 1 | -1 = 1; // 1 = breathing in (diving), -1 = breathing out
		let nav: { from: FractalView; to: FractalView; start: number } | null =
			null;
		let raf = 0;
		let last = 0;
		let sized = false;

		const currentView = (): FractalView | null =>
			base ? { re: base.re, im: base.im, scale: base.scale * m } : null;

		// Resolve a spec to a concrete camera. The 'axis' sentinel pins the
		// fractal's horizontal axis (im = 0) AXIS_Y_PX below the viewport top,
		// device-independently (the wide home view's anchor).
		const resolve = (spec: ViewSpec): FractalView => {
			const rect = canvas.getBoundingClientRect();
			const im =
				spec.im === 'axis'
					? (0.5 - AXIS_Y_PX / rect.height) *
					spec.scale *
					(rect.height / rect.width)
					: spec.im;
			return { re: spec.re, im, scale: spec.scale };
		};

		const tick = (now: number) => {
			raf = requestAnimationFrame(tick);
			if (now - last < FRAME_MS) return;
			last = now;
			if (!sized || !base) return;

			if (nav) {
				const p = Math.min((now - nav.start) / ANIM_MS, 1);
				const e = easeInOutCubic(p);
				const { from, to } = nav;
				let s: number;
				let re: number;
				let im: number;
				if (Math.abs(from.scale / to.scale - 1) < 1e-9) {
					// Pure pan: plain eased interpolation.
					s = to.scale;
					re = from.re + (to.re - from.re) * e;
					im = from.im + (to.im - from.im) * e;
				} else {
					// Zoom: geometric scale interpolation (constant zoom RATE), with
					// the center on the matching cone path so the destination stays
					// put on screen as it grows.
					s = from.scale * Math.pow(to.scale / from.scale, e);
					const k = (s - to.scale) / (from.scale - to.scale);
					re = to.re + (from.re - to.re) * k;
					im = to.im + (from.im - to.im) * k;
				}
				backend.frame({ re, im, scale: s }, colors);
				if (p >= 1) {
					// Arrived: restart the breath fresh from the page view, diving.
					base = { ...to };
					m = 1;
					dir = 1;
					nav = null;
					// Full-quality settle (matters for the CPU keyframe path, which
					// otherwise relied on the breath's continuous refinement).
					backend.sync(base, colors);
				}
				return;
			}

			// Ambient breathing zoom: ping-pong between the page view and
			// AMBIENT_RANGE× deeper — no fades, no resets.
			if (!AMBIENT_ZOOM) return;
			if (dir === 1) {
				m *= AMBIENT_ZOOM_PER_FRAME;
				if (m <= 1 / AMBIENT_RANGE) {
					m = 1 / AMBIENT_RANGE;
					dir = -1;
				}
			} else {
				m /= AMBIENT_ZOOM_PER_FRAME;
				if (m >= 1) {
					m = 1;
					dir = 1;
				}
			}
			const view = currentView();
			if (view) backend.frame(view, colors);
		};

		const goTo = (spec: ViewSpec) => {
			targetSpec = spec;
			if (!sized) return; // first resize will place the camera
			const to = resolve(spec);
			if (!base || reduceMotion) {
				base = to;
				m = 1;
				dir = 1;
				nav = null;
				backend.sync(to, colors);
				return;
			}
			// Same page view (and not mid-flight)? Let the breath continue.
			if (
				!nav &&
				base.re === to.re &&
				base.im === to.im &&
				base.scale === to.scale
			) {
				return;
			}
			const from = nav ? null : currentView();
			nav = {
				from: from ?? currentView()!,
				to,
				start: performance.now(),
			};
		};
		sysRef.current = { goTo };

		let lastW = 0;
		let lastH = 0;
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			if (rect.width < 2 || rect.height < 2) {
				sized = false;
				return;
			}
			// The GL shader can afford device-pixel resolution (sharper shapes,
			// especially at deep zoom); the CPU fallback keeps its cheaper cap.
			const dpr =
				backend.kind === 'gl' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
			const cap = backend.kind === 'gl' ? MAX_BITMAP_GL : MAX_BITMAP;
			const w = Math.min(cap, Math.round(rect.width * dpr));
			const h = Math.max(2, Math.round(w * (rect.height / rect.width)));
			// The observer fires on observe() and on spurious layout events (e.g.
			// a scrollbar appearing/vanishing on navigation changes the viewport
			// by a few px). Never interrupt anything unless pixels really changed.
			if (sized && w === lastW && h === lastH) return;
			lastW = w;
			lastH = h;
			backend.resize(w, h);
			const firstSize = !sized;
			sized = true;
			if (nav) {
				// Mid-flight: re-resolve the destination (the 'axis' pin depends on
				// viewport shape) and let the animation continue — never jump.
				nav.to = resolve(targetSpec);
				return;
			}
			base = resolve(targetSpec);
			const view = currentView();
			if (!view) return;
			// Redraw now where it's cheap or necessary; the running loop repaints
			// the CPU backend within a few frames (a synchronous CPU repaint here
			// would hitch live window-resizing).
			if (firstSize || reduceMotion || backend.kind === 'gl') {
				backend.sync(view, colors);
			}
		};
		resize();

		const ro = new ResizeObserver(() => resize());
		ro.observe(canvas);

		const mo = new MutationObserver(() => {
			readColors();
			// The running loop picks new colors up next frame; only a static
			// (reduced-motion) backdrop needs an explicit redraw.
			if (reduceMotion) {
				const view = currentView();
				if (view) backend.sync(view, colors);
			}
		});
		mo.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});

		// The breath runs whenever motion is allowed; rAF self-suspends in
		// hidden tabs, so no explicit visibility handling is needed.
		if (!reduceMotion) raf = requestAnimationFrame(tick);

		return () => {
			if (raf) cancelAnimationFrame(raf);
			ro.disconnect();
			mo.disconnect();
			sysRef.current = null;
			backend.dispose();
		};
	}, []);

	// Route changes drive the camera.
	useEffect(() => {
		sysRef.current?.goTo(viewSpecForPath(pathname));
	}, [pathname]);

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed inset-0 -z-10 hidden md:block"
		>
			<canvas
				ref={canvasRef}
				width={768}
				height={768}
				className="h-full w-full"
			/>
		</div>
	);
}
