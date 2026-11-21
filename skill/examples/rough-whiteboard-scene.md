# Example: Rough whiteboard hook scene

Hand-drawn explainer beat — paper background, sketchy card, underline emphasis, staggered headline. Use for whiteboard / doodle / handmade drawing prompts.

```html
<!doctype html><html><head><meta charset="utf-8">
<style>
  /* {{FONTS_CSS}} */
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{width:100%;height:100%;overflow:hidden;background:#000;}
  .frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;}
  .content{position:relative;z-index:2;padding:100px 120px;}
  .headline{font-size:96px;font-weight:700;color:#1a1a1a;line-height:1.05;letter-spacing:-.03em;max-width:90%;}
  .headline .hit{color:var(--brand-primary,#2563eb);}
  .sub{font-size:32px;color:#444;margin-top:28px;max-width:70%;line-height:1.35;}
</style>
</head><body>
<div class="frame om-paper-bg" id="frame">
  <svg class="om-rough-svg" id="rough" viewBox="0 0 {{W}} {{H}}" aria-hidden="true"></svg>
  <div class="content">
    <h1 class="headline" data-om-id="headline" data-om-label="Headline">
      <span class="hit">Sketch</span> your idea. Ship the video.
    </h1>
    <p class="sub" data-om-id="tagline" data-om-label="Tagline">Whiteboard energy without the whiteboard.</p>
  </div>
</div>
{{ROUGH}}
{{GSAP}}
<script>
  const svg = document.getElementById('rough');
  const tl = gsap.timeline({ paused: true });
  const accent = 'var(--brand-primary, #2563eb)';

  const card = OMRough.card(svg, 80, 220, 1760, 380, {
    stroke: accent,
    fill: 'rgba(37,99,235,0.05)',
    fillStyle: 'hachure',
    hachureGap: 7,
    roughness: 1.5,
    strokeWidth: 3,
    seed: 42
  });

  OMRough.underline(svg, 118, 318, 280, { stroke: accent, strokeWidth: 3, roughness: 2, seed: 43 });

  const scribble = OMRough.path(svg, 'M 1500 180 Q 1580 220 1620 300 T 1680 420', {
    stroke: '#94a3b8',
    strokeWidth: 2,
    roughness: 2.5,
    bowing: 3,
    seed: 44
  });

  tl.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.15);
  tl.fromTo(scribble, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.25);
  tl.fromTo('.headline', { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, 0.35);
  tl.fromTo('.sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.55);

  window.__SCENE_TIMELINE__ = tl;
  window.__SCENE_DURATION__ = 6;
</script>
</body></html>
```

**Techniques:** `.om-paper-bg` + `om-rough-svg` overlay; real HTML text above SVG; fixed seeds; build → breathe structure; brand accent on strokes only.
