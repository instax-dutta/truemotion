# Benchmark

Recorded 2026-11-21T04:46:30.347Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 5.63 | 7.1 |
| 540p | 1 | 3.29 | 12.1 |
| 540p | 4 | 1.58 | 25.4 |

## Footprint

- npm tarball: 471 KiB
- npm unpacked: 0.64 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 724 KiB in 79 files
