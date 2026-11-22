## Purpose

Core runtime modules: MCP tool surface, state contract, validation, token injection, browser rendering, bounded ffmpeg streaming, checkpointing and asset helpers. `bin/truemotion.mjs` is the CLI entry; it is parent-owned but shares these contracts.

## Ownership

- `mcp.js` - eleven stdio MCP tools and the state lock wrapper.
- `state.js` - schema v1, migration, atomic save, cross-process lock, scene CRUD and digests.
- `render.js` - frame seeking, page pool, streaming, segments and measurement.
- `inject.js` - all `{{...}}` token resolution, local data and the scene CSP.
- `segments.js` - checkpoint manifests and byte/hash verification.
- `encode.js` - ffmpeg `image2pipe` streaming and segment/finalize arguments.
- `validate.js`, `diff.js`, `pathid.js`, `sheet.js` - contract lint, pixel metrics, actor IDs, contact sheets.
- `assets.js`, `browser.js`, `filename.js`, `skill.js` - local asset optimisation, browser resolution, safe paths, skill docs.
- `brand.js`, `components.js`, `fx.js`, `rough.js`, `shaders.js`, `three.js`, `icon-colors.json` - local token helpers and data.

## Local Contracts

- A scene is one self-contained HTML document with one paused GSAP timeline at `window.__SCENE_TIMELINE__` and a literal `window.__SCENE_DURATION__`.
- Rendering is seek-deterministic: no timers, CSS animation, `from()`, randomness or wall-clock in scenes.
- No network at render time. Tokens resolve from local packages and data; the CSP blocks external requests.
- State mutations go through `withStateLock`. Long renders read state without holding the lock.
- Resume requires digest compatibility across scenes, brand, components, assets, audio, sketches and segment contents.
- New source files carry an MIT SPDX header.

## Work Guidance

- Keep modules single-purpose; a new public behaviour gets a focused test in `test/`.
- Prefer the standard library and existing dependencies. A new dependency needs a clear size and licence justification plus a `NOTICE.md` update.
- Every new token or MCP tool needs documentation in `skill/` and `docs/dox/`, and a test.
- Preserve the local-only property: never add a network call, telemetry or a model SDK to the runtime.

## Verification

- `npm test` - unit tests and env-gated suites listed in `package.json`.
- `npm run selftest` - stdio tool path.
- `TRUEMOTION_GOLDEN=1 npm test` after any renderer or injection change.
- `npm pack --dry-run` - prepack tarball gate.

## Child DOX Index

No child DOX files. The module set is flat by design; prefer a new module over deep nesting.
