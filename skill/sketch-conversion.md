# Sketch → GSAP scene conversion

When a scene has `isRawSketch=true`, the user drew a layout in the sketch editor. Your job is to replace that placeholder HTML with a real GSAP scene that **matches the sketch layout** at composition pixels.

## Before you build

1. Call **`view_sketch`** for each raw-sketch `sceneId` so you can see the PNG.
2. Read this file and **scene-contract.md** / **motion-rules.md**.
3. Sketch PNGs are exported at exact composition size (e.g. 1920×1080 for 16:9). Treat the image as the ground-truth wireframe.

## Layout fidelity

- Preserve **hierarchy**: headlines, subcopy, boxes, arrows, and groupings become matching DOM layers.
- Preserve **rough positions**: if a title sits top-left in the sketch, place it top-left in the frame — do not center everything by default.
- Preserve **relative sizes**: large sketch text → large motion type; small labels → smaller type.
- Use sketch **colors and shapes** as intent, not final polish — upgrade to brand tokens and motion, but keep the same structure.
- Do **not** leave the sketch `<img>` in the final scene unless the user asked for a literal screenshot look.

## Hand-drawn output (keep sketch aesthetic)

When the user wants the result to **look hand-drawn** (sketchy, whiteboard, doodle, handmade, Excalidraw-style):

1. Read **`rough.md`** and **`blocks/rough-hand-drawn.md`**.
2. Rebuild layout with **`OMRough`** primitives at the same positions — do not polish into glass cards or clean vector UI.
3. Use `.om-paper-bg` + `<svg class="om-rough-svg">` overlay; keep copy as HTML above the SVG.
4. Pass a **fixed `seed`** on every OMRough shape for export determinism.
5. Animate with GSAP on the returned nodes — never regenerate strokes per frame.

If the user did **not** ask for hand-drawn output, convert to polished motion graphics as usual.

## set_scenes rules for sketches

- Replace sketch placeholder HTML entirely with a contract-valid GSAP document via **update_scene**.
- Keep the same `id`, `name`, and `durationSec` unless the user asked to change them.
- Omit `isRawSketch` / sketch fields — the converted scene is normal HTML only.
- Convert sketches **in timeline order** when multiple raw sketches exist.
- One **update_scene** call per converted sketch (not a bulk set_scenes).

## Motion

- Add purposeful entrance motion for each sketched element (stagger, slide, scale, opacity).
- Hard cut at scene end — no crossfade to the next scene.
