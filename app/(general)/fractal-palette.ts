import type { FractalColors } from './fractal-shared';

export const PALETTE_SIZE = 1024;

// Additional terracotta, wine-red, and warm-gray shades separate the fine
// filaments from their broad halo. Interpolate every stop; never quantize the
// fractal into discrete bands. The last shade still falls into the dark set.
const STOPS = [
	// proximity, accent share, linear brightness, opacity
	[0,     0,    1,    0],
	[0.24,  0.15, 0.7,  0.045],
	[0.43,  0.8,  0.38, 0.1],
	[0.6,   0.95, 0.65, 0.18],
	[0.76,  1,    1,    0.27],
	[0.86,  1,    0.3,  0.26],
	[0.93,  0.88, 0.9,  0.37],
	[0.975, 1,    0.38, 0.34],
	[0.995, 0.93, 0.82, 0.39],
	[1,     1,    0.18, 0.3],
] as const;

export const paletteKey = (colors: FractalColors): string =>
	`${colors.background.join(',')}/${colors.muted.join(',')}/${colors.accent.join(',')}`;

// Shared lookup table: compute gamma conversion only on theme changes, not
// millions of times per frame. WebGL interpolates it as a texture; CPU uses
// the same entries. Entries hold straight-alpha sRGB, suitable for ImageData.
export function createPalette(colors: FractalColors): Uint8Array {
	const muted = colors.muted.map((v) => Math.pow(v / 255, 2.2));
	const accent = colors.accent.map((v) => Math.pow(v / 255, 2.2));
	// Keep prose legible over the detail in both page themes.
	const maxAlpha = colors.background[0] > 128 ? 0.16 : 0.25;
	const data = new Uint8Array(PALETTE_SIZE * 4);
	let stop = 0;
	for (let i = 0; i < PALETTE_SIZE; i++) {
		const t = i / (PALETTE_SIZE - 1);
		while (stop < STOPS.length - 2 && t > STOPS[stop + 1][0]) stop++;
		const a = STOPS[stop], b = STOPS[stop + 1];
		const u = (t - a[0]) / (b[0] - a[0]);
		const w = u * u * (3 - 2 * u);
		for (let c = 0; c < 3; c++) {
			const lo = (muted[c] + (accent[c] - muted[c]) * a[1]) * a[2];
			const hi = (muted[c] + (accent[c] - muted[c]) * b[1]) * b[2];
			data[i * 4 + c] = Math.round(255 * Math.pow(lo + (hi - lo) * w, 1 / 2.2));
		}
		data[i * 4 + 3] = Math.round(255 * Math.min(maxAlpha, a[3] + (b[3] - a[3]) * w));
	}
	return data;
}
