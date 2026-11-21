# Example: Cinematic 2.5D Scene (layered DOM depth)

Use for hero / hook / transition moments made from typography, screenshots, and other flat layers. This is CSS 2.5D—not real geometry. When the shot needs materials, lighting, shadows, or object thickness, use true-3d.md instead. All motion stays on ONE timeline.

Key techniques (the quality bar): `perspective` + `transform-style: preserve-3d`, layers at different `translateZ`, a `.camera-rig` that animates `rotationY` only (NEVER `scale` — camera zoom is user-only via the editor zoom tool), a Z-pop entrance, and a `repeat:-1` ambient. Easings: `power3.out`/`power4.out` for layer pops, `sine.inOut` for ambient.

```html
<!doctype html><html><head><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#000}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;
  background:radial-gradient(ellipse 1100px 700px at 50% 48%,#16233f 0%,#070b16 72%);
  perspective:1400px;-webkit-font-smoothing:antialiased;font-family:'Display',system-ui,sans-serif}
.camera-rig{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
.glow{position:absolute;inset:-15%;pointer-events:none;
  background:radial-gradient(ellipse 700px 500px at 50% 45%,rgba(80,150,235,.18),transparent 65%);
  mix-blend-mode:screen}
.eyebrow{position:absolute;top:34%;left:50%;transform:translateX(-50%);
  font-family:'Mono',monospace;font-size:20px;letter-spacing:.22em;text-transform:uppercase;color:#5a86c8}
.headline{position:absolute;top:40%;left:50%;transform:translateX(-50%);width:80%;text-align:center;
  font-size:118px;font-weight:800;line-height:.98;letter-spacing:-.03em;color:#EAF0FA}
.headline .hit{color:#4d8fe6}
.sub{position:absolute;top:66%;left:50%;transform:translateX(-50%);width:60%;text-align:center;
  font-size:30px;font-weight:300;color:#8aa0c4}
.rule{position:absolute;top:75%;left:50%;width:0;height:3px;background:#4d8fe6;transform:translateX(-50%)}
.ghost{position:absolute;top:-6%;left:50%;transform:translateX(-50%);font-size:420px;font-weight:800;
  color:rgba(120,160,230,.05);white-space:nowrap;letter-spacing:-.04em}
</style></head><body>
<div class="frame" id="frame">
  <div class="camera-rig">
    <div class="ghost" style="transform:translateX(-50%) translateZ(-300px)">SHIP</div>
    <div class="glow" style="transform:translateZ(-120px)"></div>
    <div class="eyebrow">Introducing</div>
    <h1 class="headline" style="transform:translateX(-50%) translateZ(60px)">Motion that <span class="hit">moves</span>.</h1>
    <p class="sub">Real depth. Real camera. Zero slideshow.</p>
    <div class="rule"></div>
  </div>
</div>
<script>
const tl = gsap.timeline({ paused:true });
// gentle rig settle — rotation only, no scale (camera zoom is user-only)
tl.fromTo('.camera-rig',{rotationY:-2},{rotationY:0,duration:5,ease:'expo.out'},0);
// Z-pop entrances: foreground faster/closer than background
tl.fromTo('.ghost',{opacity:0,z:-600},{opacity:1,z:0,duration:1.0,ease:'power2.out'},0.0);
tl.fromTo('.eyebrow',{opacity:0,y:-14},{opacity:1,y:0,duration:0.5,ease:'power3.out'},0.25);
tl.fromTo('.headline',{opacity:0,z:-420,y:40},{opacity:1,z:0,y:0,duration:0.7,ease:'power4.out'},0.35);
tl.fromTo('.sub',{opacity:0,y:30},{opacity:1,y:0,duration:0.55,ease:'power3.out'},'<0.15');
tl.to('.rule',{width:'18%',duration:0.5,ease:'power3.inOut'},'<0.1');
// breathe: ambient parallax drift, loops
tl.to('.glow',{xPercent:4,yPercent:-3,duration:8,repeat:-1,yoyo:true,ease:'sine.inOut'},0);
tl.to('.ghost',{xPercent:-2,duration:10,repeat:-1,yoyo:true,ease:'sine.inOut'},0);
// hold to ~5s
tl.to({},{duration:1.2},'>');
window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = tl.duration();
</script></body></html>
```

Why it works: the slow rig settle gives constant motion; layers entering from different `z` create real depth; the ghost word + glow fill the frame; ambient drift keeps the breathe phase alive; one accent hue; hero text fills the frame. Adapt copy, colors (from brand kit), and which element gets the camera focus — keep the structure.
