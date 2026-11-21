<!-- SPDX-License-Identifier: MIT -->
# Brand tokens

`{{BRAND:*}}` tokens resolve from the `brand` object in the state file. There is
no scraper and no external service; the values come from the project you author.

```json
{
  "brand": {
    "primary": "#F5A524",
    "background": "#0B0E14",
    "text": "#F3EFE9",
    "accent": "#F5A524",
    "muted": "rgba(243,239,233,0.62)",
    "logo": "assets/logo.svg"
  }
}
```

## Tokens

| Token | Result |
| --- | --- |
| `{{BRAND:primary}}` | The primary hex value. |
| `{{BRAND:background}}`, `{{BRAND:text}}`, `{{BRAND:accent}}`, `{{BRAND:muted}}` | Corresponding brand values. |
| `{{BRAND:logo}}` | The logo file as an inline data URL, read from the assets directory. |

Every value is also injected as a CSS variable at `:root`, so you can write
`var(--brand-primary)` instead of a token when you want a style rule rather than
a literal substitution. Missing keys resolve to an empty string; `logo` paths
that escape the assets directory are rejected.

Use brand tokens for colour decisions so a single state-file edit re-themes the
whole film. Keep one accent hue and hold it across every scene.
