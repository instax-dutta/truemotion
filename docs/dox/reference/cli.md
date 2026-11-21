# CLI Reference

- `truemotion init [state.json] [--aspect 16:9|9:16|1:1] [--resolution 1080p|720p|540p]` — create state file.
- `truemotion serve --state <file> [--skill <dir>] [--assets <dir>] [--no-preview]` — stdio MCP server.
- `truemotion render --state <file> --out <video.mp4> [--fps 30] [--crf 18] [--resolution 720p] [--concurrency 2] [--batch-size 30] [--segment-size 240] [--max-segments 2] [--resume] [--keep-checkpoints] [--start 4 --end 8] [--audio <file>] [--assets <dir>] [--chrome <path>]` — render. Resolution may be stored in the state or overridden per render; 720p/540p are intended for fast drafts. `--chrome` (or `TRUEMOTION_CHROME`) uses an existing Chrome/Chromium and skips the Playwright browser download. `--batch-size` sets how many decoded frames are held in memory before being piped to ffmpeg (default 30); lower it on small machines or for very long videos. `--segment-size` groups frames into independently encoded checkpoint segments; `--max-segments` renders only part of the film; `--resume` continues from completed segments; `--keep-checkpoints` retains them after the final mux.
- `truemotion still --state <file> --out <frame.png> [--scene <id|1>] [--time 1.5] [--resolution 720p] [--chrome <path>]` — export one seek-accurate frame as PNG. No ffmpeg needed; ideal for QA.
- `truemotion optimize-assets <dir> [--max-dimension 2200] [--min-bytes 921600]` — downscale and recompress large PNG/JPEG assets in place with local ffmpeg.
- `truemotion install-skill <target-dir>` — copy skill dir.
- `truemotion validate-state [--state <file>]` — check schema version, scene count and aspect without modifying the file. Legacy files are reported with a migration warning.
- `truemotion doctor [--state <file>]` — report Node, ffmpeg, browser, skill docs and state-file health.
- `truemotion selftest` — start a throwaway stdio server and exercise five tools plus state persistence. No browser needed.
- `npm run benchmark` / `npm run bench:longform` — record short and multi-minute render benchmarks with RSS sampling.
- `truemotion version` — print version.
