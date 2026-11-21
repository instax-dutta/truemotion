# Finishing — easing palette, effects, camera, rhythm

The finishing toolkit (OMFX) is how scenes get After-Effects-grade polish WITHOUT
inventing craft from scratch. Quality comes from picking curated ingredients,
not from writing glow CSS by hand. OMFX auto-injects whenever you reference it
(or place `{{FX}}` explicitly). Everything is timeline-driven and seek-accurate.

## Easing palette (USE THESE — never default eases on hero elements)

| Ease | Personality | Use for |
|---|---|---|
| `om-settle` | confident entrance, ~3% overshoot that settles | hero headlines, primary cards |
| `om-snap` | percussive hard stop | accents, counters, UI hits, labels |
| `om-pop` | playful ~8% overshoot | badges, icons, callouts — MAX 2 per scene |
| `om-land` | heavy landing with a micro-dip | panels, big cards, devices |
| `om-whip` | anticipation then violent move | exits, wipes, transition beats |
| `om-mech` | 3-step mechanical quantize | split-flap, tickers, gauges, terminals |
| `om-float` | weightless, soft both ends | ambient drift, background shapes |
| `om-drift` | smoothstep | camera moves, parallax — never entrances |

Rule: a scene with 4+ entrances must use at least 2 different eases from the
palette. Hero gets the expressive ease; support elements get quieter ones.
`ease: 'om-settle'` — plain string, GSAP knows it once OMFX is present.

## Finishing effects (budget: MAX 2 per scene, each needs a nameable job)

```js
// Specular band sweeps across a card/logo ONCE at a key beat
OMFX.lightSweep(tl, '.card', { at: 1.6, duration: 1.1, color: '#ffffff', opacity: 0.3 })

// Tiny star flash — "this just became important"
OMFX.glint(tl, '.logo', { at: 2.0, size: 80, x: '82%', y: '14%' })

// ONE breathing glow with a purpose (CTA pulse, live indicator)
OMFX.glowPulse(tl, '.cta', { color: '#1DB954', from: 0.12, to: 0.4, cycle: 3.2, radius: 34 })

// Seeded one-shot burst on a reveal beat (deterministic, export-safe)
OMFX.particleBurst(tl, '.frame', { at: 1.4, x: '50%', y: '42%', count: 14, color: '#1DB954' })

// Seek-accurate number counter for stats
OMFX.countUp(tl, '.stat-value', { from: 0, to: 12400, at: 0.8, duration: 1.4,
  format: (n) => Math.round(n).toLocaleString() })
```

## Text animators (per-char / per-word — the 2026 title language)

`textCascade` splits an element's text and staggers the units in. Content-level
(always runs, no effect budget). One cascade per scene on the HERO line only —
support text uses plain tweens.

```js
// presets: 'rise' (y+blur settle — default), 'blur-slide' (x drift), 'flip' (3D char flip), 'pop' (scale)
OMFX.textCascade(tl, '.headline', { preset: 'rise', by: 'char', at: 0.3 })
OMFX.textCascade(tl, '.kicker',   { preset: 'blur-slide', by: 'word', at: 0.1, stagger: 0.05 })
```

Do NOT also write a separate `tl.fromTo('.headline', …)` entrance for the same
element — the cascade IS its entrance.

## Motion blur + parallax depth

```js
// Smear: blur that decays as a fast element lands. Pair with om-snap/om-whip
// entrances. Never on elements whose entrance already tweens `filter`.
OMFX.smear(tl, '.card', { at: 0.4, amount: 10, duration: 0.35 })

// Parallax: layers drift at different rates for 2.5D depth. depth 0 = locked,
// 1 = full offset. Pair with a camera 'drift' — same duration.
OMFX.parallax(tl, [['.bg-grid', 0.3], ['.mid-card', 0.6], ['.fg-badge', 1]],
  { x: -18, y: 10, duration: SCENE_DURATION })
```

## Camera rig (NO zoom — zoom is user-only)

**Never author a camera zoom.** The `'push'` preset is retired (it is a no-op at
runtime) and hand-rolled wrapper-scale tweens are forbidden — the editor has a
user-controlled zoom tool, and the user decides where to zoom. If a brief says
"camera pushes in" or "zoom into X", compose the shot statically instead.

For non-zoom ambience, wrap scene content in `<div class="camera-rig">…</div>`, then:

```js
OMFX.camera(tl, '.camera-rig', 'drift', { duration: SCENE_DURATION })  // diagonal float (translation only)
OMFX.camera(tl, '.camera-rig', 'tilt-settle', { settle: 1.4 })         // 3D product-shot settle
```

At most one camera move per scene, matching the motion personality. The rig wraps
CONTENT only — the grade overlay and backgrounds stay outside.

## Beat grid (rhythm is engagement)

Snap entrance times to a musical grid instead of arbitrary decimals:

```js
var beat = OMBeat.grid(120)            // 120bpm → 0.5s per beat
tl.fromTo('.headline', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'om-settle' }, beat.at(1))
tl.fromTo('.sub',      { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'om-snap' },   beat.at(2))
tl.fromTo('.cta',      { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'om-pop' }, beat.at(3))
```

Beats 1/2/3/4 for major entrances, `beat.half(n)` for pickups. When background
music exists, the project SFX system aligns to the same grid.

## Grade layer (automatic — do NOT build your own)

OpenMotion applies a film-grade overlay (grain + vignette tuned to your
`<!-- direction: name -->`) at render time. Never add your own grain/vignette
divs. Opt out only when the direction demands sterile flatness: `<!-- grade: off -->`.

## What this kills

Uniform `power2.out` on everything · decorative glow on every card ·
hand-rolled camera math · arbitrary 0.37s timings · static slides.
If motion lint flags your scene, treat it as a reviewer note and fix it.
