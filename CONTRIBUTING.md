# Contributing

Thanks for helping refine TrueMotion. The easiest way to help is to make a video
and tell us what the tool got wrong.

## Quick start

```bash
git clone https://github.com/instax-dutta/truemotion.git
cd truemotion
npm install
npx playwright install chromium   # only if Chromium is not cached
npm test
```

`ffmpeg` must be on `PATH` for rendering. Node 20 or newer is required.

## Ways to help

- **Author a scene.** Point any MCP-capable harness at
  `node bin/truemotion.mjs serve --state <file>`, read `skill/SKILL.md`, and
  build something. If a scene looks wrong, the `review_timeline` tool returns
  measured reasons. Open an issue with the state JSON and the frame numbers.
- **Improve the measurement.** `src/diff.js` and `src/render.js` decide what
  counts as a static slide, a dead hold, a clipped actor or a bad cut. Better
  heuristics with tests are very welcome.
- **Add injection support.** The core currently supports `{{GSAP}}`,
  `{{FONTS_CSS}}`, `{{W}}`, `{{H}}`, `{{ICON:...}}` and `{{ASSET:...}}` plus the
  `OMTyping` runtime. Adding a standalone, permissively licensed replacement for
  one of the advanced tokens is a useful project.
- **Improve the demos.** `examples/intro-demo.mjs` and
  `examples/pro-demo.mjs` author everything through the MCP tools. The ambient
  score generator is `examples/ambient.py` (Python 3 + numpy).
- **Docs and harness recipes.** Add a config snippet for your agent in the
  README.

## Pull requests

1. Keep the change small and focused.
2. Run `npm test`. For renderer changes, also render a demo and inspect a frame.
3. Do not add a dependency that requires an account, a paid tier, or a network
   call at render time.
4. Keep new `skill/` documents original and MIT licensed, with an SPDX header.
   See [NOTICE.md](NOTICE.md).

## Reporting a bad render

Include the state JSON (with large HTML trimmed if needed), the command you ran,
the frame number where it goes wrong, and what you expected.
