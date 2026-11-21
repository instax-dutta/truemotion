<!-- SPDX-License-Identifier: MIT -->
# Example: data scene

A counter with a progress bar and a label. Use when one figure is the point.

```html
<div class="frame">
  <div class="label" data-om-id="label">FRAMES RENDERED</div>
  <div id="count" class="figure" data-om-id="figure">000</div>
  <div class="track"><i></i></div>
  <div class="foot" data-om-id="foot">Same input, same pixels.</div>
</div>
{{GSAP}}
<script>
const tl=gsap.timeline({paused:true});
tl.fromTo('.label',{opacity:0,y:14},{opacity:1,y:0,duration:.5,ease:'power3.out'},.15);
const value={n:0};
tl.to(value,{n:288,duration:2.6,ease:'power2.inOut',onUpdate(){
  document.getElementById('count').textContent=String(Math.round(value.n)).padStart(3,'0');
}},.5);
tl.fromTo('.track i',{scaleX:0,transformOrigin:'left center'},
  {scaleX:1,duration:2.6,ease:'power2.inOut'},.5);
tl.fromTo('.foot',{opacity:0},{opacity:1,duration:.5,ease:'power2.out'},2.6);
window.__SCENE_TIMELINE__=tl;window.__SCENE_DURATION__=4;
</script>
```

Give `.figure` a mono family and `font-variant-numeric: tabular-nums` so the
digits do not shift width during the count. The auditor will fire `onUpdate`
callbacks on every seek, so the number is correct in the export.
