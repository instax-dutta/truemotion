# Long-form render

Recorded 2026-11-21 on darwin/arm64, Node v26.8.1, ffmpeg 8.1.2.
Reproduce with `npm run bench:longform`. Environment overrides: `LF_SCENES`,
`LF_SCENE_SEC`, `LF_FPS`, `LF_BATCH`, `LF_CONCURRENCY`.

## Current renderer: 1200-frame validation

The full 30-scene, 120-second, 1920x1080 render was repeated after the
page-pool refactor to confirm organisation-at-scale behaviour:

| Metric | Before page pool | Current renderer |
| --- | --- | --- |
| Frames | 1200 / 1200 | 1200 / 1200 |
| Elapsed | 459.6 s | **177.7 s** |
| Throughput | 2.6 frames/s | **6.8 frames/s** |
| Peak tree RSS | 1182 MiB | 1278 MiB |
| Output | 11278 KiB | 11659 KiB |

Throughput improved 2.6x with byte-comparable output and peak RSS within 8% of
the prior figure, so no regression was found. A separate two-scene 1080p render
was inspected visually to confirm correct scene sequencing and typing after the
page-pool change.

The nightly GitHub Actions job also ran the 1200-frame benchmark on linux/x64
with Node 20: 1200/1200 frames, 198.4 s, 6.0 frames/s, 2327 MiB peak tree RSS,
11934 KiB output. Peak RSS is higher on the CI runner because of a different
Chromium build and process accounting; it is recorded separately in the nightly
artifact (`nightly-linux.md`) rather than overwriting this report.

## Page-pool A/B (10 scenes, 400 frames, 1080p, concurrency 2)

| Implementation | Peak tree RSS | Throughput | Output |
| --- | --- | --- | --- |
| Pages opened per scene (before) | 1184 MiB | 3.1 frames/s | 3903 KiB |
| One page pool reused across all scenes | **1060 MiB** | 3.1 frames/s | 3909 KiB |

A single pool of `concurrency` pages is created once per render and reused for
every scene. Reused pages navigate to a data URL first to reset the JS realm;
otherwise a new scene's top-level `const tl` collides and its script never runs.
`test/combined-e2e.test.js` compares a reused-page scene frame against a
standalone render of the same scene.

## Scale and concurrency comparison (current renderer)

| Scenes | Timeline | Frames | Concurrency | Elapsed | Frames/s | Peak tree RSS |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 40s | 400 | 2 | 128.3s | 3.1 | 1060 MiB |
| 10 | 40s | 400 | 1 | 159.8s | 2.5 | **977 MiB** |
| 30 | 120s | 1200 | 2 | 177.7s | 6.8 | 1278 MiB |

Frame counts match exactly and render time scales sub-linearly with scene count
thanks to page reuse. `--concurrency 1` remains the memory knob, saving about
80 MiB at 400 frames.

Peak RSS is sampled across the whole process tree (Node + Chromium helpers +
ffmpeg) every 500 ms. Summing per-process RSS double-counts shared library and
GPU pages, so the figure is an upper bound. Frames are streamed to ffmpeg via
`image2pipe` in bounded batches; no full-frame staging directory is written.

## Crash recovery / resume

Long renders are divided into independently encoded MPEG-TS segments with a
`resume.json` manifest. Each completed segment is verified by byte size before
it is reused. A partial run writes checkpoints but no final MP4; a later run
with `--resume` skips completed segments, renders the rest, and concatenates
and muxes the final film.

```
# render at most two segments, then stop
truemotion render --state state.json --out film.mp4 \
  --segment-size 240 --max-segments 2 --keep-checkpoints

# resume from whatever completed
truemotion render --state state.json --out film.mp4 \
  --segment-size 240 --resume
```

The manifest stores a SHA-256 digest of the scenes (HTML, names, durations),
brand, components and the contents of every file referenced by `{{ASSET:...}}`
tokens. Changing any of these between a partial render and a resume fails with a
clear error instead of producing a mismatched film; render settings such as fps,
resolution and segment size are validated the same way. The audio bed is checked
by both path and SHA-256 content digest, so editing the bed file at the same
path also rejects the resume. The MCP
`render_video` tool exposes the same options and passes the configured assets
directory into the digest. Unit tests in `test/segments.test.js` cover scene,
asset and path-traversal digests, byte-size verification and segment planning;
`test/combined-e2e.test.js` interrupts, resumes, then mutates both the state
file and an asset file, verifying each rejection. `test/crash-resume.test.js`
sends SIGKILL to a live render, including during a partially written MPEG-TS
segment, and verifies the byte-verified manifest discards the orphan file and
re-encodes that segment on resume. A truncated or structurally invalid
`resume.json` is detected by `readManifest` and treated as absent, so `--resume`
performs a clean full render rather than muxing a broken checkpoint; this is
covered by both unit and crash-suite tests. The digest is order sensitive:
reordering scenes without editing any of them changes it, so a resumed render
rejects the reordered state. `npm run test:scene-order` (opt-in) exercises this
through the CLI, asserting that the rejected resume leaves both the manifest
and the absence of a final film unchanged. `npm run test:settings-resume`
(opt-in) covers render-setting changes: fps, resolution and segment size are
each rejected on resume with "render settings changed since checkpointing"
while the state and audio stay identical, so a checkpoint cannot be reused with
incompatible frame geometry. `npm run test:component-resume` covers the same
guarantee for `components` definitions: changing a component's markup while
scenes, brand, assets and audio stay identical changes the digest and rejects
the resume without rewriting the manifest. Both built-in overrides and custom
component keys are covered; a unit test separately verifies brand changes alter
the digest.
