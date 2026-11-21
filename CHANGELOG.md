# Changelog

## 0.2.0

- Added measured feedback: pixel-diff ratios for static slides and dead holds,
  duration/timeline mismatch, external requests, script errors, clipped actors
  and tiny-text checks.
- Added `review_timeline` MCP tool.
- Evolved `add_scene` now rejects visible matched-cut jumps and attaches both
  frames to the error.
- `read_scene` with `purpose:"evolve"` returns measured actor exit states.
- Seeks now fire GSAP `onUpdate` callbacks, so proxies, counters and typed text
  survive frame-accurate export.
- Renderer supports `--crf` and `--audio` with loop and fades.
- Added the six-scene `pro-demo.mjs` with a generated stereo ambient score.

## 0.1.0

- Initial stdio MCP server with seven tools, state file, scene contract
  validation, local injection, Playwright frame renderer and ffmpeg encoding.
