# Motion Rules (GSAP)

Read every time. All taste rules from professional motion design, expressed in GSAP. A video frame is not a web page.

## Rule Zero: Restraint (flash is the amateur tell)

Audiences are overstimulated; restraint is what reads as professional. Amateur motion dazzles because the story is weak — a strong beat doesn't need particles.

- **Every motion needs a job** (reveal hierarchy, direct the eye, express a state change). If you can't name the job, delete the tween.
- **Effect budget:** at most ONE canvas/shader effect per VIDEO (not per scene), and only when the direction calls for it. Glow, grain, aberration, particles are seasoning, not structure.
- **One hero moment per scene.** Everything else supports it quietly. Two competing spectacles = zero.
- **Soft beats loud.** Prefer fewer, better transitions and more breathing room over more movement. A held, well-composed frame is a valid motion choice.
- **Decoration cap:** max 2 decorative elements the content doesn't need; each under 25% opacity.

## Seek-Safety: `fromTo()`, never `from()`

The renderer seeks/scrubs straight to arbitrary frames for preview and export — it does not always play forward from 0. `tl.from(el, {opacity:0, y:60})` computes its start state lazily from whatever the element's current computed style is _when the tween first executes_; on a cold seek that moment never happens correctly, so the element sits at its end/rest state for the ENTIRE scene. This is the #1 cause of a scene that renders as a still, unmoving frame across the whole timeline.

**Rule: never call `tl.from()`. Always `tl.fromTo(el, {...start}, {...end, duration, ease})` with BOTH states written out explicitly, or `gsap.set(el, {...})` for a state that isn't tweened.** This applies to every entrance in the Verb → GSAP Map below, not just the typing target or continuity re-intros — those were just the two places the team noticed the symptom first.

## The Cardinal Sin: Monoculture

What makes a video look AI-generated — avoid every one:

- **Emoji as icons.** Never use emoji for UI affordances (checkmarks, arrows, stars). Inline Lucide SVG instead (see scene-contract.md → Icons).
- **Same ease on every tween.** Vary. GSAP eases: `power3.out`/`power4.out` (confident settle, default), `expo.out` (sharp, premium), `back.out(1.6)` (subtle overshoot — sparingly), `elastic.out(1,0.5)` (playful, rare), `sine.inOut` (continuous/ambient), `power2.in` (exits). No more than two elements share an ease.
- **Same duration on everything.** The slowest motion ≈ 3× the fastest. Mix 0.2s percussive hits with 0.7s deliberate settles for hierarchy.
- **Same entrance for everything.** `{y:30, opacity:0}` on every element is the universal tell. Vary direction and property: y, x, scale, rotation, clip-path/`maskReveal`, blur (`filter`), 3D `rotationY`/`z`.
- **First animation at t=0.** Offset the opener by 0.1–0.3s.
- **Ambient zoom on every scene.** Vary the ambient: drift, parallax, breathing, or stillness. Stillness after motion has weight.

## Verb → GSAP Map

You named a verb per element; translate (every entrance below writes both `fromTo` states explicitly — see Seek-Safety above):

- **SLAMS / PUNCHES** → `tl.fromTo(el,{scale:1.4,opacity:0},{scale:1,opacity:1,duration:0.25,ease:'power4.out'})`
- **RISES / SLIDES** → `tl.fromTo(el,{y:60,opacity:0},{y:0,opacity:1,duration:0.6,ease:'power3.out'})`
- **PUSHES IN / ZOOMS (camera)** → **do NOT author this.** Camera zoom is user-only (editor zoom tool). Compose the shot statically, or scale the single element itself as a content move — never a scene wrapper.
- **ASSEMBLES** → `tl.fromTo('.items',{y:24,opacity:0},{y:0,opacity:1,stagger:0.07,ease:'power3.out'})`
- **COUNTS UP** → tween a proxy: `tl.to(obj,{val:8200,duration:1.2,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(obj.val).toLocaleString()})`
- **DRAWS / FILLS** → `tl.fromTo(path,{strokeDashoffset:LEN},{strokeDashoffset:0,duration:1,ease:'power2.inOut'})`
- **TYPES ON** → use `OMTyping.attach({ timeline: tl, target: '#typed-content', row: '#input-row', text, start, duration })` (see blocks/typing-input.md). Animate the bar wrapper only — never tween the typing target itself (opacity/x/y/z on the same span that receives characters = invisible typing).
- **DRIFTS / BREATHES** → ambient, ok to use `tl.to()` here since the element is already visible/settled, not entering: `tl.to(el,{x:'+=20',y:'-=12',duration:7,repeat:-1,yoyo:true,ease:'sine.inOut'},0)`

## Easing Is Emotion

Same motion, different ease, different feeling. `power3.out` reads confident; `back.out` playful; `expo.out` premium/snappy. Choose for the mood. Use `.out` for entrances (fast→settle), `.in` for exits. Never ease-in an entrance.

## Speed Expresses Weight

0.15–0.3s = percussive; 0.3–0.5s = composed; 0.5–0.8s = deliberate; 0.8s+ = atmospheric. A one-speed scene is one-note.

## Build, Breathe, Resolve

Structure every scene's timeline:

- **Build (0–35%)** for typography/simple heroes. Product/UI assembly may extend through **60–70%** so meaningful components arrive one beat at a time.
- **Breathe** — hold the smallest assembled state that proves the message, with ONE living motion (interaction, value change, focus shift, drift, or 3D response). The whole application does not need to be visible.
- **Resolve (final 12–20%)** — settle or hand off into the cut. No unrelated late entrance. (Exit tweens only on the final scene — the cut is the exit.)

Read shot-direction.md for actor order and UI framing. If the whole UI is visible at the first checkpoint, the Build phase failed.

## Choreography Is Hierarchy

First to move = most important. Stagger by importance, not DOM order. Overlap entrances (start the next before the last finishes). A sibling micro-group may assemble in under 0.6s; a sequence of meaningful UI components should span multiple readable beats. GSAP `stagger` for sibling groups; explicit position params (`, 0.2`, `, '<0.1'`, `, '+=0.15'`) for major actors.

Numbers that separate considered from chaotic:

- **1/3 simultaneity rule:** with 3+ elements, never have more than 1/3 of them in active motion at the same instant.
- **Stagger budgets:** sibling cascade 0.03–0.06s apart (total < 0.4s); major component beats 0.35–0.9s apart so the viewer can follow the construction.
- **Spatial consistency:** all entrances in one beat come from the SAME direction (or scale-in-place). Mixed entry directions in one beat read as chaos.
- **Counter-motion for depth:** if the hero moves right, ambient/background drifts left at 20–30% of its speed.
- **Entrances 30–50% longer than exits.** Arrive with care, leave with purpose.
- **Never linear** for spatial movement — linear is only for spinners/progress.

## Depth & Camera

Flat fades read as PowerPoint. Choose the lightest depth system that can truthfully make the shot.

- **NO authored DOM camera zoom:** never tween `scale` (or `z`) on a `.camera-rig`/full-scene DOM wrapper. Zoom belongs to the user's editor focus tool.
- **CSS 2.5D:** use `perspective`, flat layers at different `translateZ`, and small rig rotations for typography, screenshots, and UI planes. This is not real geometry; never choose it for metal, glass, sculpted objects, or believable lighting.
- **True 3D:** when the shot requires geometry, material response, occlusion, shadows, or a world-space camera, read true-3d.md and use `{{THREE}}` + OM3D. A true 3D camera may move inside its WebGL world; the user-only zoom rule still applies to the outer DOM frame.
- **Parallax tilt (timeline, NOT mouse):** for a cinematic drift, animate `rotationY`/`rotationX` of the rig a few degrees over the scene with `sine.inOut` — rotation/translation only, never scale. NEVER bind camera to pointer/mouse events — video has no input; all camera motion is on the timeline.
- Don't put a heavy camera move on every scene — vary it; some scenes hold still.
- See examples/cinematic-3d-scene.md for CSS 2.5D and examples/true-3d-product-scene.md for actual 3D.

## Density: Fill the Frame, Not the DOM

Visual richness comes from framing, scale, overlap, and depth—not from loading more widgets. Use only the actors the shot needs:

- **Background** — choose ONE directed structure from shot-direction.md and animate one property slowly. A flat brand color is valid when the hero is strong; a generic glow/gradient orb is not.
- **Midground** — the message or contextual product fragment.
- **Foreground** — one hero component, crop, divider, or metadata layer that creates depth.

Three carefully framed actors can beat ten tiny elements. Product detail must remain readable at playback size.

## The Scale Table (web → video)

| Element            | Video size              |
| ------------------ | ----------------------- |
| Headlines          | 64–120px (hero 100–140) |
| Body               | 28–42px                 |
| Labels / mono      | 18–24px                 |
| Decorative opacity | 12–25%                  |
| Borders            | 2–4px                   |
| Padding            | 60–140px                |

Anything under 24px or under 10% opacity needs justification — it's likely invisible on video.

## Color

One accent hue across the whole video; same background family across scenes. Accent must be VISIBLE (15–25% for glows, full saturation for focal). Tint neutrals toward the accent — no dead gray, avoid pure #000/#fff. On dark, avoid full-screen linear gradients (H.264 banding) — use radial or solid+glow.

**The statistical-center palette is banned** (it is the #1 "AI made this" tell): no purple→blue/indigo/violet gradients, no #6366f1/#8b5cf6/#a855f7 family, no cyan-glow-on-dark, no violet gradient orbs — unless the brand kit or the user explicitly specifies purple. Choose the accent from the design direction (design-directions.md), not from habit.

## Anti-slop visual tells (never do these by default)

Each of these is instantly recognized as AI output. Any of them requires the user or brand to have asked for it:

- Glassmorphism panels / frosted cards as the default container
- Gradient orbs or blurred color blobs floating behind content
- Neon glow applied to every element on a dark scene
- Three feature cards in a row; bento grid as filler
- Centered pill badge above a centered hero headline
- Every element entering with the same fade-up
- Emoji as icons (see scene-contract.md)
- Dark mode by reflex when the register doesn't call for it

## Composition

Two focal points minimum. Hero text fills 60–80% of width. Anchor to edges or split the frame into zones (data left / content right). Centered-floating is a web habit that looks lost — use it only as a deliberate solemn beat.

## Transitions

Default hard cut (modern, percussive). For a "continuous camera" feel between two scenes, velocity-match: outgoing accelerates one direction, incoming decelerates from the same direction. Reserve crossfades for genuinely continuous ideas.
