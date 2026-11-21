# TrueMotion

[![CI](https://github.com/instax-dutta/truemotion/actions/workflows/ci.yml/badge.svg)](https://github.com/instax-dutta/truemotion/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An open, harness-agnostic core for authoring and rendering motion-graphics video scenes.

![Six scenes from the pro demo](docs/demo-contact-sheet.png)

The [finished 25-second demo](examples/pro-out/pro-demo.mp4) and its
[state file](examples/pro-out/state.json) are in this repository. Regenerate them with
`npm run demo:pro`.

This project was recovered by reverse engineering **OpenMotion 1.1.0** (`/Applications/OpenMotion.app`, an Electron + React app signed by "Meta Dots", updater `anovius/openmotion`). The original ships its tools through an embedded MCP server wired to the Claude Agent SDK and Codex SDK. TrueMotion keeps the useful part, the tool contract, the scene format, and the motion-design references, and drops everything that ties it to one vendor: no Electron UI, no account, no license gate, no model SDK. The result is a plain stdio MCP server that any coding agent can drive, plus a renderer you can run yourself.

## What you get

- Eight MCP tools: `get_scenes`, `read_scene`, `update_scene`, `patch_scene`, `add_scene`, `read_skill`, `view_sketch`, `review_timeline`.
- Scene format: one self-contained HTML document per scene with a single paused GSAP timeline on `window.__SCENE_TIMELINE__`. Injection tokens `{{GSAP}}`, `{{FONTS_CSS}}`, `{{W}}`, `{{H}}`, `{{ICON:...}}`, `{{ASSET:...}}` and the `OMTyping` runtime are resolved locally.
- Contract validation, evolve/digest reads, and rendered frame feedback after each write. Feedback is measured, not decorative: pixel-diff ratios for static slides and dead holds, duration/timeline mismatches, external requests, script errors, clipped actors and text under 18px. Evolved scenes get measured actor exit states, and a visible jump at an evolved cut is rejected with the two frames attached.
- Rendering: Playwright seeks the timeline frame-by-frame, ffmpeg encodes the frames to MP4. No cloud service involved. Seeks fire GSAP `onUpdate` callbacks, so proxy-driven counters and typed text export correctly on a cold seek.

## Install

```bash
cd truemotion
npm install
npx playwright install chromium   # only if Chromium is not already cached
```

You need `ffmpeg` on `PATH` only for `render` (preview frames during MCP writes do not use it).

## Use with any harness

Create a state file, then point your harness at the stdio server:

```bash
node bin/truemotion.mjs init truemotion-state.json --aspect 16:9
```

MCP configuration (the exact file name differs by harness):

```json
{
  "mcpServers": {
    "truemotion": {
      "command": "node",
      "args": ["/absolute/path/to/truemotion/bin/truemotion.mjs", "serve",
               "--state", "/absolute/path/to/truemotion-state.json"]
    }
  }
}
```

That is all that is required: stdio MCP is supported by Claude Code, Codex, Cursor, OpenCode, and most other agents. No API keys, no vendor SDK, no Electron process.

Optional flags for `serve`:

- `--skill <dir>`: use a different motion-skill directory.
- `--assets <dir>`: where `{{ASSET:...}}` files and sketch PNGs live (defaults to `assets/` beside the state file).
- `--no-preview`: skip rendered frame feedback (faster, but the agent cannot see its own scenes).

### Skill installation

The agent needs the motion-design references. Either let the agent call `read_skill` through MCP, or copy the skill into your harness's skill folder:

```bash
node bin/truemotion.mjs install-skill ~/.claude/skills/truemotion
node bin/truemotion.mjs install-skill ~/.agents/skills/truemotion
```

## Render a video

```bash
node bin/truemotion.mjs render --state truemotion-state.json --out video.mp4 --fps 30 --crf 18
# optional music bed, looped and faded in/out around the video
node bin/truemotion.mjs render --state truemotion-state.json --out video.mp4 --audio music.mp3
```

`--crf` defaults to 18 (higher quality than ffmpeg's default). `--audio` loops the file, fades it in and out, and cuts it to the video length.

Call `review_timeline` through MCP before finishing a video. It audits every scene and returns a short note plus a middle frame per scene, so the connected model can fix its own work rather than following a fixed template.

## Example

`examples/intro-demo.mjs` authors a three-scene, 12-second intro entirely through the MCP tools (title reveal, capability assembly with an evolved matched cut, outro lockup) and renders it. Run it to see the tool contract in action:

```bash
node examples/intro-demo.mjs
```

The generated state and MP4 land in `examples/out/` (gitignored).

For a larger, art-directed piece, run `node examples/pro-demo.mjs`. It authors six scenes (kinetic wordmark, manifesto typography, prompt-to-film pipeline with typing, frame/count-up data visual, measured-continuity panels, outro lockup) through the same MCP tools, runs `review_timeline`, and renders a 25-second 1080p H.264 film with a generated stereo ambient score into `examples/pro-out/`. The score is produced by `examples/ambient.py` (Python 3 with numpy): an Am-F-C-G-Am pad with sub layer, detuned voices, soft plucked arpeggio, breathing air texture, short feedback delays and fades, encoded to AAC. Every scene in it passes the motion audit with measured build and resolve change.

## State file

Plain JSON, so it is easy to inspect or version:

```json
{
  "projectId": "default",
  "aspect": "16:9",
  "scenes": [
    { "id": "uuid", "name": "Opening", "durationSec": 6, "html": "<!doctype html>..." }
  ],
  "sketchRefs": [],
  "skillReadCache": {},
  "stats": { "readSkillCalls": 0, "writeSceneCalls": 0 }
}
```

This is intentionally compatible with OpenMotion's scene tool state, so a project authored there can be opened here and vice versa.

## Scope and limits

- Supported injection tokens are listed above. Advanced original-only tokens (`{{THREE}}`, `{{SHADERS}}`, `{{ROUGH}}`, `{{FX}}`, `{{BRAND:*}}`, `{{COMPONENT:*}}`) are rejected with a clear error rather than silently mis-rendered.
- There is no GUI, brand-kit scraper or in-app sound editor. The CLI can mux a single audio bed with `--audio`, but there is no timeline-level mixing.
- Frame-by-frame seeking is deterministic but slow for long videos; use a lower `--fps` for drafts.

## Documentation

Full documentation lives in [`docs/dox/`](docs/dox/): getting-started, architecture, reference, contributing.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and
ideas, [NOTICE.md](NOTICE.md) for provenance and third-party licenses, and
[CHANGELOG.md](CHANGELOG.md) for the release history. The most useful help is a
scene that breaks a measurement, or a better measurement with a test.

## Licensing note

The source code in `src/` and `bin/` is MIT licensed (see `LICENSE`). Dependencies keep their own licenses; see [NOTICE.md](NOTICE.md). The files in `skill/` are reference documentation recovered from OpenMotion 1.1.0; their copyright holder has not published a license for them. Confirm your right to redistribute those files before publishing a fork. They are kept separate from the MIT-licensed code for exactly that reason. Bundle versions of GSAP, fonts and Simple Icons are read from the installed npm packages at render time, not copied into this repo.

## Verification

```bash
npm test
npm pack --dry-run
```
