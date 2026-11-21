<!-- SPDX-License-Identifier: MIT -->
# Local effects

The `{{FX}}` token injects a small local helper on `window.OMFX`. It produces
inline CSS only: no canvas, no animation loop, no network request, no external
library.

```html
<div class="frame" id="frame"><div id="hero">...</div></div>
{{FX}}
<script>
OMFX.outline('#hero', '#F5A524', 4);
OMFX.scanlines('#frame', { size: 4, opacity: 0.2 });
</script>
```

## API

| Call | Effect |
| --- | --- |
| `OMFX.outline(target, color, width)` | Solid box-shadow outline. |
| `OMFX.glow(target, color, radius)` | Soft radial-gradient background. |
| `OMFX.aberration(target, amount)` | Red/blue text-shadow offset. |
| `OMFX.scanlines(target, { size, opacity })` | Appends a hard-stop striped overlay. |
| `OMFX.grain(target, { opacity })` | Inline SVG noise as a background image. |

Targets may be selectors or elements. All output is deterministic for the same
arguments. Keep effects subordinate to the message: one restrained effect per
scene is usually enough, and every animated property still belongs on the GSAP
timeline.
