# Benchmark

Recorded 2026-11-21T05:24:37.469Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 6.01 | 6.7 |
| 540p | 1 | 4.60 | 8.7 |
| 540p | 4 | 2.42 | 16.6 |

## Footprint

- npm tarball: 496 KiB
- npm unpacked: 0.72 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 810 KiB in 103 files
