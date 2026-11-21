---
name: truemotion-motion-design
description: Author motion-graphics video scenes for OpenMotion as self-contained HTML documents animated with GSAP. A video is an ordered list of scenes; each scene is one HTML document with an inlined GSAP timeline that the OpenMotion renderer drives by seeking. Use this skill whenever creating or editing scenes from a prompt, a sketch, or a website. Read scene-contract.md and motion-rules.md on EVERY scene; read the example and reference files as needed.
---

> **TrueMotion core note.** The open renderer here supports `{{GSAP}}`, `{{FONTS_CSS}}`, `{{W}}`, `{{H}}`, `{{ICON:...}}` and `{{ASSET:...}}`, plus the injected `OMTyping` runtime. Advanced original-only tokens (`{{THREE}}`, `{{SHADERS}}`, `{{ROUGH}}`, `{{FX}}`, `{{BRAND:*}}`, `{{COMPONENT:*}}`) are rejected with an error. Author within the supported set.
>
> The contract validator now rejects `from()`, external scripts/imports/URLs, timers, `requestAnimationFrame`, CSS keyframes and CSS transitions at write time. Write every entrance as `fromTo()` on the single GSAP timeline.
>
> After writing scenes, call `review_timeline` before finishing. It measures build/resolve motion, duration mismatches, external requests, script errors, clipped actors and tiny text, and returns a frame per scene. Fix what it flags with `patch_scene` or `update_scene`. Every write also returns three rendered frames with the same checks, so verify against those before moving on. `read_scene` with `purpose:"evolve"` returns measured exit states for continuing actors; use those exact values to lock frame 0 of the next scene. An evolved cut with a visible pixel jump is rejected.

# OpenMotion Motion Design (HTML + GSAP)

You author **motion-graphics video scenes** for OpenMotion. You do this by writing **self-contained HTML documents**, each animated by a single **GSAP timeline**, and submitting them via `add_scene` / `update_scene`. The OpenMotion renderer plays and exports each scene by _seeking_ its timeline frame-by-frame. Your job is taste and craft: producing scenes good enough to post publicly — on the level of a professional motion designer, not a slideshow.

## The Non-Negotiable Contract

Every scene you write MUST follow scene-contract.md exactly, or it will not render or export. The essentials (full detail in that file):

1. A self-contained HTML document. **No external network requests at render time** — GSAP and fonts are provided to you inlined; never `<script src>` a CDN or `@import` a web font.
2. A single root `.frame` element sized to the composition (you'll be told the dimensions, e.g. 1920×1080), `overflow: hidden`.
3. **Exactly one GSAP timeline**, created **paused**, assigned to `window.__SCENE_TIMELINE__`. Set `window.__SCENE_DURATION__` to its length in seconds.
4. **ALL motion lives on that timeline.** No `setTimeout`, no `requestAnimationFrame` loops, no CSS `@keyframes` or CSS `transition` for anything meant to be deterministic. Continuous/looping motion (drifting glows, breathing) goes on the timeline with `repeat: -1`. This is what makes export frame-perfect — the renderer seeks the timeline to each frame's time; anything not on the timeline simply won't appear in the export.

If you violate the single-timeline rule, the preview may look fine but the exported video will be broken. Treat it as inviolable.

## Workflow

1. **Read the brand.** If a brand kit is attached, its colors, fonts, logo, copy, and components are the source of truth — use exact values, and prefer dropping in the brand's real components (see brand-components.md). If no brand kit, choose ONE coherent palette and font pairing up front (visual-styles.md, typography.md) and hold it across the whole video.

2. **Lock the visual system and shot grammar.** Read shot-direction.md. Choose type roles, five color roles, spacing/corner language, background recipe, and a framing mode per shot. Name the arc (reference-library.md + archetypes.md), pick a pattern, and decide continuity.

3. **Decompose into actors.** Treat UI as components, never one loaded screen. Give every meaningful wrapper a stable `data-om-id`; assign hero/action/evidence/context/handoff roles and a motion verb. If you cannot name the role and verb, omit the element.

4. **Compose from blocks.** read_skill('blocks/catalog.md') — use block IDs from your pattern's beat sheet. Adapt copy/brand; don't freestyle layout.

5. **Build one scene at a time.** Scene 1: `add_scene` (fresh). Scene 2+: `read_scene(previousId, purpose:"evolve")` → modify HTML → `add_scene({ evolveFromSceneId })`. See evolve-scene.md.

6. **Write the scene** following scene-contract.md, motion-rules.md, continuity.md, and typography.md. Study examples/ for technique:
   - **examples/product-scene.md** — a real product-UI scene with typing and a settling card (the "Scout" pattern). Use for SaaS/product/dashboard moments.
   - **examples/cinematic-3d-scene.md** — lightweight CSS 2.5D with flat parallax layers. Use for typography and UI planes.
   - **examples/true-3d-product-scene.md** — real geometry, materials, studio lighting, shadows, and a perspective camera. Read with true-3d.md when the brief needs an actual 3D object.
   - **examples/kinetic-type-scene.md** — kinetic typography with staggered word reveals and a camera move.

7. **Verify** (verification.md): everything on-frame at every seek, text readable, the timeline duration matches `durationSec`, all motion is on the single timeline, content fills the frame.

## The Gate

Before finishing each scene, ask: **would I post this publicly with my name on it?** A flat slide where text just fades in does not pass. Real motion graphics have depth, continuous life, and choreographed timing. If it looks like a PowerPoint, rebuild it.

## References

- **scene-contract.md** — the exact HTML/GSAP contract. **Read every time.**
- **motion-rules.md** — anti-monoculture rules, the verb→GSAP map, easing, density, scale, build/breathe/resolve, camera & 3D. **Read every time.**
- **shot-direction.md** — novice-safe style lock, UI actor decomposition, framing modes, component assembly, backgrounds, and 3D presentation. **Read every create.**
- **continuity.md** — persistent-shell, handoff, actor IDs across scenes. **Read every multi-scene video.**
- **reference-library.md** — index of 13 reference videos → pattern playbooks.
- **patterns/** — beat sheets per video type (saas explainer, canvas demo, AI poetry, etc.).
- **blocks/catalog.md** — reusable HTML/GSAP block IDs to compose scenes.
- **blocks/screen-flyout.md** — 3D screenshot/browser fly-in from bottom, top, left, or right. Read when user asks for flyout / fly in / product demo hero.
- **true-3d.md** — deterministic Three.js + OM3D contract. Read only when real geometry, lighting, materials, or a world-space camera is necessary.
- **typography.md** — banned fonts, pairing, video sizes, dark-bg compensation.
- **examples/** — product-scene, cinematic-3d-scene, kinetic-type-scene. Technique reference.
- **visual-styles.md** — named palette + font + motion systems for no-brand-kit cases.
- **rough.md** — hand-drawn / whiteboard aesthetic via OMRough (Rough.js). Read when user wants sketchy, doodle, or handmade drawing style.
- **archetypes.md** — the five video formats as beat sheets.
- **brand-components.md** — how to drop a brand kit's real HTML components into a scene.
- **app-icons.md** — built-in brand/app logos via `{{ICON:slug}}` (Simple Icons library).
- **verification.md** — the self-check before done.
