// WebGL backend for the site-wide fractal backdrop: a fragment shader that
// computes the escape-time loop with df64 ("double-float") emulated precision
// — each coordinate is a pair of float32s (hi, lo), extending usable zoom
// depth from float32's ~1e5 to ~1e13 (Thasler/DSFUN90 technique, same lineage
// deck.gl ships in production). Every pixel is recomputed per draw at full
// resolution; when the camera is idle nothing renders at all.
//
// Compiler-folding hazard: df64 depends on error-compensation arithmetic like
// `a - (a - b)` that optimizing shader compilers may algebraically simplify
// away. The standard production mitigation (luma.gl's ONE-uniform trick) is
// used here: critical terms multiply by a uniform that is always 1.0, which
// the compiler cannot constant-fold. Correctness is also probed at startup —
// if the driver still miscompiles or WebGL is unavailable, the factory
// returns null and the caller falls back to the CPU renderer.

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
	MAX_ITER_CAP,
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

// Format a JS number as a GLSL float literal (must contain a decimal point).
const f = (v: number): string => (Number.isInteger(v) ? `${v}.0` : String(v));

const VERT = `
attribute vec2 a_pos;
void main() {
	gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_scale;
uniform vec2 u_cx; // view center real part as df64 (hi, lo)
uniform vec2 u_cy; // view center imaginary part as df64 (hi, lo)
uniform int u_maxIter;
uniform vec3 u_muted;
uniform vec3 u_accent;
uniform float u_one; // always 1.0 — blocks constant-folding of df64 math

vec2 ds(float a) {
	return vec2(a, 0.0);
}

// df64 addition (Knuth two-sum with error compensation).
vec2 ds_add(vec2 a, vec2 b) {
	float t1 = a.x + b.x;
	float e = (t1 - a.x) * u_one;
	float t2 = ((b.x - e) + (a.x - (t1 - e))) + a.y + b.y;
	float s = t1 + t2;
	return vec2(s, t2 - (s - t1) * u_one);
}

// df64 multiplication (Dekker split, SPLIT = 2^13 + 1 for float32).
vec2 ds_mul(vec2 a, vec2 b) {
	const float SPLIT = 8193.0;
	float ca = a.x * SPLIT;
	float cb = b.x * SPLIT;
	float a1 = (ca - (ca - a.x)) * u_one;
	float b1 = (cb - (cb - b.x)) * u_one;
	float a2 = a.x - a1;
	float b2 = b.x - b1;
	float c11 = a.x * b.x;
	float c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11) * u_one));
	float c2 = a.x * b.y + a.y * b.x;
	float t1 = c11 + c2;
	float e = (t1 - c11) * u_one;
	float t2 = a.y * b.y + ((c2 - e) + (c11 - (t1 - e))) + c21;
	float s = t1 + t2;
	return vec2(s, t2 - (s - t1) * u_one);
}

// GLSL ES 1.00 requires a constant loop bound; break early on u_maxIter.
const int MAX_LOOP = ${MAX_ITER_CAP};

void main() {
	// Pixel fraction with y measured from the TOP (im grows downward on
	// screen, matching the CPU renderer). u_scale is the complex-plane WIDTH;
	// the vertical span follows the pixel aspect so nothing distorts.
	vec2 frac = vec2(gl_FragCoord.x / u_res.x, 1.0 - gl_FragCoord.y / u_res.y);
	float aspect = u_res.y / u_res.x;
	// Per-pixel offsets are tiny (≤ scale/2), so plain float32 is exact enough
	// for them; only the absolute coordinates need df64.
	vec2 cx = ds_add(u_cx, ds((frac.x - 0.5) * u_scale));
	vec2 cy = ds_add(u_cy, ds((frac.y - 0.5) * u_scale * aspect));

	// Interior short-circuits (float32 on the hi parts is fine: these regions
	// only intersect the view at shallow zoom, where float32 is exact enough).
	float x = cx.x;
	float y = cy.x;
	float ySq = y * y;
	float xq = x - 0.25;
	float q = xq * xq + ySq;
	float xp1 = x + 1.0;
	if (q * (q + xq) <= 0.25 * ySq || xp1 * xp1 + ySq <= 0.0625) {
		gl_FragColor = vec4(0.0);
		return;
	}

	vec2 zr = ds(0.0);
	vec2 zi = ds(0.0);
	// Running derivative z' (z'_{n+1} = 2·z_n·z'_n + 1) for the distance
	// estimate. Plain float32 suffices: the DE uses only the RATIO of two
	// escaped, large-magnitude quantities (reference: iq's lsX3W4).
	float dzr = 0.0;
	float dzi = 0.0;
	int n = u_maxIter;
	for (int i = 0; i < MAX_LOOP; i++) {
		if (i >= u_maxIter) break;
		// Derivative first, using the CURRENT z (hi parts are plenty).
		float ndzr = 2.0 * (zr.x * dzr - zi.x * dzi) + 1.0;
		float ndzi = 2.0 * (zr.x * dzi + zi.x * dzr);
		dzr = ndzr;
		dzi = ndzi;
		// z = z^2 + c in df64 complex arithmetic.
		vec2 zr2 = ds_mul(zr, zr);
		vec2 zi2 = ds_mul(zi, zi);
		vec2 zri = ds_mul(zr, zi);
		vec2 nr = ds_add(ds_add(zr2, vec2(-zi2.x, -zi2.y)), cx);
		vec2 ni = ds_add(ds_add(zri, zri), cy);
		zr = nr;
		zi = ni;
		if (zr.x * zr.x + zi.x * zi.x > ${f(ESCAPE_R2)}) {
			n = i + 1;
			break;
		}
	}

	float fn = float(n);
	float mi = float(u_maxIter);
	// Interior and far-field stay transparent — boundary filigree only.
	if (n >= u_maxIter || fn < ${f(FILIGREE_MIN_ITER)}) {
		gl_FragColor = vec4(0.0);
		return;
	}
	// SMOOTH iteration count: the renormalized fractional escape count makes
	// the coloring continuous between neighboring pixels — this is what kills
	// banding aliasing ("static") when bands compress below pixel size.
	float zm2 = zr.x * zr.x + zi.x * zi.x;
	fn = fn + 1.0 - log2(0.5 * log2(zm2));

	// DISTANCE ESTIMATE (Milnor / iq): d = |z|·ln|z| / |z'|, expressed as
	// 0.5·sqrt(|z|²/|z'|²)·ln(|z|²). Dividing by the view scale converts to a
	// screen fraction, so the boundary renders at CONSTANT PIXEL WIDTH at any
	// zoom depth; the smoothstep over the pixel footprint is the analytic AA.
	float dzm2 = max(dzr * dzr + dzi * dzi, 1e-30);
	float dist = 0.5 * sqrt(zm2 / dzm2) * log(zm2);
	float dPx = dist / u_scale * u_res.x;
	float line = 1.0 - smoothstep(0.0, ${f(DE_LINE_PX)}, dPx);
	float glow = pow(max(0.0, 1.0 - dPx / ${f(DE_GLOW_PX)}), ${f(DE_GLOW_EXP)});
	float deA = max(line * ${f(DE_LINE_ALPHA)}, glow * ${f(DE_GLOW_ALPHA)});

	// Four-stop hue ramp toward the boundary — all shades of the one accent
	// hue: muted gray -> deep dark red -> full accent red -> hot brightened
	// red. Mixed in LINEAR light (u_muted/u_accent arrive linearized).
	float t = clamp(fn / mi, 0.0, 1.0);
	float w1 = smoothstep(${f(RED_START)}, ${f(RED_DEEP)}, t);
	float w2 = smoothstep(${f(RED_DEEP)}, ${f(RED_FULL)}, t);
	float w3 = smoothstep(${f(RED_FULL)}, ${f(RED_HOT)}, t);
	vec3 deep = u_accent * ${f(RED_DEEP_FACTOR)};
	vec3 hot = mix(u_accent, vec3(1.0), ${f(RED_HOT_MIX)});
	vec3 rgb = mix(u_muted, deep, w1);
	rgb = mix(rgb, u_accent, w2);
	rgb = mix(rgb, hot, w3);

	// Alpha: DE line-work is the definition layer; the old iteration-field
	// alpha survives underneath, subdued, as texture (still fading in from
	// zero over the far field — no hard edges anywhere).
	float aGray = ${f(ALPHA_BASE)} + ${f(ALPHA_RAMP)} * t * t;
	float farA = mix(aGray, ${f(ACCENT_ALPHA)}, w1) *
		smoothstep(0.0, ${f(FAR_FADE_END)}, t) * ${f(FAR_FIELD_KEEP)};
	float a = max(deA, farA);
	// Encode back to sRGB for the compositor, then premultiply.
	vec3 outRgb = pow(max(rgb, 0.0), vec3(1.0 / 2.2));
	gl_FragColor = vec4(outRgb * a, a);
}
`;

const CONTEXT_ATTRS: WebGLContextAttributes = {
	alpha: true,
	premultipliedAlpha: true,
	antialias: false,
	depth: false,
	stencil: false,
	powerPreference: 'low-power',
};

// Split a float64 into a (hi, lo) pair of float32s for the df64 uniforms.
const split = (v: number): [number, number] => {
	const hi = Math.fround(v);
	return [hi, v - hi];
};

// sRGB byte -> linear-light float. The shader mixes colors in linear space
// (gamma-space mixing systematically darkens and muddies) and re-encodes.
const toLinear = (byte: number): number => Math.pow(byte / 255, 2.2);

function buildProgram(gl: WebGLRenderingContext): WebGLProgram | null {
	const compile = (type: number, src: string): WebGLShader | null => {
		const shader = gl.createShader(type);
		if (!shader) return null;
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	};
	const vs = compile(gl.VERTEX_SHADER, VERT);
	const fs = compile(gl.FRAGMENT_SHADER, FRAG);
	if (!vs || !fs) return null;
	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

export function createGlBackend(canvas: HTMLCanvasElement): FractalBackend | null {
	if (typeof WebGLRenderingContext === 'undefined') return null;

	// Probe on a scratch canvas first: claiming a context type on the real
	// canvas is irreversible, and the CPU fallback needs it free for '2d' if
	// anything here fails.
	const probeCanvas = document.createElement('canvas');
	const probeGl = probeCanvas.getContext('webgl', CONTEXT_ATTRS);
	if (!probeGl) return null;
	const probeProgram = buildProgram(probeGl);
	if (!probeProgram) return null;
	probeGl.deleteProgram(probeProgram);
	probeGl.getExtension('WEBGL_lose_context')?.loseContext();

	const gl = canvas.getContext('webgl', CONTEXT_ATTRS);
	if (!gl) return null;
	if (gl.isContextLost()) {
		// Ask for restoration (it completes asynchronously); this mount can't
		// render, but the next one will find a live context.
		gl.getExtension('WEBGL_lose_context')?.restoreContext();
		return null;
	}
	const program = buildProgram(gl);
	if (!program) return null;

	// One fullscreen triangle — cheaper and simpler than a quad.
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 3, -1, -1, 3]),
		gl.STATIC_DRAW,
	);
	gl.useProgram(program);
	const aPos = gl.getAttribLocation(program, 'a_pos');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
	gl.disable(gl.BLEND);
	gl.clearColor(0, 0, 0, 0);

	const loc = {
		res: gl.getUniformLocation(program, 'u_res'),
		scale: gl.getUniformLocation(program, 'u_scale'),
		cx: gl.getUniformLocation(program, 'u_cx'),
		cy: gl.getUniformLocation(program, 'u_cy'),
		maxIter: gl.getUniformLocation(program, 'u_maxIter'),
		muted: gl.getUniformLocation(program, 'u_muted'),
		accent: gl.getUniformLocation(program, 'u_accent'),
		one: gl.getUniformLocation(program, 'u_one'),
	};
	gl.uniform1f(loc.one, 1.0);

	const draw = (view: FractalView, colors: FractalColors) => {
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.uniform2f(loc.res, canvas.width, canvas.height);
		gl.uniform1f(loc.scale, view.scale);
		gl.uniform2f(loc.cx, ...split(view.re));
		gl.uniform2f(loc.cy, ...split(view.im));
		gl.uniform1i(loc.maxIter, maxIterAt(view.scale));
		gl.uniform3f(
			loc.muted,
			toLinear(colors.muted[0]),
			toLinear(colors.muted[1]),
			toLinear(colors.muted[2]),
		);
		gl.uniform3f(
			loc.accent,
			toLinear(colors.accent[0]),
			toLinear(colors.accent[1]),
			toLinear(colors.accent[2]),
		);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	};

	return {
		kind: 'gl',
		frame: draw,
		sync: draw,
		resize(widthPx: number, heightPx: number) {
			canvas.width = widthPx;
			canvas.height = heightPx;
		},
		dispose() {
			// Delete resources but NEVER lose the context: a canvas keeps the same
			// WebGL context for life, and React StrictMode remounts effects in dev
			// — a lost context would leave every later mount with a dead renderer.
			gl.deleteBuffer(buf);
			gl.deleteProgram(program);
		},
	};
}
