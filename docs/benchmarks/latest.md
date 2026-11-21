# Benchmark

Recorded 2026-11-21T06:13:24.936Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 8.94 | 4.5 |
| 540p | 1 | 5.67 | 7.1 |
| 540p | 4 | 5.03 | 7.9 |

## Long-form streaming (240 frames, 540p, 10 fps, batch size 12)

- Frames rendered: 240
- Elapsed: 13.83s (17.4 frames/s)
- Peak process RSS: 78 MiB
- Output size: 17 KiB
- Frames are piped to ffmpeg in bounded batches; no full-frame staging directory is written.

## Footprint

- npm tarball: 679 KiB
- npm unpacked: 0.92 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 1018 KiB in 116 files
