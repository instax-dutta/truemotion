# Architecture

TrueMotion is a stdio MCP server + CLI renderer.

- `bin/truemotion.mjs`: CLI entry (init, serve, render, install-skill, version).
- `src/mcp.js`: MCP tools (get_scenes, read_scene, update_scene, patch_scene, add_scene, read_skill, view_sketch, review_timeline).
- `src/state.js`: state load/save, scene CRUD, digest.
- `src/validate.js`: scene contract validation, evolve warnings.
- `src/inject.js`: token resolution (GSAP, fonts, icons, assets, typing runtime).
- `src/render.js`: Playwright seek + ffmpeg encode + measurements.
- `src/diff.js`: PNG pixel diff.
- `src/skill.js`: skill dir resolution/read/install.

Data flow: state JSON → scenes → inject → Playwright seek → frames → ffmpeg MP4.
