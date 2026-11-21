# OMShaders — Canvas Effects & Visual Styles

OpenMotion bundles **OMShaders**, a lightweight canvas effects library inspired by **shaders.com** (free tier) and **ls.graphics** visual styles. Use it to add GPU-style backgrounds and texture effects to any scene.

`window.OMShaders` is available automatically whenever you include `{{SHADERS}}` in your scene, or whenever the injector detects `OMShaders.` in your script (auto-inject). No CDN, no npm — it's inlined like GSAP.

---

## How it works with GSAP timelines

Every `attach*` function adds a `repeat:-1` tween to your `tl`. This is seek-accurate — the renderer's frame-by-frame seeking triggers `onUpdate` correctly for export. `repeat:-1` tweens do **not** affect `tl.duration()`, so your scene duration stays correct.

**Always set `window.__SCENE_DURATION__` to a fixed value** (not `tl.duration()`) whenever you use shaders, because the shader's loopDur could otherwise become the dominant measurement if there are no other content tweens.

---

## Canvas setup pattern

Place a `<canvas>` behind your scene content with `position:absolute; inset:0`:

```html
<canvas id="bg" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
```

Then in your script:
```js
const canvas = document.getElementById('bg');
canvas.width = {{W}};
canvas.height = {{H}};
```

---

## Effects reference

### `OMShaders.attachAurora(canvas, tl, opts)`
**Animated aurora borealis** — layered radial gradients drifting in sine waves. Best for dark cinematic scenes.
```js
OMShaders.attachAurora(canvas, tl, {
  colorA: '#4d90ff',   // primary aurora color (default: blue)
  colorB: '#a855f7',   // secondary color (default: purple)
  colorC: '#06b6d4',   // tertiary color (default: cyan)
  speed: 0.5,          // drift speed multiplier (default: 0.5)
  intensity: 0.7,      // opacity 0–1 (default: 0.7)
  bands: 5,            // number of gradient bands (default: 5)
  loopDur: 10,         // loop duration in seconds (default: 10)
  start: 0             // timeline position to start (default: 0)
});
```
*Use with motion personality: **cinematic** or **clean**.*

---

### `OMShaders.attachMeshGradient(canvas, tl, opts)`
**Animated mesh/blob gradient** — replicates ls.graphics ColorFlow aesthetic. Multiple colored orbs drifting with screen blend.
```js
OMShaders.attachMeshGradient(canvas, tl, {
  colors: ['#4d90ff', '#a855f7', '#06b6d4', '#f97316'],  // array of hex colors
  speed: 0.25,         // drift speed (default: 0.25)
  intensity: 0.8,      // brightness 0–1 (default: 0.8)
  loopDur: 12,
  start: 0
});
```
*Use brand colors here: `colors: ['{{BRAND:primary}}', '{{BRAND:accent}}', ...]`*

---

### `OMShaders.attachParticles(canvas, tl, opts)`
**Floating particle field** — deterministic particles that rise and drift. Inspired by shaders.com FloatingParticles.
```js
OMShaders.attachParticles(canvas, tl, {
  count: 80,           // particle count (default: 80)
  color: '#ffffff',    // particle color hex
  size: 2.5,           // max radius in px (default: 2.5)
  opacity: 0.55,       // max opacity 0–1 (default: 0.55)
  speedY: 0.015,       // upward drift speed (default: 0.015)
  drift: 0.008,        // horizontal drift (default: 0.008)
  loopDur: 10,
  start: 0
});
```
*Pair with aurora for a layered cinematic sky effect.*

---

### `OMShaders.attachPlasma(canvas, tl, opts)`
**Colorful plasma waves** — rendered at low resolution for performance (80×45 upscaled). Inspired by shaders.com Plasma.
```js
OMShaders.attachPlasma(canvas, tl, {
  speed: 0.8,          // animation speed (default: 0.8)
  scale: 3,            // spatial scale of waves (default: 3)
  saturation: 0.75,    // color saturation 0–1 (default: 0.75)
  lightness: 0.55,     // color lightness 0–1 (default: 0.55)
  loopDur: 8,
  start: 0
});
```
*Best for energetic/vibrant scenes. Reduce saturation for a subtle heat-map look.*

---

### `OMShaders.attachGlowBurst(canvas, tl, opts)`
**Pulsing radial glow** — a breathing halo, great for hero accents and ambient light.
```js
OMShaders.attachGlowBurst(canvas, tl, {
  color: '#4d90ff',    // glow color hex
  intensity: 0.7,      // peak opacity 0–1 (default: 0.7)
  radius: 0.55,        // radius as fraction of min(width,height) (default: 0.55)
  pulseSpeed: 0.5,     // breathing cycles per second (default: 0.5)
  loopDur: 6,
  start: 0
});
```

---

### `OMShaders.attachSineWave(canvas, tl, opts)`
**Animated sine wave lines** — scrolling wave bands. Great for data/tech/AI scenes.
```js
OMShaders.attachSineWave(canvas, tl, {
  color: '#4d90ff',    // line color
  amplitude: 0.08,     // wave height as fraction of canvas height (default: 0.08)
  frequency: 2,        // wave cycles across width (default: 2)
  speed: 0.5,          // scroll speed (default: 0.5)
  lineWidth: 2,        // px (default: 2)
  opacity: 0.5,        // max line opacity (default: 0.5)
  waves: 3,            // number of wave lines (default: 3)
  loopDur: 6,
  start: 0
});
```

---

### `OMShaders.attachLiquidShift(el, tl, opts)`
**GSAP-driven hue drift** on any DOM element — seek-accurate liquid color shift. Inspired by ls.graphics Liquid States.
Unlike the CSS `.om-liquid` class, this works correctly in exported video.
```js
// el is a DOM element (not a canvas)
OMShaders.attachLiquidShift(document.getElementById('bg-grad'), tl, {
  maxHue: 18,          // max hue-rotate degrees (default: 18)
  minSat: 0.88,        // min saturation (default: 0.88)
  maxSat: 1.2,         // max saturation (default: 1.2)
  loopDur: 9,
  start: 0
});
```

---

## CSS utility classes (ls.graphics visual styles)

These inject automatically when `{{SHADERS}}` is present — no canvas needed.

| Class | Effect | Inspired by |
|---|---|---|
| `.om-grain` | Subtle noise grain overlay via SVG feTurbulence | ls.graphics Grainy Blurs |
| `.om-glass` | Frosted glass: white tint + backdrop-filter blur | ls.graphics Glass Aberrations |
| `.om-glass-dark` | Dark frosted glass variant | ls.graphics Glass Aberrations |
| `.om-translucent` | Semi-transparent card with inset highlight | ls.graphics Translucent Layers |
| `.om-aberration` | Chromatic aberration split (set `data-text="Your Text"`) | ls.graphics Glass Aberrations |

Usage:
```html
<!-- Grain on background div -->
<div class="bg-wrapper om-grain" ...>

<!-- Glass card -->
<div class="card om-glass" ...>

<!-- Chromatic aberration on text -->
<h1 class="title om-aberration" data-om-id="title" data-text="LAUNCH">LAUNCH</h1>
```

**Note:** `.om-liquid` (CSS-only hue animation) is also available but is NOT seek-accurate — use `attachLiquidShift` for exported videos.

---

## Full scene example

```html
<!doctype html><html><head><meta charset="utf-8">
<style>
  /* {{FONTS_CSS}} */
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{width:100%;height:100%;overflow:hidden;background:#000;}
  .frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#050d1f;}
  canvas.bg{position:absolute;inset:0;width:100%;height:100%;}
  .content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;}
  .headline{font-size:96px;font-weight:700;color:#fff;opacity:0;}
  .card{padding:32px 48px;border-radius:20px;opacity:0;}
</style>
</head><body>
<div class="frame" id="frame">
  <canvas class="bg" id="bg"></canvas>
  <div class="content">
    <h1 class="headline" data-om-id="headline" data-om-label="Headline">Ship faster.</h1>
    <div class="card om-glass om-grain" data-om-id="card">
      <p style="color:rgba(255,255,255,0.8);font-size:24px;">Built for modern teams</p>
    </div>
  </div>
</div>
{{SHADERS}}
{{GSAP}}
<script>
  const canvas = document.getElementById('bg');
  canvas.width = {{W}}; canvas.height = {{H}};

  const tl = gsap.timeline({ paused: true });

  // Aurora background — uses brand primary colors
  OMShaders.attachAurora(canvas, tl, {
    colorA: '{{BRAND:primary}}', colorB: '#a855f7', colorC: '#06b6d4',
    intensity: 0.65, loopDur: 10
  });

  // Content animations
  tl.fromTo('.headline', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 0.3);
  tl.fromTo('.card',     { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.9);

  window.__SCENE_TIMELINE__ = tl;
  window.__SCENE_DURATION__ = 6; // always set explicitly when using shaders
</script>
</body></html>
```

---

## Rules when using OMShaders

1. **Always place `{{SHADERS}}` BEFORE `{{GSAP}}`** — the library needs to load before scene script runs.
2. **Always set `window.__SCENE_DURATION__` explicitly** (not from `tl.duration()`) when shaders are your only or primary tween.
3. **Canvas must have `.width` and `.height` set** in pixels matching `{{W}}` / `{{H}}` before calling attach functions.
4. **Multiple effects** can be layered on the same canvas — they `clearRect` independently so they must each clear before drawing. For layering, use separate canvas elements per effect or composite them manually.
5. **For export accuracy**: all `attach*` functions are seek-accurate. CSS `.om-liquid` is preview-only.
