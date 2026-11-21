# Pattern: SaaS Explainer — Persistent Shell (video 01)

**Continuity:** `persistent-shell` — actors `#preview-shell`, `#section-pills`, `#playhead` never re-intro.

## Beat sheet

| Beat | ~Duration | Active pill | Inner content | Blocks |
|------|-----------|-------------|---------------|--------|
| Hook | 4s | Hook | Kinetic headline blur-in | `kinetic-headline-blur` |
| Solution | 5s | Solution | Problem/solution copy | `kinetic-headline-blur` |
| Demo | 8s | Demo | Dashboard skills mastery | `dashboard-skills-mastery` |
| Features | 6s | Features | 3D-tilt feature cards | `dashboard-skills-mastery` |
| CTA | 5s | CTA | Text lockup (logo only if provided) | `logo-lockup-cta` / text CTA |

## Shell structure (every scene)

```html
<div class="preview-shell" data-om-id="preview-shell">
  <div class="preview-inner"><!-- ONLY this swaps --></div>
  <div class="filmstrip" data-om-id="filmstrip">…</div>
  <div class="section-pills" data-om-id="section-pills">
    <!-- active pill gets .active gradient; sync to scene beat -->
  </div>
</div>
```

## Motion rules

- Shell fades in once on scene 1 only. Scenes 2–5: shell at opacity 1 from t=0.
- Animate `.pill.active` transition + playhead x position — not full shell rebuild.
- Inner content: stagger entrances 0.2–0.6s. No camera push/zoom — zoom is user-only via the editor zoom tool.

## Palette

Dark `#0a0a12`, blue glow `#3b82f6`, pill active gradient blue→cyan.
