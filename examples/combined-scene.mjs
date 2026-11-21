// One scene exercising every locally implemented authoring token together.
// Shared by the shipped pro demo and the end-to-end regression test.
export const COMBINED_BRAND = {
  primary: '#F5A524',
  background: '#0B0E14',
  text: '#F3EFE9',
  accent: '#F5A524',
  muted: 'rgba(243,239,231,0.62)',
  logo: ''
};

export const COMBINED_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:{{BRAND:background}}}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:var(--brand-background);color:var(--brand-text)}
#stage{position:absolute;inset:0;width:100%;height:100%}
.plane{width:520px;height:320px;border-radius:18px}
.eyebrow{position:absolute;left:120px;top:88px;font-family:'Mono';font-weight:500;font-size:20px;letter-spacing:.2em;color:{{BRAND:primary}}}
.sketch{position:absolute;left:1180px;top:700px}
</style></head><body><div class="frame">
<div class="eyebrow" data-om-id="eyebrow">EVERY TOKEN / ONE SCENE</div>
<div id="stage">
  <div class="plane" id="back" data-om-id="back"></div>
  <div class="plane" id="front" data-om-id="front">{{COMPONENT:card}}</div>
</div>
<div class="sketch" id="sketch" data-om-id="sketch"></div>
</div>
{{ROUGH}}
{{FX}}
{{SHADERS}}
{{THREE}}
{{GSAP}}
<script>
// BRAND token as a literal value, plus injected CSS variables above.
document.getElementById('back').style.background = '{{BRAND:primary}}';

// THREE: CSS-3D stage with two planes at different depths.
const world = OM3D.create('#stage', { perspective: 1000, maxRotation: 5 });
world.addPlane('#back', { x: 220, y: 300, z: -160 });
world.addPlane('#front', { x: 900, y: 300, z: 40, rotationY: 8 });

// ROUGH: deterministic hand-drawn underline.
document.getElementById('sketch').innerHTML =
  OMRough.line(0, 0, 520, 12, { stroke: '{{BRAND:primary}}', strokeWidth: 6, roughness: 3 });

// FX: restrained scanlines on the frame.
OMFX.scanlines(document.querySelector('.frame'), { size: 5, opacity: 0.16 });

// SHADERS: glass treatment on the card and a vignette.
OMShaders.glass('#front', { blur: 8 });
OMShaders.vignette('#stage');

const tl = gsap.timeline({ paused: true });
tl.fromTo('#front', { x: 900, y: 420, opacity: 0 }, { x: 900, y: 300, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0.2);
tl.fromTo('.eyebrow', { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.1);
tl.to({ v: 0 }, { v: 1, duration: 4 }, 0);
world.bindTimeline(tl, 4);
window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 4;
</script></body></html>`;
