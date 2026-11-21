# Example: Kinetic Typography Scene

Use for statement / hook / punchline moments where words ARE the visual. Staggered word reveals with varied motion, oversized type filling the frame, one accent word. All on one timeline.

Key techniques: per-word stagger with mixed properties, one word gets a `back.out` emphasis, a drifting glow. (No camera zoom — zoom is user-only via the editor zoom tool.) Don't slide every word the same way.

```html
<!doctype html><html><head><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#000}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#08060f;
  font-family:'Display',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.glow{position:absolute;inset:-20%;background:radial-gradient(ellipse 800px 600px at 42% 50%,rgba(150,90,235,.16),transparent 68%);mix-blend-mode:screen}
.rig{position:absolute;inset:0;display:flex;align-items:center;padding-left:120px}
.kin{font-size:130px;font-weight:800;line-height:.95;letter-spacing:-.035em;color:#F2EEFA;max-width:75%}
.kin .w{display:inline-block;margin-right:.28em}
.kin .hit{color:#a06bf0}
.tag{position:absolute;left:120px;bottom:140px;font-family:'Mono',monospace;font-size:22px;
  letter-spacing:.12em;text-transform:uppercase;color:#6b5a8c}
</style></head><body>
<div class="frame" id="frame">
  <div class="glow"></div>
  <div class="rig">
    <h1 class="kin">
      <span class="w">Stop</span><span class="w">juggling</span><span class="w hit">14</span><span class="w hit">apps.</span>
    </h1>
  </div>
  <div class="tag">— the workflow tax</div>
</div>
<script>
const tl = gsap.timeline({ paused:true });
// words enter with VARIED motion, not all identical
tl.fromTo('.kin .w',{opacity:0,y:50,rotationX:-40},{opacity:1,y:0,rotationX:0,transformOrigin:'50% 100%',
  stagger:0.09,duration:0.55,ease:'power4.out'},0.2);
// accent words get an extra pop
tl.fromTo('.kin .hit',{scale:1.5},{scale:1,duration:0.4,ease:'back.out(2)',stagger:0.08},'>-0.3');
tl.fromTo('.tag',{opacity:0,x:-20},{opacity:1,x:0,duration:0.5,ease:'power3.out'},'<0.1');
// breathe
tl.to('.glow',{xPercent:5,duration:7,repeat:-1,yoyo:true,ease:'sine.inOut'},0);
tl.to({},{duration:1.4},'>');
window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = tl.duration();
</script></body></html>
```

Why it works: words split into spans so each animates independently with staggered, varied motion (y + rotationX, not a uniform fade); the accent numbers pop with `back.out`; oversized type fills the frame anchored left; the glow drift keeps it alive. Swap copy/accent to the brand.
