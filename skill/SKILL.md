---
name: truemotion-motion-design
description: Author and render motion-graphics videos as self-contained HTML scenes driven by a single seekable GSAP timeline. Use when a request asks for a video, animation, title sequence, explainer, product demo, or motion study. Reads the contract first, writes scenes through the TrueMotion MCP tools, audits them, then renders.
---
<!-- SPDX-License-Identifier: MIT -->
# TrueMotion motion design

A video is an ordered list of scenes. A scene is one HTML document with one
paused GSAP timeline. TrueMotion renders by seeking that timeline to exact
times, so every visible change must be a function of timeline position.

## Workflow

1. Load the brief. Pick one visual system: a palette, a type pairing, a spacing
   scale, and a background treatment. Hold it across the whole film.
2. Read [scene-contract.md](scene-contract.md) and [motion-rules.md](motion-rules.md)
   before writing any scene.
3. Read [typography.md](typography.md) and [shot-direction.md](shot-direction.md)
   for the type and composition decisions.
4. Write scene 1 with `add_scene`. For later scenes, read the previous one with
   `read_scene(purpose: "evolve")` when actors continue across the cut, or pass
   `freshStart: true` for an intentional hard cut.
5. After every write, inspect the returned frames before continuing.
6. Call `review_timeline`. Fix what it flags with `patch_scene` or `update_scene`.
7. Call `render_video` with the final output path.

## Authoring rules

- One timeline, paused, on `window.__SCENE_TIMELINE__`.
- Explicit `window.__SCENE_DURATION__` in seconds.
- Every entrance uses `fromTo()` with both states written out.
- Tokens `{{GSAP}}`, `{{FONTS_CSS}}`, `{{W}}`, `{{H}}`, `{{ICON:...}}`,
  `{{ASSET:...}}`, `{{ROUGH}}`, `{{FX}}`, `{{SHADERS}}`, `{{BRAND:*}}` and
  `{{COMPONENT:*}}` are inlined locally. Never reference a CDN, a web font, or a
  local file path.
- Available font families are `Display` (600, 900), `Body` (300, 400) and
  `Mono` (500). No other family names.
- No emoji. Brand logos come from `{{ICON:slug}}`; generic icons are inline SVG.
- Mark editable copy with `data-om-id` and `data-om-label`.

## The quality bar

A scene is finished when it has a clear hero, depth, continuous life, and a
deliberate resolve. A flat layout where text simply appears is not finished.
Trust the measurements from `review_timeline` over your own reading of the code.

## References

Call `list_skills` through MCP to see the current reference set; load any file
with `read_skill`.

- [scene-contract.md](scene-contract.md) - required HTML shape and tokens.
- [motion-rules.md](motion-rules.md) - timing, easing, depth, anti-patterns.
- [typography.md](typography.md) - type roles and minimum sizes.
- [shot-direction.md](shot-direction.md) - framing and actor hierarchy.
- [continuity.md](continuity.md) - matched cuts across scenes.
- [evolve-scene.md](evolve-scene.md) - how to fork a scene safely.
- [verification.md](verification.md) - the self-check before finishing.
- [finishing.md](finishing.md) - final polish and handoff.
- [reference-library.md](reference-library.md) - pattern index.
- [blocks/catalog.md](blocks/catalog.md) - reusable block shapes.
- [blocks/typing-input.md](blocks/typing-input.md) - prompt-bar typing.
- [blocks/rough.md](blocks/rough.md) - hand-drawn SVG helper for `{{ROUGH}}`.
- [blocks/fx.md](blocks/fx.md) - local inline-CSS effects for `{{FX}}`.
- [blocks/shaders.md](blocks/shaders.md) - CSS utility layer for `{{SHADERS}}`.
- [blocks/brand.md](blocks/brand.md) - colour variables and logo for `{{BRAND:*}}`.
- [blocks/components.md](blocks/components.md) - reusable markup for `{{COMPONENT:*}}`.
- [patterns/](patterns/) - beat sheets by video type.
- [examples/](examples/) - complete scene sketches.
