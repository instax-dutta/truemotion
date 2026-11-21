<!-- SPDX-License-Identifier: MIT -->
# Example: title scene

A complete four-second cold open. Copy the structure, change the palette and
copy to suit the brief.

```html
<!doctype html><html><head><meta charset="utf-8"><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#0B0E14}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0B0E14;color:#F3EFE9}
.eyebrow{position:absolute;left:120px;top:112px;font-family:'Mono';font-size:20px;letter-spacing:.18em;color:#F5A524}
.rule{position:absolute;left:120px;top:160px;width:180px;height:3px;background:#F5A524}
h1{position:absolute;left:112px;top:380px;font-family:'Display';font-weight:900;font-size:156px;letter-spacing:-.05em}
.sub{position:absolute;left:120px;top:600px;font-family:'Body';font-weight:300;font-size:34px;color:rgba(243,239,231,.7)}
</style></head><body><div class="frame">
<div class="eyebrow" data-om-id="eyebrow">AN OPEN MOTION STUDIO</div>
<div class="rule"></div><h1 data-om-id="title">TrueMotion</h1>
<div class="sub" data-om-id="sub">Motion, authored anywhere.</div>
</div>
{{GSAP}}
<script>
const tl=gsap.timeline({paused:true});
tl.fromTo('.rule',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:.5,ease:'expo.out'},.12);
tl.fromTo('.eyebrow',{x:-18,opacity:0},{x:0,opacity:1,duration:.5,ease:'power3.out'},.2);
tl.fromTo('h1',{y:70,opacity:0},{y:0,opacity:1,duration:.9,ease:'power4.out'},.3);
tl.fromTo('.sub',{y:24,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},1);
tl.to('h1',{x:16,duration:1.6,ease:'sine.inOut'},2.1);
window.__SCENE_TIMELINE__=tl;window.__SCENE_DURATION__=4;
</script></body></html>
```

The final tween is the resolve: a small drift keeps the last 40 percent alive
without competing with the title.
