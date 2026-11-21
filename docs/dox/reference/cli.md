# CLI Reference

- `truemotion init [state.json] [--aspect 16:9|9:16|1:1] [--resolution 1080p|720p|540p]` — create state file.
- `truemotion serve --state <file> [--skill <dir>] [--assets <dir>] [--no-preview]` — stdio MCP server.
- `truemotion render --state <file> --out <video.mp4> [--fps 30] [--crf 18] [--resolution 720p] [--audio <file>] [--assets <dir>]` — render. Resolution may be stored in the state or overridden per render; 720p/540p are intended for fast drafts.
- `truemotion install-skill <target-dir>` — copy skill dir.
- `truemotion doctor` — report runtime prerequisites.
- `truemotion version` — print version.
