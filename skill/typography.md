# Typography

Read on every composition — every scene has text. These rules are what separate produced-looking type from generated-looking type.

## Banned Fonts

These are training-data defaults that every LLM reaches for. They produce monoculture across videos. Do NOT use them unless a brand kit explicitly specifies one:

Inter, Roboto, Open Sans, Noto Sans, Arimo, Lato, Source Sans, PT Sans, Nunito, Poppins, Outfit, Sora, Playfair Display, Cormorant Garamond, Bodoni Moda, EB Garamond, Cinzel, Prata, Syne.

**Syne especially** is the most overused "distinctive" display font — an instant AI tell. Avoid it.

If a brand kit names one of these, use it (the brand wins). Otherwise choose something with more character for the register (see Selection below).

## Hard Pairing Rules

- **Never pair two sans-serifs.** This is the reflex to resist. Cross a boundary: serif + sans, or sans + mono.
- **One expressive font per scene.** One performs (display/headline), one recedes (body/label). Picking two interesting fonts makes it worse.
- **Weight contrast must be extreme.** Video needs 300 vs 900, not 400 vs 700. The difference must read at a glance, in motion.
- **Never pair two fonts that are similar-but-not-identical** (two geometric sans, two transitional serifs). It creates friction without hierarchy — the viewer senses something's off. Either one font at two weights, or fonts that contrast on multiple axes (serif+sans, condensed+wide, geometric+humanist).

## Video Sizes, Not Web Sizes

(See the scale table in motion-rules.md.) Minimums:
- Headlines: 64px+ (display moments 100–130px+).
- Body: 28px+ — never below 24px without justification.
- Labels / data: 18–24px.
- Tracking tighter than web on display sizes: -0.03em to -0.05em. Video encoding compresses letter detail, so tighten.

## Dark-Background Compensation

Light text on dark creates two optical illusions — compensate:
- **Apparent weight increases.** Light-on-dark reads heavier at the same weight. Use ~350 for body instead of 400. Headlines are less affected (size compensates).
- **Apparent spacing tightens.** Light halos shrink perceived gaps. Add ~0.05–0.1 to line-height beyond your light-background value, and ~0.01em letter-spacing on display sizes.

## Numbers

Any time digits stack or align (stat callouts, counters, scoreboards, tables), use tabular figures (`font-variant-numeric: tabular-nums` in the element style) so columns line up. Without it, proportional digits make columns ragged. For counters that animate from 0, tabular figures also stop width-jitter as the value changes.

## Selecting a Font (when no brand kit)

Don't pick by category reflex (editorial→serif, tech→mono, modern→geometric sans). That's pattern-matching, not design.
1. **Name the register** — the voice the content speaks in: institutional authority, personal confession, technical precision, casual irreverence. The register narrows the field more than the category.
2. **Think physically** — imagine the font as an object the brand could ship: a museum caption, a hand-painted sign, a 1970s terminal manual, a fabric label. Whichever fits the register points at the right *kind* of typeface.
3. **Reject your first instinct** — the first font that feels right is usually your default for that register. Find something with more character.
4. **Cross-check** — an editorial brief does not need a serif; a technical brief does not need a sans. The most distinctive choice often contradicts the category expectation.

## Motion Is Typography

How a word enters carries as much meaning as the font. A 0.15s slam and a 2s fade on the same word say completely different things. In video, sequence is hierarchy — the first word to appear is the most important. Use entrance timing and order, not just size, to rank text.

## Reading Time

3 seconds on screen means it must be readable in 2. Fewer words, larger type. If a line won't fit comfortably, cut words before shrinking the font. Max ~12 words of text per scene as a rule of thumb.

## Fonts in OpenMotion (important)

OpenMotion injects bundled fonts via {{FONTS_CSS}} — you reference them by family name, never load from a CDN. The available families and weights are:
- **'Display'** — the bundled display/headline face, weights **600** and **900**. Use 900 for hero headlines (it hits hard at 100px+), 600 for sub-heads. Use for headlines and large type only.
- **'Body'** — the bundled body/text face, weights **300** and **400**. Use 300 on dark backgrounds (light-on-dark reads heavier), 400 on light.
- **'Mono'** — the bundled monospace, weight **500** (labels, metadata, code, mono eyebrows).

The weight contrast that makes video type read is **Display 900 vs Body 300** — use that pairing for hero + support text, not two mid weights.

Use only these family names in scenes. They are guaranteed present and offline. Do NOT @import Google Fonts or reference any font by its real name (Syne/Inter/etc) — declaring a raw font name is a contract violation and the scene will be rejected. If a brand kit specifies its own fonts, OpenMotion injects those under the same family names, so your markup stays the same and automatically picks up brand fonts.
