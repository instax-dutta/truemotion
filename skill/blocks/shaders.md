<!-- SPDX-License-Identifier: MIT -->
# Shader-style utilities

The `{{SHADERS}}` token injects a local CSS utility layer on `window.OMShaders`.
It emulates the useful surface of the original effects bundle with inline CSS
only: no WebGL, no canvas, no network request, no dependency.

```html
<div class="frame" id="frame"><div id="card">...</div></div>
{{SHADERS}}
<script>
OMShaders.glass('#card', { blur: 12 });
OMShaders.vignette('#frame');
</script>
```

## API

| Call | Effect |
| --- | --- |
| `OMShaders.inject()` | Adds the class stylesheet. Called automatically. |
| `OMShaders.translucent(target, color, alpha)` | Sets a translucent background. |
| `OMShaders.glass(target, { color, alpha, blur })` | Translucent background plus backdrop blur. |
| `OMShaders.aberration(target, amount)` | Red/blue text-shadow offset. |
| `OMShaders.vignette(target)` | Appends a radial vignette overlay. |

The injected stylesheet exposes `.om-glass`, `.om-grain`, `.om-translucent`,
`.om-aberration` and `.om-vignette` so static markup can use the same language.
Targets may be selectors or elements. Keep these effects restrained, and put
any animation on the GSAP timeline rather than in CSS.
