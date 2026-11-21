# Benchmark

Recorded 2026-11-21T05:54:22.837Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 7.26 | 5.5 |
| 540p | 1 | 4.23 | 9.5 |
| 540p | 4 | 2.09 | 19.1 |

## Footprint

- npm tarball: 677 KiB
- npm unpacked: 0.92 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 1012 KiB in 114 files
