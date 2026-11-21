# Typing Input — Prompt Bar + Character Reveal

Use when the user asks for an **input box**, **prompt bar**, or **text being typed**. `window.OMTyping` is injected in every scene (scene bridge) — no token required.

> **Read this file** whenever a scene shows typing in a search bar, chat input, or prompt field.

---

## Why typing goes invisible (avoid this)

The #1 bug: GSAP `from()` on the **same element** that receives typed text (`opacity: 0`, `y`, `z`, `scale`). The proxy writes characters while the element is still faded or off-position.

**Rules:**
- Typing target: empty `<span id="typed-content" data-om-typed>` — **never** `tl.from()` on it.
- Entrance: animate the **bar wrapper** (`#prompt-bar`, `.input-row`) — not `#typed-content`.
- Use `OMTyping.attach()` — it forces `opacity: 1` and resets `x/y/z` on the typing target at start.
- Add class `om-typing-host` on the bar wrapper for safe z-index/overflow CSS.
- Do **not** use `<input>` or `contenteditable` — use a `<span>` + proxy (seek-accurate export).
- Prefer `OMTyping.attach()` over hand-rolled proxies — the bridge re-flushes all proxy `onUpdate` handlers after every seek.

---

## Block: `typing-prompt-bar`

```html
<div class="prompt-bar om-typing-host" id="prompt-bar" data-om-id="prompt-bar">
  <div class="input-row om-input-row" id="input-row">
    <div class="prompt-text">
      <span id="typed-content" class="om-typed-target" data-om-typed></span>
      <span class="type-cursor" id="type-cursor"></span>
    </div>
    <button class="gen-btn" type="button">Generate</button>
  </div>
</div>
<style>
.prompt-bar {
  width: min(88%, 720px);
  background: rgba(10, 20, 55, 0.9);
  border: 2px solid rgba(77, 144, 255, 0.45);
  border-radius: 16px;
  padding: 0 24px;
  box-shadow: 0 0 60px rgba(77, 144, 255, 0.2);
}
.input-row {
  display: flex; align-items: center; gap: 16px; min-height: 72px;
}
.prompt-text {
  flex: 1; font-size: 24px; color: rgba(255, 255, 255, 0.9);
  white-space: nowrap; overflow: hidden; display: flex; align-items: center;
}
.type-cursor {
  display: inline-block; width: 3px; height: 1.1em; background: var(--brand-primary, #4d90ff);
  margin-left: 2px; flex-shrink: 0;
}
.gen-btn {
  flex-shrink: 0; border: none; border-radius: 12px; padding: 12px 24px;
  font-size: 18px; font-weight: 600; color: #fff;
  background: var(--brand-primary, #4d90ff);
}
</style>
```

```js
const tl = gsap.timeline({ paused: true });
const PROMPT = 'Summarize my Q4 pipeline in one slide';

// Entrance on wrapper ONLY — not #typed-content
tl.fromTo('#prompt-bar', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, 0.2);

OMTyping.attach({
  timeline: tl,
  target: '#typed-content',
  row: '#input-row',
  cursor: '#type-cursor',
  text: PROMPT,
  start: 0.85,
  duration: 2.2
});

window.__SCENE_TIMELINE__ = tl;
window.__SCENE_DURATION__ = 6;
```

---

## Morph scenes (input → card)

If the bar morphs later, hide `.input-row` with a **separate** tween **after** typing finishes — never overlap typing with `opacity: 0` on `#input-row`.

```js
// Good: typing ends ~3s, morph hides row at 4.5s
tl.to('#input-row', { opacity: 0, height: 0, duration: 0.35, ease: 'power2.in' }, 4.5);
```

---

## Checklist

- [ ] `#typed-content` starts empty; text only via `OMTyping.attach` or proxy `onUpdate`
- [ ] No `tl.from('#typed-content', …)` or `from('.om-typed-target', …)`
- [ ] Bar has `om-typing-host`; typing row has `om-input-row` or `input-row`
- [ ] Prompt text color contrasts background (min 24px, not opacity 0 in CSS)
