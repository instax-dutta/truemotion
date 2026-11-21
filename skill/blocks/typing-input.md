<!-- SPDX-License-Identifier: MIT -->
# Typing input

Use for a prompt bar, search box or chat input where characters appear one at a
time. Typing must be seek-accurate, so the text is written by the timeline.

## Markup

```html
<div class="prompt-bar om-typing-host" id="prompt-bar">
  <div class="input-row" id="input-row">
    <span id="typed" data-om-typed></span><span id="cursor" class="cursor"></span>
  </div>
</div>
```

Keep the target span empty. Do not use an `<input>` or `contenteditable`: a
browser control does not respond to timeline seeking.

## Timeline

```js
const tl = gsap.timeline({ paused: true });
tl.fromTo('#prompt-bar', { y: 28, opacity: 0 },
                         { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.2);
OMTyping.attach({
  timeline: tl,
  target: '#typed',
  cursor: '#cursor',
  text: 'Describe the video you want',
  start: 0.8,
  duration: 1.6
});
window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 4;
```

`OMTyping` is injected by the renderer; there is no token to place.

## Rules

- Animate the bar wrapper, never the typing span. Applying opacity, y, z or
  scale to the span hides the characters.
- Do not overlap the end of typing with a fade of the row that contains it.
- When the bar later morphs into a card, hide the input row with a separate
  tween after typing finishes.
- Keep the cursor visible as a thin vertical bar in the accent colour.
