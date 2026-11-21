<!-- SPDX-License-Identifier: MIT -->
# Finishing

Before rendering the final film:

1. Every scene has passed `review_timeline` with measured build and resolve
   motion and no structural warnings.
2. Every evolved cut has passed the matched-cut check, or was deliberately
   declared a hard cut.
3. Durations match, the aspect is consistent, and the palette uses one accent.
4. Typography follows the role and size rules in `typography.md`.
5. No scene requests the network or declares an unsupported injection token.

Call `render_video` with the final output path. For a draft use a lower
resolution and frame rate; for delivery keep the default 1080p and add an
audio bed with the CLI `--audio` flag if the film needs one.

After rendering, sample a frame from the middle of each scene with the `still`
command and compare it with the contact sheet. If they differ, report it as a
renderer bug with the state file attached.

Hand off the state JSON alongside the video. It is the editable source of the
film and is small enough to review in a diff.
