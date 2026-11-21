# Scene Continuity (mandatory for multi-scene videos)

Read on every multi-scene composition. A pro motion video feels like **one story**, not independent slides.

## PRIMARY: Scene evolution (read evolve-scene.md)

**Scene 2+ must evolve from the previous scene's HTML** — not written from scratch.

1. Scene 1 → fresh `add_scene`
2. Scene 2 → `read_scene(scene1, purpose:"evolve")` → modify → `add_scene({ evolveFromSceneId: scene1Id })`
3. Scene 3 → fork scene 2 only (chain, not cumulative)

The tool layer **enforces** this: `add_scene` without `evolveFromSceneId` fails when the timeline already has scenes (unless `freshStart:true` for isolated beats).

## CRITICAL: Morphs = one scene file

If an element **transforms** into the next state (prompt bar → dashboard card, search box → docked nav, toast → panel):

- Author **ONE scene** with **ONE timeline** — the GSAP morph runs on the same DOM node. (No authored camera zoom — zoom is user-only via the editor zoom tool.)
- **Never** split morph journeys across scene boundaries. Export hard-cuts between scene files — morph is impossible across cuts.
- Read `examples/connected-morph-scene.md` and copy that pattern.

Split scenes only when the **camera world resets** (e.g. mesh word interstitial, logo sting outro) — not when the same widget continues.

## Three continuity modes

| Mode | When | Rule |
|------|------|------|
| **evolve** (default) | Most product demos, explainers | Fork previous scene HTML; animate delta only |
| **persistent-shell** | Explainer with fixed chrome | Shell actors never re-intro. Only inner content swaps. |
| **isolated** | Montage / logo stings / unrelated beats | `freshStart:true` — hard cut OK |

## Actor rules

1. Assign stable IDs: `data-om-id="search-bar"`, `data-om-id="guide-cursor"`, `data-om-id="canvas-root"`, `data-om-id="preview-shell"`.
2. **Never** re-introduce a continuing actor with `opacity:0` fade-in — it already exists in the viewer's mind.
3. Document handoff in a HTML comment at top of each scene — list **every continuing actor** with its **exact exit coordinates** so the next scene can lock them:
   ```html
   <!-- evolved-from: {prev-scene-id} "Scene name" -->
   <!-- continuity: .phone EXIT x:0 y:380 scale:1 opacity:1 | NEXT ENTRY same → drifts up to y:200 -->
   ```
4. Shared actors use **identical CSS dimensions AND identical t=0 transform** at scene boundaries (within 2px). The new scene must `tl.set()` those exact values at position 0.
5. Guide cursor (`data-om-id="guide-cursor"`) may persist across scenes — animate its position on the timeline, don't respawn.

## Verb → continuity

| Journey | Actor | Pattern |
|---------|-------|---------|
| Search → morph → relocate | `#prompt-bar` | morph in ONE scene, or evolve handoff |
| Notification → feature | `#notification-toast` | evolve: toast slides up, next scene continues from exit state |
| Canvas demo | `#canvas-root` | persistent-shell: dot grid never leaves |
| Section nav explainer | `#preview-shell` + `#section-pills` | persistent-shell: pills update active state |
| Hand-guided UI | `#guide-cursor` | evolve: cursor position matches last frame |

## Matched cuts at export (MANDATORY for evolve)

Scenes are separate HTML documents, so the only way a cut feels invisible is if **frame 0 of scene N+1 is pixel-identical to the last frame of scene N**. The viewer must see NOTHING jump, shift, fade, or re-appear.

1. **Fork verbatim** — copy the previous scene HTML as-is. Do not rewrite the CSS position/size/transform of any continuing element.
2. **Lock exit state at t=0** — find each continuing actor's final `x/y/scale/opacity` from the previous timeline and re-apply them with `tl.set('...', { ... }, 0)`. Without this lock the element will snap to its CSS default at the cut and continuity breaks (e.g. a phone that was at the bottom suddenly appears centered).
3. **No re-intro** — continuing actors are on screen at t=0, never `.from({opacity:0})` or `{y:30}`.
4. **Animate only the delta** after t=0 — a new panel slides in, content swaps, the phone drifts. The starting position always equals the previous scene's ending position.
5. **Background family** — same `--scene-bg` hue across the pair (use brand vars).

A continuing element that changes position between the last frame of scene N and frame 0 of scene N+1 is a **failed cut**. Fix it by copying the exit values into a `tl.set(..., 0)`.

## Anti-patterns (instant AI tell)

- Writing every scene from scratch (slides, not motion graphics)
- Rebuilding the same search bar/card in every scene
- Resetting camera to default while pretending it's continuous
- Different accent color per scene without narrative reason
- Every scene opens with identical `{y:30, opacity:0}` on all elements

## Reference patterns with continuity

- `patterns/saas-explainer-persistent-shell.md` — shell + pills (video 01)
- `patterns/connected-ui-demo-canvas.md` — canvas + cursor (video 12)
- `patterns/ai-product-poetry-16x9.md` — prompt bar morph (video 09)
- `patterns/feature-launch-pain-hook.md` — cursor guide (video 10)
