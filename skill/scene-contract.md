# Scene Contract

Every scene is ONE self-contained HTML document. Follow this exactly or the scene will not render/export. Read every time.

## Required structure

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      /* {{FONTS_CSS}} is injected by OpenMotion — @font-face rules for the bundled
         fonts, already inlined as data URLs. Reference those font-families by name.
         Do NOT @import or <link> any web font. */
      *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
      .frame {
        position: relative;
        width: {{W}}px;            /* e.g. 1920 — injected */
        height: {{H}}px;           /* e.g. 1080 — injected */
        overflow: hidden;
        background: #0A0F1E;       /* your scene bg */
        -webkit-font-smoothing: antialiased;
      }
      /* all your scene styles here */
    </style>
  </head>
  <body>
    <div class="frame" id="frame">
      <!-- Mark editable copy/colors for the Design panel (recommended on all user-facing text): -->
      <!-- <h1 class="headline" data-om-id="headline" data-om-label="Headline">Your headline</h1> -->
      <!-- your layered scene markup -->
    </div>

    <!-- {{GSAP}} is injected by OpenMotion: the full GSAP library, inlined.
       It is guaranteed to be present before your script runs. -->
    <script>
      // Build ONE timeline, PAUSED.
      const tl = gsap.timeline({ paused: true })

      // ...all your tweens on tl...
      // Always fromTo() with explicit start AND end state, never from() — the renderer
      // seeks to arbitrary frames, and from()'s lazily-captured start breaks on a cold seek
      // (see motion-rules.md → Seek-Safety). This is the #1 cause of a scene that renders static.
      // tl.fromTo('.headline', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.2);

      // REQUIRED: expose for the renderer to seek.
      window.__SCENE_TIMELINE__ = tl
      window.__SCENE_DURATION__ = 6 // seconds — set explicitly; do not use tl.duration() when repeat:-1 tweens exist
    </script>
  </body>
</html>
```

## Injection tokens

OpenMotion replaces these before rendering — use them, do not provide your own:

- `{{GSAP}}` — the full GSAP library inlined in a `<script>`. Available before your script. (Place the GSAP token in the head or just before your script; OpenMotion handles placement — you write your code assuming `gsap` is global.)
- `{{THREE}}` — the bundled Three.js renderer plus deterministic `OM3D` adapter. Use only for true geometry/material/light scenes; read `true-3d.md` first.
- `{{SHADERS}}` — **OMShaders** canvas effects library + ls.graphics CSS utilities. Inlines `window.OMShaders` and CSS classes (`.om-glass`, `.om-grain`, `.om-translucent`, `.om-aberration`). Place BEFORE `{{GSAP}}` — read `shaders.md` for full API. Auto-injected when `OMShaders.` is detected in your script.
- `{{ROUGH}}` — **OMRough** hand-drawn sketch graphics (Rough.js). Inlines `window.OMRough` and CSS classes (`.om-paper-bg`, `.om-rough-svg`). Place BEFORE `{{GSAP}}` — read `rough.md` for full API. Auto-injected when `OMRough.` is detected in your script.
- `{{FONTS_CSS}}` — `@font-face` rules for the bundled fonts (display + mono), inlined as data URLs. Use the font-families named in typography.md.
- `{{W}}` / `{{H}}` — the composition pixel dimensions. Author at this exact size.
- Project assets (brand kit logo, chat attachments, imported images) use `{{ASSET:relativePath}}` tokens that resolve to inlined data URLs at preview/export. Never reference a file path or http URL directly.
- **Chat attachments:** images the user drops in chat are saved to `assets/` and listed in the agent message with exact `{{ASSET:...}}` tokens — use those when embedding user-provided logos or reference images.
- `{{BRAND:logo}}` — brand kit logo as an inlined data URL.
- `{{BRAND:primary}}`, `{{BRAND:background}}`, etc. — brand color hex values (prefer `var(--brand-primary)` in CSS).
- `{{COMPONENT:id}}` — brand kit UI component HTML snippet.
- `{{ICON:slug}}` — brand/app logo from the built-in Simple Icons library (e.g. `{{ICON:notion}}`, `{{ICON:gmail/mono}}`). See `app-icons.md`.
- When a project has a brand kit, OpenMotion injects `/* om-brand */` CSS variables (`--brand-primary`, `--brand-background`, `--brand-text`, …) and brand fonts. **Always use these variables for colors and typography.**

## Icons

**Never use emojis.**

### Brand / app logos (Notion, Gmail, Slack, etc.)

OpenMotion ships **3,400+ brand icons** via [Simple Icons](https://simpleicons.org). Use the `{{ICON:slug}}` token — resolved to an inlined SVG data URL at preview/export:

```html
<img class="app-icon" src="{{ICON:notion}}" alt="" width="48" height="48" />
<img class="app-icon" src="{{ICON:gmail}}" alt="" width="48" height="48" />
<img class="app-icon" src="{{ICON:slack}}" alt="" width="48" height="48" />
<img class="app-icon" src="{{ICON:googlesheets}}" alt="" width="48" height="48" />
```

- Slugs match [simpleicons.org](https://simpleicons.org) (e.g. `notion`, `gmail`, `slack`, `googlesheets`, `figma`, `linear`).
- Aliases work too: `sheets` → `googlesheets`, `mail` → `gmail`, `twitter` → `x`.
- **Brand color (default):** `{{ICON:notion}}`
- **Monochrome (white, for dark UI):** `{{ICON:notion/mono}}`
- **Monochrome custom hex:** `{{ICON:slack/mono/111111}}`
- Read `app-icons.md` for floating-icon patterns and a curated slug list.

### Generic UI icons (arrows, plus, menu)

Use **Lucide** icons inlined as SVG strings from [lucide.dev](https://lucide.dev) — no React, no npm, no external requests.

```html
<svg
  class="icon"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>
```

- Use `stroke="currentColor"` so Lucide icons inherit text color from the brand palette.
- Brand logos → `{{ICON:slug}}` in `<img>`. Generic UI chrome → inline Lucide SVG.
- Do not use emoji (🚀 ✨ ⚡ etc.) or icon fonts.

## The single-timeline rule (why it matters)

The renderer produces each video frame by calling:

```js
window.__SCENE_TIMELINE__.pause()
window.__SCENE_TIMELINE__.seek(frameNumber / fps)
```

then capturing the DOM. The scene bridge also calls `tl.render()` and flushes proxy `onUpdate` handlers after each seek so typing and count-ups stay in sync. Therefore:

- **Everything visible/animated must be a function of timeline position.** A `setTimeout` that reveals an element will never fire during a seek-based render — that element will be invisible in the export.
- **No CSS `transition` or `@keyframes`** for meaningful motion — they run on wall-clock time, not timeline time, so they won't be captured deterministically. (A purely static `:root` style is fine; motion must be GSAP.)
- **Continuous loops** (ambient glow drift, breathing) must be GSAP tweens with `repeat: -1` on the timeline (e.g. `tl.to('.glow', { x: 30, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 0)`), so seeking to any time yields a defined state.
- **Counters / number count-ups**: animate a proxy object on the timeline and write to the DOM in `onUpdate` (see examples/product-scene.md). Never use a `setInterval`.
- **SVG draw-on** (arcs, paths): animate `strokeDashoffset` via GSAP, not CSS. Use `OMRough.prepareDrawOn()` for sketchy paths when using `{{ROUGH}}`.
- **Three.js:** use `{{THREE}}`, create the stage with `OM3D.create()`, and call `stage.bindTimeline(tl, duration, onFrame)` after other tweens. Never use `requestAnimationFrame`, `Clock`, or `setAnimationLoop`; derive the complete 3D frame from the supplied time.

## Typing in input / prompt bars

When showing text typed into an input box, chat bar, or prompt field:

- Use an empty `<span id="typed-content" data-om-typed>` — not `<input>` (not seek-accurate).
- Call `OMTyping.attach()` (injected in every scene) — read `blocks/typing-input.md`.
- Add `om-typing-host` on the bar wrapper; animate **the bar**, not the typing span.
- **Never** apply `opacity: 0`, `y`, `z`, or `scale` `from()` tweens to the element that receives typed characters.

## Sound (SFX)

Sound effects are **not** embedded in the scene HTML.

Users add, place, trim, and mix sounds manually while previewing the video in the editor.
Your job is only the visuals + perfect GSAP timeline.

## Duration

Set `durationSec` (the scene's length in the video) to match `window.__SCENE_DURATION__` — set that to an explicit number of seconds (e.g. `6`), **not** `tl.duration()` when the timeline has `repeat: -1` ambient tweens (cursor blink, pulse, shaders). Build a real **build → breathe → resolve** timeline. Typography/simple heroes finish Build early; product/UI shots may assemble stable `data-om-id` components through 60–70%, then hold the smallest state that proves the message. Never reveal a complete interface at once by default; follow shot-direction.md.

## Design panel (no-code edits)

OpenMotion parses scene HTML for a **Design** inspector tab. Help the panel map your scene:

- Put `data-om-id` (unique slug) and `data-om-label` (human label) on every headline, tagline, CTA, and stat the user might edit.
- Use **numeric GSAP positions** on entrance tweens when possible (e.g. `, 0.2)` not `,'>-0.3'`) so start time / stagger sliders can find them.
- Add **timeline labels** for grouped entrances: `tl.addLabel('headline-in', 0.2)` then reference with `'headline-in'` or `'<0.1'` offsets.
- Keep `.frame { background: … }` as a solid color when the user should recolor the scene background.
- Prefer solid hex colors in CSS (not only `var(...)`) for secondary accents the user may tweak.

## Determinism checklist (self-verify)

- Only ONE `gsap.timeline`, created `paused`, on `window.__SCENE_TIMELINE__`. ✓
- No `setTimeout`, `setInterval`, or bare `requestAnimationFrame`. ✓
- No CSS `transition`/`@keyframes` driving meaningful motion. ✓
- Continuous motion uses `repeat: -1` GSAP tweens. ✓
- `window.__SCENE_DURATION__` set to the intended scene length in seconds (explicit number; avoid `tl.duration()` if `repeat: -1` tweens exist). ✓
- Fonts referenced by injected family names; no external requests. ✓
- Icons are Lucide SVG inlined in HTML; no emojis. ✓
