## Purpose

Agent-facing motion-design reference library, loaded through `read_skill` / `list_skills` or installed into a harness skill folder. `SKILL.md` is the entry point.

## Ownership

- `SKILL.md` - workflow overview and reference index.
- `scene-contract.md` - HTML, timeline and token contract.
- `motion-rules.md`, `typography.md`, `shot-direction.md`, `continuity.md`, `verification.md`, `finishing.md`, `evolve-scene.md` - craft and process references.
- `blocks/` - runtime helpers and individual tokens; `patterns/` - shot structures; `examples/` - sample scenes.

## Local Contracts

- Every Markdown reference carries `<!-- SPDX-License-Identifier: MIT -->` and all internal links resolve.
- Documents describe contracts and motion rules, not implementation history.
- A new token or runtime helper needs a matching doc in `blocks/` and a row in the `scene-contract.md` token table.
- References are cached by SHA-256 content hash in state; an edit is picked up on the next `read_skill` call.

## Work Guidance

- Write for an agent that has not seen the codebase: state the exact contract, constraints and verification.
- Keep examples seek-safe: one paused timeline, no timers, CSS animation or external URLs.
- Prefer direct bullets and concrete constraints over generic design advice.
- Do not copy proprietary OpenMotion documentation or bundle text.

## Verification

- `npm test` includes SPDX header and link-resolution checks.
- `npm run test:mcp-schema` covers cache invalidation through MCP.

## Child DOX Index

No child DOX files. `blocks/`, `patterns/` and `examples/` are topical groupings, not separate contracts; their rules are owned here.
