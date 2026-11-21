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

export const FX_TIMES = [0.5, 2, 3.5];

export const FX_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#0B0E14}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0B0E14}
.target{position:absolute;left:100px;top:100px;width:300px;height:200px;background:#F3EFE9}
</style></head><body><div class="frame"><div class="target" id="target"></div></div>
{{FX}}
<script>
OMFX.outline('#target','#F5A524',6);
OMFX.scanlines(document.querySelector('.frame'),{size:4,opacity:0.25});
const tl=gsap.timeline({paused:true});
tl.fromTo('#target',{x:0},{x:60,duration:3,ease:'none'},0);
window.__SCENE_TIMELINE__=tl;
window.__SCENE_DURATION__=4;
</script></body></html>`;

export const ROUGH_TIMES = [0.5, 2, 3.5];

export const ROUGH_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#F7F3E8}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#F7F3E8}
</style></head><body><div class="frame om-paper-bg"><div id="sketch"></div></div>
{{ROUGH}}
<script>
document.getElementById('sketch').innerHTML=
  OMRough.rect(100,100,300,200,{stroke:'#111111'})+
  OMRough.line(100,360,500,360,{stroke:'#F5A524',strokeWidth:5});
const tl=gsap.timeline({paused:true});
tl.fromTo('#sketch',{x:0},{x:40,duration:3,ease:'none'},0);
window.__SCENE_TIMELINE__=tl;
window.__SCENE_DURATION__=4;
</script></body></html>`;
