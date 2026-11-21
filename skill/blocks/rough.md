<!-- SPDX-License-Identifier: MIT -->
# Hand-drawn shapes

The `{{ROUGH}}` token injects a small, deterministic hand-drawn SVG helper on
`window.OMRough`. It has no dependency and makes no network request.

Place the token before your own script, then write the generated SVG into a
container:

```html
<div id="sketch"></div>
{{ROUGH}}
<script>
document.getElementById('sketch').innerHTML =
  OMRough.rect(100, 100, 320, 200, { stroke: '#1A1A1A', strokeWidth: 3 }) +
  OMRough.line(100, 360, 500, 360, { stroke: '#F5A524', strokeWidth: 5 });
</script>
```

## API

| Call | Result |
| --- | --- |
| `OMRough.line(x1, y1, x2, y2, opts)` | Two slightly offset strokes. |
| `OMRough.rect(x, y, w, h, opts)` | Double-stroked rectangle. |
| `OMRough.ellipse(cx, cy, w, h, opts)` | Jittered ellipse path. |
| `OMRough.polygon([[x,y], ...], opts)` | Jittered closed polygon. |
| `OMRough.prepareDrawOn(target)` | Sets dash arrays on paths and returns their lengths. |

Options: `stroke`, `fill`, `strokeWidth`, `roughness` and `seed`. Output is
deterministic for the same arguments, so exported frames are repeatable. Use a
different `seed` for different-looking shapes.

The injected stylesheet provides `.om-rough-svg` (round caps and joins) and
`.om-paper-bg` (warm paper background). Put `om-paper-bg` on the frame when you
want a sketchbook surface.

For a draw-on effect, call `prepareDrawOn` and tween `strokeDashoffset` on the
timeline. Do not use CSS transitions or timers.
