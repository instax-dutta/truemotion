## Purpose

CI automation and issue templates. Enforces the project's verification gates and schedules expensive checks.

## Ownership

- `workflows/ci.yml` - push and PR checks on Node 20 and 22: unit tests, tarball gate, golden frames, MCP e2e, crash resume, A/V resume, CSP, schema, resume mutations and concurrency.
- `workflows/nightly.yml` - scheduled and manual long A/V resume plus the 1200-frame long-form benchmark with a performance guard; uploads benchmark artifacts.
- `workflows/release.yml` - tag-gated npm publication with provenance. Dormant while publication is paused.
- `ISSUE_TEMPLATE/` - bug reports and scene showcases.

## Local Contracts

- A test script is not enforced until it is added to a workflow.
- Heavy suites belong in nightly, not push CI.
- Release must verify the `v*` tag matches `package.json` and run tests before publishing.
- Never commit credentials; secrets are referenced as `secrets.NPM_TOKEN`.

## Work Guidance

- Validate workflow YAML after editing.
- Keep push CI fast; move expensive checks to nightly.
- Update README when CI coverage changes.

## Verification

- `gh run list` and `gh run view` after pushing a workflow change.
- Local YAML parse check with Python `yaml.safe_load`.

## Child DOX Index

No child DOX files.
