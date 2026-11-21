# Reference Video Library (13 sources)

All videos analyzed in `reference-videos/reports/`. Every video maps to a **template**, **pattern playbook**, and **blocks**.

## Index

| ID | Template ID | Pattern | Continuity | Tier |
|----|-------------|---------|------------|------|
| 01 | `ref-01-ava-ai-saas` | `patterns/saas-explainer-persistent-shell.md` | persistent-shell | S |
| 02 | `ref-02-odoo-montage` | `patterns/social-launch-montage.md` | isolated (palette lock) | B |
| 03 | `ref-03-ganimate-ui` | `patterns/ui-micro-interactions.md` | handoff (cursor) | C |
| 04 | `ref-04-dashboard-connects` | `patterns/desk-dashboard-demo.md` | handoff | C |
| 05 | `ref-05-agency-trust` | `patterns/agency-trust-reel.md` | handoff (grid bg) | A |
| 06 | `ref-06-impact-launch` | `patterns/b2b-saas-launch-purple.md` | handoff (purple bg) | A |
| 07 | `ref-07-paypal-trust` | `patterns/fintech-trust-sting.md` | isolated | B |
| 08 | `ref-08-spotify-neon` | `patterns/media-player-reveal.md` | isolated | B |
| 09 | `ref-09-claude-poetry` | `patterns/ai-product-poetry-16x9.md` | handoff (prompt-bar) | S |
| 10 | `ref-10-feature-pain` | `patterns/feature-launch-pain-hook.md` | handoff (cursor) | A |
| 11 | `ref-11-gemini-agents` | `patterns/tech-explainer-google-dark.md` | persistent (black bg) | S |
| 12 | `ref-12-stitch-canvas` | `patterns/connected-ui-demo-canvas.md` | persistent-shell | S |
| 13 | `ref-13-shopify-creator` | `patterns/creator-commerce-montage.md` | isolated | B |

## Agent workflow (multi-scene from prompt)

1. If user picked a template or mentions a style → `read_skill('reference-library.md')` → open matching **pattern**.
2. `read_skill('continuity.md')` — apply mode from table above.
3. `read_skill('blocks/catalog.md')` — use block IDs from pattern beat sheet.
4. Build scenes **in order**; for handoff/persistent modes, copy actor IDs and match exit/entry states.
5. `read_skill('verification.md')` before finishing.

## Camera / laptop footage (videos 03, 04, 07, 08, 13)

Source videos include desk POV — **ignore the recording**. Use extracted UI/motion patterns only (documented in each pattern file).

## Full reports

Human-readable analysis: `reference-videos/reports/01-ava-ai-saas-explainer.md` … `13-shopify-digital-products.md`
