# Shot Direction: Build Products From Actors

This is the default directing system for users who do not speak motion-design language. A product video is not a website tour. Never load a complete interface and then animate the container. Direct attention by revealing a small number of meaningful actors in sequence.

## 1. Lock the visual system before scene 1

Choose these once and keep them across the video:

- **Type:** one Display family/weight for claims, one Body family for UI, optional Mono for data. State why the pairing fits the product. Use the video scale table, not website sizes.
- **Color roles:** background, surface, primary text, muted text, one accent. Do not collect unrelated hex values.
- **Spacing:** one base unit (normally 8 or 10px); use multiples for gaps and padding. Pick one corner language (sharp / 8–12px / 20px+) and one shadow/light direction.
- **Background recipe:** one family for the video and one slowly animated property. Background motion supports the hero; it never becomes a second hero.

If a brand kit exists, derive every choice from it. Otherwise choose from design-directions.md and typography.md. Do not ask a raw user to choose fonts, hex codes, spacing, easing, or 3D technique.

## 2. Decompose UI into actors

The interface is a set of components, not one screenshot-like block. Give every component wrapper a stable ID:

```html
<section data-om-id="checkout-shell">…</section>
<div data-om-id="amount-card">…</div>
<div data-om-id="payment-methods">…</div>
<button data-om-id="pay-action">…</button>
<div data-om-id="approval-state">…</div>
```

For each shot, write an internal actor order before authoring HTML:

1. **Hero actor** — the one thing the viewer must notice.
2. **Action actor** — the interaction or state change.
3. **Evidence actors** — at most 2–3 details that prove the claim.
4. **Context actor** — optional fragment that establishes where this lives.
5. **Handoff actor** — the element that carries energy into the next beat.

If an element has no role or motion verb, omit it. DOM order is not reveal order.

## 3. Choose a framing mode per shot

Do not default to the whole interface. Rotate framing modes across the video; never repeat the same mode twice in a row.

| Framing mode              | What the viewer sees                                                                     | Best use                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Component isolation**   | One card, field, row, button, chart, or token at hero scale                              | Feature claim or interaction                             |
| **Macro crop**            | A corner/edge/detail enlarged beyond the frame; surrounding UI clipped or softly blurred | Texture, speed, premium detail                           |
| **Component assembly**    | 3–5 actors arrive one beat at a time and form a meaningful subset                        | Explaining how a workflow works                          |
| **Depth stack**           | Components separated in Z with overlap and occlusion; front actor sharp, context quieter | Relationships and hierarchy                              |
| **Full-interface payoff** | The assembled product, readable and large, after the audience understands its parts      | Use at most once unless the brief requires a walkthrough |
| **True-3D product shot**  | Physical geometry with material, light, shadow, occlusion, and world camera              | Cards, devices, packages, spatial data                   |

A UI crop may intentionally show only 20–60% of a shell. A contextual layer can be blurred with a static CSS filter while the hero stays sharp. Blur is a depth cue, not decoration; do not animate expensive blur continuously.

## 4. Choreograph components instead of loading them

- At the first checkpoint, show only the hero or an intentional contextual fragment. Never show every component waiting for animation.
- Reveal one major component per beat. Sibling micro-elements may cascade together, but they count as one actor.
- Product/UI assembly may use **BUILD through 60–70%** of the shot. Each actor gets 0.25–0.7s; overlap beats slightly. Do not compress five meaningful components into a 0.4s stagger.
- The payoff is the smallest state that proves the message. It does not need to be the entire application.
- Keep one actor alive after it lands: a cursor move, value change, chart draw, parallax drift, focus shift, or 3D light/camera response.
- Change state in place: field → value → approval, row → risk score → blocked, card → exploded parts → card. Prefer transformation over replacement.
- Use `data-om-id` on every meaningful actor and keep IDs stable through transforms/evolved scenes.

For a 4–6s UI shot, the default cadence is:

1. 0–15%: establish the hero fragment.
2. 15–65%: assemble or transform 2–4 supporting actors one by one.
3. 65–88%: readable payoff with one living motion.
4. 88–100%: settle or hand off; no unrelated late entrance.

Typography-only shots may keep the shorter 0–35% BUILD rule.

## 5. Direct the background

Choose exactly one background structure:

- tinted solid with a moving light falloff;
- oversized cropped type/number at very low contrast;
- sparse grid or ruled field with slow translation;
- layered paper/noise texture with fixed seed;
- true-3D floor/backdrop with a moving light or camera;
- a cropped, blurred contextual UI layer behind the hero component.

Animate one property slowly: position, light direction, gradient focal point, parallax translation, or 3D camera angle. Avoid default glowing orbs, mesh gradients, and decorative particles. Flat color is valid when typography or product detail is already visually strong.

## 6. True 3D must read as physical

Use true-3d.md only when geometry adds meaning. The object must separate from the background through silhouette and lighting. Across checkpoints, reveal at least two of: thickness, side face, shadow travel, material response, occlusion, or perspective change. A black rectangle on a black floor with a two-degree orbit is technically 3D but visually flat and fails.

## Reject these outputs

- Whole UI visible at the first checkpoint.
- Small complete dashboard centered inside a large empty frame.
- Same top-left headline plus centered panel in consecutive scenes.
- Every component using the same fade-up.
- Full-interface views in every scene.
- Background added as generic glow/gradient filler.
- UI details too small to read at playback size.
- Components without stable `data-om-id` wrappers.

The test: if cropping the frame into a still makes it look like a landing-page screenshot, it needs stronger shot direction.
