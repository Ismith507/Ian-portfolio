const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Compile the small renderer modules in memory with the project's TypeScript
// dependency; no browser or additional test runner is required.
const root = path.join(__dirname, '../app/(general)');
function load(name, globals = {}, modules = {}) {
  const tsFile = path.join(root, `${name}.ts`);
  const file = fs.existsSync(tsFile) ? tsFile : path.join(root, `${name}.tsx`);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: (name) => modules[name] ?? load(name.replace('./', ''), globals, modules),
    performance,
    Uint8ClampedArray,
    ...globals,
  }, { filename: file });
  return exports;
}
const { PAGE_VIEWS, viewSpecForPath, createViewTransition, ambientScale, maxIterAt, BASE_ITER, MAX_ITER_CAP } = load('fractal-shared');
const transitionView = (from, to, progress, aspect) => createViewTransition(from, to, aspect).at(progress);
const concrete = (spec) => ({ ...spec, im: spec.im === 'axis' ? -0.25 : spec.im });
const close = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const closeView = (a, b, tolerance) => ['re', 'im', 'scale'].forEach((key) => close(a[key], b[key], tolerance));

test('all five routes have distinct cameras and retain the existing opening views', () => {
  const routes = ['/', '/projects/software', '/projects/art', '/projects/music', '/about'];
  const views = routes.map(viewSpecForPath);
  assert.equal(new Set(views.map((v) => JSON.stringify(v))).size, 5);
  closeView(concrete(views[0]), { re: -1.4, im: -0.25, scale: 3 });
  closeView(views[1], { re: -0.7435, im: 0.1314, scale: 0.004 });
  for (const route of routes.slice(1)) {
    assert.equal(viewSpecForPath(`${route}/detail`), viewSpecForPath(route));
  }
});

test('navigation remains continuous with exact endpoints at different aspect ratios', () => {
  const views = Object.values(PAGE_VIEWS).map(concrete);
  for (const from of views) for (const to of views) for (const aspect of [0.45, 0.8, 1.4]) {
    closeView(transitionView(from, to, 0, aspect), from);
    closeView(transitionView(from, to, 1, aspect), to);
    for (let step = 0; step <= 100; step++) {
      const view = transitionView(from, to, step / 100, aspect);
      assert.ok(Object.values(view).every(Number.isFinite));
      assert.ok(view.scale > 0);
    }
    closeView(transitionView(from, to, 0.5 - 1e-8, aspect), transitionView(from, to, 0.5 + 1e-8, aspect), 1e-6);
  }
  const from = PAGE_VIEWS.software, to = PAGE_VIEWS.about;
  assert.ok(transitionView(from, to, 0.5, 0.6).scale > Math.max(from.scale, to.scale) * 10);
  const interrupted = transitionView(from, to, 0.3, 0.6);
  closeView(transitionView(interrupted, PAGE_VIEWS.art, 0, 0.6), interrupted);
});

test('detail budgets increase with zoom and stay bounded during pullbacks', () => {
  assert.equal(maxIterAt(30), BASE_ITER);
  assert.equal(maxIterAt(1e-20), MAX_ITER_CAP);
  for (const spec of Object.values(PAGE_VIEWS)) {
    assert.ok(maxIterAt(spec.scale / 10) >= maxIterAt(spec.scale));
  }
});

test('CPU fallback retains detail across destinations, depths, resize, and theme changes', () => {
  let rendered;
  const document = {
    createElement: () => ({ getContext: () => ({ putImageData: (image) => { rendered = image.data.slice(); } }) }),
  };
  const canvas = {
    clientWidth: 1200,
    getContext: () => ({
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      clearRect() {}, drawImage() {},
    }),
  };
  const { createCpuBackend } = load('fractal-cpu', { document });
  const backend = createCpuBackend(canvas);
  const dark = { background: [18, 18, 16], muted: [155, 150, 140], accent: [221, 99, 90] };
  backend.resize(240, 135);
  for (const spec of Object.values(PAGE_VIEWS).slice(1)) for (const depth of [1, 3, 10]) {
    backend.sync({ ...spec, scale: spec.scale / depth }, dark);
    let visible = 0;
    const shades = new Set();
    for (let i = 0; i < rendered.length; i += 4) {
      if (rendered[i + 3] > 5) visible++;
      shades.add(`${rendered[i]},${rendered[i + 1]},${rendered[i + 2]},${rendered[i + 3]}`);
    }
    // Guards against an ambient zoom drifting entirely into the set or void,
    // and against accidentally restoring a small, discrete color palette.
    assert.ok(visible / (240 * 135) > 0.2);
    assert.ok(shades.size > 100);
  }
  backend.resize(320, 400);
  backend.sync(PAGE_VIEWS.art, dark);
  assert.equal(rendered.length, 320 * 400 * 4);
  const before = rendered;
  backend.sync(PAGE_VIEWS.art, { background: [245, 244, 240], muted: [93, 90, 82], accent: [169, 59, 56] });
  assert.notDeepEqual(rendered, before);
  backend.sync({ re: 0, im: 0, scale: 0.1 }, dark);
  assert.ok(rendered.every((v) => v === 0), 'the main-cardioid interior should be transparent');
  backend.dispose();
});

function mountBackdrop(reducedMotion) {
  const frames = [], draws = [], refs = [];
  let effects = [], refIndex = 0, pathname = '/', now = 0;
  const canvas = { width: 0, height: 0, getBoundingClientRect: () => ({ width: 1200, height: 675 }) };
  const backend = {
    kind: 'gl',
    resize: (w, h) => { canvas.width = w; canvas.height = h; },
    sync: (view) => draws.push({ ...view }),
    frame: (view) => draws.push({ ...view }),
    dispose() {},
  };
  class Observer { observe() {} disconnect() {} }
  const { default: Backdrop } = load('fractal-backdrop', {
    document: { documentElement: {} },
    window: { location: { pathname }, devicePixelRatio: 2, matchMedia: () => ({ matches: reducedMotion }) },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    ResizeObserver: Observer, MutationObserver: Observer,
    requestAnimationFrame: (cb) => { frames.push(cb); return frames.length; },
    cancelAnimationFrame() {}, performance: { now: () => now },
  }, {
    react: {
      useRef: (initial) => refs[refIndex++] ?? (refs[refIndex - 1] = { current: refIndex === 1 ? canvas : initial }),
      useEffect: (effect) => effects.push(effect),
    },
    'react/jsx-runtime': { jsx() {} },
    'next/navigation': { usePathname: () => pathname },
    './fractal-gl': { createGlBackend: () => backend },
    './fractal-cpu': { createCpuBackend: () => { throw new Error('Unexpected CPU fallback'); } },
  });
  Backdrop();
  const cleanup = effects[0]();
  effects[1]();
  return {
    frames, draws, cleanup,
    navigate(route, time) {
      pathname = route; now = time; refIndex = 0; effects = [];
      Backdrop(); effects[1]();
    },
    tick(time) { now = time; frames.at(-1)(time); },
  };
}

test('reduced motion draws each page immediately without scheduling animation', () => {
  const app = mountBackdrop(true);
  for (const route of ['/projects/software', '/projects/art', '/projects/music', '/about']) {
    app.navigate(route, 0);
    closeView(app.draws.at(-1), viewSpecForPath(route));
  }
  assert.equal(app.frames.length, 0);
  app.cleanup();
});

test('rapid route changes continue from the displayed frame', () => {
  const app = mountBackdrop(false);
  app.navigate('/projects/software', 0);
  app.tick(700);
  const displayed = app.draws.at(-1);
  app.navigate('/projects/art', 720);
  app.tick(720);
  closeView(app.draws.at(-1), displayed);
  app.tick(4720);
  closeView(app.draws.at(-1), PAGE_VIEWS.art);
  app.cleanup();
});


test('long transitions keep moving through the pullback and ease gently at the ends', () => {
  const flight = createViewTransition(PAGE_VIEWS.software, PAGE_VIEWS.about, 0.6);
  assert.ok(flight.duration >= 1800 && flight.duration <= 3600);
  const before = flight.at(0.499), after = flight.at(0.501);
  assert.ok(Math.hypot(after.re - before.re, after.im - before.im) > 1e-5, 'no stop at the midpoint');
  const start = flight.at(0), nearStart = flight.at(1e-4);
  closeView(start, nearStart, 1e-8);
  const end = flight.at(1), nearEnd = flight.at(1 - 1e-4);
  closeView(end, nearEnd, 1e-8);
});

test('ambient zoom is time-based with smooth reversals', () => {
  close(ambientScale(0), 1);
  close(ambientScale(300000), 0.1);
  close(ambientScale(600000), 1);
  close(ambientScale(0), ambientScale(1), 1e-8);
  close(ambientScale(300000), ambientScale(300001), 1e-8);
  for (let t = 0; t < 600000; t += 5000) assert.ok(ambientScale(t) >= 0.1 - 1e-12 && ambientScale(t) <= 1);
});

test('navigation draws at 60Hz without skipping near-16.667ms callbacks', () => {
  const app = mountBackdrop(false);
  app.navigate('/projects/software', 0);
  const before = app.draws.length;
  for (let i = 1; i <= 60; i++) app.tick(i * (1000 / 60));
  assert.equal(app.draws.length - before, 60);
  app.cleanup();
});

test('slow ambient motion uses half as many full-resolution renders', () => {
  const app = mountBackdrop(false);
  const before = app.draws.length;
  for (let i = 1; i <= 60; i++) app.tick(i * (1000 / 60));
  assert.ok(app.draws.length - before <= 31);
  app.cleanup();
});
