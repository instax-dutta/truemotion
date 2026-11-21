# Rough.js Hand-Drawn Blocks

Copy-paste HTML+GSAP blocks for sketchy / whiteboard aesthetics. Requires `{{ROUGH}}` — read `rough.md` for API.

---

## Block: `rough-paper-stage`
Warm paper background + full-frame SVG layer.

```html
<div class="frame om-paper-bg" id="frame">
  <svg class="om-rough-svg" id="rough" viewBox="0 0 {{W}} {{H}}" aria-hidden="true"></svg>
  <!-- content layers here -->
</div>
```

---

## Block: `rough-hero-card`
Sketchy bordered card behind a headline.

```js
const svg = document.getElementById('rough');
const card = OMRough.card(svg, 100, 260, 1720, 340, {
  stroke: 'var(--brand-primary, #2563eb)',
  fill: 'rgba(37,99,235,0.06)',
  fillStyle: 'hachure',
  hachureGap: 6,
  roughness: 1.5,
  strokeWidth: 3,
  seed: 42
});
tl.fromTo(card, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' }, 0.15);
```

---

## Block: `rough-callout-arrow`
Curved attention arrow pointing at a UI element.

```js
OMRough.arrow(svg, 200, 400, 520, 320, {
  stroke: 'var(--brand-primary, #e11d48)',
  strokeWidth: 3,
  roughness: 1.8,
  bowing: 2,
  seed: 44
});
```

---

## Block: `rough-emphasis-underline`
Wobbly underline under a keyword (position to match headline).

```js
OMRough.underline(svg, 140, 380, 480, {
  stroke: 'var(--brand-primary, #2563eb)',
  strokeWidth: 3,
  roughness: 2,
  seed: 45
});
```

---

## Block: `rough-flow-box`
Diagram node — box + label HTML on top.

```html
<div class="flow-node" style="position:absolute;left:200px;top:420px;width:320px;height:120px;">
  <h2 data-om-id="node-a" style="font-size:36px;color:#1a1a1a;text-align:center;padding-top:36px;">Capture</h2>
</div>
```

```js
const boxA = OMRough.card(svg, 200, 420, 320, 120, {
  stroke: '#1a1a1a',
  fill: 'rgba(0,0,0,0.03)',
  fillStyle: 'solid',
  roughness: 1.2,
  seed: 50
});
tl.fromTo(boxA, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.3);
```

---

## Block: `rough-connector`
Arrow between two diagram nodes.

```js
OMRough.arrow(svg, 520, 480, 680, 480, {
  stroke: '#1a1a1a',
  strokeWidth: 2.5,
  roughness: 1.4,
  seed: 51
});
```

---

## Block: `rough-draw-on-circle`
Circle that draws on via strokeDashoffset.

```js
const ring = OMRough.circle(svg, 960, 540, 180, {
  stroke: 'var(--brand-primary, #2563eb)',
  strokeWidth: 4,
  roughness: 1.6,
  seed: 60
});
const draw = OMRough.prepareDrawOn(ring);
tl.fromTo(draw.node.querySelector('path'), { strokeDashoffset: draw.length }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0.4);
```

---

## Block: `rough-highlight-circle`
Hand-drawn circle highlight around an icon or stat.

```js
OMRough.ellipse(svg, 400, 600, 200, 140, {
  stroke: 'var(--brand-primary, #f59e0b)',
  strokeWidth: 3,
  roughness: 2.2,
  bowing: 2.5,
  seed: 55
});
```

---

## Composition tips

- **Layer order:** paper bg → rough SVG → HTML content (text must sit above SVG for readability).
- **Hybrid polish:** use `ls-glass-card` or product blocks for UI, add `rough-callout-arrow` / `rough-highlight-circle` on the SVG layer with higher z-index on content.
- **Stagger diagram builds:** animate each `rough-flow-box` + connector in sequence (0.2s apart).
- **One accent ink** — black/graphite strokes + one brand color for emphasis; avoid rainbow sketch strokes.
