// CPU backend for the site-wide fractal backdrop — the JavaScript escape-time
// renderer with time-sliced keyframes. Used only when WebGL is unavailable
// (the GL backend in fractal-gl.ts is preferred).
//
// Architecture (perf without losing resolution):
// - The fractal is always computed at FULL sample density into "keyframes".
//   A keyframe's rows are computed in time slices (≤ BUILD_BUDGET_MS per
//   frame() call), so heavy deep-zoom frames never stall an animation.
// - While a view transition animates, every frame() crop-zooms the latest
//   keyframe via drawImage (GPU, ~free); the crop drifts a little until the
//   next keyframe lands, which reads as a settle, never as lost resolution.
// - Interior points (they never escape, so they'd burn the whole iteration
//   budget) are skipped using closed-form cardioid/period-2-bulb tests
//   and exact cycle detection. Each keyframe is sampled independently:
//   a point unescaped at one zoom is not proof that its neighbors are inside.

import { createPalette, paletteKey, PALETTE_SIZE } from './fractal-palette';
import {
	DETAIL_FREQUENCY,
	DETAIL_STRENGTH,
	ESCAPE_R2,
	GRADIENT_REACH_PX,
	maxIterAt,
	type FractalBackend,
	type FractalColors,
	type FractalView,
} from './fractal-shared';

// Hermite smoothstep, identical to the GLSL built-in the shader uses.
const smoothstep = (lo: number, hi: number, t: number): number => {
	let w = (t - lo) / (hi - lo);
	w = w < 0 ? 0 : w > 1 ? 1 : w;
	return w * w * (3 - 2 * w);
};

const BUILD_BUDGET_MS = 6; // keyframe computation time per frame() call

type Build = FractalView & { row: number };

export function createCpuBackend(
	canvas: HTMLCanvasElement,
): FractalBackend | null {
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	const keyCanvas = document.createElement('canvas');
	const keyCtx = keyCanvas.getContext('2d');
	if (!keyCtx) return null;

	let bw = 0; // bitmap width/height (device px)
	let bh = 0;
	let buildImg: ImageData | null = null;
	let keyView: FractalView | null = null; // view the displayed keyframe holds
	let build: Build | null = null;
	let palette = new Uint8Array(PALETTE_SIZE * 4);
	let lastPalette = '';
	let cssWidth = 1;
	const updatePalette = (colors: FractalColors) => {
		const key = paletteKey(colors);
		if (key === lastPalette) return;
		palette = createPalette(colors);
		lastPalette = key;
		// Do not finish a frame whose upper rows used the previous theme.
		build = null;
	};

	// Compute rows [fromRow, bh) of a keyframe for `view` into data, stopping
	// at the deadline. Returns the next row to compute (== bh when done).
	const computeRows = (
		data: Uint8ClampedArray,
		view: FractalView,
		fromRow: number,
		deadline: number,
	): number => {
		const s = view.scale;
		const aspect = bh / bw;
		const maxIter = maxIterAt(s);

		for (let j = fromRow; j < bh; j++) {
			if (performance.now() > deadline) return j;

			const cIm = view.im + ((j + 0.5) / bh - 0.5) * s * aspect;
			const ySq = cIm * cIm;

			for (let i = 0; i < bw; i++) {
				const x = view.re + ((i + 0.5) / bw - 0.5) * s;

				// Interior short-circuit 1: closed forms. Main cardioid…
				const xq = x - 0.25;
				const q = xq * xq + ySq;
				if (q * (q + xq) <= 0.25 * ySq) {
					continue;
				}
				// …and the period-2 bulb.
				const xp1 = x + 1;
				if (xp1 * xp1 + ySq <= 0.0625) {
					continue;
				}

				let re = 0;
				let im = 0;
				// Running derivative z' for the distance estimate.
				let dzr = 0;
				let dzi = 0;
				let n = 0;
				// Interior short-circuit 2: cycle detection (Brent). Interior
				// orbits converge to exact repeating cycles in float math; on a
				// repeat, the point can never escape — bail as interior.
				let pRe = 0;
				let pIm = 0;
				let checkAt = 16;
				while (n < maxIter) {
					// Derivative first, using the CURRENT z: z' -> 2·z·z' + 1.
					const ndzr = 2 * (re * dzr - im * dzi) + 1;
					const ndzi = 2 * (re * dzi + im * dzr);
					dzr = ndzr;
					dzi = ndzi;
					const reNext = re * re - im * im + x;
					const imNext = 2 * re * im + cIm;
					re = reNext;
					im = imNext;
					n++;
					if (re * re + im * im > ESCAPE_R2) break;
					if (re === pRe && im === pIm) {
						n = maxIter; // cycling → interior
						break;
					}
					if (n === checkAt) {
						pRe = re;
						pIm = im;
						checkAt <<= 1;
					}
				}

				if (n >= maxIter) {
					continue;
				}

				const zm2 = re * re + im * im;
				const dzm2 = Math.max(dzr * dzr + dzi * dzi, 1e-300);
				const dist = 0.5 * Math.sqrt(zm2 / dzm2) * Math.log(zm2);
				const dCss = (dist / s) * cssWidth;
				const t = Math.exp(-Math.sqrt(dCss / GRADIENT_REACH_PX));
				const position = t * (PALETTE_SIZE - 1);
				const lo = Math.floor(position) * 4;
				const hi = Math.min(lo + 4, palette.length - 4);
				const w = position - Math.floor(position);
				const nu = n + 1 - Math.log2(0.5 * Math.log(zm2));
				const detail = 1 - DETAIL_STRENGTH * smoothstep(0.65, 0.98, t) *
					(0.5 + 0.5 * Math.cos(nu * DETAIL_FREQUENCY));
				const off = (j * bw + i) * 4;
				for (let c = 0; c < 4; c++) {
					const value = palette[lo + c] + (palette[hi + c] - palette[lo + c]) * w;
					data[off + c] = Math.round(c < 3 ? value * detail : value);
				}

			}
		}
		return bh;
	};

	const promote = (view: FractalView) => {
		if (!buildImg) return;
		keyCtx.putImageData(buildImg, 0, 0);
		keyView = { ...view };
		build = null;
	};

	// Advance the in-progress keyframe by at most BUILD_BUDGET_MS, promoting
	// it when complete — a keyframe stays in flight while the camera moves.
	const advanceBuild = (view: FractalView) => {
		if (!buildImg) return;
		if (!build) {
			build = { ...view, row: 0 };
			buildImg.data.fill(0);
		}
		const next = computeRows(
			buildImg.data,
			build,
			build.row,
			performance.now() + BUILD_BUDGET_MS,
		);
		if (next >= bh) {
			promote(build);
		} else {
			build.row = next;
		}
	};

	// Display the requested view by crop-zooming the latest keyframe. The crop
	// maps the requested view's complex-plane rectangle into the keyframe's;
	// out-of-cover edges clamp (they heal when the next keyframe promotes).
	const present = (view: FractalView) => {
		if (!keyView) return;
		ctx.clearRect(0, 0, bw, bh);
		const aspect = bh / bw;
		const ratio = view.scale / keyView.scale;
		let sw = bw * ratio;
		let sh = bh * ratio;
		let sx =
			((view.re - view.scale / 2 - (keyView.re - keyView.scale / 2)) /
				keyView.scale) *
			bw;
		let sy =
			((view.im -
				(view.scale * aspect) / 2 -
				(keyView.im - (keyView.scale * aspect) / 2)) /
				(keyView.scale * aspect)) *
			bh;
		// Clamp to the keyframe's coverage.
		if (sw > bw) sw = bw;
		if (sh > bh) sh = bh;
		sx = Math.max(0, Math.min(bw - sw, sx));
		sy = Math.max(0, Math.min(bh - sh, sy));
		ctx.drawImage(keyCanvas, sx, sy, sw, sh, 0, 0, bw, bh);
	};

	return {
		kind: 'cpu',
		frame(view, c) {
			updatePalette(c);
			advanceBuild(view);
			present(view);
		},
		sync(view, c) {
			updatePalette(c);
			if (!buildImg) return;
			build = null;
			buildImg.data.fill(0);
			computeRows(buildImg.data, view, 0, Infinity);
			promote(view);
			present(view);
		},
		resize(widthPx, heightPx) {
			if (widthPx === bw && heightPx === bh && buildImg) return;
			bw = widthPx;
			bh = heightPx;
			cssWidth = canvas.clientWidth || widthPx;
			canvas.width = bw;
			canvas.height = bh;
			keyCanvas.width = bw;
			keyCanvas.height = bh;
			buildImg = ctx.createImageData(bw, bh);
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			build = null;
			keyView = null;
		},
		dispose() {
			buildImg = null;
		},
	};
}
