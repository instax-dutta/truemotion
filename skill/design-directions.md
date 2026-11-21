# Design Directions (pick ONE before scene 1 — mandatory)

The root cause of AI-looking video is **no decision**: when no direction is chosen, output converges to the statistical center — purple gradients, glow-on-dark, glassmorphism, uniform fade-ins. That center is instantly recognizable as machine output. "Clean and modern" is not a direction; it IS the slop default.

**Process (required):**
1. Before authoring scene 1, pick ONE direction below that fits the content's register (or derive one from the brand kit — the brand always wins).
2. Record it in an HTML comment at the top of scene 1: `<!-- direction: swiss-editorial -->`.
3. Hold its tokens for EVERY scene — same palette strategy, type treatment, texture, and motion character across the whole video. Evolved scenes inherit it automatically; freshStart scenes must re-apply it.
4. Never mix directions inside one video.

## The directions

### swiss-editorial
Confident print-design authority. **Palette:** paper tones (warm off-white #F4F1EA-family or cool #EDEFF2) + near-black ink + ONE saturated accent (vermillion, cobalt, forest). **Type:** oversized Display 900 headlines (tight tracking), generous whitespace, baseline-grid alignment, Mono for small labels/figures. **Texture:** none — flatness is the texture; hairline rules (2px) to divide zones. **Motion:** precise and grid-snapped; elements slide along one axis, hard stops, `power4.out`; no bounce, no glow. **Backgrounds:** solid paper; oversized ghost numerals/text at 6-10% ink.

### industrial-mono
Terminal/engineering-log aesthetic. **Palette:** one dark neutral (warm charcoal #17181A-family, NOT pure black) + phosphor-ish accent (amber or green-white) + mid-gray. **Type:** Mono everywhere it can justify itself (labels, data, timestamps); Display only for the one big statement per scene. **Texture:** faint scanline or 1px grid at 4-6%; corner brackets, crosshair ticks. **Motion:** typewriter reveals, stepped counters, blink-free cursor moves; percussive 0.15-0.3s hits; stillness between actions. **Backgrounds:** solid; data readouts as foreground chrome.

### soft-organic
Warm, human, editorial-lifestyle. **Palette:** cream/sand base + muted earth accent (terracotta, sage, ochre) + soft brown-black text. **Type:** Display 600 (not 900 — softer), Body 300 large and airy, sentence case. **Texture:** grain at 3-5%, blob/arch masks with very large radii. **Motion:** slow drifts (0.6-1s, `sine.inOut`/`power2.out`), scale breathing, nothing snaps; generous holds. **Backgrounds:** tinted solids or ONE soft radial wash in the accent (no purple, no orbs).

### bold-poster
Loud brutalist confidence — for launches and hype. **Palette:** one screaming accent (red, acid yellow, electric blue) + black + white, used in big flat blocks. **Type:** Display 900 at 140px+, words as the composition; outlined/knockout variants. **Motion:** slams (`power4.out`, 0.2-0.35s), hard cuts, kinetic type, block-color wipes; overshoot allowed (`back.out(1.4)`) max twice per video. **Texture:** none, or halftone at 8%. **Backgrounds:** flat accent or black — the color IS the background.

### clean-product
Light SaaS clarity — for UI demos. **Palette:** near-white base (#FAFAF8-family, not pure #fff) + ONE brand-ish accent + slate text; UI shown in realistic neutral chrome. **Type:** Display 600/900 for claims, Body 400 for support, Mono for metrics. **Texture:** soft single-source shadows (8-10% opacity); NO glassmorphism, NO gradient meshes. **Motion:** composed 0.35-0.55s entrances (`power3.out`), UI interactions demonstrated at believable speed. **Backgrounds:** solid light; a single very subtle vignette allowed.

### cinematic-noir
Dark done right — premium, restrained, NOT neon. **Palette:** deep desaturated base (blue-black or warm black, never #000) + ONE warm or metallic accent used sparsely (title, one key line) + gray-white text at 85-92%. **Type:** Display 900 with wide scenes of negative space; small Mono eyebrows. **Texture:** ONE slow light source (soft radial, 12-18% accent tint, 10s+ drift) — not glow on every element. **Motion:** deliberate 0.5-0.9s entrances (`expo.out`), long holds; silence-then-hit rhythm. **Backgrounds:** solid + that one light; no full-screen linear gradients (banding).

## Fitting direction to content

| Register | Direction |
|----------|-----------|
| Dev tool, API, CLI, infra | industrial-mono or swiss-editorial |
| B2B SaaS, dashboard, productivity | clean-product or swiss-editorial |
| Consumer app, lifestyle, wellness | soft-organic |
| Launch hype, drop, event, sale | bold-poster |
| Finance, security, luxury, "trusted" | cinematic-noir or swiss-editorial |
| Agency reel, portfolio | bold-poster or cinematic-noir |

When a brand kit exists: keep its colors/fonts as the tokens, and use the direction only for texture + motion character + composition attitude. When the user names a style ("hand-drawn", "retro"), that overrides this list — but still lock ITS tokens the same way.

## What no direction ever includes (the slop center)

Purple→blue/indigo gradients; violet gradient orbs floating behind content; glassmorphism panels by default; neon glow on every element; pure #000 or #fff backgrounds; three feature cards in a row; centered pill badge above a centered hero; bento grids as filler; every element fading in the same way. If a scene drifts toward any of these without the user asking, the direction was lost — re-read this file.
