<!-- SPDX-License-Identifier: MIT -->
# Typography

Read on every composition. Video type has different constraints from web type.

## Available families

The scene injector supplies three families as data URLs. Use only these names.

| Family | Weights | Role |
| --- | --- | --- |
| `Display` | 600, 900 | Headlines and large statements. |
| `Body` | 300, 400 | Supporting copy. Use 300 on dark backgrounds. |
| `Mono` | 500 | Labels, indices, metadata, counters. |

A strong default pairing is Display 900 for the hero and Body 300 for support.
Extreme weight contrast reads at a glance; two mid weights do not. Mono is a
third voice, not a substitute for Body.

## Sizes

- Hero headline: 100-160px.
- Section headline: 56-80px.
- Body copy: 28-42px.
- Labels and metadata: 18-24px. Text below 18px is flagged by the auditor.

Tighten display tracking to roughly -0.03em to -0.05em. On dark backgrounds
light text appears heavier and tighter, so use lighter weights and slightly
more line height.

## Numbers

Any aligned digits need `font-variant-numeric: tabular-nums`. Without it a
counter jitters as values change.

## Reading time

A line on screen for three seconds must be readable in two. Prefer cutting
words over shrinking type. Keep each scene to roughly twelve words or fewer.
Sequence is hierarchy: the first word to move is the most important.

## Motion is typography

A 0.15s slam and a 2s fade on the same word say different things. Choose the
entrance to match the meaning, and use stagger order rather than size alone to
rank several lines.
