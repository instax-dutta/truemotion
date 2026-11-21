# Long-form render

Recorded 2026-11-21T12:49:48.407Z on darwin/arm64, Node v26.8.1.

```json
{
  "scenes": 4,
  "timelineSeconds": 16,
  "expectedFrames": 160,
  "frames": 160,
  "resolution": "960x540",
  "elapsedSeconds": 16.79,
  "framesPerSecond": 9.5,
  "peakTreeRssMib": 888,
  "outputKib": 278
}
```

Peak RSS is sampled across the whole process tree (Node + Chromium + ffmpeg) every 500 ms. Frames are streamed to ffmpeg in bounded batches; no staging directory is written.
