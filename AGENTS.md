# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Project Rail

- TrueMotion is an open, harness-agnostic motion-graphics tool: a stdio MCP server plus a local CLI renderer. No GUI, account, cloud service or model SDK.
- Scope and contracts live in `README.md`, `docs/dox/`, `skill/scene-contract.md` and `docs/reverse-engineering/audit.md`.
- Core commands: `npm test`, `npm run selftest`, `npm pack --dry-run` (prepack gate). Opt-in suites are env-gated; see `package.json`.
- Our source and skill docs are MIT. Third-party licenses are in `NOTICE.md`. Never copy proprietary bundles or original OpenMotion documents.
- No network at render time. Tokens resolve locally and the injected scene CSP sets `default-src 'none'; connect-src 'none'`.
- Public repo: `github.com/instax-dutta/truemotion`. npm publication is paused by user request; the release workflow is tag-gated and dormant.

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:
- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

- Keep changes small, verified and committed with command output as evidence.
- npm publication stays paused until the user lifts it; the release workflow remains dormant.
- Respect the global preferences in `~/.claude/CLAUDE.md` (no emojis, use dashes not em dashes, reproduce bugs end to end).

## Child DOX Index

- `src/AGENTS.md` - runtime modules: MCP tools, state, validation, injection, rendering, encoding, checkpointing.
- `test/AGENTS.md` - unit and opt-in integration suites, env gates and test conventions.
- `scripts/AGENTS.md` - benchmarks, performance guards, golden generation, GIF export and tarball verification.
- `skill/AGENTS.md` - agent-facing motion reference library and its licensing/link contracts.
- `docs/AGENTS.md` - user manual, benchmark reports, reverse-engineering records and visual evidence.
- `examples/AGENTS.md` - runnable MCP demos and their generated artifacts.
- `.github/AGENTS.md` - CI, nightly and release workflows plus issue templates.

Parent-owned and intentionally not indexed: `bin/` (single CLI entry), root config files (`package.json`, `README.md`, `CHANGELOG.md`, `LICENSE`, `NOTICE.md`, `CONTRIBUTING.md`, `.gitignore`).
