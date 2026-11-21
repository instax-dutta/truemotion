# Changelog

## 0.3.0

- Replaced all recovered skill documentation with original MIT-licensed references.
- Added a static seek-safety lint that rejects `from()`, external resources,
  timers, `requestAnimationFrame`, CSS keyframes and transitions.
- Added `still`, `optimize-assets`, `selftest`, `list_skills` and `render_video`.
- Added resolution scaling, system Chrome support, time ranges and parallel
  frame rendering with `--concurrency`.
- Injected a local-only CSP into every scene.
- Added a standalone ffmpeg asset optimiser and safe export filenames.
- Added path-based element IDs for unlabelled actors in evolved reads.
- Adopted the typing runtime's explicit flush registry and blinking cursor for
  seek-accurate character reveals.
- `review_timeline` now returns one contact sheet instead of one image per scene.
- Hardened state loading with per-scene validation and atomic saves with unique
  temporary names.
- Trimmed generated media from the npm tarball.
- Added a reproducible benchmark and recorded measured package/runtime footprint.
- Replaced `playwright` with `playwright-core` and system-Chrome resolution to
  remove the browser downloader and shrink the dependency tree.
- Replaced the 26 MiB `simple-icons` runtime dependency with Iconify's CC0 path
  data and a 69 KiB generated colour map, preserving `{{ICON:slug}}` tokens.
- Added a formal reverse-engineering audit with status and evidence per finding.
- Added pinned-Chromium golden-frame regression coverage in CI.
- Added a standalone deterministic `{{ROUGH}}` hand-drawn helper with unit and
  golden-frame coverage.
- Added a standalone `{{FX}}` inline-CSS effects helper with unit and
  golden-frame coverage.
- Added a standalone `{{SHADERS}}` CSS utility layer with unit and golden-frame
  coverage.
- Added state-driven `{{BRAND:*}}` tokens with CSS variables and inlined logo,
  with unit and golden-frame coverage.
- Added built-in and state-defined `{{COMPONENT:*}}` snippets with unit and
  golden-frame coverage.
- Added a local CSS-3D `{{THREE}}` helper with unit and golden-frame coverage;
  all documented authoring tokens are now supported locally.
- Added a shared all-token scene used by the shipped demo and an MCP end-to-end
  regression, with golden fixtures proving every helper works together.
- Replaced disk-staged rendering with bounded, backpressure-aware frame streaming
  into ffmpeg via `image2pipe`. Added `--batch-size` / `batchSize`, encoder unit
  tests, an e2e streaming regression and a long-form benchmark with peak RSS.
- Added a reproducible multi-minute 1080p long-form benchmark with whole-process-tree RSS sampling; confirmed flat memory across 400 and 1200 frames and a 25% RSS reduction at `--concurrency 1`.
- Added crash-resumable rendering with MPEG-TS segment checkpoints, a byte-verified manifest, `--segment-size`, `--max-segments`, `--resume` and `--keep-checkpoints`, with unit and MCP e2e coverage.
- Added a scene/brand/component digest to the checkpoint manifest so `--resume` rejects a state file edited since checkpointing.
- Extended that digest to hash `{{ASSET:...}}` file contents, and fixed `render_video` to pass the assets directory so MCP resumes detect asset edits.
- Made skill-read caching fingerprint-based so edited skill files or a changed `--skill` directory invalidate stale entries.
- Added A/V alignment coverage (looping bed, duration within 50 ms, measured fade-out); no drift found.

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
