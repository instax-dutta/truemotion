# Example: Product UI Scene (the "Scout" pattern)

Use for SaaS / product / dashboard / demo moments. This is the Motion.so "code-generated view" trick: a real-looking product UI built in HTML, with a camera settle, text TYPING into a field, integration chips, and a count-up — all on one timeline. This is what makes a product video feel like the actual product, not stock.

Key techniques: a settling UI card (`back.out` rise), character-by-character typing via a timeline proxy (NOT setInterval), number count-up via proxy `onUpdate`, staggered chip reveal, ambient card "breathe". Easings: `back.out(1.4)` for the card, `power3.out` for content, `power2.out` for counts.

```html
<!doctype html><html><head><style>
/* {{FONTS_CSS}} */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#000}
.frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#0A0F1E;
  font-family:'Display',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.glow{position:absolute;inset:-20%;background:radial-gradient(ellipse 900px 600px at 50% 50%,#16233f,transparent 70%)}
.stage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:980px}
.card{border-radius:16px;overflow:hidden;background:#0c1426;
  box-shadow:0 32px 90px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08)}
.bar{height:48px;background:#0F1629;border-bottom:1px solid rgba(255,255,255,.07);
  display:flex;align-items:center;justify-content:space-between;padding:0 22px}
.brand{font-size:15px;color:#EAF0FA}
.url{font-family:'Mono',monospace;font-size:12px;color:#64748B}
.body{padding:40px 48px}
.label{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#64748B}
.input{margin-top:14px;min-height:120px;border-radius:10px;padding:20px 24px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);
  font-size:17px;font-weight:300;line-height:1.6;color:#EAF0FA}
.chips{margin-top:22px;display:flex;gap:10px}
.chip{border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:7px 16px;
  font-size:13px;color:#94A3B8;background:rgba(255,255,255,.04)}
.stat{margin-top:28px;display:flex;align-items:baseline;gap:12px}
.statnum{font-size:52px;font-weight:700;color:#4d8fe6;font-variant-numeric:tabular-nums}
.statlbl{font-size:18px;color:#64748B}
</style></head><body>
<div class="frame" id="frame">
  <div class="glow"></div>
  <div class="stage">
    <div class="card" id="card">
      <div class="bar"><span class="brand">Scout</span><span class="url">scout.app</span></div>
      <div class="body">
        <div class="label">Tell Scout about your business</div>
        <div class="input" id="typed"></div>
        <div class="chips">
          <span class="chip chip-i">Gmail</span><span class="chip chip-i">WhatsApp</span><span class="chip chip-i">Sheets</span>
        </div>
        <div class="stat"><span class="statnum" id="num">0</span><span class="statlbl">issues found / month</span></div>
      </div>
    </div>
  </div>
</div>
<script>
const tl = gsap.timeline({ paused:true });
const FULL = "We run a 25-person events company. Vendors and clients live in WhatsApp and email. Invoicing is on Excel.";
const typed = document.getElementById('typed');
const numEl = document.getElementById('num');
const proxy = { chars:0, n:0 };

tl.fromTo('.card',{y:60,opacity:0,scale:0.96},{y:0,opacity:1,scale:1,duration:0.7,ease:'back.out(1.4)'},0.15);
// typing via proxy on the timeline (deterministic under seek)
tl.to(proxy,{chars:FULL.length,duration:1.6,ease:'none',
  onUpdate:()=>{ typed.textContent = FULL.slice(0, Math.round(proxy.chars)); }},0.7);
tl.fromTo('.chip-i',{y:16,opacity:0},{y:0,opacity:1,stagger:0.08,duration:0.4,ease:'power3.out'},'>-0.2');
// count-up
tl.to(proxy,{n:284,duration:1.1,ease:'power2.out',
  onUpdate:()=>{ numEl.textContent = Math.round(proxy.n).toLocaleString(); }},'>0.1');
// breathe
tl.to('.card',{y:'-=6',duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'},2.5);
tl.to({},{duration:0.8},'>');
window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = tl.duration();
</script></body></html>
```

Why it works: a believable product surface (use the brand kit's REAL components/colors here when available — see brand-components.md), motion that demonstrates the product (typing, counting), tabular-nums on the number, a settle + breathe. When a brand kit is attached, replace this generic card with the kit's actual navbar/dashboard/card HTML and animate THAT the same way.
