// Authors a three-scene intro through truemotion's MCP tools, then renders it.
// Run from anywhere: node examples/intro-demo.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'examples/out');
fs.mkdirSync(outDir, { recursive: true });
const state = path.join(outDir, 'state.json');
const bin = path.join(root, 'bin/truemotion.mjs');
if (fs.existsSync(state)) fs.rmSync(state);

console.log(spawnSync('node', [bin, 'init', state, '--aspect', '16:9'], { encoding: 'utf8' }).stdout.trim());

const scene = (css, markup, script) => `<!doctype html><html><head><meta charset="utf-8"><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#0E1116}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0E1116;-webkit-font-smoothing:antialiased}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(242,239,233,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(242,239,233,.035) 1px,transparent 1px);background-size:80px 80px;opacity:.6}
.glow{position:absolute;right:-260px;top:-300px;width:1100px;height:1100px;background:radial-gradient(circle,rgba(245,165,36,.13) 0%,rgba(245,165,36,0) 62%)}
.mono{font-family:'Mono';font-weight:500;font-size:22px;letter-spacing:.16em;color:#F5A524}
.body{font-family:'Body';font-weight:300;color:rgba(242,239,233,.72)}
.display{font-family:'Display';font-weight:900;color:#F2EFE9;letter-spacing:-.04em}
${css}</style></head><body><div class="frame" id="frame"><div class="grid"></div><div class="glow"></div>
${markup}</div>
<!-- {{GSAP}} -->
<script>
const tl=gsap.timeline({paused:true});
${script}
window.__SCENE_TIMELINE__=tl;
window.__SCENE_DURATION__=4;
</script></body></html>`;

const title = scene(`
.eyebrow{position:absolute;left:120px;top:112px}
.rule{position:absolute;left:120px;top:166px;width:180px;height:3px;background:#F5A524}
#headline{position:absolute;left:114px;top:392px;font-size:150px}
.sub{position:absolute;left:120px;top:606px;font-size:36px}
.subline{position:absolute;left:120px;top:674px;width:260px;height:2px;background:rgba(245,165,36,.75);transform-origin:left center}
.meta{position:absolute;right:120px;bottom:96px;font-size:20px;color:rgba(242,239,233,.38)}
`, `
<div class="eyebrow mono" data-om-id="eyebrow">TRUE / MOTION</div>
<div class="rule"></div>
<h1 class="display" id="headline" data-om-id="headline">TrueMotion</h1>
<p class="sub body" data-om-id="sub">Motion, authored anywhere.</p>
<div class="subline"></div>
<div class="meta mono">A / 001</div>`, `
tl.fromTo('.rule',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:.5,ease:'expo.out'},.12);
tl.fromTo('.eyebrow',{x:-18,opacity:0},{x:0,opacity:1,duration:.5,ease:'power3.out'},.22);
tl.fromTo('#headline',{y:74,opacity:0,clipPath:'inset(0 0 100% 0)'},{y:0,opacity:1,clipPath:'inset(0 0 0% 0)',duration:.9,ease:'power4.out'},.34);
tl.fromTo('.sub',{y:26,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},.86);
tl.fromTo('.meta',{opacity:0},{opacity:1,duration:.4,ease:'power2.out'},1.3);
tl.fromTo('.subline',{scaleX:0},{scaleX:1,duration:1,ease:'power2.inOut'},2.2);
tl.to('.grid',{backgroundPosition:'60px -30px',duration:2,ease:'sine.inOut'},1.9);
tl.to('.glow',{x:44,y:-24,duration:4,repeat:-1,yoyo:true,ease:'sine.inOut'},0);`);

const features = scene(`
#headline{position:absolute;left:114px;top:392px;font-size:150px}
.rule{position:absolute;left:120px;top:166px;width:180px;height:3px;background:#F5A524}
.eyebrow{position:absolute;left:120px;top:112px}
.sub{position:absolute;left:120px;top:606px;font-size:36px}
.rows{position:absolute;left:120px;top:400px;width:1500px}
.row{position:relative;display:flex;align-items:baseline;gap:36px;height:118px}
.tick{position:absolute;left:-38px;top:30px;width:18px;height:3px;background:#F5A524}
.idx{font-family:'Mono';font-weight:500;font-size:22px;letter-spacing:.1em;color:#F5A524;width:60px}
.label{font-family:'Display';font-weight:900;font-size:62px;color:#F2EFE9;letter-spacing:-.03em;min-width:520px}
.desc{font-family:'Body';font-weight:300;font-size:32px;color:rgba(242,239,233,.62)}
.progress{position:absolute;left:120px;bottom:96px;height:3px;width:760px;background:rgba(245,165,36,.22)}
.progress i{display:block;height:100%;width:100%;background:#F5A524;transform-origin:left center}
`, `
<div class="eyebrow mono" data-om-id="eyebrow">TRUE / MOTION</div>
<div class="rule"></div>
<h1 class="display" id="headline" data-om-id="headline">TrueMotion</h1>
<p class="sub body" data-om-id="sub">Motion, authored anywhere.</p>
<div class="rows">
<div class="row" data-om-id="row-1"><span class="tick"></span><span class="idx">01</span><span class="label">Any harness</span><span class="desc">stdio MCP. No SDK lock-in.</span></div>
<div class="row" data-om-id="row-2"><span class="tick"></span><span class="idx">02</span><span class="label">Frame-perfect</span><span class="desc">Seek the timeline, not the clock.</span></div>
<div class="row" data-om-id="row-3"><span class="tick"></span><span class="idx">03</span><span class="label">Open core</span><span class="desc">MIT code. No account, no gate.</span></div>
</div>
<div class="progress"><i></i></div>`, `
tl.fromTo('#headline',{top:392,fontSize:150},{top:104,fontSize:66,duration:.85,ease:'power3.inOut'},0);
tl.fromTo('.rule',{opacity:1,scaleX:1},{opacity:0,duration:.35,ease:'power2.in'},0);
tl.fromTo('.eyebrow',{opacity:1,y:0},{opacity:0,y:-12,duration:.4,ease:'power2.in'},0);
tl.fromTo('.sub',{opacity:1},{opacity:0,duration:.3,ease:'power2.in'},0);
tl.fromTo('.row:nth-child(1)',{x:48,opacity:0},{x:0,opacity:1,duration:.7,ease:'power3.out'},.95);
tl.fromTo('.row:nth-child(2)',{x:48,opacity:0},{x:0,opacity:1,duration:.7,ease:'expo.out'},1.4);
tl.fromTo('.row:nth-child(3)',{x:48,opacity:0},{x:0,opacity:1,duration:.7,ease:'power4.out'},1.85);
gsap.set('.tick',{scaleX:0,transformOrigin:'left center'});
tl.to('.tick',{scaleX:1,duration:.35,ease:'power4.out',stagger:.45},1.0);
tl.fromTo('.progress i',{scaleX:0},{scaleX:1,duration:2.4,ease:'power2.inOut'},1.5);
tl.to('.glow',{x:-32,y:18,duration:4,repeat:-1,yoyo:true,ease:'sine.inOut'},0);`);

const outro = scene(`
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.kicker{font-family:'Mono';font-weight:500;font-size:22px;letter-spacing:.24em;color:#F5A524;margin-bottom:34px}
#mark{font-family:'Display';font-weight:900;font-size:156px;color:#F2EFE9;letter-spacing:-.05em}
.under{width:340px;height:3px;background:#F5A524;margin:38px 0 30px}
.tagline{font-family:'Body';font-weight:300;font-size:38px;color:rgba(242,239,233,.74)}
.footer{position:absolute;left:0;right:0;bottom:86px;text-align:center;font-family:'Mono';font-weight:500;font-size:19px;letter-spacing:.18em;color:rgba(242,239,233,.36)}
`, `
<div class="center"><div class="kicker" data-om-id="kicker">OPEN / STUDIO-AGNOSTIC</div>
<h1 id="mark" data-om-id="mark">TrueMotion</h1><div class="under"></div>
<div class="tagline" data-om-id="tagline">Author once. Render anywhere.</div></div>
<div class="footer">MIT LICENSE &nbsp;/&nbsp; GSAP + PLAYWRIGHT + FFMPEG</div>`, `
tl.fromTo('.kicker',{y:16,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},.18);
tl.fromTo('#mark',{scale:1.14,opacity:0},{scale:1,opacity:1,duration:.95,ease:'expo.out'},.3);
tl.fromTo('.under',{scaleX:0},{scaleX:1,duration:.6,ease:'power4.out'},.9);
tl.fromTo('.tagline',{y:22,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},1.15);
tl.fromTo('.footer',{opacity:0},{opacity:1,duration:.5,ease:'power2.out'},1.6);
tl.fromTo('.under',{scaleX:1,transformOrigin:'center center'},{scaleX:1.28,duration:1,ease:'power2.inOut'},2.1);
tl.to('.grid',{backgroundPosition:'-48px 28px',duration:2,ease:'sine.inOut'},1.9);
tl.to('.glow',{x:52,y:-18,duration:4,repeat:-1,yoyo:true,ease:'sine.inOut'},0);`);

const transport = new StdioClientTransport({ command: 'node', args: [bin, 'serve', '--state', state] });
const client = new Client({ name: 'intro-demo', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  console.log(name, r.isError ? 'ERROR' : 'ok', (r.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').slice(0, 200).replace(/\n/g, ' '));
};
await call('add_scene', { name: 'Title reveal', durationSec: 4, html: title });
const firstId = JSON.parse(fs.readFileSync(state, 'utf8')).scenes[0].id;
await call('add_scene', { name: 'Capability assembly', durationSec: 4, html: features, evolveFromSceneId: firstId });
await call('add_scene', { name: 'Outro lockup', durationSec: 4, html: outro, freshStart: true });
await client.close();

const rendered = spawnSync('node', [bin, 'render', '--state', state, '--out', path.join(outDir, 'truemotion-demo.mp4'), '--fps', '24'], { encoding: 'utf8' });
console.log(rendered.stdout.trim(), rendered.stderr.trim());
console.log('Video:', path.join(outDir, 'truemotion-demo.mp4'));
