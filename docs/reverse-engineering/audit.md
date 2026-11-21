# Reverse-engineering audit

Status of every material finding from the static inspection of OpenMotion 1.1.0.
Evidence refers to files in this repository or to commands that can be run
locally. This audit closes the RE workstream; remaining gaps are deliberate.

## Summary

| Status | Count |
| --- | --- |
| Adopted | 14 |
| Replaced with an equivalent | 2 |
| Rejected with rationale | 6 |

## Findings

| # | Finding in OpenMotion | Status | Evidence |
| --- | --- | --- | --- |
| 1 | stdio MCP server with seven scene tools | Adopted and extended to eleven | `src/mcp.js`; `npm run selftest` exercises six tools |
| 2 | Plain-JSON project state shared between UI and tools | Adopted with `resolution` added | `src/state.js`; `test/state-validation.test.js` |
| 3 | Scene = self-contained HTML with one paused GSAP timeline | Adopted | `skill/scene-contract.md`; `src/validate.js` |
| 4 | Local injection of `{{GSAP}}`, `{{FONTS_CSS}}`, `{{W}}`, `{{H}}`, icons, assets | Adopted for supported tokens | `src/inject.js`; `test/core.test.js` token tests |
| 5 | Matched-cut pixel thresholds 18% reject / 6% warn | Adopted | `src/render.js` `matchedCut`; MCP `add_scene` rejects with two frames |
| 6 | `buildFrameReviewContent` samples 0.1/0.5/0.9 and flags static/dead holds | Adopted and extended | `src/render.js` `sceneNotes`; measurements plus duration, network, script and layout checks |
| 7 | `extractActorExitStates` measures actors in a real browser | Adopted | `src/render.js` actor probe using `gsap.getProperty` |
| 8 | `buildElementPathIdScript` DOM-path fallback IDs | Adopted | `src/pathid.js`; `test/pathid.test.js`; `pathActors` in evolved reads |
| 9 | Typing runtime with `_writes` flush registry and blinking cursor | Adopted | `src/inject.js` `TYPING_SHIM`; `test/typing.test.js`; live seek probe |
| 10 | Strict Content-Security-Policy in scene documents | Adopted | `src/inject.js` CSP injection; `connect-src 'none'` asserted in tests |
| 11 | `sanitizeExportFilename` | Adopted | `src/filename.js`; `test/filename.test.js` |
| 12 | `optimizeImportedImage` (Electron `nativeImage`) | Replaced with equivalent | `src/assets.js` standalone ffmpeg implementation; `test/assets.test.js`; CLI and MCP tool |
| 13 | `verifyMotionSkill` self-test harness | Replaced with equivalent | `truemotion selftest`, documented in `docs/dox/reference/cli.md` |
| 14 | `simple-icons` for 3400+ brand marks | Replaced with equivalent | `@iconify-json/simple-icons` paths plus 69 KiB CC0 colour map; `test/core.test.js` icon-token test |
| 15 | Remotion `delayRender`/`continueRender` per frame | Replaced with equivalent | Two `requestAnimationFrame` settle in `src/render.js` seek |
| 16 | Remotion renderer and bundler | Rejected | Two-tier license requires a company license for larger organisations and adds native compositor binaries; see `NOTICE.md` |
| 17 | Claude Agent SDK and Codex SDK embedded in the app | Rejected | No model SDK in TrueMotion; stdio MCP is harness-agnostic |
| 18 | Electron GUI, project manager and brand-kit scraper | Rejected | Agent-facing core only; state file is the handoff format |
| 19 | Excalidraw sketch conversion UI | Rejected | `view_sketch` reads existing PNG refs; no drawing editor |
| 20 | In-app sound editor and timeline mixing | Rejected | CLI `render --audio` muxes one bed; no UI mixing |
| 21 | Chat-document limits (`MAX_CHAT_DOCUMENT_BYTES`, `isAllowedChatDocument`) | Rejected | Chat UI concern, not scene rendering |
| 22 | `drainPendingEvents` Electron event stream | Rejected | No Electron process; state file changes are the event record |
| 23 | `{{ROUGH}}` / `OMRough` hand-drawn helper backed by rough.js | Replaced with equivalent | `src/rough.js`: deterministic local SVG helper; `test/rough.test.js`; `rough-*.png` golden fixtures |
| 24 | `{{FX}}` / OMFX effects bundle | Replaced with equivalent | `src/fx.js`: local inline-CSS effects; `test/fx.test.js`; `fx-*.png` golden fixtures |
| 25 | `{{SHADERS}}` / OMShaders CSS utilities | Replaced with equivalent | `src/shaders.js`: local CSS utility layer; `test/shaders.test.js`; `shaders-*.png` golden fixtures |
| 26 | `{{BRAND:*}}` tokens from scraped brand kits | Replaced with equivalent | `src/brand.js`: state-driven colour variables and inlined logo; `test/brand.test.js`; `brand-*.png` golden fixtures |
| 27 | `{{COMPONENT:id}}` snippets from brand kits | Replaced with equivalent | `src/components.js`: built-in plus state-defined snippets; `test/components.test.js`; `component-*.png` golden fixtures |
| 28 | `{{THREE}}` / OM3D WebGL runtime | Replaced with equivalent | `src/three.js`: CSS-3D stage helper; `test/three.test.js`; `three-*.png` golden fixtures |

## Verification commands

```
npm test                      # 33 passing tests
npm run selftest              # stdio tool path, 6 tools
npm run benchmark -- --write  # performance and footprint
npm pack --dry-run            # published file list
```

## Open items

- All authoring tokens documented in the skill references are now supported by
  local equivalents. The original WebGL bundle was not copied; `{{THREE}}`
  provides CSS-3D depth only, so physically lit geometry and material response
  remain out of scope by design.
- npm publication is intentionally paused by the user; the package is verified
  packable but not published.
