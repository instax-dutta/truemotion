# NOTICE

## Origin

TrueMotion was reconstructed from the public behaviour and bundled artifacts of
**OpenMotion 1.1.0**, a macOS Electron application signed by "Meta Dots" whose
updater points at `anovius/openmotion`. The upstream repository is not public.
The MCP tool contract, scene format and rendering approach were recovered by
static inspection; the implementation in `src/` and `bin/` is original work
written for this project.

## License of this repository

- Source code in `src/`, `bin/`, `test/` and the demo scripts in `examples/` is
  MIT licensed. See [LICENSE](LICENSE).
- The Markdown references in `skill/` were recovered from the OpenMotion
  application. No license for them has been published by their copyright
  holder. They are kept in a separate directory, are **not** covered by this
  repository's MIT grant, and are included for interoperability and reference.
  Confirm your right to redistribute them before publishing a fork or a package
  that contains them.

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
| `simple-icons` | CC0-1.0 |
| `@fontsource/archivo`, `@fontsource/jetbrains-mono` | SIL OFL 1.1 |
| `ffmpeg` (external executable used by `render`) | LGPL/GPL depending on build |

Remotion is deliberately **not** used. It has a two-tier license that requires a
company license for larger organisations.
