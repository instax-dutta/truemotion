# Launch film: "Describe it"

A 37.5-second, 1920x1080 / 24 fps launch film authored entirely through
TrueMotion's MCP tools. Unlike the feature-led pro demo, this film is built
around the thing that makes TrueMotion unusual: **an agent authors the film,
gets rendered frames and measurements back, and corrects its own work.**

Regenerate with `npm run demo:launch`. The script authors all scenes through
`add_scene`, runs `review_timeline`, generates a matched ambient score, and
renders the H.264/AAC film.

## Arc and sequence

Arc: Future Pacing, with a Demo Loop in the middle. Promise lands by beat 2;
features after that are its evidence. One job per beat.

| # | Name | Time | Role / blueprint | Beat and persuasion |
| --- | --- | --- | --- | --- |
| 1 | Describe it | 0.0–4.5 | hook / ticker-takeover | Curiosity; negative contrast. "Storyboard. Keyframe. Render. Repeat." hard-cut cycle resolves on "Describe it." |
| 2 | TrueMotion | 4.5–8.5 | product_intro / logo-assemble-lockup | Inevitability; category announcement. Letter-stagger wordmark and the promise line. Deliberate held read. |
| 3 | One prompt | 8.5–13.5 | feature_showcase / prompt-type-submit-generate | Control; show-don't-tell. Prompt types, three MCP tool receipts land on their cues. |
| 4 | Frames + numbers | 13.5–18.5 | benefit_highlight / agent-progress-theater | Trust; measured proof. A **real returned frame** from TrueMotion's own output fills the hero, with a strip of three real frames and three metric rows revealing in sequence. |
| 5 | Correct | 18.5–23.0 | feature_showcase / panel-edit-live-sync | Relief; friction reduction. Before panel has a clipped actor, `patch_scene()` bridges, after panel is clean. |
| 6 | Every frame | 23.0–28.0 | proof / dataviz-countup | Confidence; statistical proof. Filmstrip with a playhead and three values counting to 696 / 24 / 29. |
| 7 | Every token | 28.0–33.0 | social_proof / grid-card-assemble | Ease; value stacking. Ten local capability chips assemble, MIT/offline claims hold. |
| 8 | CTA | 33.0–37.5 | cta / logo-assemble-lockup | Motivation; calm end card. Wordmark, line, repository URL, held read. |

## Video direction (invariants inherited by every scene)

- **Palette:** near-black `#0B0E14`, warm text `#F3EFE9`, amber `#F5A524` accent,
  amber radial glow, faint grid and vignette. All values come from the project's
  established design system.
- **Type:** Display (900) for headlines and wordmarks, Body (300) for lines,
  Mono (500, letterspaced) for eyebrows, labels and tool receipts. Nothing under
  19 px; the audit is clean on text size.
- **Motion grammar:** long-tail `power3` / `expo.out` settles, no bounce. Each
  scene front-loads almost nothing: only what its opening line says is present at
  t=0, and the rest reveals across the back half on separate cues. Every scene
  ends on a still hold. No infinite loops, no CSS keyframes, no `Math.random`,
  no lazy breathing and no back-half pan/push.
- **Depth:** grid + glow + vignette on every scene; two scenes add a faint
  outlined ghost word (`MCP`, `696`) fully inside the frame.
- **Negative list:** no browser chrome, no floating bokeh, no slideshow
  (front-load then freeze), no screensaver motion, no cheap aliveness.

## Verification evidence

- `review_timeline` reports motion change on every build; the only two
  "DEAD HOLD" notes are the deliberate wordmark holds in scenes 2 and 8.
- No clipped actors, tiny text, duration mismatch, external request or script
  error in the final review.
- Rendered output: 900 frames, 37.500 s, 1920x1080, H.264 24 fps + AAC stereo
  (measured -24.1 dB mean). Frame count equals duration x fps exactly.
- The feedback scene embeds genuine frames extracted from
  `examples/pro-out/pro-demo.mp4` via `{{ASSET:...}}`, so the frames presented as
  "returned by the renderer" are real renderer output, not mockups.
- Visual inspection: `docs/launch-film-contact-sheet.png` (two sampled times per
  scene) and full-resolution frames were reviewed and iterated on. The first
  pass had a wrong font in the hook and placeholder cards in the feedback and
  iteration scenes; both were corrected and re-rendered.
