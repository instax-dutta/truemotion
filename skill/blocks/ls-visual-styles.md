# LS Visual Styles — Premium Aesthetic Blocks

CSS/HTML building blocks that replicate the visual language of **ls.graphics** asset packs:
- Grainy Blurs, Glass Aberrations, Liquid States, Translucent Layers

These work alongside the `{{SHADERS}}` CSS utility classes but are self-contained HTML/CSS — no canvas or JS required.

> **When to read this file:** whenever you want premium texture overlays, frosted glass cards, device frames, or the "high-end product studio" aesthetic.

---

## Block: `ls-grain-bg`
**Grainy gradient background** — warm noise over a radial gradient.
Replicates ls.graphics "Grainy Blurs" aesthetic.

```html
<div class="ls-grain-bg" style="position:absolute;inset:0;">
  <div class="ls-grain-noise"></div>
</div>
<style>
.ls-grain-bg {
  background: radial-gradient(ellipse 120% 100% at 50% 60%,
    #1a3a8f 0%, #0a1a4a 45%, #050d1f 100%);
  overflow: hidden;
}
.ls-grain-noise {
  position: absolute; inset: 0; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 220px 220px;
  opacity: 0.06;
  mix-blend-mode: overlay;
}
</style>
```

---

## Block: `ls-glass-card`
**Frosted glass card** — ls.graphics Glass Aberrations style.
Works best over blurred / colorful backgrounds.

```html
<div class="ls-glass-card">
  <!-- content -->
</div>
<style>
.ls-glass-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.06) inset,
    0 20px 60px rgba(0, 0, 0, 0.4);
}
</style>
```

Dark variant for white/light backgrounds:
```html
<div class="ls-glass-dark-card">
<style>
.ls-glass-dark-card {
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
}
</style>
```

---

## Block: `ls-translucent-card`
**Translucent layered card** — ls.graphics Translucent Layers style.
Semi-transparent with double border + inset highlight.

```html
<div class="ls-translucent-card">
  <!-- content -->
</div>
<style>
.ls-translucent-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}
</style>
```

---

## Block: `ls-aberration-text`
**Chromatic aberration headline** — ls.graphics Glass Aberrations style.
Cyan/red channel split on text. Use `data-text` to mirror the visible text content.

```html
<h1 class="ls-aberration" data-text="VELOCITY">VELOCITY</h1>
<style>
.ls-aberration {
  position: relative;
  isolation: isolate;
  color: #fff;
}
.ls-aberration::before {
  content: attr(data-text);
  position: absolute; inset: 0;
  color: rgba(255, 0, 80, 0.4);
  transform: translate(-3px, 0);
  mix-blend-mode: screen;
  pointer-events: none;
}
.ls-aberration::after {
  content: attr(data-text);
  position: absolute; inset: 0;
  color: rgba(0, 200, 255, 0.4);
  transform: translate(3px, 0);
  mix-blend-mode: screen;
  pointer-events: none;
}
</style>
```

---

## Block: `ls-device-iphone`
**CSS iPhone frame** — ls.graphics device mockup style.
A pure CSS/SVG phone shell. Place a screenshot or UI inside `.ls-phone-screen`.

```html
<div class="ls-phone">
  <div class="ls-phone-notch"></div>
  <div class="ls-phone-screen">
    <!-- your UI / screenshot here -->
    <!-- e.g. <img src="{{ASSET:assets/app-screen.png}}" style="width:100%;height:100%;object-fit:cover;"> -->
  </div>
  <div class="ls-phone-home"></div>
</div>
<style>
.ls-phone {
  width: 320px; height: 640px;
  background: #1a1a1a;
  border-radius: 48px;
  border: 2px solid rgba(255,255,255,0.12);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.06) inset,
    0 40px 100px rgba(0,0,0,0.6),
    0 0 0 8px #111,
    0 0 0 10px rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 24px;
  gap: 8px;
}
.ls-phone-notch {
  width: 100px; height: 28px;
  background: #111;
  border-radius: 0 0 18px 18px;
  flex-shrink: 0;
}
.ls-phone-screen {
  flex: 1;
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.ls-phone-home {
  width: 100px; height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
```

---

## Block: `ls-device-macbook`
**CSS MacBook frame** — ls.graphics device mockup style.

```html
<div class="ls-macbook">
  <div class="ls-macbook-lid">
    <div class="ls-macbook-notch"></div>
    <div class="ls-macbook-screen">
      <!-- your UI here -->
    </div>
  </div>
  <div class="ls-macbook-base">
    <div class="ls-macbook-keyboard"></div>
    <div class="ls-macbook-trackpad"></div>
  </div>
</div>
<style>
.ls-macbook { display: flex; flex-direction: column; align-items: center; gap: 0; }
.ls-macbook-lid {
  width: 640px; height: 400px;
  background: #1a1a1a;
  border-radius: 12px 12px 0 0;
  border: 2px solid rgba(255,255,255,0.1);
  border-bottom: none;
  position: relative;
  padding: 16px 16px 0;
  box-shadow: 0 -4px 40px rgba(0,0,0,0.5);
}
.ls-macbook-notch {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 120px; height: 20px;
  background: #1a1a1a;
  border-radius: 0 0 12px 12px;
  z-index: 2;
}
.ls-macbook-screen {
  width: 100%; height: 100%;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
}
.ls-macbook-base {
  width: 700px; height: 24px;
  background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
  border-radius: 0 0 8px 8px;
  border: 2px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
}
.ls-macbook-keyboard {
  width: 420px; height: 6px;
  background: rgba(255,255,255,0.08); border-radius: 2px;
}
.ls-macbook-trackpad {
  width: 120px; height: 3px;
  background: rgba(255,255,255,0.05); border-radius: 2px;
}
</style>
```

---

## Block: `ls-colorflow-gradient`
**ColorFlow-style mesh gradient background** — ls.graphics ColorFlow free tool aesthetic.
Use with `OMShaders.attachMeshGradient()` for animated version, or static CSS for a still frame.

**Static version (no JS):**
```html
<div class="ls-colorflow-static"></div>
<style>
.ls-colorflow-static {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 60% at 20% 30%, rgba(77,144,255,0.7) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 80% 20%, rgba(168,85,247,0.6) 0%, transparent 55%),
    radial-gradient(ellipse 55% 55% at 60% 80%, rgba(6,182,212,0.65) 0%, transparent 60%),
    radial-gradient(ellipse 45% 45% at 10% 70%, rgba(249,115,22,0.5) 0%, transparent 50%),
    #050d1f;
  filter: blur(40px) saturate(1.4);
}
</style>
```

**Animated version (requires {{SHADERS}}):**
```js
const canvas = document.getElementById('bg');
canvas.width = {{W}}; canvas.height = {{H}};
OMShaders.attachMeshGradient(canvas, tl, {
  colors: ['{{BRAND:primary}}', '#a855f7', '#06b6d4', '#f97316'],
  speed: 0.25, intensity: 0.8, loopDur: 12
});
```

---

## Composition tips

- **Layer grain on top of everything** — `z-index: 999`, `pointer-events: none`, `mix-blend-mode: overlay`
- **Glass cards need a colorful background** — frosted glass with backdrop-filter only shows on content behind it
- **Phone/MacBook frames at 3D angle** — wrap in a `.rig` with `transform: perspective(1200px) rotateY(-12deg) rotateX(4deg)` for the ls.graphics product-angle look
- **Combine glass + grain** — add both `.om-glass` and `.om-grain` classes for the ls.graphics "grainy glass" texture popular in premium SaaS promo videos
