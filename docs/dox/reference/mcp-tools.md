# MCP Tools

All tools load and validate the state file before running. A state written by a
newer schema version is rejected with a clear error across every tool; legacy
files are migrated with a warning to stderr and persisted on the next write.
`read_skill` caches documents by SHA-256 content hash, so an edited skill file
is re-read on the next call even when the state file already holds a cache entry.

- `get_scenes` — scene metadata.
- `read_scene` — full/evolve/digest.
- `update_scene` — rewrite one scene.
- `patch_scene` — find/replace ops.
- `add_scene` — add scene (evolve/fresh).
- `read_skill` — load motion reference.
- `list_skills` — list available reference documents.
- `view_sketch` — load sketch PNG.
- `review_timeline` — audit timeline; returns notes plus one contact sheet.
- `render_video` — render the timeline to MP4 from inside the agent. Accepts `out`, `fps`, `resolution`, `crf`, `audio`, `startSec`, `endSec`, `concurrency`, `batchSize`, `segmentSize`, `maxSegments`, `resume`, `keepCheckpoints`. Partial renders return a checkpoint message instead of a path.
- `optimize_assets` — downscale and recompress large local PNG/JPEG assets; filenames are preserved.
