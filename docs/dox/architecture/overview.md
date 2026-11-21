# Architecture

TrueMotion is a stdio MCP server plus a CLI renderer. It has no GUI, account,
cloud service or model SDK. Every dependency is local.

## Entry points

- `bin/truemotion.mjs`: CLI (`init`, `serve`, `render`, `still`, `optimize-assets`,
  `install-skill`, `doctor`, `selftest`, `version`).
- `src/mcp.js`: eleven stdio MCP tools: `get_scenes`, `read_scene`,
  `update_scene`, `patch_scene`, `add_scene`, `read_skill`, `list_skills`,
  `view_sketch`, `review_timeline`, `render_video`, `optimize_assets`.

## Core modules

| Module | Responsibility |
| --- | --- |
| `src/state.js` | Schema versioning/migration, state normalisation, validation, atomic save, cross-process state lock, scene CRUD, digests. |
| `src/validate.js` | Contract validation, static seek-safety lint, evolve warnings. |
| `src/inject.js` | Local token resolution: GSAP, fonts, icons, assets, typing runtime, CSP. |
| `src/render.js` | Scene probe, frame capture, measurement, parallel rendering with page reuse. |
| `src/encode.js` | Bounded frame streaming into ffmpeg via `image2pipe`, with stdin backpressure and segment/finalize arg builders. |
| `src/segments.js` | Checkpoint manifest, byte-verified segment discovery, concat list generation. |
| `src/diff.js` | PNG pixel-diff metrics. |
| `src/sheet.js` | Contact-sheet composition from frame PNGs. |
| `src/browser.js` | Browser resolution and launch via `playwright-core`; system Chrome first, cached browser as fallback, clear error otherwise. |
| `src/assets.js` | Standalone ffmpeg image downscale and recompression. |
| `src/filename.js` | Safe export filenames and output paths. |
| `src/pathid.js` | DOM path fallback identifiers for unlabelled actors. |
| `src/skill.js` | Skill directory resolution, listing, fingerprint-based cached reading and installation. |

## Data flow

State JSON is loaded and normalised. All MCP state mutations are serialised by
a cross-process lock file, so concurrent harnesses cannot lose updates; long
renders read state without holding the lock. The lock has a configurable
acquisition timeout and treats abandoned locks older than the stale threshold
as recoverable, so a crashed writer cannot block all future writes. Agents
mutate scenes through MCP tools.
Each write is validated and returns rendered checkpoints. Rendering injects
tokens into the scene HTML, opens it in headless Chromium, seeks the single GSAP
timeline to each frame time, and pipes PNG bytes directly into ffmpeg's stdin.
A single pool of browser pages is created once per render and reused across all
scenes (reused pages navigate to a fresh data URL first to reset the JS realm).
Only `batchSize` frames are held in memory at once, and stdin backpressure is
awaited, so memory stays flat for long videos and no staging directory is
written. Long renders are
split into MPEG-TS segments with a verified manifest, allowing an interrupted
render to resume without re-encoding completed frames.

## Design constraints

- No network requests at render time; scenes are CSP-locked and tokens are local.
- No paid or tiered runtime dependencies in our own code.
- Fixed-pixel scene layouts are preserved by scaling the raster, not the viewport.
- Scene contracts stay compatible with OpenMotion 1.1.0 state files.
