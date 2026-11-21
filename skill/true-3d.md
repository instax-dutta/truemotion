# True 3D (Three.js + OM3D)

Use this only when the shot genuinely needs geometry, material response, occlusion, studio lighting, shadows, or a perspective camera moving through world space. For flat UI screenshots and typography, CSS 2.5D remains lighter and easier to edit.

## Contract

1. Put a full-frame `<canvas>` inside `.frame` and include `{{THREE}}` before scene code.
2. Create one `OM3D` stage. OpenMotion bundles Three.js locally; never import a CDN.
3. Create the one paused GSAP timeline required by every scene.
4. Call `stage.bindTimeline(tl, duration, onFrame)` **after** adding DOM tweens. `onFrame(time, stage)` must derive every 3D transform from absolute time.
5. Never use `requestAnimationFrame`, `THREE.Clock`, `setAnimationLoop`, physics deltas, pointer input, or random values without a fixed seed.
6. Set renderer pixel ratio to 1 (OM3D does this) so preview and export match.

## Minimal setup

```html
<canvas id="world"></canvas>
{{THREE}} {{GSAP}}
<script>
  const T = THREE;
  const stage = OM3D.create({
    canvas: '#world', width: {{W}}, height: {{H}},
    background: '#07090d', camera: [0, 1, 7], target: [0, 0, 0],
    fov: 34, exposure: 1.15, shadows: true
  });
  OM3D.addStudioLights(stage, { rimColor: 0x77aaff });

  const hero = new T.Mesh(
    new T.IcosahedronGeometry(1.35, 3),
    new T.MeshStandardMaterial({ color: 0x9fc7ff, metalness: 0.75, roughness: 0.2 })
  );
  hero.castShadow = true;
  stage.scene.add(hero);

  const tl = gsap.timeline({ paused: true });
  stage.bindTimeline(tl, 5, (time, world) => {
    hero.rotation.y = time * 0.7;
    hero.rotation.x = Math.sin(time * 0.6) * 0.14;
    world.camera.position.x = Math.sin(time * 0.28) * 0.45;
  });
  window.__SCENE_TIMELINE__ = tl;
  window.__SCENE_DURATION__ = 5;
</script>
```

## Quality rules

- Use `MeshStandardMaterial` or `MeshPhysicalMaterial`; unlit basic materials look like debug geometry.
- Use one hero object, one supporting structure, and one restrained light rig. More geometry is not more premium.
- Give objects thickness. A product screen can be a thin `BoxGeometry`; a card stack should not be flat DOM planes when side faces are visible.
- Use metalness only for objects that should behave like metal. Keep roughness above approximately 0.15 so highlights do not alias during export.
- Prefer a 30–45° field of view. Very wide lenses distort product shots.
- Camera travel should be small and motivated. Change position or target, not both aggressively.
- Shadows are opt-in because they cost render time. Enable them only when contact with a floor or object stack matters.
- Keep DOM typography above the canvas. Three.js is for the dimensional subject; HTML remains better for crisp editable copy.

## Choosing the correct system

| Shot                                                    | Use                                              |
| ------------------------------------------------------- | ------------------------------------------------ |
| Headline with layered words                             | CSS/GSAP                                         |
| Browser screenshot tilting into place                   | CSS 2.5D screen-flyout                           |
| Dashboard cards at several depths                       | CSS 2.5D unless side thickness/occlusion matters |
| Metallic icon, rotating device, sculpted form           | True 3D                                          |
| Cards/books visibly stacked with side faces and shadows | True 3D                                          |
| Full-frame zoom into existing DOM UI                    | User Camera tool                                 |
| Camera orbiting a 3D object                             | OM3D world camera                                |

## Current scope

The bundled foundation intentionally covers procedural Three.js geometry, materials, lighting, shadows, and deterministic camera motion. Do not claim GLB/GLTF, HDRI, physics, or post-processing support yet.
