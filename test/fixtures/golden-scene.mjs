export const GOLDEN_TIMES = [0.5, 2, 3.5];

// Deliberately font-free and gradient-free: solid integer-positioned rectangles
// keep golden frames stable across operating systems and font stacks.
export const GOLDEN_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#000}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0B0E14}
.a{position:absolute;left:100px;top:100px;width:200px;height:200px;background:#F5A524}
.b{position:absolute;left:400px;top:100px;width:200px;height:200px;background:#F3EFE9}
.c{position:absolute;left:100px;top:400px;width:600px;height:40px;background:#4D90FF}
</style></head><body><div class="frame"><div class="a"></div><div class="b"></div><div class="c"></div></div>
{{GSAP}}
<script>
const tl=gsap.timeline({paused:true});
tl.fromTo('.a',{x:0},{x:200,duration:2,ease:'none'},0);
tl.fromTo('.c',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:2,ease:'none'},0.5);
window.__SCENE_TIMELINE__=tl;
window.__SCENE_DURATION__=4;
</script></body></html>`;
