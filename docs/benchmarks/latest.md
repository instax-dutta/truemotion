# Benchmark

Recorded 2026-11-21T04:21:15.523Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 6.07 | 6.6 |
| 540p | 1 | 3.91 | 10.2 |
| 540p | 4 | 2.50 | 16.0 |

## Footprint

- npm tarball: 430 KiB
- npm unpacked: 0.54 MiB
- installed dependencies: 76.9 MiB
- project source and docs: 619 KiB in 64 files
