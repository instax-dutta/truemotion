# Benchmark

Recorded 2026-11-21T05:01:47.231Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 4.98 | 8.0 |
| 540p | 1 | 3.52 | 11.4 |
| 540p | 4 | 1.84 | 21.8 |

## Footprint

- npm tarball: 477 KiB
- npm unpacked: 0.67 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 757 KiB in 91 files
