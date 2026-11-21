# Reverse-engineering notes: OpenMotion 1.1.0

The formal status of each finding is tracked in [audit.md](audit.md).

These notes record what was learned from static inspection of
`/Applications/OpenMotion.app` and what TrueMotion adopted. No proprietary code
is copied into this repository. The artefacts were read, not executed.

## Target

- Electron + React + TypeScript app, version 1.1.0, signed `Developer ID Application: Meta Dots (A9X3L9QMZT)`.
- Updater config: `anovius/openmotion` on GitHub (repository not public at inspection time).
- Payload: `Resources/app.asar` (381 MB) with `out/main/index.js`, `out/main/openmotionMcp.js` and chunks, plus a 34 MB `remotion-bundle` and a `motion-skill/` documentation tree.
- Dependencies revealed by `package.json`: `@modelcontextprotocol/sdk`, `@anthropic-ai/claude-agent-sdk`, `@openai/codex-sdk`, Remotion, GSAP, Playwright, Excalidraw, three.js, rough.js, simple-icons.

## Findings and decisions

| Finding in the original | Decision in TrueMotion |
| --- | --- |
| `openmotionMcp.js` registers seven tools over stdio; handlers live in `sceneToolState-*.js`. | Adopted the tool contract verbatim so existing prompts keep working. Added `review_timeline` as an eighth tool. |
| State is plain JSON: `projectId`, `aspect`, `scenes[{id,name,durationSec,html}]`, `sketchRefs`, caches, stats. | Adopted; added `resolution`. Compatible both ways. |
| Scenes are self-contained HTML with one paused GSAP timeline exposed as `window.__SCENE_TIMELINE__`; renderer seeks frame by frame. | Adopted. Seeks now pass `false` so GSAP `onUpdate` proxies (counters, typing) render on a cold seek. |
| `injectSceneHtmlTokens` replaces `{{GSAP}}`, `{{FONTS_CSS}}`, `{{W}}`, `{{H}}`, icons and assets with locally inlined data. | Adopted. every documented authoring token is supported by a local deterministic helper; none of the proprietary bundles were copied. |
| The typing runtime keeps a `_writes` flush registry, sets `lazy: false` on its proxy tween and blinks the cursor with a repeating tween. | Adopted in `src/inject.js`; the renderer calls `OMTyping._flush()` after every seek. Tests cover flush, cold seek and blink. |
| `checkMatchedCutPixels` compares previous last frame with next frame 0; thresholds 0.18 reject / 0.06 warn. | Adopted with the same thresholds and attached PNG evidence. |
| `buildEvolveGuide` plus `extractActorExitStates` measures actor transforms in a real browser before an evolved add. | Adopted using `gsap.getProperty` in the probe. |
| `buildElementPathIdScript` generates `om/...` DOM paths so elements without `data-om-id` can still be identified and found. | Adopted as `src/pathid.js`, injected during the actor probe. Evolved reads now return `pathActors` alongside labelled actors. |
| `buildFrameReviewContent` samples 0.1 / 0.5 / 0.9 of a scene and flags static slides and dead holds. | Adopted and extended with duration, timeline-count, network, script-error and layout checks using real pixel diffs. |
| `HtmlVideoComposition.tsx` uses Remotion `delayRender` / `continueRender` around each seek. | Replaced with a two-frame `requestAnimationFrame` settle in Playwright. Same deterministic intent, no Remotion dependency or its two-tier license. |
| Spike test HTML sets a strict Content-Security-Policy: `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data: blob:`. | Adopted: the injector now adds a local-only CSP so a scene cannot reach the network even if authored badly. |
| `verifyMotionSkill` is an in-process self-test that drives the agent and asserts scene writes happened. | Inspired a lightweight `selftest` command for the stdio tool path. |
| `sanitizeExportFilename` replaces filesystem-unsafe characters and collapses whitespace, falling back to `Untitled`. | Adopted as `src/filename.js`, applied to `render`, `still` and `render_video` output paths. |
| `optimizeImportedImage` downscales large imports to 2200 px and prefers JPEG when there is no alpha. | Adopted as `src/assets.js`: a standalone ffmpeg implementation with PNG alpha detection, in-place filename preservation, a CLI command and an MCP tool. |
| Brand-kit scraping, Excalidraw sketches, sound mixing, Electron GUI. | Not adopted: those are UI concerns of the original app, not the agent-facing core. |

## Method

1. Read the asar header (Chromium pickle) to list files without extracting the 381 MB payload.
2. Extracted only the ~1.3 MB of main-process JS and the five small Remotion TSX files to a temporary directory.
3. Matched exported symbols and handler names (`handleAddScene`, `prepareSceneHtmlForProject`, `injectSceneHtmlTokens`, `checkMatchedCutPixels`, `verifyMotionSkill`, `optimizeImportedImage`) and read their bodies.
4. Kept behaviour that is observable and protocol-shaped; reimplemented it. Kept no code, bundles, logos or fonts from the target.

## License boundary

The `skill/` Markdown references that originally shipped with this repository
came from the application and had no published license. They have been replaced
with original MIT-licensed documentation that preserves the same tool contract
and scene format. See [NOTICE.md](../../NOTICE.md).
