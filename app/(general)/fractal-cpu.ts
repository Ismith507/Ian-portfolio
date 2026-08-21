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
//   budget) are skipped three ways: closed-form cardioid/period-2-bulb tests,
//   a carried-forward interior mask from the previous keyframe (3×3
//   all-interior neighborhoods only, so emerging boundary detail is never
//   falsely skipped), and in-loop cycle detection (Brent) — interior orbits
//   settle into exact repeating cycles.

import {
	ACCENT_ALPHA,
	ALPHA_BASE,
	ALPHA_RAMP,
	DE_GLOW_ALPHA,
	DE_GLOW_EXP,
	DE_GLOW_PX,
	DE_LINE_ALPHA,
	DE_LINE_PX,
	ESCAPE_R2,
	FAR_FADE_END,
	FAR_FIELD_KEEP,
	FILIGREE_MIN_ITER,
	RED_DEEP,
	RED_DEEP_FACTOR,
	RED_FULL,
	RED_HOT,
	RED_HOT_MIX,
	RED_START,
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
const MAX_GRID_W = 1024; // sample-density cap per axis

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
	let gw = 0; // sample grid width/height
	let gh = 0;
	let buildImg: ImageData | null = null;
	let keyView: FractalView | null = null; // view the displayed keyframe holds
	// Interior masks (1 = point known to never escape): previous completed
	// keyframe's classification (read side) and the in-progress keyframe's
	// (write side); swapped on promote.
	let prevMask: Uint8Array | null = null;
	let workMask: Uint8Array | null = null;
	let prevView: FractalView | null = null;
	let build: Build | null = null;
	let colors: FractalColors = {
		muted: [155, 150, 140],
		accent: [221, 99, 90],
	};

	// Compute rows [fromRow, gh) of a keyframe for `view` into data, stopping
	// at the deadline. Returns the next row to compute (== gh when done).
	const computeRows = (
		data: Uint8ClampedArray,
		mask: Uint8Array,
		view: FractalView,
		fromRow: number,
		deadline: number,
	): number => {
		const s = view.scale;
		const aspect = bh / bw;
		const maxIter = maxIterAt(s);
		const [mr, mg, mb] = colors.muted;
		const [ar, ag, ab] = colors.accent;
		const stepX = bw / gw;
		const stepY = bh / gh;
		const pm = prevMask;
		const pv = prevView;

		for (let j = fromRow; j < gh; j++) {
			if (performance.now() > deadline) return j;

			const cIm = view.im + (j / (gh - 1) - 0.5) * s * aspect;
			const ySq = cIm * cIm;
			const y0 = Math.round(j * stepY);
			const y1 = Math.round((j + 1) * stepY);
			const maskRow = j * gw;

			for (let i = 0; i < gw; i++) {
				const x = view.re + (i / (gw - 1) - 0.5) * s;

				// Interior short-circuit 1: closed forms. Main cardioid…
				const xq = x - 0.25;
				const q = xq * xq + ySq;
				if (q * (q + xq) <= 0.25 * ySq) {
					mask[maskRow + i] = 1;
					continue;
				}
				// …and the period-2 bulb.
				const xp1 = x + 1;
				if (xp1 * xp1 + ySq <= 0.0625) {
					mask[maskRow + i] = 1;
					continue;
				}

				// Interior short-circuit 2: carried-forward mask. If this complex
				// point sat in an all-interior 3×3 neighborhood of the previous
				// keyframe, it is interior now too — don't recompute it.
				if (pm && pv) {
					const u = Math.round(((x - pv.re) / pv.scale + 0.5) * (gw - 1));
					const v = Math.round(
						((cIm - pv.im) / (pv.scale * aspect) + 0.5) * (gh - 1),
					);
					if (u >= 1 && u <= gw - 2 && v >= 1 && v <= gh - 2) {
						const b = v * gw + u;
						if (
							pm[b] &
							pm[b - 1] &
							pm[b + 1] &
							pm[b - gw] &
							pm[b - gw - 1] &
							pm[b - gw + 1] &
							pm[b + gw] &
							pm[b + gw - 1] &
							pm[b + gw + 1]
						) {
							mask[maskRow + i] = 1;
							continue;
						}
					}
				}

				let re = 0;
				let im = 0;
				// Running derivative z' for the distance estimate.
				let dzr = 0;
				let dzi = 0;
				let n = 0;
				// Interior short-circuit 3: cycle detection (Brent). Interior
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
					mask[maskRow + i] = 1;
					continue;
				}

				// Draw only the boundary filigree. Four-stop ramp toward the
				// boundary (same math as the GL shader): muted gray -> deep dark
				// red -> full accent red -> hot brightened red; alpha rises from
				// zero over the far field so there is no hard edge anywhere.
				if (n >= FILIGREE_MIN_ITER) {
					// Smooth iteration count (same renormalization as the shader) —
					// continuous coloring between pixels kills banding aliasing.
					const zm2 = re * re + im * im;
					const nu = n + 1 - Math.log2(0.5 * Math.log2(zm2));
					const t = Math.min(1, Math.max(0, nu / maxIter));
					// Distance estimate (same math as the shader): constant-pixel-
					// width boundary line art with analytic anti-aliasing.
					const dzm2 = Math.max(dzr * dzr + dzi * dzi, 1e-300);
					const dist = 0.5 * Math.sqrt(zm2 / dzm2) * Math.log(zm2);
					const dPx = (dist / s) * bw;
					const lineI = 1 - smoothstep(0, DE_LINE_PX, dPx);
					const glow = Math.pow(
						Math.max(0, 1 - dPx / DE_GLOW_PX),
						DE_GLOW_EXP,
					);
					const deA = Math.max(lineI * DE_LINE_ALPHA, glow * DE_GLOW_ALPHA);
					const w1 = smoothstep(RED_START, RED_DEEP, t);
					const w2 = smoothstep(RED_DEEP, RED_FULL, t);
					const w3 = smoothstep(RED_FULL, RED_HOT, t);
					let r = mr + (ar * RED_DEEP_FACTOR - mr) * w1;
					let g = mg + (ag * RED_DEEP_FACTOR - mg) * w1;
					let b = mb + (ab * RED_DEEP_FACTOR - mb) * w1;
					r += (ar - r) * w2;
					g += (ag - g) * w2;
					b += (ab - b) * w2;
					r = Math.round(r + (ar + (255 - ar) * RED_HOT_MIX - r) * w3);
					g = Math.round(g + (ag + (255 - ag) * RED_HOT_MIX - g) * w3);
					b = Math.round(b + (ab + (255 - ab) * RED_HOT_MIX - b) * w3);
					// DE line-work is the definition layer; the iteration-field alpha
					// survives underneath, subdued. (Fallback-only divergence: hue
					// mixing stays in sRGB here — the GL path mixes in linear light.)
					const grayA = ALPHA_BASE + ALPHA_RAMP * t * t;
					const farA =
						(grayA + (ACCENT_ALPHA - grayA) * w1) *
						smoothstep(0, FAR_FADE_END, t) *
						FAR_FIELD_KEEP;
					const a = Math.round(255 * Math.max(deA, farA));
					const x0 = Math.round(i * stepX);
					const x1 = Math.round((i + 1) * stepX);
					for (let y = y0; y < y1; y++) {
						let off = (y * bw + x0) * 4;
						for (let px = x0; px < x1; px++) {
							data[off] = r;
							data[off + 1] = g;
							data[off + 2] = b;
							data[off + 3] = a;
							off += 4;
						}
					}
				}
			}
		}
		return gh;
	};

	const promote = (view: FractalView) => {
		if (!buildImg || !workMask) return;
		keyCtx.putImageData(buildImg, 0, 0);
		keyView = { ...view };
		const finished = workMask;
		workMask = prevMask ?? new Uint8Array(gw * gh);
		prevMask = finished;
		prevView = { ...view };
		build = null;
	};

	// Advance the in-progress keyframe by at most BUILD_BUDGET_MS, promoting
	// it when complete — a keyframe stays in flight while the camera moves.
	const advanceBuild = (view: FractalView) => {
		if (!buildImg || !workMask) return;
		if (!build) {
			build = { ...view, row: 0 };
			buildImg.data.fill(0);
			workMask.fill(0);
		}
		const next = computeRows(
			buildImg.data,
			workMask,
			build,
			build.row,
			performance.now() + BUILD_BUDGET_MS,
		);
		if (next >= gh) {
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
			colors = c;
			advanceBuild(view);
			present(view);
		},
		sync(view, c) {
			colors = c;
			if (!buildImg || !workMask) return;
			// A sync is a discontinuity (mount, resize, theme change) — the
			// previous mask no longer describes the view; drop it.
			prevMask = null;
			prevView = null;
			build = null;
			buildImg.data.fill(0);
			workMask.fill(0);
			computeRows(buildImg.data, workMask, view, 0, Infinity);
			promote(view);
			present(view);
		},
		resize(widthPx, heightPx) {
			if (widthPx === bw && heightPx === bh && buildImg) return;
			bw = widthPx;
			bh = heightPx;
			gw = Math.min(MAX_GRID_W, bw);
			gh = Math.max(2, Math.round(gw * (bh / bw)));
			canvas.width = bw;
			canvas.height = bh;
			keyCanvas.width = bw;
			keyCanvas.height = bh;
			buildImg = ctx.createImageData(bw, bh);
			// Grid geometry changed: history no longer maps — invalidate.
			prevMask = null;
			prevView = null;
			workMask = new Uint8Array(gw * gh);
			build = null;
			keyView = null;
		},
		dispose() {
			buildImg = null;
			prevMask = null;
			workMask = null;
		},
	};
}
