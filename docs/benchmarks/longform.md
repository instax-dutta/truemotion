# Long-form render

Recorded 2026-11-21 on darwin/arm64, Node v26.8.1, ffmpeg 8.1.2.
Reproduce with `npm run bench:longform`. Environment overrides: `LF_SCENES`,
`LF_SCENE_SEC`, `LF_FPS`, `LF_BATCH`, `LF_CONCURRENCY`.

## Scale and concurrency comparison

| Scenes | Timeline | Frames | Concurrency | Elapsed | Frames/s | Peak tree RSS | Output |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | 40s | 400 | 2 | 154.9s | 2.6 | 1208 MiB | 3755 KiB |
| 10 | 40s | 400 | 1 | 159.8s | 2.5 | **977 MiB** | 3891 KiB |
| 30 | 120s | 1200 | 2 | 459.6s | 2.6 | 1182 MiB | 11278 KiB |

Settings: 1080p, 10 fps, 24-frame batches. The concurrency-1 run was repeated
after the asset-digest change; 977 MiB is within run-to-run variance of the
earlier 910 MiB figure, with no regression from hashing asset files.

## Findings

- **Memory is bounded by the batch and browser pool, not video length.** Peak
  RSS is flat between 400 and 1200 frames at concurrency 2 (1208 vs 1182 MiB,
  a 2% decrease), and render time scales linearly at 2.6 frames/s.
- **`--concurrency` is the memory knob.** Dropping from 2 pages to 1 at the
  same 400 frames lowers peak tree RSS by roughly 230-300 MiB (20-25%).
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
brand, components and the contents of every file referenced by `{{ASSET:...}}`
tokens. Changing any of these between a partial render and a resume fails with a
clear error instead of producing a mismatched film; render settings such as fps,
resolution, segment size and audio path are validated the same way. The MCP
`render_video` tool exposes the same options and passes the configured assets
directory into the digest. Unit tests in `test/segments.test.js` cover scene,
asset and path-traversal digests, byte-size verification and segment planning;
`test/combined-e2e.test.js` interrupts, resumes, then mutates both the state
file and an asset file, verifying each rejection. `test/crash-resume.test.js`
goes further: it sends SIGKILL to a live render, including during a partially
written MPEG-TS segment, and verifies the byte-verified manifest discards the
orphan file and re-encodes that segment on resume.

## Audio/video alignment

The e2e suite also renders a film with a 2-second looping audio bed under a
4-second video and verifies alignment: video 4.000 s, audio within 50 ms
(AAC frame granularity), and a measured fade-out of at least 3 dB between the
middle of the film and its final 0.25 s. No drift was found, so no fix was
needed. The fade-out start is derived from the exact frame count
(`totalFrames / fps - 0.6`), keeping it aligned with the last video frame.

Skill references are cached per state file, but the cache stores a file
fingerprint (mtime, size, resolved directory). Editing a skill document or
switching `--skill` directories invalidates the entry, verified in
`test/skill-cache.test.js`.
