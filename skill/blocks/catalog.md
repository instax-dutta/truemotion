<!-- SPDX-License-Identifier: MIT -->
# Block catalogue

Small shapes to compose. Each is deliberately incomplete: supply your own
colours, copy and timing.

## Rule reveal

A 3px line that grows from left to right.

```html
<div class="rule" data-om-id="rule"></div>
```
```css
.rule { height: 3px; width: 240px; background: var(--accent); }
```
```js
tl.fromTo('.rule', { scaleX: 0, transformOrigin: 'left center' },
                   { scaleX: 1, duration: 0.5, ease: 'expo.out' }, 0.1);
```

## Staggered list

Rows arriving from the same direction with a tight cascade.

```js
tl.fromTo('.row', { x: 40, opacity: 0 },
                  { x: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' }, 0.4);
```

## Counter

A proxy tween writing tabular figures.

```html
<span id="count" style="font-variant-numeric:tabular-nums">000</span>
```
```js
const value = { n: 0 };
tl.to(value, { n: 288, duration: 2.4, ease: 'power2.inOut',
  onUpdate: () => { document.getElementById('count').textContent =
    String(Math.round(value.n)).padStart(3, '0'); } }, 0.6);
```

## Progress line

A thin line that fills under a group of actors.

```html
<div class="track"><i></i></div>
```
```js
tl.fromTo('.track i', { scaleX: 0, transformOrigin: 'left center' },
                      { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0.8);
```

## Layered planes

Flat cards at different depths inside a perspective container.

```css
.stage { perspective: 1200px; }
.plane { transform-style: preserve-3d; }
```
```js
tl.fromTo('.plane--back', { z: -200, opacity: 0 }, { z: 0, opacity: 1, duration: 1 }, 0.2);
tl.to('.stage', { rotationY: 4, duration: 2, ease: 'sine.inOut' }, 1);
```

## Seam

Two panels separated by a vertical accent line. Animate `scaleY` of the seam
to close or open the comparison.
