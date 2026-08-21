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
	frame(view: FractalView, colors: FractalColors): void;
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
	// TODO(Ian): pick signature views for these pages. Until then they share
	// the home view, so navigating to them does not move the camera.
	art: HOME_VIEW,
	music: HOME_VIEW,
	about: HOME_VIEW,
} as const;

export function viewSpecForPath(pathname: string): ViewSpec {
	if (pathname.startsWith('/projects/software')) return PAGE_VIEWS.software;
	if (pathname.startsWith('/projects/art')) return PAGE_VIEWS.art;
	if (pathname.startsWith('/projects/music')) return PAGE_VIEWS.music;
	if (pathname.startsWith('/about')) return PAGE_VIEWS.about;
	return PAGE_VIEWS.home;
}

// ---- fractal tuning (single source of truth for both backends) ----
export const MAX_BITMAP = 1280; // backing-width cap for the CPU fallback (px)
// GL renders at devicePixelRatio up to this — high enough that a Retina 16"
// viewport (~3024 device px) renders 1:1 with NO compositor upscale blur.
export const MAX_BITMAP_GL = 4096;
// Escape bailout |z|² threshold. Deliberately huge: the distance estimate
// needs a large escape radius to converge (bailout 1e4 ≈ 2 accurate digits,
// 1e6 ≈ 3), and the smooth iteration count stays exact at any radius. Costs
// only ~4 extra iterations per escaped point.
export const ESCAPE_R2 = 1e8;

// ---- distance-estimation (DE) line art ----
// The crispness primitive: each pixel's true distance to the set boundary
// (d = |z|·ln|z| / |z'|, derivative iterated alongside the orbit) is mapped
// to screen space, so the boundary renders as CONSTANT-PIXEL-WIDTH line art
// at any zoom depth, with analytic anti-aliasing from a pixel-footprint
// smoothstep — no supersampling needed.
export const DE_LINE_PX = 1.5; // core line width (device px)
export const DE_LINE_ALPHA = 0.42; // alpha of the line core (matte: no hard pop)
export const DE_GLOW_PX = 20; // soft halo reach around lines (device px)
export const DE_GLOW_EXP = 3; // halo falloff exponent (steeper = less bloom)
export const DE_GLOW_ALPHA = 0.14; // alpha of the halo at the line (matte)
// The old iteration-field alpha survives as an under-layer beneath the DE
// line-work — this is the TEXTURE layer; higher = more visible grain/banding
// structure between the lines.
export const FAR_FIELD_KEEP = 0.55;
export const BASE_ITER = 48; // iterations at the widest view
export const ITER_PER_DECADE = 60; // extra iterations per 10x zoom-in
export const MAX_ITER_CAP = 320;
export const START_SCALE = 3; // widest view; iteration budget is relative to it

// Boundary filigree styling — a four-stop ramp over t = n/maxIter, always
// shades of the ONE accent hue (palette law): muted gray warms into a deep
// dark red, saturates to the full accent, and brightens to a hot red only in
// the last sliver hugging the black interior.
export const RED_START = 0.3; // t where gray starts warming
export const RED_DEEP = 0.55; // fully deep/dark red by here
export const RED_FULL = 0.8; // fully saturated accent red by here
export const RED_HOT = 0.98; // brightened hot red at the set's edge
export const RED_DEEP_FACTOR = 0.45; // deep shade = accent × this
export const RED_HOT_MIX = 0.12; // hot shade = accent mixed this far to white (kept low: matte, no white bloom)
export const ACCENT_ALPHA = 0.35; // alpha once the red has developed
// Alpha shaping. The far field fades in FROM ZERO over [0, FAR_FADE_END] of t
// so the gray-to-background edge far from the set is imperceptible — never a
// hard cutoff; then a quadratic ramp lifts detail toward the boundary.
export const FAR_FADE_END = 0.22;
export const ALPHA_BASE = 0.05;
export const ALPHA_RAMP = 0.28;
export const FILIGREE_MIN_ITER = 2; // skip only the immediate-escape far field

// More iterations as the view narrows, so boundary bands stay resolved.
export const maxIterAt = (scale: number): number =>
	Math.min(
		MAX_ITER_CAP,
		Math.round(BASE_ITER + ITER_PER_DECADE * Math.log10(START_SCALE / scale)),
	);
