# Pattern: Connected UI Demo — Canvas (video 12)

**Continuity:** `persistent-shell` — `#canvas-root` dot grid + `#guide-cursor` persist all demo beats.

## Beat sheet

| Beat | ~Duration | Content | Blocks |
|------|-----------|---------|--------|
| Features | 4s | Opacity stack feature list | `feature-list-opacity-stack` |
| Canvas | 5s | Drop zone on dot grid | `canvas-dot-grid`, `upload-drop-zone` |
| Interaction | 6s | Card + cursor + typing | `bento-card-profile`, `purple-cursor-typing-pill` |
| Motion | 5s | "Put your designs in motion" nebula | `mesh-gradient-kinetic-word` |
| Export | 4s | Export callout | dark feature text on same canvas |

## Actor handoffs

```
canvas-root: ALL beats — same background, never opacity 0 intro after beat 2
guide-cursor: beat 3 end position → beat 4 start (match x,y)
bento-card: beat 3 center → beat 4 may scale down relocate — NO re-create
```

## Motion rules

- Dot grid: subtle opacity 0.15 white dots, 24px spacing.
- Cursor: purple `#a855f7`, moves with `expo.inOut` between click targets.
- Typing pill: two white dots pulsing `scale yoyo` on timeline.
