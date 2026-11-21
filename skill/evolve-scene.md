<!-- SPDX-License-Identifier: MIT -->
# Evolving a scene

This is the practical checklist for adding scene two or later as a connected
beat.

1. Call `read_scene` with the previous scene id and `purpose: "evolve"`. You
   receive the full HTML, a guide, and measured exit states.
2. Copy the HTML into your draft. Do not start from an empty document.
3. Keep the `.frame` background declaration unchanged.
4. Keep the same `data-om-id` values for actors that remain visible.
5. Add `tl.set()` calls at time zero using the exact exit values. For example:
   `tl.set('[data-om-id="headline"]', { x: 0, y: -120, scale: 0.6, opacity: 1 }, 0);`
6. Add the new beat's tweens after those locks. Give new actors fresh ids.
7. Call `add_scene` with `evolveFromSceneId` set to the previous id.
8. If the cut is rejected, study the two attached frames and correct the locks.
   If the beat is intentionally unrelated, call `add_scene` again with
   `freshStart: true` instead.

Do not re-run an actor's original entrance tween in the evolved scene. The
actor is already on screen at frame zero; re-entering it creates a visible pop.

Do not change the background "just slightly". A matched cut depends on a
pixel-identical field. A background change means you want a hard cut.
