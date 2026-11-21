# Long-form render

Recorded 2026-11-21 on darwin/arm64, Node v26.8.1, ffmpeg 8.1.2.
Reproduce with `npm run bench:longform`. Environment overrides: `LF_SCENES`,
`LF_SCENE_SEC`, `LF_FPS`, `LF_BATCH`, `LF_CONCURRENCY`.

## Scale and concurrency comparison

| Scenes | Timeline | Frames | Concurrency | Elapsed | Frames/s | Peak tree RSS | Output |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | 40s | 400 | 2 | 154.9s | 2.6 | 1208 MiB | 3755 KiB |
| 10 | 40s | 400 | 1 | 156.1s | 2.6 | **908 MiB** | 3892 KiB |
| 30 | 120s | 1200 | 2 | 459.6s | 2.6 | 1182 MiB | 11278 KiB |

Settings: 1080p, 10 fps, 24-frame batches. The concurrency-1 run was repeated
after the digest change to confirm no regression (908 MiB vs 910 MiB).

## Findings

- **Memory is bounded by the batch and browser pool, not video length.** Peak
  RSS is flat between 400 and 1200 frames at concurrency 2 (1208 vs 1182 MiB,
  a 2% decrease), and render time scales linearly at 2.6 frames/s.
- **`--concurrency` is the memory knob.** Dropping from 2 pages to 1 at the
  same 400 frames lowers peak tree RSS by ~300 MiB (25%) with no throughput
  cost in the repeated run.
- Peak RSS is sampled across the whole process tree (Node + Chromium helpers +
  ffmpeg) every 500 ms. Summing per-process RSS double-counts shared library
  and GPU pages, so the figure is an upper bound; the fixed cost is the 1080p
  browser pool, not frame data.
- Frames are streamed to ffmpeg via `image2pipe` in bounded batches; no
  full-frame staging directory is written. Renders can be split across
  invocations with `--segment-size`, `--max-segments` and `--resume`.

## Crash recovery / resume

Long renders are divided into independently encoded MPEG-TS segments with a
`resume.json` manifest. Each completed segment is verified by byte size before
it is reused. A partial run writes checkpoints but no final MP4; a later run
with `--resume` skips completed segments, renders the rest, and concatenates
and muxes the final film.

```
# render at most two segments, then stop
truemotion render --state state.json --out film.mp4 \
  --segment-size 240 --max-segments 2 --keep-checkpoints

# resume from whatever completed
truemotion render --state state.json --out film.mp4 \
  --segment-size 240 --resume
```

The manifest stores a SHA-256 digest of the scenes (HTML, names, durations),
brand and components. Changing any of these between a partial render and a
resume fails with a clear error instead of producing a mismatched film; render
settings such as fps, resolution, segment size and audio path are validated the
same way. The MCP `render_video` tool exposes the same options. Unit tests in
`test/segments.test.js` cover digests, byte-size verification and segment
planning; `test/combined-e2e.test.js` interrupts, resumes, then mutates state
and verifies rejection.
