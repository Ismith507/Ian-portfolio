import {
	ACCENT_ALPHA,
	ALPHA_BASE,
	ALPHA_RAMP,
	FAR_FADE_END,
	FAR_FIELD_KEEP,
	RED_DARK,
	RED_DARK_FACTOR,
	RED_DEEP,
	RED_DEEP_FACTOR,
	RED_FULL,
	RED_START,
	type FractalColors,
} from './fractal-shared';

export const PALETTE_SIZE = 1024;

export const paletteKey = (colors: FractalColors): string =>
	`${colors.muted.join(',')}/${colors.accent.join(',')}`;

const smoothstep = (lo: number, hi: number, value: number): number => {
	const t = Math.min(1, Math.max(0, (value - lo) / (hi - lo)));
	return t * t * (3 - 2 * t);
};

// Cache the original four-stop gradient: muted gray, deep red, accent red,
// then the existing dark edge. Alpha stores only the subdued iteration field;
// each renderer adds the original narrow distance-estimated line and halo.
export function createPalette(colors: FractalColors): Uint8Array {
	const muted = colors.muted.map((v) => Math.pow(v / 255, 2.2));
	const accent = colors.accent.map((v) => Math.pow(v / 255, 2.2));
	const data = new Uint8Array(PALETTE_SIZE * 4);
	for (let i = 0; i < PALETTE_SIZE; i++) {
		const t = i / (PALETTE_SIZE - 1);
		const w1 = smoothstep(RED_START, RED_DEEP, t);
		const w2 = smoothstep(RED_DEEP, RED_FULL, t);
		const w3 = smoothstep(RED_FULL, RED_DARK, t);
		for (let c = 0; c < 3; c++) {
			let value = muted[c] + (accent[c] * RED_DEEP_FACTOR - muted[c]) * w1;
			value += (accent[c] - value) * w2;
			value += (accent[c] * RED_DARK_FACTOR - value) * w3;
			data[i * 4 + c] = Math.round(255 * Math.pow(value, 1 / 2.2));
		}
		const grayAlpha = ALPHA_BASE + ALPHA_RAMP * t * t;
		const farAlpha = (grayAlpha + (ACCENT_ALPHA - grayAlpha) * w1) *
			smoothstep(0, FAR_FADE_END, t) * FAR_FIELD_KEEP;
		data[i * 4 + 3] = Math.round(255 * farAlpha);
	}
	return data;
}
