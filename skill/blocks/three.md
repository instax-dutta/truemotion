<!-- SPDX-License-Identifier: MIT -->
# CSS-3D stages

`{{THREE}}` injects a small local helper on `window.OM3D`. It builds depth with
CSS perspective and transforms, not WebGL. Use it for layered planes, cards and
typography in space, not for physically lit geometry or materials.

```html
<div class="frame"><div id="stage"><div class="back">...</div><div class="front">...</div></div></div>
{{THREE}}
<script>
const world = OM3D.create('#stage', { perspective: 900, maxRotation: 6 });
world.addPlane('.back', { x: 140, y: 160, z: -150 });
world.addPlane('.front', { x: 420, y: 320, z: 60, rotationY: 12 });
const tl = gsap.timeline({ paused: true });
tl.to({ v: 0 }, { v: 1, duration: 4 }, 0); // keep the timeline length explicit
world.bindTimeline(tl, 4);
window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 4;
</script>
```

## API

| Call | Result |
| --- | --- |
| `OM3D.create(target, { perspective, maxRotation })` | Creates a stage and returns a world object. |
| `world.addPlane(target, { x, y, z, rotationX, rotationY })` | Positions a plane in the stage. |
| `world.bindTimeline(tl, duration, onFrame)` | Drives a subtle rig tilt from timeline time; returns the update function. |

`bindTimeline` patches `seek`, so the rig is correct on a cold seek during
export. Give the timeline a real duration with a harmless proxy tween; an empty
timeline clamps seeks to zero. Keep rotation small and never scale the whole
stage as a camera zoom, since zoom belongs to the viewer's editor.
