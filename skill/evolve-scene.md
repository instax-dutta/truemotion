# Scene evolution (mandatory for scene 2+)

OpenMotion videos feel like **motion graphics**, not slides, when each scene **evolves from the previous scene's final state** — not when every scene is written from scratch.

## CRITICAL: Evolve ≠ Morph

| Technique | When | Tool |
|-----------|------|------|
| **Evolve** | Shell moves, logo repositions, new panel slides in, bg persists | `add_scene({ evolveFromSceneId })` |
| **Morph** | **Same widget transforms** (input→card→video, search→dashboard) | **ONE scene** — `update_scene` with longer `durationSec` |

**Never** use `evolveFromSceneId` when the same `data-om-id` actor (especially `#prompt-bar`) morphs into the next state. Export hard-cuts — morph across scenes = frozen duplicate frames.

User says "input becomes card becomes video" → **one ~15s morph scene**, not three evolved scenes.

## The chain model

| Scene | How to build |
|-------|----------------|
| **Scene 1** | Fresh HTML — `add_scene` with no `evolveFromSceneId` |
| **Scene 2+** | `read_scene(previousId, purpose: "evolve")` → modify → `add_scene({ evolveFromSceneId })` |
| **Morph beat** | Extend current scene OR one new scene with full journey — **never split morph across evolve** |

Each evolved scene forks **only the previous scene** — not cumulative DOM from all prior scenes.

## What to keep vs change (evolve only)

**Keep (verbatim — do not rewrite):** background, shell, grid, persistent chrome, AND every continuing actor's position/size/transform at its exit value. Copy the HTML as-is, then lock the exit state with `tl.set(..., 0)`.

**Change:** logo position, nav reveal, inner content swap, new section, new panel sliding in.

**Do NOT evolve:** same input box → card → player. That's morph — one timeline.

## Timeline rules at t=0 (evolve) — MATCHED CUT IS MANDATORY

Frame 0 of the new scene MUST look **pixel-identical** to the last frame of the previous scene. The viewer must not see anything jump, shift, or re-appear at the cut.

**How:**
1. Fork the previous scene HTML **verbatim** — keep every continuing element's CSS (position, size, transform) exactly as-is. Do not rewrite layout.
2. Find each continuing actor's **final transform** from the previous timeline (the `x/y/scale/opacity` at the end of its last `tl.to()`). Re-apply those exact values with `tl.set()` at position `0`:

```javascript
// Previous scene ended with .phone at x:0, y:380, scale:1, opacity:1
tl.set('.phone', { x: 0, y: 380, scale: 1, opacity: 1 }, 0);   // LOCK exit state at frame 0
tl.to('.phone', { y: 200, duration: 0.9, ease: 'power3.out' }, 0.3); // THEN animate the new beat
// Bad: tl.from('.phone', { opacity: 0, y: 30 }, 0);  // re-intro — breaks the cut
// Bad: leaving .phone at its default CSS position if it differs from the exit position
```

3. Animate **only the delta** after t=0. Continuing actors may move during the scene, but their **starting** position = the previous scene's **ending** position.
4. A continuing element that "jumps" between the last frame of scene N and frame 0 of scene N+1 is a **failed evolve** — fix it by copying the exit values into a `tl.set(..., 0)`.

## Morph beats (input → card → video)

One scene, one timeline (no authored camera zoom — zoom is user-only):

- read_skill('examples/connected-morph-scene.md')
- read_skill('examples/aura-input-to-video-morph.md') for input→generating→player pattern
- All states live inside one `#prompt-bar` / `#gen-card` DOM node
- Use `update_scene` to extend duration — do not `add_scene` for the next morph phase

## Isolated beats (exception)

Use `freshStart: true` only for montage smashes, logo stings, unrelated chapters.

## Required HTML comments

```html
<!-- evolved-from: {previous-scene-id} "Scene name" -->
<!-- continuity: .phone EXIT x:0 y:380 scale:1 opacity:1 | NEXT ENTRY same → drifts up to y:200 -->
```

List **every continuing actor** with its exact exit `x/y/scale/opacity` — the next scene reads this and locks those values at t=0.

For morph scenes (single file):
```html
<!-- journey: input types → morph card → progress → morph 16:9 player -->
```

## Tool workflow

**Multi-beat product demo (intro + morph journey):**
1. `add_scene` — intro (fresh)
2. `add_scene({ evolveFromSceneId })` — prompt shell appears (logo moves, new UI — evolve OK)
3. **If input must become card/video:** `update_scene` on scene 2 OR replace with one morph scene — **do not add scenes 3 & 4 for morph phases**

**Evolve-only chain:**
1. get_scenes → add_scene scene 1
2. read_scene(evolve) → add_scene({ evolveFromSceneId }) for shell/layout beats only

## Anti-patterns

- Scene 2 input → Scene 3 card → Scene 4 video (three files) — **split morph**
- Every scene opens with `{ opacity: 0, y: 30 }` on continuing actors
- Matched static frames at cuts with no motion between identical layouts
- Writing scene 2+ from scratch
