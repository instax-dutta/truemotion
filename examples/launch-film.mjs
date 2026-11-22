// Agent-focused launch film, authored entirely through TrueMotion's MCP tools.
// Story: Future Pacing + Demo Loop. Arc: describe -> author -> measure -> correct
// -> render -> open-source CTA. Built from the product-launch-video guidance:
// smooth power3 settles, VO-paced reveals across the back half, held reads,
// one signature move per scene, no lazy breathing or back-half drift.
// Run: node examples/launch-film.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'examples/launch-out');
fs.mkdirSync(outDir, { recursive: true });
const stateFile = path.join(outDir, 'state.json');
const bin = path.join(root, 'bin/truemotion.mjs');
if (fs.existsSync(stateFile)) fs.rmSync(stateFile);
console.log(spawnSync('node', [bin, 'init', stateFile, '--aspect', '16:9'], { encoding: 'utf8' }).stdout.trim());

// Shared design system: dark editorial field, amber accent, one grid + glow.
const scene = (css, markup, script, duration = 4) => `<!doctype html><html><head><meta charset="utf-8"><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#0B0E14}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0B0E14;color:#F3EFE9;-webkit-font-smoothing:antialiased}
.grid{position:absolute;inset:-90px;background-image:linear-gradient(rgba(243,239,231,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(243,239,231,.04) 1px,transparent 1px);background-size:80px 80px;opacity:.55}
.glow{position:absolute;right:-360px;top:-400px;width:1300px;height:1300px;background:radial-gradient(circle,rgba(245,165,36,.14) 0%,rgba(245,165,36,0) 62%)}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,transparent 44%,rgba(0,0,0,.36) 100%)}
.mono{font-family:'Mono';font-weight:500;font-size:20px;letter-spacing:.17em;color:#F5A524}
.muted{font-family:'Mono';font-weight:500;font-size:18px;letter-spacing:.16em;color:rgba(243,239,231,.5)}
.body{font-family:'Body';font-weight:300;font-size:34px;color:rgba(243,239,231,.74)}
.display{font-family:'Display';font-weight:900;color:#F3EFE9;letter-spacing:-.05em}
.amber{color:#F5A524}
.rule{height:3px;background:#F5A524}
.eyebrow{position:absolute;left:120px;top:100px}
.corner{position:absolute;right:120px;top:100px;text-align:right}
.foot{position:absolute;left:120px;bottom:74px}
.h1{position:absolute;left:120px;top:150px;font-size:74px;line-height:1.06}
.ghost{position:absolute;right:24px;bottom:12px;font-family:'Display';font-weight:900;font-size:310px;letter-spacing:-.08em;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(243,239,231,.055);pointer-events:none;white-space:nowrap}
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

// 1. HOOK (ticker-takeover): the old workflow cycles, then the promise crashes in.
const s1 = scene(`
.slot{position:absolute;left:108px;top:320px;width:1700px;height:210px;overflow:hidden}
.w{position:absolute;left:0;top:0;font-family:'Display';font-weight:900;font-size:150px;line-height:1.1;white-space:nowrap;letter-spacing:-.05em}
.wsmall{font-size:118px;color:rgba(243,239,231,.55)}
.final{position:absolute;left:108px;top:318px;font-size:150px;line-height:1.1}
.bar2{position:absolute;left:120px;top:556px;width:520px}
.sub{position:absolute;left:120px;top:606px;font-size:40px}
`, `
<div class="eyebrow mono">MOTION, THE OLD WAY</div>
<div class="corner muted">001 / 008</div>
<div class="slot">
  <div class="w wsmall" data-om-id="w1">Storyboard.</div>
  <div class="w wsmall" data-om-id="w2">Keyframe.</div>
  <div class="w wsmall" data-om-id="w3">Render. Repeat.</div>
</div>
<div class="final display amber" data-om-id="final">Describe it.</div>
<div class="bar2 rule" data-om-id="bar2"></div>
<div class="sub body" data-om-id="sub">An agent makes the film. You keep the words.</div>
<div class="foot muted">AN OPEN MOTION STUDIO FOR AGENTS</div>`, `
tl.fromTo('.eyebrow',{x:-16,opacity:0},{x:0,opacity:1,duration:.5,ease:'power3.out'},.1);
tl.fromTo('.corner',{opacity:0},{opacity:1,duration:.5},.2);
tl.fromTo('[data-om-id="w1"]',{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.5,ease:'power3.out'},.45);
tl.to('[data-om-id="w1"]',{yPercent:-110,opacity:0,duration:.4,ease:'power3.in'},1.15);
tl.fromTo('[data-om-id="w2"]',{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.5,ease:'power3.out'},1.3);
tl.to('[data-om-id="w2"]',{yPercent:-110,opacity:0,duration:.4,ease:'power3.in'},2.0);
tl.fromTo('[data-om-id="w3"]',{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.5,ease:'power3.out'},2.15);
tl.to('[data-om-id="w3"]',{yPercent:-110,opacity:0,duration:.4,ease:'power3.in'},2.85);
tl.fromTo('[data-om-id="final"]',{y:46,opacity:0},{y:0,opacity:1,duration:.8,ease:'expo.out'},3.0);
tl.fromTo('[data-om-id="bar2"]',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:.6,ease:'expo.out'},3.35);
tl.fromTo('[data-om-id="sub"]',{y:20,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},3.5);
tl.fromTo('.foot',{opacity:0},{opacity:1,duration:.5},3.7);`, 4.5);

// 2. PROMISE (logo-assemble-lockup): the product names itself.
const s2 = scene(`
.word{position:absolute;left:100px;top:330px;display:flex;overflow:hidden;padding-bottom:22px;perspective:1300px;transform-style:preserve-3d}
.letter{display:inline-block;font-size:156px;line-height:1;transform-origin:50% 100%}
.underline{position:absolute;left:120px;top:548px;width:600px}
.sub{position:absolute;left:120px;top:596px;font-size:42px}
.term{position:absolute;left:120px;top:706px;display:flex;align-items:center;gap:14px}
.prompt{font-family:'Mono';font-weight:500;font-size:19px;letter-spacing:.1em;color:rgba(243,239,231,.65)}
.cursor{width:4px;height:26px;background:#F5A524}
.caret{position:absolute;right:120px;top:108px;font-family:'Mono';font-size:18px;color:rgba(243,239,231,.4)}
`, `
<div class="eyebrow mono">MEET TRUE MOTION</div>
<div class="caret">STDIO MCP</div>
<div class="word display">${[...'TrueMotion'].map((c, i) => `<span class="letter" data-om-id="L${i}">${c}</span>`).join('')}</div>
<div class="underline rule" data-om-id="underline"></div>
<div class="sub body" data-om-id="sub">Your agent authors. TrueMotion renders.</div>
<div class="term" data-om-id="term"><span class="prompt">&gt; add_scene()</span><span class="cursor"></span></div>
<div class="foot muted">11 TOOLS · ONE STATE FILE · ANY HARNESS</div>`, `
tl.fromTo('.eyebrow',{x:-16,opacity:0},{x:0,opacity:1,duration:.5,ease:'power3.out'},.1);
tl.fromTo('.caret',{opacity:0},{opacity:1,duration:.5},.2);
tl.fromTo('.letter',{yPercent:115,opacity:0,rotationX:-62},{yPercent:0,opacity:1,rotationX:0,duration:.95,stagger:.04,ease:'power4.out'},.35);
tl.fromTo('[data-om-id="underline"]',{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:.75,ease:'expo.out'},1.15);
tl.fromTo('[data-om-id="sub"]',{y:22,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},1.35);
tl.fromTo('[data-om-id="term"]',{opacity:0,y:14},{opacity:1,y:0,duration:.6,ease:'power3.out'},2.05);
tl.fromTo('.foot',{opacity:0},{opacity:1,duration:.5},2.4);`, 4);

// 3. AUTHORING (prompt-type-submit-generate): the ask and the tool receipts.
const s3 = scene(`
.bar{position:absolute;left:120px;top:300px;width:1500px;height:120px;border:2px solid rgba(245,165,36,.4);border-radius:18px;background:rgba(245,165,36,.045);display:flex;align-items:center;padding:0 36px;gap:14px}
#typed{font-family:'Body';font-weight:300;font-size:36px;color:#F3EFE9;white-space:nowrap}
.cursor{width:4px;height:44px;background:#F5A524}
.rows{position:absolute;left:120px;top:500px;display:flex;flex-direction:column;gap:22px}
.row{display:flex;align-items:center;gap:26px;font-family:'Mono';font-weight:500;font-size:24px;letter-spacing:.05em;color:rgba(243,239,231,.82)}
.chk{width:34px;height:34px;border:2px solid #F5A524;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#F5A524;font-size:20px}
.note{position:absolute;right:120px;bottom:82px}
`, `
<div class="ghost">MCP</div>
<div class="h1 display">One prompt.<span class="amber"> Tools do the rest.</span></div>
<div class="bar om-typing-host"><span id="typed" data-om-typed></span><span class="cursor" id="cursor"></span></div>
<div class="rows">
  <div class="row" data-om-id="r1"><span class="chk">&#10003;</span>read_skill("scene-contract.md")</div>
  <div class="row" data-om-id="r2"><span class="chk">&#10003;</span>add_scene("Cold open", 4.5s)</div>
  <div class="row" data-om-id="r3"><span class="chk">&#10003;</span>review_timeline()</div>
</div>
<div class="note muted">LOCAL &nbsp;/&nbsp; DETERMINISTIC &nbsp;/&nbsp; YOURS</div>`, `
tl.fromTo('.h1',{y:30,opacity:0},{y:0,opacity:1,duration:.75,ease:'power3.out'},.1);
tl.fromTo('.bar',{y:26,opacity:0,scaleX:.98},{y:0,opacity:1,scaleX:1,duration:.8,ease:'power4.out'},.5);
OMTyping.attach({timeline:tl,target:'#typed',cursor:'#cursor',text:'A dark editorial intro, amber accents',start:.95,duration:1.7});
tl.fromTo('[data-om-id="r1"]',{x:-26,opacity:0},{x:0,opacity:1,duration:.6,ease:'power3.out'},1.75);
tl.fromTo('[data-om-id="r2"]',{x:-26,opacity:0},{x:0,opacity:1,duration:.6,ease:'power3.out'},2.35);
tl.fromTo('[data-om-id="r3"]',{x:-26,opacity:0},{x:0,opacity:1,duration:.6,ease:'power3.out'},2.95);
tl.fromTo('.note',{opacity:0},{opacity:1,duration:.5},3.5);`, 5);

// 4. MEASURED FEEDBACK (agent-progress-theater): the signature differentiator.
const s4 = scene(`
.preview{position:absolute;left:120px;top:300px;width:980px;height:430px;border:2px solid rgba(245,165,36,.3);border-radius:16px;background:linear-gradient(135deg,#111722 0%,#0D1119 100%);overflow:hidden}
.p-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
.p-badge{position:absolute;left:24px;top:22px;background:rgba(11,14,20,.86);border:1px solid #F5A524;border-radius:6px;padding:9px 14px;font-family:'Mono';font-weight:500;font-size:19px;letter-spacing:.1em;color:#F5A524}
.p-strip{position:absolute;left:24px;bottom:20px;display:flex;gap:8px}
.p-cell{width:104px;height:60px;border:1px solid rgba(243,239,231,.2);border-radius:5px;object-fit:cover;opacity:.85}
.p-cell.active{border:2px solid #F5A524;opacity:1}
.mrow{position:absolute;left:1160px;width:640px;height:118px;border-bottom:2px solid rgba(243,239,231,.12);display:flex;align-items:center;gap:24px}
.mrow1{top:312px}.mrow2{top:440px}.mrow3{top:568px}
.mchk{width:46px;height:46px;border:2px solid #F5A524;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#F5A524;font-size:26px;flex:none}
.mlabel{font-family:'Mono';font-weight:500;font-size:21px;letter-spacing:.14em;color:rgba(243,239,231,.78);width:210px}
.mval{font-family:'Display';font-weight:900;font-size:62px;color:#F5A524;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.lead{position:absolute;left:120px;bottom:56px;font-size:32px}
`, `
<div class="eyebrow mono">EVERY WRITE RETURNS FRAMES + NUMBERS</div>
<div class="corner muted">004 / 008</div>
<div class="preview" data-om-id="preview">
  <img class="p-img" src="{{ASSET:frame-toolkit.png}}" alt="rendered frame">
  <div class="p-badge" data-om-id="pe">RETURNED FRAME 089 / 696</div>
  <div class="p-strip" data-om-id="pstrip">
    <img class="p-cell" src="{{ASSET:frame-cold.png}}" alt="frame">
    <img class="p-cell" src="{{ASSET:frame-prompt.png}}" alt="frame">
    <img class="p-cell active" src="{{ASSET:frame-toolkit.png}}" alt="frame">
  </div>
</div>
<div class="mrow mrow1" data-om-id="m1"><div class="mchk">&#10003;</div><div class="mlabel">MOTION</div><div class="mval">8.2%</div></div>
<div class="mrow mrow2" data-om-id="m2"><div class="mchk">&#10003;</div><div class="mlabel">CLIPPED</div><div class="mval">0</div></div>
<div class="mrow mrow3" data-om-id="m3"><div class="mchk">&#10003;</div><div class="mlabel">NETWORK</div><div class="mval">0</div></div>
<div class="lead body" data-om-id="lead">The agent sees its own work. Then fixes it.</div>`, `
tl.fromTo('.eyebrow',{x:-16,opacity:0},{x:0,opacity:1,duration:.5,ease:'power3.out'},.1);
tl.fromTo('.corner',{opacity:0},{opacity:1,duration:.5},.2);
tl.fromTo('[data-om-id="preview"]',{y:36,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out'},.55);
tl.fromTo('[data-om-id="pe"]',{opacity:0,y:-10},{opacity:1,y:0,duration:.5,ease:'power3.out'},.95);
tl.fromTo('.p-cell',{y:18,opacity:0},{y:0,opacity:1,duration:.5,stagger:.18,ease:'power3.out'},1.5);
tl.fromTo('[data-om-id="m1"]',{x:28,opacity:0},{x:0,opacity:1,duration:.6,ease:'power3.out'},2.1);
tl.fromTo('[data-om-id="m2"]',{x:28,opacity:0},{x:0,opacity:1,duration:.6,ease:'power3.out'},2.55);
tl.fromTo('[data-om-id="m3"]',{x:28,opacity:0},{x:0,opacity:1,duration:.6,ease:'power3.out'},3.0);
tl.fromTo('[data-om-id="lead"]',{y:20,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out'},3.45);`, 5);

// 5. ITERATION (panel-edit-live-sync): measure, correct, repeat.
const s5 = scene(`
.panel{position:absolute;top:270px;width:700px;height:450px;border:2px solid rgba(243,239,231,.13);border-radius:16px;background:#10151E;overflow:hidden}
.before{left:120px}.after{left:1100px}
.ptag{position:absolute;left:32px;top:26px;font-family:'Mono';font-size:19px;letter-spacing:.16em;color:rgba(243,239,231,.5)}
.ptitle{position:absolute;left:32px;top:76px;font-family:'Display';font-weight:900;font-size:52px;color:#F3EFE9;letter-spacing:-.04em}
.mini-card{position:absolute;left:32px;top:190px;width:620px;height:170px;border-radius:12px;background:#161D29;border:1px solid rgba(243,239,231,.08);padding:24px}
.mini-card .t{font-family:'Display';font-weight:900;font-size:32px;color:#F3EFE9}
.mini-card .s{font-family:'Body';font-weight:300;font-size:19px;color:rgba(243,239,231,.6);margin-top:10px;white-space:nowrap}
.clip{position:absolute;left:56px;top:214px;width:460px;height:122px;border:2px dashed #B6634E;border-radius:8px;pointer-events:none}
.warn{position:absolute;right:26px;bottom:24px;font-family:'Mono';font-size:19px;letter-spacing:.1em;color:#B6634E}
.ok{position:absolute;right:26px;bottom:24px;font-family:'Mono';font-size:19px;letter-spacing:.1em;color:#F5A524}
.mid{position:absolute;left:858px;top:470px;font-family:'Mono';font-size:22px;color:#F5A524;white-space:nowrap}
.stat{position:absolute;left:120px;bottom:52px;font-size:30px}
`, `
<div class="h1 display">Measure. <span class="amber">Correct.</span> Repeat.</div>
<div class="panel before" data-om-id="before">
  <div class="ptag">BEFORE</div><div class="ptitle">The toolkit</div>
  <div class="mini-card" data-om-id="bc"><div class="t">A clear title that runs far too long</div><div class="s">One line of supporting copy that clips at the edge of the card</div></div>
  <div class="clip" data-om-id="clip"></div>
  <div class="warn" data-om-id="warn">CLIPPED ACTOR</div>
</div>
<div class="mid" data-om-id="mid">patch_scene(&rarr;)</div>
<div class="panel after" data-om-id="after">
  <div class="ptag">AFTER</div><div class="ptitle">The toolkit</div>
  <div class="mini-card" data-om-id="ac"><div class="t">A clear title</div><div class="s">One line of supporting copy.</div></div>
  <div class="ok" data-om-id="ok">0 CLIPPED &nbsp;·&nbsp; MOTION 3.7%</div>
</div>
<div class="stat body" data-om-id="stat">A correction, not a guess.</div>`, `
tl.fromTo('.h1',{y:30,opacity:0},{y:0,opacity:1,duration:.75,ease:'power3.out'},.1);
tl.fromTo('[data-om-id="before"]',{x:-30,opacity:0},{x:0,opacity:1,duration:.75,ease:'power3.out'},.6);
tl.fromTo('[data-om-id="clip"]',{opacity:0},{opacity:1,duration:.5},1.35);
tl.fromTo('[data-om-id="warn"]',{opacity:0},{opacity:1,duration:.5},1.55);
tl.fromTo('[data-om-id="mid"]',{opacity:0,scale:.9},{opacity:1,scale:1,duration:.6,ease:'power3.out'},1.95);
tl.fromTo('[data-om-id="after"]',{x:30,opacity:0},{x:0,opacity:1,duration:.75,ease:'power3.out'},2.25);
tl.fromTo('[data-om-id="ok"]',{opacity:0},{opacity:1,duration:.5},2.95);
tl.fromTo('[data-om-id="stat"]',{y:20,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},3.3);`, 4.5);

// 6. FRAME ACCURACY (dataviz-countup): every frame seeked and intentional.
const s6 = scene(`
.strip{position:absolute;left:120px;top:340px;width:1680px;display:flex;gap:10px}
.cell{width:118px;height:150px;border:2px solid rgba(243,239,231,.12);border-radius:8px;background:#10151E;position:relative;overflow:hidden}
.cell::after{content:'';position:absolute;left:18px;bottom:18px;width:60px;height:3px;background:#F5A524}
.play{position:absolute;left:120px;top:315px;width:4px;height:200px;background:#F5A524;box-shadow:0 0 22px rgba(245,165,36,.7)}
.stats{position:absolute;left:120px;top:570px;display:flex;gap:120px}
.num{font-family:'Display';font-weight:900;font-size:86px;color:#F5A524;letter-spacing:-.05em;font-variant-numeric:tabular-nums}
.lbl2{font-family:'Mono';font-size:19px;letter-spacing:.14em;color:rgba(243,239,231,.55);margin-top:8px}
.note{position:absolute;right:120px;bottom:80px;text-align:right}
`, `
<div class="ghost">696</div>
<div class="h1 display">Every frame. <span class="amber">On purpose.</span></div>
<div class="corner muted">006 / 008</div>
<div class="strip">${Array.from({ length: 12 }, (_, i) => `<div class="cell" data-om-id="c${i}"></div>`).join('')}</div>
<div class="play" data-om-id="play"></div>
<div class="stats">
  <div><div class="num" data-om-id="n1">0</div><div class="lbl2">FRAMES RENDERED</div></div>
  <div><div class="num" data-om-id="n2">0</div><div class="lbl2">FPS</div></div>
  <div><div class="num" data-om-id="n3">0</div><div class="lbl2">SECONDS</div></div>
</div>
<div class="note muted">SEEK-ACCURATE &nbsp;/&nbsp; DETERMINISTIC &nbsp;/&nbsp; CRASH-RESUMABLE</div>`, `
tl.fromTo('.h1',{y:30,opacity:0},{y:0,opacity:1,duration:.75,ease:'power3.out'},.1);
tl.fromTo('.corner',{opacity:0},{opacity:1,duration:.5},.2);
tl.fromTo('.cell',{y:24,opacity:0},{y:0,opacity:1,duration:.55,stagger:.06,ease:'power3.out'},.5);
tl.fromTo('[data-om-id="play"]',{x:0,opacity:0},{x:1520,opacity:1,duration:2.4,ease:'power2.inOut'},.7);
const v1={n:0},v2={n:0},v3={n:0};
tl.to(v1,{n:696,duration:2.2,ease:'power2.out',onUpdate(){document.querySelector('[data-om-id="n1"]').textContent=Math.round(v1.n);}},.8);
tl.to(v2,{n:24,duration:1.4,ease:'power2.out',onUpdate(){document.querySelector('[data-om-id="n2"]').textContent=Math.round(v2.n);}},1.1);
tl.to(v3,{n:29,duration:1.4,ease:'power2.out',onUpdate(){document.querySelector('[data-om-id="n3"]').textContent=Math.round(v3.n);}},1.3);
tl.fromTo('.note',{opacity:0},{opacity:1,duration:.5},3.0);`, 5);

// 7. ALL TOKENS LOCAL (grid-card-assemble): completeness, openness.
const chips = ['GSAP','FONTS','ICONS','ASSETS','ROUGH','FX','SHADERS','THREE','BRAND','COMPONENT'];
const s7 = scene(`
.chip{position:absolute;padding:18px 30px;border:2px solid rgba(245,165,36,.42);border-radius:999px;font-family:'Mono';font-weight:500;font-size:22px;letter-spacing:.1em;color:#F5A524;background:rgba(245,165,36,.05)}
.note{position:absolute;left:120px;bottom:78px;font-size:34px}
.note2{position:absolute;right:120px;bottom:80px}
`, `
<div class="h1 display">Every token. <span class="amber">No gate.</span></div>
${chips.map((c, i) => {
  const col = i % 5, row = Math.floor(i / 5);
  return `<div class="chip" data-om-id="chip${i}" style="left:${120 + col * 340}px;top:${330 + row * 130}px">${c}</div>`;
}).join('')}
<div class="note body" data-om-id="note">MIT licensed. Fully offline.</div>
<div class="note2 muted" data-om-id="note2">NO CLOUD &nbsp;/&nbsp; NO SDK &nbsp;/&nbsp; NO ACCOUNT</div>`, `
tl.fromTo('.h1',{y:30,opacity:0},{y:0,opacity:1,duration:.75,ease:'power3.out'},.1);
tl.fromTo('.chip',{scale:.8,opacity:0},{scale:1,opacity:1,duration:.55,stagger:.11,ease:'power3.out'},.7);
tl.fromTo('[data-om-id="note"]',{y:20,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},2.4);
tl.fromTo('[data-om-id="note2"]',{opacity:0},{opacity:1,duration:.5},2.7);`, 5);

// 8. CTA (logo-assemble-lockup): calm held end card.
const s8 = scene(`
.word{position:absolute;left:50%;top:360px;transform:translateX(-50%);display:flex;gap:2px}
.letter{display:inline-block;font-size:120px;line-height:1;transform-origin:50% 100%}
.underline{position:absolute;left:50%;top:520px;width:440px;transform:translateX(-50%)}
.sub{position:absolute;left:0;right:0;top:570px;text-align:center;font-size:38px}
.url{position:absolute;left:0;right:0;top:672px;text-align:center;font-family:'Mono';font-weight:500;font-size:23px;letter-spacing:.1em;color:rgba(243,239,231,.66)}
`, `
<div class="eyebrow mono" style="left:0;right:0;text-align:center">AUTHOR ONCE. RENDER ANYWHERE.</div>
<div class="word display">${[...'TrueMotion'].map((c, i) => `<span class="letter" data-om-id="z${i}">${c}</span>`).join('')}</div>
<div class="underline rule" data-om-id="underline"></div>
<div class="sub body" data-om-id="sub">The open motion studio for agents.</div>
<div class="url" data-om-id="url">github.com/instax-dutta/truemotion</div>`, `
tl.fromTo('.eyebrow',{opacity:0,y:-12},{opacity:1,y:0,duration:.6,ease:'power3.out'},.1);
tl.fromTo('.letter',{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.9,stagger:.045,ease:'power4.out'},.35);
tl.fromTo('[data-om-id="underline"]',{scaleX:0},{scaleX:1,duration:.75,ease:'expo.out'},1.2);
tl.fromTo('[data-om-id="sub"]',{y:20,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out'},1.45);
tl.fromTo('[data-om-id="url"]',{opacity:0},{opacity:1,duration:.7,ease:'power2.out'},2.2);`, 4.5);

const scenes = [
  ['1 - Hook: describe it', s1],
  ['2 - Promise: TrueMotion', s2],
  ['3 - Authoring: one prompt', s3],
  ['4 - Measured feedback', s4],
  ['5 - Iterate: correct', s5],
  ['6 - Frame accuracy', s6],
  ['7 - All tokens local', s7],
  ['8 - CTA', s8]
];

const transport = new StdioClientTransport({ command: 'node', args: [bin, 'serve', '--state', stateFile] });
const client = new Client({ name: 'launch-film', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
for (const [name, html] of scenes) {
  const duration = Number(html.match(/__SCENE_DURATION__\s*=\s*([\d.]+)/)?.[1] ?? 4);
  const r = await client.callTool({
    name: 'add_scene',
    arguments: { name, durationSec: duration, html, freshStart: true }
  });
  const summary = (r.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  console.log(`add_scene ${name}: ${r.isError ? 'ERROR' : 'ok'} | ${summary.slice(0, 200).replace(/\n/g, ' ')}`);
}
const review = await client.callTool({ name: 'review_timeline', arguments: {} }, undefined, { timeout: 180000 });
console.log('\n=== REVIEW ===');
for (const block of review.content || []) {
  if (block.type === 'text') console.log(block.text);
}
await client.close();

// Ambient score, length matched to the film.
const wav = path.join(outDir, 'ambient.wav');
const audio = path.join(outDir, 'ambient-score.m4a');
const persisted = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
const totalSeconds = persisted.scenes.reduce((sum, s) => sum + s.durationSec, 0);
const score = spawnSync('python3', [path.join(root, 'examples/ambient.py'), wav, String(totalSeconds)], { encoding: 'utf8' });
console.log('audio score:', score.stdout.trim() || score.stderr.slice(-200));
const encode = spawnSync('ffmpeg', ['-y', '-i', wav, '-c:a', 'aac', '-b:a', '192k', audio, '-loglevel', 'error'], { encoding: 'utf8' });
console.log('audio encode:', encode.status === 0 ? 'ok' : encode.stderr.slice(-200));

const rendered = spawnSync('node', [bin, 'render', '--state', stateFile, '--out', path.join(outDir, 'launch-film.mp4'), '--fps', '24', '--crf', '17', '--segment-size', 120, '--audio', audio], { encoding: 'utf8' });
console.log(rendered.stdout.trim(), rendered.stderr.trim());
console.log('VIDEO', path.join(outDir, 'launch-film.mp4'));
