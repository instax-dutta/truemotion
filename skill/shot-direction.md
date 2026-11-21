<!-- SPDX-License-Identifier: MIT -->
# Shot direction

Read when creating a scene. Decide the framing and actor order before writing
markup.

## Name the shot

Write one sentence: what does the viewer understand at the end of this scene?
Everything that does not serve that sentence is removed.

## Choose a framing mode

- **Hero type**: a single large statement, a quiet background, one accent.
- **UI fragment**: a cropped piece of an interface, large enough to read, with
  surrounding context deliberately cut away.
- **Comparison**: two panels or two states side by side with a clear seam.
- **Data moment**: one number or one relationship, with a label that tells the
  viewer what to notice.

Pick one. Mixing a hero statement with a full interface and a data panel in a
single shot produces noise.

## Decompose actors

Treat each meaningful element as an actor with a role and a verb.

| Role | Job |
| --- | --- |
| Hero | Carries the message. Moves first or settles last. |
| Evidence | Proves the claim. Arrives after the hero. |
| Context | Anchors the viewer. Usually quiet and static. |
| Handoff | Points to the next scene. Appears only at the resolve. |

Give each actor a stable `data-om-id`. If you cannot name an actor's role and
verb, delete it.

## Background and depth

Choose one directed structure: a fine grid, a soft radial glow, a solid field
with a rule, or layered planes. Animate one property slowly. Add a vignette if
the edges need weight. Keep the background below 25 percent contrast so type
stays legible.

## Assembly order

A component-based shot should not be complete at the first checkpoint. Bring
in the hero, then one meaningful component at a time, then a label or value.
Stagger siblings tightly and separate major beats widely. A viewer should be
able to describe each step as it happens.

## Framing checks

- Content fills the composition or is deliberately cropped; tiny centred UI
  reads as a placeholder.
- No element extends past the frame edge unless the crop is intentional.
- Text is large enough to read at playback size.
- The first and last sampled frames are meaningfully different.
