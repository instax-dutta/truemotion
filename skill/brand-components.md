# Brand Components

Read when the project has a brand kit with UI components (product demos, dashboards, SaaS UI, feature screens).

## Why components exist

Brand kits store **real UI HTML** scraped or imported from the user's product. Your job is to **embed** that HTML — not redraw it from memory.

## How to embed

Place the token inside `.frame` where the UI should appear:

```html
<div class="frame" id="frame">
  <img src="{{BRAND:logo}}" alt="" style="position:absolute;top:32px;left:32px;height:48px;width:auto;" />
  <div class="ui-stage" style="position:absolute;inset:80px 120px;display:flex;align-items:center;justify-content:center;">
    {{COMPONENT:component-id-here}}
  </div>
</div>
```

Replace `component-id-here` with the exact id from the brand kit prompt (e.g. `{{COMPONENT:a1b2c3d4-...}}`).

## Layout rules

- Wrap `{{COMPONENT:id}}` in a positioned container — scale/animate the wrapper with GSAP, not individual nodes inside the component unless necessary.
- Keep brand colors on `.frame` and surrounding chrome via `var(--brand-primary)`, `var(--brand-background)`, etc.
- Animate the component **entering** (fade, slide, scale) as a unit on the timeline.
- If the scene is a product demo, the component should be the **hero** — at least 50% of frame area.

## Logo usage

The logo is **NOT mandatory**. Add `{{BRAND:logo}}` only when the user explicitly asks for the logo, or for a closing CTA / logo-sting outro. Do **not** place it in a header or chrome of every scene by default. Use only `{{BRAND:logo}}` or `{{ASSET:assets/brand-logo.*}}` — never `assets/logo.png` or external URLs.

## Do not

- Recreate the UI in fresh HTML/CSS when a matching component exists
- Use external `<link>` or `@import` inside component markup
- Use emoji or stock illustrations instead of the brand component
- Omit `{{FONTS_CSS}}` — brand fonts load through that token
