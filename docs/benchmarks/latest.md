# Benchmark

Recorded 2026-11-21T04:34:34.715Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 7.02 | 5.7 |
| 540p | 1 | 3.75 | 10.7 |
| 540p | 4 | 2.50 | 16.0 |

## Footprint

- npm tarball: 466 KiB
- npm unpacked: 0.62 MiB
- installed dependencies: 56.1 MiB
- project source and docs: 706 KiB in 73 files
