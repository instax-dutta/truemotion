## Purpose

Standalone local utilities: short and long-form benchmarks, A/V drift measurement, performance guards, golden-frame generation, README GIF export and tarball verification.

## Ownership

- `benchmark.mjs`, `longform-benchmark.mjs`, `av-benchmark.mjs` write reports under `docs/benchmarks/`.
- `guard-longform.mjs` reads those reports and enforces fps/RSS/output thresholds; env vars override defaults.
- `generate-goldens.mjs` owns golden PNG generation.
- `make-gif.mjs` builds the looping README GIF from the launch film.
- `verify-tarball.mjs` is the prepack gate.

## Local Contracts

- Benchmarks print a JSON result block that the guard can parse.
- Report paths are overridable with `LF_REPORT`; nightly CI writes `nightly-linux.md` so it never overwrites canonical docs.
- Scripts use `spawnSync` with argument arrays, not shell strings, and require no credentials.
- New npm scripts belong in `package.json` and must be documented in README.

## Work Guidance

- Report platform, Node version and reproduction command with every measurement.
- Calibrate thresholds from real runs and document the rationale; avoid tight bounds that fail on slower runners.
- Exercise both the pass path and a forced fail path before committing a guard change.

## Verification

- `npm run benchmark -- --write`, `npm run bench:longform`, `npm run guard:smoke`
- `npm run gif:launch`, `npm run goldens`, `npm pack --dry-run`

## Child DOX Index

No child DOX files.
