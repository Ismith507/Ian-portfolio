// Shared contract, tuning constants, and PER-PAGE VIEWS for the site-wide
// fractal backdrop.
//
// The backdrop lives in the root layout (it persists across client-side
// navigation) and spans the viewport behind the page content. Each page owns
// a base view of the Mandelbrot set; an ambient "breathing" zoom slowly
// dives deeper from that view and climbs back out, forever. Navigating
// between pages animates a zoom/pan to the destination page's view, giving
// each page its own region of the fractal as its character.
//
// Two rendering backends implement FractalBackend:
//  - fractal-gl.ts  — WebGL fragment shader with df64 (double-float) emulated
//    precision; recomputes every pixel on demand. Preferred.
//  - fractal-cpu.ts — JavaScript escape-time renderer with time-sliced
//    keyframes; automatic fallback when WebGL is unavailable.

export type Rgb = [number, number, number];

export type FractalColors = {
	muted: Rgb;
	accent: Rgb;
};

// A concrete camera: center of the view on the complex plane, plus the
// complex-plane WIDTH of the viewport (height follows the pixel aspect).
export type FractalView = {
	re: number;
	im: number;
	scale: number;
};

export type FractalBackend = {
	kind: 'gl' | 'cpu';
	/** Per-tick draw while a view transition animates. */
	frame(view: FractalView, colors: FractalColors, quality?: 'motion' | 'detail'): void;
	/** Complete draw right now (mount, resize, theme change, reduced motion). */
	sync(view: FractalView, colors: FractalColors): void;
	/** Backing store resolution changed (device pixels). */
	resize(widthPx: number, heightPx: number): void;
	dispose(): void;
};

// ---- per-page views ----
// im can be the sentinel 'axis': resolved at runtime so the fractal's
// horizontal axis (im = 0) sits AXIS_Y_PX below the top of the viewport —
// the device-independent pinning used by the home view.
export type ViewSpec = {
	re: number;
	im: number | 'axis';
	scale: number;
};

export const AXIS_Y_PX = 460;

const HOME_VIEW: ViewSpec = { re: -1.4, im: 'axis', scale: 3 };

export const PAGE_VIEWS = {
	home: HOME_VIEW,
	// Seahorse Valley — the filigree-dense cleft between the main cardioid and
	// the period-2 bulb. The software page's signature view.
	software: { re: -0.7435, im: 0.1314, scale: 0.004 } as ViewSpec,
	// Branching satellite forms above the main set.
	art: { re: -0.16, im: 1.04, scale: 0.12 } as ViewSpec,
	// Elephant Valley — repeating, trunk-like curves at the cardioid's cusp.
	music: { re: 0.275, im: 0.008, scale: 0.035 } as ViewSpec,
	// A miniature Mandelbrot on the western antenna, with radiating filaments.
	about: { re: -1.7688, im: 0.0082, scale: 0.045 } as ViewSpec,
} as const;

export function viewSpecForPath(pathname: string): ViewSpec {
	if (pathname.startsWith('/projects/software')) return PAGE_VIEWS.software;
	if (pathname.startsWith('/projects/art')) return PAGE_VIEWS.art;
	if (pathname.startsWith('/projects/music')) return PAGE_VIEWS.music;
	if (pathname.startsWith('/about')) return PAGE_VIEWS.about;
	return PAGE_VIEWS.home;
}

export type ViewTransition = {
	duration: number;
	at(progress: number): FractalView;
};

// One continuous van Wijk–Nuij zoom path. Unlike two separately eased legs,
// the camera keeps panning through the widest point of the pullback.
// Equations adapted from d3-interpolate (ISC; see design/D3-LICENSE.txt).
export function createViewTransition(
	from: FractalView,
	to: FractalView,
	aspect: number,
): ViewTransition {
	const dx = to.re - from.re;
	const dy = to.im - from.im;
	const distance = Math.hypot(dx, dy / aspect);
	let sample: (t: number) => FractalView;
	let length: number;
	if (distance < Math.min(from.scale, to.scale) * 1e-6) {
		length = Math.abs(Math.log(to.scale / from.scale));
		sample = (t) => ({
			re: from.re + dx * t,
			im: from.im + dy * t,
			scale: from.scale * Math.pow(to.scale / from.scale, t),
		});
	} else {
		const scaleDelta = to.scale * to.scale - from.scale * from.scale;
		const r0 = -Math.asinh((scaleDelta + 4 * distance * distance) / (4 * from.scale * distance));
		const r1 = -Math.asinh((scaleDelta - 4 * distance * distance) / (4 * to.scale * distance));
		const coshStart = Math.cosh(r0);
		const sinhStart = Math.sinh(r0);
		length = Math.abs(r1 - r0);
		sample = (t) => {
			const r = r0 + (r1 - r0) * t;
			const pan = (from.scale / (2 * distance)) * (coshStart * Math.tanh(r) - sinhStart);
			return {
				re: from.re + dx * pan,
				im: from.im + dy * pan,
				scale: (from.scale * coshStart) / Math.cosh(r),
			};
		};
	}
	return {
		duration: Math.min(3600, Math.max(1800, 1200 + 220 * length)),
		at(progress) {
			if (progress <= 0) return { ...from };
			if (progress >= 1) return { ...to };
			// Zero velocity AND acceleration at departure/arrival.
			const t = progress * progress * progress * (10 + progress * (-15 + 6 * progress));
			return sample(t);
		},
	};
}

// Ten-minute breathing cycle, with gentle reversals and a stationary start.
// Driven by elapsed time so the renderer can lower its ambient frame rate.
export function ambientScale(elapsedMs: number): number {
	const phase = ((elapsedMs % 600000) / 600000) * Math.PI * 2;
	return Math.exp(-Math.log(10) * (1 - Math.cos(phase)) / 2);
}

// ---- fractal tuning (single source of truth for both backends) ----
export const MAX_BITMAP = 1280; // longest backing dimension for the CPU fallback
// GL renders at devicePixelRatio up to this — high enough that a Retina 16"
// viewport (~3024 device px) renders 1:1 with NO compositor upscale blur.
export const MAX_BITMAP_GL = 4096;
// Escape bailout |z|² threshold. Deliberately huge: the distance estimate
// needs a large escape radius to converge (bailout 1e4 ≈ 2 accurate digits,
// 1e6 ≈ 3), and the smooth iteration count stays exact at any radius. Costs
// only ~4 extra iterations per escaped point.
export const ESCAPE_R2 = 1e8;

// Original boundary line and narrow halo, measured in backing pixels.
export const DE_LINE_PX = 1.5;
export const DE_LINE_ALPHA = 0.42;
export const DE_GLOW_PX = 20;
export const DE_GLOW_EXP = 3;
export const DE_GLOW_ALPHA = 0.14;
export const FAR_FIELD_KEEP = 0.55;
export const RED_START = 0.3;
export const RED_DEEP = 0.55;
export const RED_FULL = 0.8;
export const RED_DARK = 0.98;
export const RED_DEEP_FACTOR = 0.45;
export const RED_DARK_FACTOR = 0.18;
export const ACCENT_ALPHA = 0.35;
export const FAR_FADE_END = 0.22;
export const ALPHA_BASE = 0.05;
export const ALPHA_RAMP = 0.28;
export const FILIGREE_MIN_ITER = 2;

// Preserve the original color distribution independently of the larger
// iteration budget used to resolve fine geometry.
export const colorIterAt = (scale: number): number =>
	Math.min(320, Math.max(48, Math.round(48 + 60 * Math.log10(3 / scale))));

// Use float32 only when one pixel spans at least this much of the plane.
// Deep views retain double-float coordinates and orbit arithmetic.
export const FLOAT_PIXEL_THRESHOLD = 0.000008;
export const BASE_ITER = 128;
export const ITER_PER_DECADE = 80;
export const MAX_ITER_CAP = 640;
export const START_SCALE = 3;

// More iterations as the view narrows, so boundary bands stay resolved.
export const maxIterAt = (scale: number): number =>
	Math.min(
		MAX_ITER_CAP,
		Math.max(
			BASE_ITER,
			Math.round(BASE_ITER + ITER_PER_DECADE * Math.log10(START_SCALE / scale)),
		),
	);
