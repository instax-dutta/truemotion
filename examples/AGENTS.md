## Purpose

Runnable demos that author films through the MCP tools, plus the state, video, audio and image artifacts they generate. Used as both documentation and end-to-end proof of the tool contract.

## Ownership

- `intro-demo.mjs` - smallest three-scene example.
- `pro-demo.mjs` - seven-scene art-directed demo including the all-token toolkit scene.
- `launch-film.mjs` - eight-scene narrative film about the agent authoring loop.
- `combined-scene.mjs` - shared all-token scene used by the pro demo and e2e regression.
- `ambient.py` - ambient score generator; `launch-out/STORYBOARD.md` documents the launch film.
- Generated files in `out/`, `pro-out/` and `launch-out/` are artifacts. A small set is deliberately un-ignored in `.gitignore` as shipped evidence.

## Local Contracts

- Examples author scenes through MCP `add_scene`, not by writing state files directly.
- Shipped scenes must pass `review_timeline` with no defects except deliberate held reads.
- Generated media is gitignored unless explicitly un-ignored in `.gitignore`.
- `{{ASSET:...}}` files live in `assets/` beside the state file.

## Work Guidance

- Keep examples readable end to end. Add a new one only to demonstrate a distinct capability.
- Match ambient score length to the summed scene durations.
- Inspect a demo visually (contact sheet plus full-resolution frames) and fix defects before committing it.
- Regenerate the README GIF after changing the launch film with `npm run gif:launch`.

## Verification

- `npm run demo`, `npm run demo:pro`, `npm run demo:launch`
- `npm run test:e2e` covers the shared all-token scene.

## Child DOX Index

No child DOX files. Output folders are generated artifacts, not durable boundaries.
