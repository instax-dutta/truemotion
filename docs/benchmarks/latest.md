# Benchmark

Recorded 2026-11-21T05:35:04.188Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 5.10 | 7.8 |
| 540p | 1 | 3.31 | 12.1 |
| 540p | 4 | 1.66 | 24.1 |

## Footprint

- npm tarball: 500 KiB
- npm unpacked: 0.74 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 827 KiB in 109 files
