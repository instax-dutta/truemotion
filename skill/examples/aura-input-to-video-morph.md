# Example: Aura input → generating card → video player (ONE scene)

**Use when the user describes:** input/prompt → card/generating → video player — all on the same `#prompt-bar` / `#gen-card` actor.

This MUST be **one scene, one timeline** (~15s). Never split into evolved scenes 2, 3, 4 — hard cuts freeze morphs.

## Structure

- Shell: blue gradient bg, nav logo
- Single `#gen-card` data-om-id="prompt-bar" contains:
  1. `#input-row` — typing + generate button
  2. `#card-body` — generating UI (hidden until morph)
  3. `#video-interior` — black 16:9 + play button (hidden until second morph)

## Timeline phases

| Phase | ~Time | Motion |
|-------|-------|--------|
| Build | 0–4s | Nav slides in, headline, input rises, typing, hints |
| Clear | 4–4.6s | Headline and hints fade out (no camera zoom — zoom is user-only) |
| Morph card | 4.6–9s | Input fades, card height 84→380, progress 0→100%, steps |
| Morph video | 9–14s | Flash, card → 16:9 black, play button, done label |

## Full reference HTML

Copy from `examples/aura-journey-scene.html` in the motion-skill folder (same content agents get via read_skill).

## Agent rule

If you already added scene 2 (prompt) and were about to add scene 3 (card) with `evolveFromSceneId` and same `prompt-bar` — **stop**. Tool will reject split morph. Instead `update_scene` on scene 2 with merged journey HTML and `durationSec: 15`.
