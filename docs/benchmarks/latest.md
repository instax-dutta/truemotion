# Benchmark

Recorded 2026-11-21T04:15:22.912Z on darwin/arm64, Node v26.8.1.
ffmpeg: ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers

## Render (4s scene, 10 fps, 40 frames, CRF 23)

| Resolution | Concurrency | Seconds | Frames/s |
| --- | --- | --- | --- |
| 1080p | 1 | 3.93 | 10.2 |
| 540p | 1 | 2.88 | 13.9 |
| 540p | 4 | 1.12 | 35.6 |

## Footprint

- npm tarball: 430 KiB
- npm unpacked: 0.53 MiB
- installed dependencies: 81.8 MiB
- project source and docs: 618 KiB in 63 files
