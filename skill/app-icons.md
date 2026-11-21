# App Icons (Simple Icons)

OpenMotion includes the full **Simple Icons** library (~3,400 brand SVGs). Use `{{ICON:slug}}` in scene HTML — OpenMotion inlines them as data URLs at preview/export (no external requests).

## Basic usage

```html
<div class="icon-row" style="display:flex;gap:16px;align-items:center;">
  <img src="{{ICON:notion}}" alt="" width="56" height="56" style="border-radius:14px;" />
  <img src="{{ICON:gmail}}" alt="" width="56" height="56" style="border-radius:14px;" />
  <img src="{{ICON:discord}}" alt="" width="56" height="56" style="border-radius:14px;" />
  <img src="{{ICON:googlesheets}}" alt="" width="56" height="56" style="border-radius:14px;" />
</div>
```

## Token variants

| Token | Result |
|-------|--------|
| `{{ICON:notion}}` | Official brand color |
| `{{ICON:notion/mono}}` | White monochrome (good on dark backgrounds) |
| `{{ICON:discord/mono/1a1a2e}}` | Monochrome with custom hex (no `#`) |

## Slug lookup

Slugs match [simpleicons.org](https://simpleicons.org). Common aliases:

| You might say | Slug used |
|---------------|-----------|
| Sheets, Google Sheets | `googlesheets` or `sheets` |
| Docs | `googledocs` or `gdocs` |
| Drive | `googledrive` or `gdrive` |
| Mail | `gmail` |
| Twitter | `x` |
| Teams | `microsoftteams` or `teams` |

## Curated popular slugs

`notion`, `gmail`, `googlesheets`, `googledocs`, `googledrive`, `googlecalendar`, `googlemeet`, `figma`, `linear`, `asana`, `trello`, `jira`, `confluence`, `airtable`, `dropbox`, `zoom`, `microsoftteams`, `microsoftoutlook`, `microsoftexcel`, `salesforce`, `hubspot`, `stripe`, `shopify`, `discord`, `github`, `gitlab`, `vercel`, `openai`, `anthropic`, `claude`, `spotify`, `youtube`, `instagram`, `linkedin`, `apple`, `google`, `microsoft`, `canva`, `miro`, `loom`, `calendly`, `paypal`, `uber`, `airbnb`

Any slug on [simpleicons.org](https://simpleicons.org) works — search there if unsure. Some brands are periodically removed from the library (e.g. Slack); use a nearby alternative or upload a custom asset.

## Floating icon field pattern

For the `floating-icon-field` block style, stagger icons on the timeline:

```html
<div class="icon-field" style="position:absolute;inset:0;">
  <img class="float-icon i1" src="{{ICON:notion/mono}}" alt="" width="64" height="64" />
  <img class="float-icon i2" src="{{ICON:discord/mono}}" alt="" width="52" height="52" />
  <img class="float-icon i3" src="{{ICON:gmail/mono}}" alt="" width="48" height="48" />
</div>
<script>
  // after {{GSAP}}
  tl.fromTo('.i1', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }, 0.2);
  tl.fromTo('.i2', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }, 0.35);
  tl.fromTo('.i3', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }, 0.5);
</script>
```

Put icons on a frosted dock with `border-radius`, soft `box-shadow`, and optional white `/mono` variants on dark gradients.

## Rules

- **Static HTML** — put tokens directly on `<img src>`:
  ```html
  <img src="{{ICON:notion/mono/0d0d0d}}" alt="" width="48" height="48" />
  ```
- **JS-built icons** — use `__OM_ICON__` (OpenMotion injects the resolver automatically when you use this pattern):
  ```javascript
  const ICONS = [{ slug: 'notion', label: 'Notion' }];
  ICONS.forEach((icon) => {
    const img = document.createElement('img');
    img.src = __OM_ICON__(icon.slug + '/mono/0d0d0d');
  });
  ```
- **Never** wrap tokens in template literals like `` `{{ICON:${icon.slug}/mono}}` `` — injection cannot see inside `${…}` and the browser gets a broken `{{ICON:…}}` URL.
- **Brand logos** → `{{ICON:slug}}` or `__OM_ICON__(slug + '/mono/hex')` (never emoji, never guessed SVG paths).
- **Generic UI** (chevrons, plus, menu) → inline Lucide SVG (see scene-contract.md).
- Never hotlink `simpleicons.org` or other URLs — tokens only.
- Animate the **wrapper** (`<div>` around icons) with GSAP when possible.
