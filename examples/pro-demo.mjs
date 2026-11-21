// Six-scene, art-directed demo authored entirely through truemotion's MCP tools.
// Run: node examples/pro-demo.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'examples/pro-out');
fs.mkdirSync(outDir, { recursive: true });
const stateFile = path.join(outDir, 'state.json');
const bin = path.join(root, 'bin/truemotion.mjs');
if (fs.existsSync(stateFile)) fs.rmSync(stateFile);
console.log(spawnSync('node', [bin, 'init', stateFile, '--aspect', '16:9'], { encoding: 'utf8' }).stdout.trim());

const scene = (css, markup, script, duration = 4) => `<!doctype html><html><head><meta charset="utf-8"><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#0B0E14}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0B0E14;color:#F3EFE9;-webkit-font-smoothing:antialiased}
.grid{position:absolute;inset:-90px;background-image:linear-gradient(rgba(243,239,231,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(243,239,231,.045) 1px,transparent 1px);background-size:80px 80px;opacity:.6}
.glow{position:absolute;right:-340px;top:-380px;width:1250px;height:1250px;background:radial-gradient(circle,rgba(245,165,36,.15) 0%,rgba(245,165,36,0) 60%)}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 48%,transparent 42%,rgba(0,0,0,.34) 100%)}
.mono{font-family:'Mono';font-weight:500;font-size:20px;letter-spacing:.18em;color:#F5A524}
.body{font-family:'Body';font-weight:300;font-size:34px;color:rgba(243,239,231,.72)}
.display{font-family:'Display';font-weight:900;color:#F3EFE9;letter-spacing:-.045em}
.amber{color:#F5A524}
.rule{height:3px;background:#F5A524}
${css}</style></head><body><div class="frame" id="frame"><div class="grid"></div><div class="glow"></div>
${markup}
<div class="vig"></div></div>
{{GSAP}}
<script>
const tl=gsap.timeline({paused:true});
${script}
window.__SCENE_TIMELINE__=tl;
window.__SCENE_DURATION__=${duration};
</script></body></html>`;

const t1 = scene(`
.hair{position:absolute;left:120px;top:104px;width:64px;height:3px}
.eyebrow{position:absolute;left:204px;top:97px}
.counter{position:absolute;right:120px;top:97px;color:rgba(243,239,231,.42)}
.word{position:absolute;left:108px;top:352px;display:flex;overflow:hidden;padding-bottom:24px;perspective:1300px;transform-style:preserve-3d}
.letter{display:inline-block;font-size:164px;line-height:1;transform-origin:50% 100%}
.underline{position:absolute;left:120px;top:572px;width:360px}
.sub{position:absolute;left:120px;top:630px}
.meta{position:absolute;left:120px;bottom:88px;color:rgba(243,239,231,.38)}
`, `
<div class="hair rule"></div><div class="eyebrow mono">AN OPEN MOTION STUDIO</div>
<div class="counter mono">001 / 006</div>
<div class="word display">${[...'TrueMotion'].map((c, i) => `<span class="letter" data-om-id="letter-${i}">${c}</span>`).join('')}</div>
<div class="underline rule"></div><div class="sub body">Motion, authored anywhere.</div>
<div class="meta mono">STUDIO AGNOSTIC &nbsp;/&nbsp; FRAME PERFECT &nbsp;/&nbsp; MIT</div>`, `
tl.fromTo('.hair',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:.45,ease:'expo.out'},.12);
tl.fromTo('.eyebrow',{x:-18,opacity:0},{x:0,opacity:1,duration:.5,ease:'power3.out'},.2);
tl.fromTo('.counter',{opacity:0},{opacity:1,duration:.5,ease:'power2.out'},.3);
tl.fromTo('.letter',{yPercent:120,opacity:0,rotationX:-68},{yPercent:0,opacity:1,rotationX:0,duration:.9,stagger:.045,ease:'power4.out'},.3);
tl.fromTo('.underline',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:.7,ease:'expo.out'},1.05);
tl.fromTo('.sub',{y:26,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out'},1.25);
tl.fromTo('.meta',{opacity:0},{opacity:1,duration:.5,ease:'power2.out'},1.65);
tl.to('.grid',{backgroundPosition:'72px -38px',duration:2.4,ease:'sine.inOut'},1.3);
tl.to('.word',{x:18,duration:1.6,ease:'sine.inOut'},2.1);`);

const t2 = scene(`
.ghost{position:absolute;left:104px;top:120px;font-family:'Display';font-weight:900;font-size:320px;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1px rgba(243,239,231,.09)}
.lines{position:absolute;left:120px;top:336px}
.line{display:block;height:136px;overflow:hidden}
.line span{display:block;font-family:'Display';font-weight:900;font-size:108px;line-height:1.14;color:#F3EFE9;letter-spacing:-.05em}
.tag{position:absolute;right:120px;bottom:96px;text-align:right;line-height:1.9}
`, `
<div class="ghost" data-om-id="ghost">OPEN</div>
<div class="lines"><span class="line" data-om-id="l1"><span>The studio</span></span>
<span class="line" data-om-id="l2"><span>should live</span></span>
<span class="line" data-om-id="l3"><span class="amber">where you work.</span></span></div>
<div class="tag mono" data-om-id="tag">NO ACCOUNT &nbsp;/&nbsp; NO SDK &nbsp;/&nbsp; NO GATE<br>YOUR HARNESS, YOUR SCENES</div>`, `
tl.fromTo('.ghost',{x:-46,opacity:0},{x:0,opacity:1,duration:1.3,ease:'power2.out'},0);
tl.fromTo('.line span',{yPercent:112,clipPath:'inset(0 0 100% 0)'},{yPercent:0,clipPath:'inset(0 0 0% 0)',duration:.95,stagger:.17,ease:'power4.out'},.28);
tl.fromTo('.tag',{opacity:0,y:18},{opacity:1,y:0,duration:.65,ease:'power3.out'},1.45);
tl.to('.ghost',{x:38,y:-22,duration:2.6,ease:'sine.inOut'},1.1);
tl.to('.grid',{backgroundPosition:'-54px 30px',duration:2.5,ease:'sine.inOut'},1.2);
tl.to('.lines',{x:16,duration:1.7,ease:'sine.inOut'},2.0);`);

const t3 = scene(`
.h{position:absolute;left:120px;top:118px;font-size:70px}
.bar{position:absolute;left:120px;top:308px;width:1240px;height:118px;border:2px solid rgba(245,165,36,.42);border-radius:18px;background:rgba(245,165,36,.045);display:flex;align-items:center;padding:0 38px;gap:16px}
#typed{font-family:'Body';font-weight:300;font-size:36px;color:#F3EFE9;white-space:nowrap}
.cursor{width:4px;height:44px;background:#F5A524}
.arrow{position:absolute;left:120px;top:506px;width:1240px;height:2px;background:rgba(243,239,231,.13)}
.arrow i{display:block;height:100%;width:100%;background:#F5A524;transform-origin:left center}
.nodes{position:absolute;left:120px;top:528px;width:1240px;display:flex;justify-content:space-between}
.node{width:250px;text-align:center}
.dot{width:14px;height:14px;border-radius:50%;border:2px solid #F5A524;margin:0 auto 18px;background:#0B0E14}
.lbl{font-family:'Mono';font-weight:500;font-size:20px;letter-spacing:.14em;color:rgba(243,239,231,.78)}
.note{position:absolute;right:120px;bottom:88px}
`, `
<div class="h display">One prompt. A finished film.</div>
<div class="bar om-typing-host" id="bar"><span id="typed" data-om-typed></span><span class="cursor" id="cursor"></span></div>
<div class="arrow"><i></i></div>
<div class="nodes">
<div class="node" data-om-id="n1"><div class="dot"></div><div class="lbl">PROMPT</div></div>
<div class="node" data-om-id="n2"><div class="dot"></div><div class="lbl">SCENES</div></div>
<div class="node" data-om-id="n3"><div class="dot"></div><div class="lbl">FRAMES</div></div>
<div class="node" data-om-id="n4"><div class="dot"></div><div class="lbl">MP4</div></div>
</div>
<div class="note mono" data-om-id="note">LOCAL &nbsp;/&nbsp; DETERMINISTIC &nbsp;/&nbsp; YOURS</div>`, `
tl.fromTo('.h',{y:32,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},.1);
tl.fromTo('.bar',{y:30,opacity:0,scaleX:.97},{y:0,opacity:1,scaleX:1,duration:.75,ease:'power4.out'},.35);
OMTyping.attach({timeline:tl,target:'#typed',cursor:'#cursor',text:'An open motion studio, in any harness',start:.8,duration:1.7});
tl.fromTo('.node',{y:24,opacity:0},{y:0,opacity:1,duration:.6,stagger:.13,ease:'power3.out'},1.15);
tl.fromTo('.arrow i',{scaleX:0},{scaleX:1,duration:1.6,ease:'power2.inOut'},1.2);
tl.to('.dot',{backgroundColor:'#F5A524',scale:1.2,duration:.3,stagger:.36,ease:'back.out(1.6)'},1.35);
tl.fromTo('.note',{opacity:0},{opacity:1,duration:.55,ease:'power2.out'},2.4);
tl.to('.grid',{backgroundPosition:'48px -26px',duration:2.4,ease:'sine.inOut'},1.2);
tl.to('.bar',{y:-8,duration:1.9,ease:'sine.inOut'},2.4);
tl.to('.nodes',{y:8,duration:1.9,ease:'sine.inOut'},2.4);`, 5);

const t4 = scene(`
.h{position:absolute;left:120px;top:112px;font-size:70px}
.strip{position:absolute;left:120px;top:352px;display:flex;gap:18px;perspective:1300px}
.card{width:270px;height:152px;border:2px solid rgba(243,239,231,.13);position:relative;overflow:hidden;background:#111722}
.card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 28%,rgba(245,165,36,.24),transparent 62%)}
.card i{position:absolute;left:22px;bottom:20px;width:132px;height:6px;background:rgba(243,239,231,.38)}
.cnum{position:absolute;left:18px;top:14px;font-family:'Mono';font-weight:500;font-size:18px;letter-spacing:.1em;color:rgba(243,239,231,.46)}
.playhead{position:absolute;left:120px;top:330px;width:5px;height:196px;background:#F5A524;opacity:.9}
.countwrap{position:absolute;right:120px;top:600px;text-align:right}
#count{font-family:'Mono';font-weight:500;font-size:86px;color:#F5A524;font-variant-numeric:tabular-nums}
.countlbl{font-family:'Mono';font-weight:500;font-size:19px;letter-spacing:.18em;color:rgba(243,239,231,.55);margin-top:6px}
.foot{position:absolute;left:120px;bottom:92px}
`, `
<div class="h display">Every frame. On purpose.</div>
<div class="strip">${Array.from({ length: 6 }, (_, i) => `<div class="card" data-om-id="frame-${i}"><span class="cnum">F0${i + 1}</span><i></i></div>`).join('')}</div>
<div class="playhead" data-om-id="playhead"></div>
<div class="countwrap"><div id="count">000</div><div class="countlbl">FRAMES / ZERO DRIFT</div></div>
<div class="foot mono">SEEK FRAME 187 &nbsp;=&nbsp; SAME PIXELS EVERY RENDER</div>`, `
tl.fromTo('.h',{y:28,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out'},.1);
tl.fromTo('.card',{y:44,opacity:0,rotationY:34},{y:0,opacity:1,rotationY:0,duration:.75,stagger:.075,ease:'power4.out'},.35);
const n={v:0};
tl.to(n,{v:288,duration:2.7,ease:'power2.inOut',onUpdate:()=>{document.getElementById('count').textContent=String(Math.round(n.v)).padStart(3,'0');}},.85);
tl.fromTo('.playhead',{x:0,opacity:0},{x:0,opacity:1,duration:.2,ease:'none'},.8);
tl.to('.playhead',{x:1600,duration:2.7,ease:'none'},.9);
tl.to('.card:nth-child(4)',{borderColor:'#F5A524',duration:.35,ease:'power2.out'},2.5);
tl.fromTo('.foot',{opacity:0},{opacity:1,duration:.5,ease:'power2.out'},2.3);`);

const t5 = scene(`
.h{position:absolute;left:120px;top:110px;font-size:70px}
.panel{position:absolute;top:300px;width:770px;height:430px;border:2px solid rgba(243,239,231,.14);background:#0E131C;overflow:hidden}
.left{left:120px}.right{right:120px}
.ptitle{position:absolute;left:44px;top:48px;font-family:'Mono';font-weight:500;font-size:20px;letter-spacing:.18em;color:#F5A524}
.pbar{position:absolute;left:44px;top:120px;width:300px;height:4px;background:#F5A524}
.pcopy{position:absolute;left:44px;top:170px;font-family:'Display';font-weight:900;font-size:84px;color:#F3EFE9;letter-spacing:-.04em}
.pghost{position:absolute;right:36px;bottom:26px;font-family:'Mono';font-weight:500;font-size:19px;color:rgba(243,239,231,.35)}
.seam{position:absolute;left:50%;top:282px;width:3px;height:466px;background:#F5A524;transform:translateX(-50%)}
.stat{position:absolute;left:120px;bottom:96px}
`, `
<div class="h display">Continuity, measured.</div>
<div class="panel left" data-om-id="p1"><div class="ptitle">SCENE 02 / EXIT</div><div class="pbar"></div><div class="pcopy">TrueMotion</div><div class="pghost">FRAME 095</div></div>
<div class="panel right" data-om-id="p2"><div class="ptitle">SCENE 03 / ENTRY</div><div class="pbar"></div><div class="pcopy">TrueMotion</div><div class="pghost">FRAME 000</div></div>
<div class="seam" data-om-id="seam"></div>
<div class="stat mono">MATCHED CUT &nbsp;/&nbsp; 0.0% PIXEL DRIFT &nbsp;/&nbsp; LOCKED ACTOR STATES</div>`, `
tl.fromTo('.h',{y:28,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},.1);
tl.fromTo('.left',{x:-70,opacity:0},{x:0,opacity:1,duration:.9,ease:'power4.out'},.35);
tl.fromTo('.right',{x:70,opacity:0},{x:0,opacity:1,duration:.9,ease:'expo.out'},.45);
tl.fromTo('.seam',{scaleY:0,transformOrigin:'center center'},{scaleY:1,duration:.55,ease:'power3.out'},.8);
tl.fromTo('.pbar',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:.6,ease:'power2.inOut',stagger:.25},1.0);
tl.fromTo('.stat',{opacity:0,y:14},{opacity:1,y:0,duration:.6,ease:'power3.out'},1.7);
tl.to('.grid',{backgroundPosition:'-40px 34px',duration:2.4,ease:'sine.inOut'},1.2);
tl.to('.left',{x:-12,duration:1.7,ease:'sine.inOut'},2.0);
tl.to('.right',{x:12,duration:1.7,ease:'sine.inOut'},2.0);`);

const t6 = scene(`
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;perspective:1400px}
.kicker{font-family:'Mono';font-weight:500;font-size:21px;letter-spacing:.28em;color:#F5A524;margin-bottom:32px}
#mark{font-family:'Display';font-weight:900;font-size:160px;color:#F3EFE9;letter-spacing:-.055em}
.under{width:360px;height:3px;background:#F5A524;margin:40px 0 30px}
.tagline{font-family:'Body';font-weight:300;font-size:40px;color:rgba(243,239,231,.76)}
.cols{position:absolute;left:120px;right:120px;bottom:86px;display:flex;justify-content:space-between;font-family:'Mono';font-weight:500;font-size:18px;letter-spacing:.17em;color:rgba(243,239,231,.4)}
`, `
<div class="center" data-om-id="lockup"><div class="kicker" data-om-id="kicker">OPEN / STUDIO-AGNOSTIC</div>
<h1 id="mark" data-om-id="mark">TrueMotion</h1><div class="under" data-om-id="under"></div>
<div class="tagline" data-om-id="tagline">Author once. Render anywhere.</div></div>
<div class="cols"><span>MIT LICENSE</span><span>STDIO MCP</span><span>ANY HARNESS</span><span>NO ACCOUNT</span></div>`, `
tl.fromTo('.kicker',{y:18,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},.15);
tl.fromTo('#mark',{scale:1.13,opacity:0},{scale:1,opacity:1,duration:1,ease:'expo.out'},.28);
tl.fromTo('.under',{scaleX:0,transformOrigin:'center center'},{scaleX:1,duration:.6,ease:'power4.out'},.9);
tl.fromTo('.tagline',{y:24,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},1.15);
tl.fromTo('.cols',{opacity:0},{opacity:1,duration:.6,ease:'power2.out'},1.5);
tl.fromTo('.center',{rotationY:5},{rotationY:0,duration:2.4,ease:'sine.inOut'},1.2);
tl.to('.grid',{backgroundPosition:'-58px -32px',duration:2.5,ease:'sine.inOut'},1.2);`);

const scenes = [
  ['Cold open', t1], ['The manifesto', t2], ['Prompt to film', t3],
  ['Frame perfect', t4], ['Continuity', t5], ['Outro', t6]
];

const transport = new StdioClientTransport({ command: 'node', args: [bin, 'serve', '--state', stateFile] });
const client = new Client({ name: 'pro-demo', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
for (const [name, html] of scenes) {
  const r = await client.callTool({
    name: 'add_scene',
    arguments: { name, durationSec: html.match(/__SCENE_DURATION__=([\d.]+)/)[1] === '5' ? 5 : 4, html, freshStart: true }
  });
  const summary = (r.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  console.log(`add_scene ${name}: ${r.isError ? 'ERROR' : 'ok'} | ${summary.slice(0, 240).replace(/\n/g, ' ')}`);
}
const review = await client.callTool({ name: 'review_timeline', arguments: {} });
console.log('\n=== REVIEW ===');
for (const block of review.content || []) {
  if (block.type === 'text') console.log(block.text);
}
await client.close();

const wav = path.join(outDir, 'ambient.wav');
const audio = path.join(outDir, 'ambient-score.m4a');
const score = spawnSync('python3', [path.join(root, 'examples/ambient.py'), wav], { encoding: 'utf8' });
console.log('audio score:', score.stdout.trim() || score.stderr.slice(-200));
const encode = spawnSync('ffmpeg', ['-y', '-i', wav, '-c:a', 'aac', '-b:a', '192k', audio, '-loglevel', 'error'], { encoding: 'utf8' });
console.log('audio encode:', encode.status === 0 ? 'ok' : encode.stderr.slice(-200));

const rendered = spawnSync('node', [bin, 'render', '--state', stateFile, '--out', path.join(outDir, 'pro-demo.mp4'), '--fps', '24', '--crf', '17', '--audio', audio], { encoding: 'utf8' });
console.log(rendered.stdout.trim(), rendered.stderr.trim());
console.log('VIDEO', path.join(outDir, 'pro-demo.mp4'));
