# MCP Tools

- `get_scenes` — scene metadata.
- `read_scene` — full/evolve/digest.
- `update_scene` — rewrite one scene.
- `patch_scene` — find/replace ops.
- `add_scene` — add scene (evolve/fresh).
- `read_skill` — load motion reference.
- `list_skills` — list available reference documents.
- `view_sketch` — load sketch PNG.
- `review_timeline` — audit timeline; returns notes plus one contact sheet.
- `render_video` — render the timeline to MP4 from inside the agent. Accepts `out`, `fps`, `resolution`, `crf`, `audio`, `startSec`, `endSec`, `concurrency`, `batchSize`.
- `optimize_assets` — downscale and recompress large local PNG/JPEG assets; filenames are preserved.
