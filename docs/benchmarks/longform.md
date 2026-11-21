# Long-form render

Recorded 2026-11-21 on darwin/arm64, Node v26.8.1, ffmpeg 8.1.2.
Reproduce with `npm run bench:longform` (environment overrides: `LF_SCENES`,
`LF_SCENE_SEC`, `LF_FPS`, `LF_BATCH`, `LF_CONCURRENCY`).

## Scale comparison

| Scenes | Timeline | Frames | Resolution | Elapsed | Frames/s | Peak tree RSS | Output |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | 40s | 400 | 1920x1080 | 154.9s | 2.6 | 1208 MiB | 3755 KiB |
| 30 | 120s | 1200 | 1920x1080 | 459.6s | 2.6 | 1182 MiB | 11278 KiB |

Settings: 10 fps, 24-frame batches, 2 browser pages per scene.

## Interpretation

Peak RSS is sampled across the whole process tree (Node + Chromium helpers +
ffmpeg) every 500 ms. It is **flat between 400 and 1200 frames** (1208 MiB vs
1182 MiB, a 2% decrease), which demonstrates that memory is bounded by the
streaming batch and the browser pool rather than by video length. Rendering
time scales linearly (2.6 frames/s in both runs) and frame counts match exactly.

The ~1.2 GiB figure is an upper bound: summing per-process RSS double-counts
shared library pages and GPU buffers across Chromium's helper processes. The
fixed cost is the 1080p browser pool, not accumulated frames; using
`--resolution 540p` or `--concurrency 1` reduces it further.

Frames are streamed to ffmpeg via `image2pipe` in bounded batches; no
full-frame staging directory is written at any point.
