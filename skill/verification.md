# Verification (before you finish each scene)

Run this self-check on every scene you write. Fix failures before calling the scene done.

## Contract (or it won't export)

- [ ] Exactly ONE `gsap.timeline`, created with `{ paused: true }`, assigned to `window.__SCENE_TIMELINE__`.
- [ ] `window.__SCENE_DURATION__` set to `tl.duration()`.
- [ ] NO `setTimeout`, `setInterval`, or bare `requestAnimationFrame` anywhere.
- [ ] NO CSS `transition` or `@keyframes` driving meaningful motion (GSAP only).
- [ ] Continuous/looping motion uses GSAP `repeat: -1` on the timeline.
- [ ] Counters/typing use a proxy object tweened on the timeline with `onUpdate`, not intervals.
- [ ] Prompt-bar typing: `OMTyping.attach()` used; typing target never has `from({opacity:0,y,z})` on it (see blocks/typing-input.md).
- [ ] Screen flyout: `#flyout-rig` uses correct direction block from `blocks/screen-flyout.md`; screenshot via `{{ASSET:...}}`; no RAF for the entrance.
- [ ] Fonts referenced only by injected families ('Display'/'Mono'/'Body'); no CDN/@import.
- [ ] Assets referenced only via injected `{{ASSET:...}}` tokens; no file paths or http URLs.

## Layout (mentally seek to several times: ~10%, ~50%, ~90%)

- [ ] At every time, all content is on-frame — nothing clipped or off-frame at any seek (entrances that start far off-frame must arrive inside).
- [ ] Content fills the frame (hero text 60–80% width; not a small block floating in dead space).
- [ ] At least two focal points; three visual layers (bg/mid/fg) present.
- [ ] Text readable: sizes per the scale table, sufficient contrast on the background.
- [ ] Product/UI shot uses a deliberate framing mode from shot-direction.md; the whole interface is not visible at the first checkpoint unless explicitly required.
- [ ] Every meaningful UI component has a stable `data-om-id`; hero/action/evidence actors arrive in a readable order.
- [ ] Consecutive scenes do not repeat the same top-left-heading + centered-panel composition.

## Motion quality (the anti-PowerPoint check)

- [ ] Not every element uses the same ease/duration/entrance (no monoculture).
- [ ] There is real depth (3D layers or parallax) OR a deliberate reason there isn't.
- [ ] NO authored camera zoom: no `scale` tween on `.camera-rig`/full-scene wrappers, no `OMFX.camera(..., 'push', ...)` — zoom is user-only via the editor zoom tool.
- [ ] A breathe/payoff phase exists with ONE living motion; product/UI assembly may extend through 60–70%, while simple hero entrances finish earlier.
- [ ] Entrances are choreographed by importance. Sibling micro-elements may stagger quickly; major components receive separate readable beats.
- [ ] Only the FINAL scene of the video has exit animations.
- [ ] Background uses one intentional structure and one slow animated property—not generic glow/gradient filler.
- [ ] True 3D reveals physical evidence (silhouette/thickness/shadow/material/occlusion/perspective), not a dark flat object with negligible camera change.

## Anti-slop check (the "AI made this" tells)

- [ ] A named design direction is locked (\`<!-- direction: ... -->\`) and this scene's palette/type/texture match it.
- [ ] No statistical-center visuals: no purple/indigo gradient, no gradient orbs, no default glassmorphism, no neon glow on everything, no three-cards-in-a-row, no centered-pill-badge hero.
- [ ] Every tween has a nameable job; effect budget respected (≤1 shader effect per VIDEO).
- [ ] Restraint: one hero moment; supporting elements are quiet; the frame could hold still and remain composed.

## The Gate

- [ ] Would I post this publicly with my name on it? If it reads as a slide with fading text, rebuild with depth, camera, and choreography per the examples. If it reads as flashy AI output, strip effects until every remaining motion has a job.
