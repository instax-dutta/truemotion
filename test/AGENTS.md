## Purpose

Verification suite: unit tests, opt-in end-to-end suites, pinned golden frames and shared fixtures. Test commands are declared in `package.json`; enforcement lives in `.github/workflows/ci.yml`.

## Ownership

- `test/*.test.js` - unit and integration tests.
- `test/fixtures/` - golden scene source and pinned frame PNGs (owned by its child DOX).
- Tests that render video own their temp dirs and browser processes from spawn to cleanup.

## Local Contracts

- `npm test` runs by default. Browser and heavy suites are gated by `TRUEMOTION_*` env vars; golden is gated by `TRUEMOTION_GOLDEN`.
- A new behaviour needs a test that would fail before the change.
- Integration suites must remove temp dirs in `finally` and leave no headless browser running.
- Golden frames are compared with `diffPng` thresholds and are tied to the Playwright Chromium revision pinned in `package-lock.json`.
- Opt-in suites are documented in README and wired into CI or nightly before they are considered enforced.

## Work Guidance

- Name a test after the guarantee it asserts, not the implementation detail.
- Use `fs.mkdtempSync(path.join(os.tmpdir(), ...))` and remove it in `finally`.
- Prefer observable outcomes (frame counts, stream durations, byte-identical files) over internal state.
- When a test is timing-sensitive, widen the physical window rather than lowering the assertion.

## Verification

- `npm test`
- `TRUEMOTION_GOLDEN=1 npm test`
- Individual `npm run test:*` scripts for the gated suites.

## Child DOX Index

- `test/fixtures/AGENTS.md` - golden scene source and pinned PNG frames; regeneration rules.
