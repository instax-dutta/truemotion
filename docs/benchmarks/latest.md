# Benchmark

Recorded 2026-11-21T04:28:59.421Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 6.21 | 6.4 |
| 540p | 1 | 3.73 | 10.7 |
| 540p | 4 | 1.74 | 22.9 |

## Footprint

- npm tarball: 464 KiB
- npm unpacked: 0.61 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 694 KiB in 67 files
