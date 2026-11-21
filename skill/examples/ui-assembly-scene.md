<!-- SPDX-License-Identifier: MIT -->
# Example: UI assembly scene

Shows a product interface arriving one component at a time. In production,
replace the placeholder cards with real markup and keep the `data-om-id` values.

```html
<div class="frame">
  <h1 data-om-id="promise">From prompt to film</h1>
  <div class="panel" data-om-id="panel-1">Prompt</div>
  <div class="panel" data-om-id="panel-2">Scenes</div>
  <div class="panel" data-om-id="panel-3">Frames</div>
  <div class="panel" data-om-id="panel-4">MP4</div>
  <div class="track"><i></i></div>
</div>
{{GSAP}}
<script>
const tl=gsap.timeline({paused:true});
tl.fromTo('h1',{y:28,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},.1);
tl.fromTo('.panel',{y:36,opacity:0,rotationY:24},
  {y:0,opacity:1,rotationY:0,duration:.7,stagger:.16,ease:'power4.out'},.5);
tl.fromTo('.track i',{scaleX:0,transformOrigin:'left center'},
  {scaleX:1,duration:2,ease:'power2.inOut'},1.1);
tl.to('.panel:last-of-type',{borderColor:'#F5A524',duration:.3,ease:'power2.out'},2.4);
window.__SCENE_TIMELINE__=tl;window.__SCENE_DURATION__=4;
</script>
```

Notes:
- A perspective container on `.frame` gives the rotation depth.
- Four panels arrive in 0.48s total, then the progress line becomes the
  breathing motion.
- The accent border at 2.4s is the resolve, not a new entrance.
