## Purpose

Deterministic golden-frame fixtures for the pinned-Chromium regression test: one scene source module and one PNG per scene prefix and sample time.

## Ownership

- `golden-scene.mjs` defines the geometric scenes, sample times and exported brand values.
- `golden/*.png` are generated artifacts, one per `prefix-N` pair.

## Local Contracts

- Fixtures are font-free and gradient-free so they stay stable across hosts.
- PNGs are regenerated only by `npm run goldens`, using the browser pinned by `playwright-core` in `package-lock.json`.
- Any intentional renderer or injection output change requires regenerating and committing the PNGs in the same commit.
- Existing prefixes are stable; adding a new one is a deliberate API change to the golden suite.

## Work Guidance

- Never hand-edit a golden PNG.
- Add a fixture by extending `golden-scene.mjs` and both `scripts/generate-goldens.mjs` and `test/golden.test.js`, then regenerate.
- Verify the visual diff is expected before committing; the suite compares against a pixel threshold, not exact bytes.

## Verification

- `npm run goldens`
- `TRUEMOTION_GOLDEN=1 npm test`

## Child DOX Index

No child DOX files.
