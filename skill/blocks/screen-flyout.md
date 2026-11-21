# Screen Flyout — 3D Screenshot / Browser Entrance

Use when the user asks for a **screen flyout**, **fly in**, **fly from bottom/top/left/right**, **browser window animation**, **product demo hero**, or **screenshot landing on screen**.

> **Read this file** before building any scene where a UI screenshot or browser window flies from off-axis into the front-facing hero position.

**Requires:** `{{GSAP}}`, `{{W}}`, `{{H}}`. Embed user screenshots via `{{ASSET:assets/...}}` from chat attachments — never inline base64.

---

## When to use

| User says | Block / direction |
|-----------|-----------------|
| fly in from bottom, floor, desk | `screen-flyout-bottom` |
| fly in from top, drop down | `screen-flyout-top` |
| fly in from left | `screen-flyout-left` |
| fly in from right | `screen-flyout-right` |
| "screen flyout" / "product demo" (no direction) | default **`screen-flyout-bottom`** |

Optional: stack a `ls-glass-card` callout or `{{COMPONENT:id}}` widget **after** the fly-in lands (tween starts ~2.2s).

---

## Shared shell (all directions)

Place inside `.frame`. The screenshot goes inside `.browser-body`.

```html
<div class="fly-stage" id="fly-stage">
  <div class="flyout-rig" id="flyout-rig">
    <div class="browser" id="browser">
      <div class="browser-chrome">
        <div class="browser-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yel"></span>
          <span class="dot dot-grn"></span>
        </div>
        <div class="browser-url"><span>app.example.com</span></div>
      </div>
      <div class="browser-body">
        <!-- User screenshot — REQUIRED when they attached an image -->
        <img class="screenshot" src="{{ASSET:assets/your-shot.png}}" alt="" />
      </div>
    </div>
  </div>
</div>
```

```css
.fly-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  perspective-origin: 50% 52%;
}
.flyout-rig {
  width: min(82%, 1400px);
  transform-style: preserve-3d;
  will-change: transform;
}
.browser {
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
  background: #1a1a1d;
}
.browser-chrome {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  background: #2a2a2d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.browser-dots { display: flex; gap: 7px; }
.dot { width: 11px; height: 11px; border-radius: 50%; }
.dot-red { background: #ff5f57; }
.dot-yel { background: #febc2e; }
.dot-grn { background: #28c840; }
.browser-url {
  flex: 1;
  height: 26px;
  margin: 0 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}
.screenshot {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: top center;
}
```

**Rules:**
- All motion on **one GSAP timeline** — no `requestAnimationFrame`, no CSS `@keyframes` for the flyout.
- Easing: `power3.out` (matches cubic ease-out).
- Fly duration: **1.6–2.0s**. Hold **1.5–2.5s** after landing.
- Animate `#flyout-rig` for 3D rotation/position; tween `#browser` `boxShadow` in parallel for depth.
- If user attached a screenshot, **must** use their `{{ASSET:...}}` token in `.screenshot` src.

---

## Block: `screen-flyout-bottom`

**Bottom → front** — screen tilted on the floor plane, rises to face camera.

```js
const tl = gsap.timeline({ paused: true });

gsap.set('#flyout-rig', { transformOrigin: '50% 100%', transformPerspective: 1200 });

tl.fromTo(
  '#flyout-rig',
  { rotateX: 56, y: 80, scale: 0.78, opacity: 0.92 },
  { rotateX: 0, y: 0, scale: 1, opacity: 1, duration: 1.8, ease: 'power3.out' },
  0.25
);

tl.fromTo(
  '#browser',
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.25)' },
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 24px 80px rgba(0,0,0,0.55)', duration: 1.8, ease: 'power3.out' },
  0.25
);

window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 5;
```

---

## Block: `screen-flyout-top`

**Top → front** — screen hinged from above, unfolds down toward camera.

```js
const tl = gsap.timeline({ paused: true });

gsap.set('#flyout-rig', { transformOrigin: '50% 0%', transformPerspective: 1200 });

tl.fromTo(
  '#flyout-rig',
  { rotateX: -56, y: -80, scale: 0.78, opacity: 0.92 },
  { rotateX: 0, y: 0, scale: 1, opacity: 1, duration: 1.8, ease: 'power3.out' },
  0.25
);

tl.fromTo(
  '#browser',
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 -4px 12px rgba(0,0,0,0.2)' },
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 28px 90px rgba(0,0,0,0.55)', duration: 1.8, ease: 'power3.out' },
  0.25
);

window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 5;
```

---

## Block: `screen-flyout-left`

**Left → front** — screen swings in from the left edge.

```js
const tl = gsap.timeline({ paused: true });

gsap.set('#flyout-rig', { transformOrigin: '0% 50%', transformPerspective: 1200 });

tl.fromTo(
  '#flyout-rig',
  { rotateY: 52, x: -120, scale: 0.82, opacity: 0.92 },
  { rotateY: 0, x: 0, scale: 1, opacity: 1, duration: 1.75, ease: 'power3.out' },
  0.25
);

tl.fromTo(
  '#browser',
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), -8px 8px 24px rgba(0,0,0,0.2)' },
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 28px 90px rgba(0,0,0,0.55)', duration: 1.75, ease: 'power3.out' },
  0.25
);

window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 5;
```

---

## Block: `screen-flyout-right`

**Right → front** — screen swings in from the right edge.

```js
const tl = gsap.timeline({ paused: true });

gsap.set('#flyout-rig', { transformOrigin: '100% 50%', transformPerspective: 1200 });

tl.fromTo(
  '#flyout-rig',
  { rotateY: -52, x: 120, scale: 0.82, opacity: 0.92 },
  { rotateY: 0, x: 0, scale: 1, opacity: 1, duration: 1.75, ease: 'power3.out' },
  0.25
);

tl.fromTo(
  '#browser',
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 8px 8px 24px rgba(0,0,0,0.2)' },
  { boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 28px 90px rgba(0,0,0,0.55)', duration: 1.75, ease: 'power3.out' },
  0.25
);

window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 5;
```

---

## Optional widget overlay

After fly-in completes (~2.0s), fade/slide a callout or brand component:

```html
<div class="fly-widget ls-glass-card" id="fly-widget" data-om-id="callout">
  <p data-om-id="callout-text" data-om-label="Callout">AI-powered workflow</p>
</div>
```

```css
.fly-widget {
  position: absolute;
  left: 8%;
  bottom: 12%;
  padding: 20px 28px;
  max-width: 320px;
  opacity: 0;
}
```

```js
tl.fromTo('#fly-widget', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, 2.1);
```

Use `{{COMPONENT:id}}` inside `.fly-widget` when the user asks for a **widget** from their brand kit.

---

## Background

Dark stage works best. Options (pick one):
- `ls-grain-bg` on `.frame` (read `blocks/ls-visual-styles.md`)
- `OMShaders.attachAurora` on a full-frame canvas (read `shaders.md`)
- Brand `var(--brand-background)` gradient

---

## Checklist

- [ ] `read_skill('blocks/screen-flyout.md')` called before writing
- [ ] Correct direction block: bottom / top / left / right
- [ ] User screenshot uses `{{ASSET:...}}` token (if attached)
- [ ] Single paused GSAP timeline; `window.__SCENE_DURATION__` set explicitly
- [ ] No RAF / CSS keyframes for the flyout
- [ ] Shadow builds in sync with flatten
- [ ] Widget (if requested) animates **after** fly-in lands
