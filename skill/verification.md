<!-- SPDX-License-Identifier: MIT -->
# Verification

Run `review_timeline` before finishing. It renders three checkpoints per
scene and returns one contact sheet plus a note for each scene.

## What the auditor measures

- Percentage of pixels changing in the build and in the final 40 percent.
  Very low numbers mean a static slide or a dead hold.
- Whether `window.__SCENE_DURATION__` matches the scene's `durationSec`.
- Whether more than one GSAP timeline was created.
- External network requests, script errors, clipped actors and text below
  18px.
- At an evolved cut, the pixel difference between the previous last frame and
  the new first frame.

## How to react

- A static slide: add a real entrance sequence, not a longer fade.
- A dead hold: add one meaningful progression in the resolve, such as a value
  change, a focus shift or a slow parallax drift.
- A clipped actor: adjust its size or position; deliberate crops should use a
  wrapper with `overflow: hidden` so the actor stays inside the frame.
- A duration mismatch: set the literal duration in the scene to the
  `durationSec` passed to the tool.
- External requests: replace them with the injection tokens.

## Human checks the auditor cannot make

- Does the scene answer the brief?
- Is the hierarchy obvious at a glance?
- Is the type readable and free of awkward line breaks?
- Does the composition feel intentional rather than assembled from defaults?
- Would you be comfortable showing the frame with your name on it?

Fix one clear issue per iteration and re-read the returned frames. Do not
rewrite a whole scene because one detail is wrong.
