<!-- SPDX-License-Identifier: MIT -->
# Continuity

Read whenever a video has more than one scene. A cut is either a hard cut or a
matched cut. Decide which one you are making.

## Hard cut

A hard cut changes composition, background or cast deliberately. Use
`freshStart: true` when adding the scene. No continuity check is applied. Hard
cuts are legitimate between distinct beats of a story.

## Matched cut

A matched cut keeps the same background and the same visible actors. Use
`read_scene(previousId, purpose: "evolve")` before writing the next scene. The
response includes measured exit states for every `data-om-id` actor: their
position, scale, rotation, opacity and rendered rectangle at the previous
scene's final frame.

To make the new scene continue from that frame:

1. Fork the previous HTML verbatim.
2. Keep the `.frame` background identical.
3. For each continuing actor, add a `tl.set()` at position zero using the exact
   values from the exit states.
4. Then animate only what the new beat needs.

The renderer compares the previous last frame with the new frame zero. More
than 18 percent changed pixels is rejected with both frames attached; more
than 6 percent is reported as a warning. Intentional ambient drift can account
for a small percentage.

## Actors that end hidden

If an actor's exit state reports `visible: false`, do not show it at frame zero
of the next scene. Reintroducing it later is a new entrance.

## Handoffs

A handoff element belongs to the previous scene's resolve and the next scene's
first beat. Give it the same `data-om-id` in both so its continuity is explicit.

## Debugging a rejected cut

Compare the two attached images. If the whole frame changed, you likely used a
new background or omitted the `tl.set()` locks. If only one actor changed, it
was animated again from its original entry state instead of its exit state.
