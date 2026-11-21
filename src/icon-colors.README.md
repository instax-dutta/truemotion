# icon-colors.json

Generated map of `slug -> brand hex` used by `{{ICON:slug}}` when no `/mono`
variant is requested.

- Source: the `simple-icons` dataset, CC0-1.0 (https://simpleicons.org).
- Transformation: each icon's `slug` and `hex` fields were copied into a compact
  JSON object. Paths themselves come from `@iconify-json/simple-icons` (CC0-1.0)
  at render time and are not vendored here.
- Regenerate from a temporary `simple-icons` install with:

```js
import * as si from 'simple-icons';
import fs from 'node:fs';
const colors = {};
for (const icon of Object.values(si)) if (icon?.slug && icon?.hex) colors[icon.slug] = icon.hex;
fs.writeFileSync('src/icon-colors.json', JSON.stringify(colors));
```
