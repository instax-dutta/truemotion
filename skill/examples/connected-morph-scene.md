# Example: Connected Morph Scene (prompt bar → dashboard)

**Use when the same UI element transforms across a story beat** — search bar types → becomes dashboard card. This MUST be **one scene, one timeline**. Splitting into two scene files breaks the morph (hard cut).

Key techniques: single `#prompt-bar` actor, GSAP morph of size/border/content, KPI cards assemble INSIDE the bar after morph — no second intro. (No authored camera zoom — zoom is user-only via the editor zoom tool.)

```html
<!doctype html><html><head><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#000}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#000;
  font-family:'Display',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.rig{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform-origin:50% 45%}
.bar{position:relative;width:min(88%,720px);background:#1a1a1a;border-radius:16px;padding:22px 24px;
  border:1px solid rgba(255,255,255,.08);box-shadow:0 0 80px rgba(255,107,53,.25);overflow:hidden}
.bar .prompt-row{font-size:22px;color:#e8845c;display:flex;align-items:center;gap:6px}
.cursor{display:inline-block;width:3px;height:1.1em;background:#ff6b35;box-shadow:0 0 12px #ff6b35}
.bar .dashboard{display:none;margin-top:20px}
.bar.morph .prompt-row{opacity:0;height:0;overflow:hidden}
.bar.morph .dashboard{display:block}
.bar h2{font-size:26px;color:#f4a482;margin-bottom:8px}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
.kpi{background:rgba(255,255,255,.06);border-radius:10px;padding:12px}
.kpi strong{display:block;font-size:20px;color:#fff}.kpi span{font-size:11px;color:#888}
</style></head><body>
<div class="frame" id="frame">
  <div class="rig camera-rig">
    <div class="bar om-typing-host" id="prompt-bar" data-om-id="prompt-bar">
      <div class="prompt-row om-input-row" id="input-row">
        <span class="cursor" id="type-cursor"></span>
        <span id="typed-content" class="om-typed-target" data-om-typed></span>
      </div>
      <div class="dashboard">
        <h2 data-om-id="card-title">Pipeline overview</h2>
        <div class="kpis">
          <div class="kpi"><strong>24</strong><span>Deals</span></div>
          <div class="kpi"><strong>$1.2M</strong><span>Pipeline</span></div>
          <div class="kpi"><strong>68%</strong><span>Win rate</span></div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
const bar = document.getElementById('prompt-bar');
const PROMPT = 'Summarize my Q4 pipeline';

// BUILD — bar rises; typing via OMTyping (never from() on #typed-content)
tl.fromTo('.rig',{scale:1.08,opacity:0},{scale:1,opacity:1,duration:0.7,ease:'power3.out'},0.15);
tl.fromTo('.bar',{y:30,opacity:0},{y:0,opacity:1,duration:0.55,ease:'power4.out'},0.25);
OMTyping.attach({ timeline: tl, target: '#typed-content', row: '#input-row', cursor: '#type-cursor', text: PROMPT, start: 0.5, duration: 1.8 });


// MORPH — same DOM: bar grows, prompt hides, dashboard reveals inside
tl.addLabel('morph', 3.4);
tl.to('.bar',{height:320,padding:28,duration:0.85,ease:'power3.inOut'},'morph');
tl.call(() => bar.classList.add('morph'), null, 'morph+=0.15');
tl.fromTo('.dashboard h2',{opacity:0,y:12},{opacity:1,y:0,duration:0.45,ease:'power3.out'},'morph+=0.35');
tl.fromTo('.kpi',{opacity:0,y:20},{opacity:1,y:0,stagger:0.08,duration:0.5,ease:'power3.out'},'morph+=0.55');

// BREATHE — subtle drift, then settle
tl.to('.bar',{boxShadow:'0 0 100px rgba(255,107,53,.35)',duration:3,yoyo:true,repeat:1,ease:'sine.inOut'},'morph+=1.5');
tl.to({},{duration:1.2},'>');

window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = tl.duration();
</script></body></html>
```

## When to use

- Prompt/search bar → product card / dashboard
- Notification toast → full app panel
- Small UI → hero UI (same element, not a new one)

## When NOT to split scenes

If `#prompt-bar` in scene 3 and scene 4 are separate HTML files, export **hard-cuts** — morph is impossible. One timeline only.

## Agent rule

Before `add_scene` for a morph beat: check if previous beat ends with same actor — if yes, **extend the current scene timeline** or merge beats into one `update_scene` with longer `durationSec`.
