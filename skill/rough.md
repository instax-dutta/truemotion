# OMRough — Hand-Drawn Sketch Graphics

OpenMotion bundles **OMRough** on top of [Rough.js](https://roughjs.com) for authentic hand-drawn / whiteboard / sketchbook aesthetics. Use when the user asks for hand-made drawings, sketchy UI, doodle style, whiteboard explainer, or Excalidraw-like visuals.

`window.OMRough` is available when you include `{{ROUGH}}` in your scene, or when the injector detects `OMRough.` in your script (auto-inject). No CDN — inlined like GSAP.

> **When to read this file:** user wants hand-drawn, sketchy, whiteboard, doodle, notebook, or handmade drawing design. Also read `blocks/rough-hand-drawn.md` for copy-paste blocks.

---

## How it works with GSAP timelines

1. **Draw once at init** — call `OMRough.*` before or at timeline start. Every shape uses a **fixed `seed`** (default `42`) so export frames are deterministic.
2. **Animate with GSAP** — tween opacity, scale, x, y on the returned SVG `<g>` nodes. Never re-call Rough on every frame.
3. **Draw-on paths** — use `OMRough.prepareDrawOn(node)` then GSAP `strokeDashoffset` (same pattern as `svg-curve-draw` in catalog).

**Do not** regenerate sketch strokes in `onUpdate` — the renderer seeks the timeline; only GSAP state must change per frame.

---

## Scene setup

Place an SVG overlay behind or around your content:

```html
<div class="frame om-paper-bg" id="frame">
  <svg class="om-rough-svg" id="rough" viewBox="0 0 {{W}} {{H}}" aria-hidden="true"></svg>
  <div class="content">
    <h1 class="headline" data-om-id="headline">Ship faster.</h1>
  </div>
</div>
```

In your script (after `{{ROUGH}}` and `{{GSAP}}`):

```js
const svg = document.getElementById('rough');
const tl = gsap.timeline({ paused: true });

// Sketchy card behind headline area
const card = OMRough.card(svg, 120, 280, 1680, 320, {
  stroke: 'var(--brand-primary, #2563eb)',
  fill: 'rgba(37,99,235,0.08)',
  fillStyle: 'hachure',
  roughness: 1.6,
  seed: 42
});

OMRough.underline(svg, 140, 520, 420, { stroke: 'var(--brand-primary, #2563eb)', seed: 43 });

tl.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.2);
tl.fromTo('.headline', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.35);

window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 6;
```

---

## API reference

All methods append to the SVG and return the root `<g>` node for GSAP targeting.

| Method | Description |
|--------|-------------|
| `OMRough.card(svg, x, y, w, h, opts?)` | Sketchy rectangle — boxes, cards, diagram nodes |
| `OMRough.circle(svg, cx, cy, diameter, opts?)` | Sketchy circle |
| `OMRough.ellipse(svg, cx, cy, w, h, opts?)` | Sketchy ellipse |
| `OMRough.line(svg, x1, y1, x2, y2, opts?)` | Sketchy line |
| `OMRough.arrow(svg, x1, y1, x2, y2, opts?)` | Line + arrowhead |
| `OMRough.path(svg, d, opts?)` | SVG path `d` string |
| `OMRough.underline(svg, x, y, width, opts?)` | Wobbly emphasis underline |
| `OMRough.prepareDrawOn(node)` | Sets dasharray for draw-on; returns `{ node, length }` |

### Common options (pass per call or via `OMRough.defaults`)

| Option | Default | Notes |
|--------|---------|-------|
| `seed` | `42` | **Always set** for determinism; increment per shape (`43`, `44`…) |
| `roughness` | `1.4` | `0.5` = tidy sketch, `2.5` = messy whiteboard |
| `bowing` | `1.2` | Stroke waviness |
| `stroke` | `#000` | Use `var(--brand-primary)` or `{{BRAND:primary}}` |
| `strokeWidth` | `2` | Scale up for 1920×1080 (3–4 for hero strokes) |
| `fill` | — | Fill color |
| `fillStyle` | `hachure` | `hachure`, `solid`, `cross-hatch`, `dots`, `zigzag` |

### CSS utilities (auto-injected with `{{ROUGH}}`)

| Class | Effect |
|-------|--------|
| `.om-paper-bg` | Warm paper background + subtle grain |
| `.om-rough-svg` | Full-frame SVG overlay (`position:absolute; inset:0`) |

---

## Three composition modes

| Mode | When | Approach |
|------|------|----------|
| **Full sketch** | Whole scene is hand-drawn | `.om-paper-bg` + all chrome via OMRough + casual display type |
| **Hybrid** | Polished product + sketch annotations | Glass/clean UI + OMRough arrows, circles, underlines on top |
| **Sketch conversion** | User drew layout, wants to keep sketch look | Match positions from `view_sketch`, rebuild with OMRough instead of glass cards |

For sketch conversion with hand-drawn output, read `sketch-conversion.md` → **Hand-drawn output** section.

---

## Typography pairing (hand-drawn scenes)

Prefer humanist / casual faces over geometric sans. If no brand kit, pair a display face with a neutral body — avoid banned fonts in typography.md. Headlines still follow video scale (64px+). Sketch scenes often use darker ink (`#1a1a1a`) on paper (`#f6f1e8`) with one brand accent for strokes.

---

## Full scene example

See `examples/rough-whiteboard-scene.md`.

---

## Rules

1. **Place `{{ROUGH}}` before `{{GSAP}}`** (after `{{SHADERS}}` if both are used).
2. **Always pass `seed`** on every shape — export depends on it.
3. **Text stays HTML** — Rough draws chrome (boxes, arrows, underlines), not body copy.
4. **`data-om-id` on HTML wrappers** — not on generated path nodes.
5. **Hybrid scenes** — polished blocks from catalog + OMRough annotation layer on top (`z-index` above content).
6. **No emoji** — Lucide SVG icons only (scene-contract.md).
