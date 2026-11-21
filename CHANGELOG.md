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
- Reused a single browser-page pool across all scenes in `renderVideo`, lowering 1080p peak tree RSS by 10.5% (1184 -> 1060 MiB at 400 frames) and cutting the 1200-frame render from 459.6 s to 177.7 s (2.6 -> 6.8 frames/s). Fixed a related realm bug where reused pages kept stale top-level declarations.
- Added a scene/brand/component digest to the checkpoint manifest so `--resume` rejects a state file edited since checkpointing.
- Extended that digest to hash `{{ASSET:...}}` file contents, and fixed `render_video` to pass the assets directory so MCP resumes detect asset edits.
- Made skill-read caching hash-based (SHA-256) so edited skill files, including same-size edits, invalidate stale entries.
- Added A/V alignment coverage (looping bed, duration within 50 ms, measured fade-out); no drift found. A two-minute multi-minute render measured 23 ms drift with a 5.1 dB tail fade, recorded in `docs/benchmarks/av-drift.md`.
- Added an explicit `schemaVersion` to state files with migration warnings for legacy/older files and rejection of newer schemas.
- Added genuine SIGKILL crash-resume tests: one after a checkpoint, one during a partially written MPEG-TS segment, verifying orphan files are discarded and re-encoded. Wired crash, A/V drift and schema validation into CI.
- Added an end-to-end test combining looping audio with segmented checkpoint/resume, verifying frame count, A/V duration alignment and tail fade after concatenation.
- Added a SHA-256 digest of the audio bed to the checkpoint manifest; changing the bed path or content between partial and resume is rejected.
- Added a real-browser e2e test verifying the injected CSP blocks external network requests while the scene timeline still runs.
- Added MCP-level tests that a newer state schema is rejected across tools, that edited skill files are re-read despite a populated cache, and that rejected writes leave the state file byte-identical.
- Partial render progress now reports the total frames of the selected time range instead of the whole timeline.
- Corrupt or structurally invalid checkpoint manifests are detected and trigger a clean full render, with unit and e2e coverage.
- Added an opt-in two-minute 1080p end-to-end test that renders a looping-audio film across four segments, interrupts after the first, resumes, and verifies 1200 frames plus A/V alignment and tail fade.
- Added unit and opt-in CLI coverage that reordering scenes changes the checkpoint digest and is rejected on resume without mutating the manifest.
- Added opt-in CLI coverage that fps, resolution or segment size changes are rejected on resume with identical state and audio.
- Wired the scene-order and render-setting resume suites into the golden CI job.
- Added a nightly workflow for the two-minute A/V resume and long-form benchmark, and a tag-gated npm release workflow that verifies the tag against `package.json` before publishing. The nightly writes its Linux report to a separate artifact file instead of overwriting the canonical benchmark docs.

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
