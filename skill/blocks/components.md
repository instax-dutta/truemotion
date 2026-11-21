<!-- SPDX-License-Identifier: MIT -->
# Reusable components

`{{COMPONENT:id}}` expands to a small HTML snippet. Built-ins are available
without configuration; a state file can override or add components.

```html
<div class="stage">{{COMPONENT:card}}{{COMPONENT:button}}</div>
```

```json
{
  "components": {
    "cta": "<button class='om-btn' data-om-id='cta'>Install now</button>"
  }
}
```

## Built-ins

| Id | Snippet |
| --- | --- |
| `button` | Primary call-to-action button. |
| `card` | Title and supporting copy in a bordered card. |
| `stat` | Large tabular figure with a mono label. |
| `pill` | Small outlined mono label. |
| `promptbar` | Wide prompt or input bar. |

Built-ins use the injected brand variables and an injected stylesheet with
classes `.om-btn`, `.om-card`, `.om-stat`, `.om-pill` and `.om-promptbar`. Put
`data-om-id` on components you intend to continue across scenes. Unknown ids
expand to an empty string, and ids containing path characters are rejected.

Components are markup, not behaviour: animate them on the single GSAP timeline
just like hand-written elements.
