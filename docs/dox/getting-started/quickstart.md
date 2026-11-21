# Quickstart

1. Install: `npm install` (Node >=20).
2. Install browser: `npx playwright install chromium`.
3. Ensure `ffmpeg` on PATH (render only).
4. Init state: `node bin/truemotion.mjs init truemotion-state.json --aspect 16:9`.
5. Point harness at stdio server: `node bin/truemotion.mjs serve --state truemotion-state.json`.
6. Render: `node bin/truemotion.mjs render --state truemotion-state.json --out video.mp4 --fps 30 --crf 18`.
