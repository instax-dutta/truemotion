# Pattern: AI Product Poetry 16:9 (video 09)

**Continuity:** evolve chain — scene 2+ fork previous HTML. Morph journey = ONE scene file.

## Beat sheet

| Beat | ~Duration | Content | Blocks |
|------|-----------|---------|--------|
| Dock | 3s | 3D glass icon dock | `glass-icon-dock-3d` |
| Word | 2s | "everything" mesh | `mesh-gradient-kinetic-word` |
| Journey | 12s | Prompt → morph → KPI dashboard inside same bar | `examples/connected-morph-scene.md` |
| Close | 3s | Text-only CTA (use `logo-sting-organic-blob` ONLY if a real logo asset is provided) | `logo-sting-organic-blob` / text CTA |

## Journey scene (critical)

Prompt bar and dashboard are **one DOM node** (`#prompt-bar`), one timeline:

1. Type + cursor pulse (0–2s)
2. Bar height morph + dashboard content reveal inside (2–5s) — no camera zoom (zoom is user-only)
3. KPI stagger + breathe (5–12s)

**Do not** create separate scenes for "prompt" and "dashboard".

## data-om-id

- `prompt-bar` — entire Journey scene
- `card-title`, `headline` — editable copy inside morph
