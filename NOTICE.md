# NOTICE

## Origin

TrueMotion was reconstructed from the public behaviour and bundled artifacts of
**OpenMotion 1.1.0**, a macOS Electron application signed by "Meta Dots" whose
updater points at `anovius/openmotion`. The upstream repository is not public.
The MCP tool contract, scene format and rendering approach were recovered by
static inspection; the implementation in `src/` and `bin/` is original work
written for this project.

## License of this repository

- All source in `src/`, `bin/`, `test/`, the demo scripts in `examples/` and the
  reference documents in `skill/` is MIT licensed. See [LICENSE](LICENSE).
  Every skill document carries an `SPDX-License-Identifier: MIT` header.
- Earlier releases shipped Markdown recovered from OpenMotion 1.1.0. Those
  files have been **replaced** with original documentation written for this
  project. The MCP tool contract and scene format remain compatible, but no
  recovered prose remains in the repository.

## Third-party components

TrueMotion does not bundle these, it declares them as dependencies. Their own
licenses govern their use:

| Component | License |
| --- | --- |
| `@modelcontextprotocol/sdk` | MIT |
| `gsap` | GSAP Standard License (no charge, not OSI-approved) |
| `zod` | MIT |
| `playwright` | Apache-2.0 |
| `pngjs` | MIT |
| `@iconify-json/simple-icons` | CC0-1.0 |
| `@fontsource/archivo`, `@fontsource/jetbrains-mono` | SIL OFL 1.1 |
| `ffmpeg` (external executable used by `render`) | LGPL/GPL depending on build |

`src/icon-colors.json` is a generated 69 KiB map of icon slug to brand hex,
derived from the CC0-1.0 simple-icons dataset. It records the upstream source
and license here rather than implying an MIT grant over that data.

Remotion is deliberately **not** used. It has a two-tier license that requires a
company license for larger organisations.
