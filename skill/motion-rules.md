<!-- SPDX-License-Identifier: MIT -->
# Motion rules

Read before every scene. These rules exist because a frame is captured by
seeking, not by waiting.

## Restraint

Every tween needs a job: reveal hierarchy, lead the eye, or express a state
change. If you cannot name the job, remove it. One hero moment per scene.
At most two decorative elements, each below 25 percent opacity. A held frame
after motion has weight; do not fill every second with activity.

## Seek safety

`from()` reads the current computed style when it first runs. On a cold seek
that moment never arrives, so the element stays at its end state for the whole
scene. Write both states with `fromTo()` instead. Use `gsap.set()` for a state
that never animates. Continuous ambient motion is a permitted `to()` because
the element is already visible when it starts.

## Timing

- 0.15-0.3s: percussive hits.
- 0.3-0.5s: composed, ordinary entrances.
- 0.5-0.8s: deliberate settles.
- 0.8s and longer: atmosphere.
- The slowest motion should be about three times the fastest.
- Offset the first entrance to 0.1-0.3s.
- Entrances are longer than exits.
- With three or more elements, no more than one third move at any instant.
- Sibling cascades sit 0.03-0.06s apart. Major component beats sit 0.35-0.9s
  apart so the viewer can follow construction.

## Easing

`power3.out` and `power4.out` read as confident settles. `expo.out` feels
premium and sharp. `back.out(1.6)` is playful and should be rare.
`sine.inOut` belongs on continuous ambient motion. `power2.in` is for exits.
Vary easing: no more than two elements should share one ease.

## Structure

Every scene moves through build, breathe and resolve.

- Build: the hero and its supporting actors arrive, in importance order.
- Breathe: hold the smallest assembled state that proves the message, with one
  living motion such as a drift, a value change or a focus shift.
- Resolve: settle or hand off to the next cut. No unrelated late entrance.

## Depth

Flat fades read as slides. Use a few flat layers at different `translateZ`
values inside a perspective container, tilt the rig by a few degrees with
`rotationY` or `rotationX`, and drift background and foreground in opposite
directions by 20-30 percent of the hero's movement. Never scale a full-scene
wrapper as a camera zoom; the viewer's editor owns zoom.

## Colour

Choose one accent hue for the whole film and keep the background family
constant. Tint neutrals toward the accent rather than using dead grey. Avoid
full-screen linear gradients on dark backgrounds because H.264 bands them;
use a solid colour plus a soft radial glow. A violet-to-blue gradient and a
cyan glow on near-black are overused defaults; pick something with intent.

## Anti-patterns

- The same entrance on every element.
- Whole interfaces appearing in one beat.
- Type smaller than 24px except for labels and metadata.
- Decoration that competes with the message.
- Motion on wall-clock time instead of the timeline.
