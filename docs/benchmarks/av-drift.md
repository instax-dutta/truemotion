# A/V drift (multi-minute)

Recorded 2026-11-21T07:33:49.546Z on darwin/arm64, Node v26.8.1.

```json
{
  "timelineSeconds": 120,
  "videoFrames": 1200,
  "expectedFrames": 1200,
  "videoDuration": 120,
  "audioDuration": 119.977007,
  "driftMs": 23,
  "middleDb": -21.1,
  "tailDb": -26.2,
  "fadeReductionDb": 5.1,
  "elapsedSeconds": 153.98
}
```

A 3-second audio bed is looped under a 120-second video. Drift is the absolute difference between audio and video stream durations: **23 ms over two minutes** (0.019%), which is within AAC frame granularity and shows no cumulative drift from looping. Tail level is measured in the final ~0.5 s, after the fade-out begins at `total - 0.6` seconds; it is 5.1 dB below the mid-film level, confirming the fade lands at the tail. Reproduce with `npm run bench:av`.

`test/audio-resume.test.js` (`npm run test:audio-resume`, also in CI) covers the harder combined case: a two-segment film with a looping bed is rendered partially, resumed from its checkpoint, then checked for exact frame count, audio/video duration alignment within 50 ms, and a tail fade at least 3 dB below the mid-film level. This verifies that concatenation of independently encoded MPEG-TS segments does not disturb audio timing or the final fade.
