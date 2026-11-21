# Install

Requirements: Node.js >=20, ffmpeg (render only), and Chrome or Chromium on
the host. TrueMotion uses `playwright-core` and never downloads a browser.

```
npm install
truemotion doctor
```

`doctor` reports the resolved browser path. To use a non-standard binary, set
`TRUEMOTION_CHROME=/path/to/chrome` or pass `--chrome <path>` to `render` and
`serve`.
