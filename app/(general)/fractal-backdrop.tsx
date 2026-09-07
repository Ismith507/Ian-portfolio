'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { createCpuBackend } from './fractal-cpu';
import { createGlBackend } from './fractal-gl';
import {
	AXIS_Y_PX,
	MAX_BITMAP,
	MAX_BITMAP_GL,
	ambientScale,
	createViewTransition,
	viewSpecForPath,
	type FractalColors,
	type FractalView,
	type Rgb,
	type ViewSpec,
	type ViewTransition,
} from './fractal-shared';

// Site-wide fractal backdrop. Lives in the root layout so it persists across
// client-side navigation; spans the viewport (fixed, behind all content —
// the opaque nav and footer bound it visually).
//
// Camera behavior:
// - Each page owns a base view (fractal-shared.ts PAGE_VIEWS). Navigating
//   animates a zoom/pan to the destination page's view.
// - On top of the base view, an AMBIENT BREATHING ZOOM runs continuously:
//   it dives slowly to 10× deeper than the page view, then
//   reverses and climbs back out — a ping-pong, never a fade/reset, since
//   the backdrop persists. Each frame resolves new detail along the boundary.
// - Navigation transitions interrupt the breath and it restarts fresh (from
//   the page view, diving) on arrival. Reduced motion disables all of it —
//   each page gets a static view.
const NAV_FRAME_MS = 1000 / 60;
const AMBIENT_FRAME_MS = 1000 / 30;

function parseChannels(channels: string, fallback: Rgb): Rgb {
	// CSS custom properties hold space-separated RGB channels, e.g. "154 154 162".
	const parts = channels.trim().split(/\s+/).map(Number);
	if (parts.length === 3 && parts.every((p) => Number.isFinite(p))) {
		return [parts[0], parts[1], parts[2]];
	}
	return fallback;
}

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
		let displayedView: FractalView | null = null;
		let ambientMs = 0;
		let nav: { flight: ViewTransition; to: FractalView; start: number } | null = null;
		let raf = 0;
		let nextDrawAt = 0;
		let lastTick = performance.now();
		let sized = false;

		const currentView = (): FractalView | null =>
			base ? { re: base.re, im: base.im, scale: base.scale * ambientScale(ambientMs) } : null;

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
			const elapsed = Math.min(100, Math.max(0, now - lastTick));
			lastTick = now;
			if (!sized || !base || document.hidden) return;
			if (!nav) ambientMs += elapsed;
			// A deadline with a small timing tolerance avoids skipping every other
			// frame when rAF lands just short of 16.667ms. Ambient motion needs
			// fewer renders; its speed is independent of this scheduling choice.
			if (now + 0.5 < nextDrawAt) return;
			const interval = nav ? NAV_FRAME_MS : AMBIENT_FRAME_MS;
			nextDrawAt = Math.max(nextDrawAt + interval, now + interval / 2);

			if (nav) {
				const p = Math.min((now - nav.start) / nav.flight.duration, 1);
				displayedView = nav.flight.at(p);
				if (p >= 1) {
					base = nav.to;
					ambientMs = 0;
					nav = null;
					// Draw the final frame once, with a complete CPU keyframe if needed.
					backend.sync(base, colors);
				} else {
					backend.frame(displayedView, colors, 'motion');
				}
				return;
			}

			const view = currentView();
			if (view) {
				displayedView = view;
				backend.frame(view, colors);
			}
		};

		const goTo = (spec: ViewSpec) => {
			targetSpec = spec;
			if (!sized) return; // first resize will place the camera
			const to = resolve(spec);
			if (!base || reduceMotion) {
				base = to;
				ambientMs = 0;
				nav = null;
				displayedView = to;
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
			nav = {
				// Rapid clicks continue from the frame on screen, not the old page.
				flight: createViewTransition(displayedView ?? currentView()!, to, canvas.height / canvas.width),
				to,
				start: performance.now(),
			};
			nextDrawAt = 0;
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
			const density = Math.min(dpr, cap / Math.max(rect.width, rect.height));
			const w = Math.max(2, Math.round(rect.width * density));
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
				const to = resolve(targetSpec);
				nav = {
					flight: createViewTransition(displayedView!, to, h / w),
					to,
					start: performance.now(),
				};
				nextDrawAt = 0;
				return;
			}
			base = resolve(targetSpec);
			const view = currentView();
			if (!view) return;
			displayedView = view;
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
