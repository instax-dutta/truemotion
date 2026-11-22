## Purpose

Durable project documentation: the user manual in `docs/dox/`, measured reports in `docs/benchmarks/`, reverse-engineering provenance in `docs/reverse-engineering/`, and contact-sheet images used as visual evidence for shipped films.

## Ownership

- `docs/dox/` - canonical manual: getting started, architecture, CLI and MCP references, contributing.
- `docs/benchmarks/` - generated reports; benchmark scripts own the files.
- `docs/reverse-engineering/` - adopted, replaced and rejected findings with rationale.
- Root PNGs - sampled frames from shipped demo films.

## Local Contracts

- Documentation must match current behaviour. Remove commands that no longer exist instead of deprecating them in place.
- Benchmark numbers cite platform, Node version and reproduction command. Compare figures only within the same runner.
- The RE audit may not be weakened without evidence and an updated rationale.
- Generated media is excluded from the npm tarball via the `files` list in `package.json`.

## Work Guidance

- Prefer concise operational docs over narrative. Link to source for detail.
- Keep README as the discovery surface; put depth in `docs/dox/`.
- Update the manual in the same commit as a CLI or MCP contract change.
- Give README images descriptive alt text.

## Verification

- `npm pack --dry-run` verifies the published file set.
- No automated doc-link check exists; verify local README links after editing.

## Child DOX Index

No child DOX files. The three subfolders are topical groupings with contracts owned here.
