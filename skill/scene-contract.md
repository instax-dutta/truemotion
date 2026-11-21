<!-- SPDX-License-Identifier: MIT -->
# Scene contract

Read this before every scene. TrueMotion does not play a scene in real time; it
seeks a timeline to each frame. Anything outside that timeline is invisible to
the export.

## Required document

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      /* {{FONTS_CSS}} */
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #0B0E14; }
      .frame {
        position: relative;
        width: {{W}}px;
        height: {{H}}px;
        overflow: hidden;
        background: #0B0E14;
      }
    </style>
  </head>
  <body>
    <div class="frame" id="frame">
      <!-- layered content -->
    </div>
    {{GSAP}}
    <script>
      const tl = gsap.timeline({ paused: true });
      // tl.fromTo(el, { ... }, { ... }, position);
      window.__SCENE_TIMELINE__ = tl;
      window.__SCENE_DURATION__ = 4;
    </script>
  </body>
</html>
```

A static validator rejects a document that lacks `.frame`,
`window.__SCENE_TIMELINE__` or `window.__SCENE_DURATION__`, and also rejects
`from()`, external scripts or imports, remote URLs, timers,
`requestAnimationFrame`, CSS keyframes and CSS transitions.

## Injection tokens

| Token | Result |
| --- | --- |
| `{{W}}`, `{{H}}` | Composition size in CSS pixels. |
| `{{GSAP}}` | GSAP inlined as a script. Place it before your own script. |
| `{{FONTS_CSS}}` | `@font-face` rules for Display, Body and Mono as data URLs. |
| `{{ICON:slug}}` | Brand logo as an inline SVG data URL. `/mono` and `/mono/rrggbb` variants exist. |
| `{{ASSET:relativePath}}` | A file from the project assets directory as a data URL. |
| `{{ROUGH}}` | A local hand-drawn SVG helper on `window.OMRough`. See `blocks/rough.md`. |
| `{{FX}}` | A local inline-CSS effects helper on `window.OMFX`. See `blocks/fx.md`. |
| `{{SHADERS}}` | A local CSS utility layer on `window.OMShaders`. See `blocks/shaders.md`. |
| `{{BRAND:key}}` | A value from the state file's `brand` object, also exposed as `--brand-key`. See `blocks/brand.md`. |
| `{{COMPONENT:id}}` | A built-in or state-defined HTML snippet. See `blocks/components.md`. |
| `{{THREE}}` | A local CSS-3D stage helper on `window.OM3D`. See `blocks/three.md`. |

An HTML comment containing `{{GSAP}}` works, but a bare token is clearer.

The renderer injects a Content-Security-Policy that sets `default-src 'none'`
and `connect-src 'none'`. External requests from an authored scene are blocked;
inline scripts, injected fonts, data URLs and blob URLs still work. This keeps
rendering offline and reproducible even if a scene accidentally references a
remote URL.

## Seek-safe motion

- Build one timeline and put every moving thing on it.
- Use `fromTo()` with explicit start and end values. `from()` cannot seek.
- Continuous motion uses a tween with `repeat: -1` and `yoyo: true`.
- Counters tween a proxy object and write text in `onUpdate`. The renderer
  fires those callbacks on every seek.
- Typewriter effects use `OMTyping.attach()`; see `blocks/typing-input.md`.
- 3D and shader libraries from the original application are not part of this
  core. Compose depth with flat layers, perspective and rotation instead.

## Icons

No emoji. Use `{{ICON:slug}}` inside `<img>` for brand marks. Use inline Lucide
style SVG with `stroke="currentColor"` for arrows, plus signs and other UI
chrome.

## Duration

Set `window.__SCENE_DURATION__` to the scene's length in seconds as a literal
number. The MCP `durationSec` argument must match it. A mismatch is reported by
`review_timeline`.

## Design panel hints

Add `data-om-id` to headlines, labels, buttons and statistics, and
`data-om-label` with a human name. Prefer solid hex colours and numeric GSAP
positions so a later tool can adjust them without guessing.
