# Motion Blocks Catalog

Reusable HTML+GSAP building blocks from 13 reference videos. Compose scenes from blocks — do not invent choreography from scratch.

**Usage:** `read_skill('blocks/catalog.md')` then match block IDs from the pattern playbook for your video type.

## Shell & continuity actors (persist across scenes)

| Block ID | Source | Use when |
|----------|--------|----------|
| `shell-timeline-nav` | 01 | SaaS explainer — preview frame + filmstrip + Hook/Solution/Demo/Features/CTA pills |
| `canvas-dot-grid` | 12 | Product demo — dark workspace + dot pattern; **never destroy between beats** |
| `purple-cursor-typing-pill` | 12 | Guide cursor + typing indicator on canvas |
| `guide-cursor-hand` | 03,05,10,12 | White hand pointer — position must handoff across scenes |

## UI components

| Block ID | Source | Description |
|----------|--------|-------------|
| `ai-prompt-bar` | 09 | Chat input, glow cursor, model selector — **actor: prompt-bar** |
| `typing-prompt-bar` | bridge | Prompt bar + `OMTyping.attach` character reveal — read `blocks/typing-input.md` |
| `glass-icon-dock-3d` | 09 | Frosted pill dock + icons + 3D cube stage |
| `product-card-glass-input` | 11 | Glass hero card + gradient headline + prompt + GENERATE |
| `code-editor-deploy` | 11 | IDE window + markdown + glowing Deploy button |
| `dashboard-skills-mastery` | 01 | Multi-widget analytics (bar, donut, radar, progress) |
| `dashboard-kpi-grid` | 04,06 | KPI cards + line/bar charts |
| `notification-toast-meeting` | 02,10 | Dynamic Island reminder + metadata |
| `imessage-bubble` | 02 | Blue outgoing chat bubble |
| `notification-email-card` | 02 | Gmail-style announcement card |
| `social-share-sheet` | 05 | Reels share UI + typing caption |
| `spotify-now-playing-neon` | 08 | Album art + green neon glow + controls |
| `paypal-wallet-card` | 07 | Balance + Send/Request + debit card |
| `dropdown-menu-hover` | 03 | Icon list menu + hover row + cursor |
| `inline-cta-in-headline` | 03 | Sentence with embedded pill button |
| `floating-icon-field` | 03,13 | App icons at depth + center pill label |
| `split-state-comparison` | 04 | Disconnected vs Manual two-card layout |
| `hero-glow-product-cards` | 13 | Glow headline + floating product cards |
| `brand-pill-icon-label` | 13 | Icon + label horizontal pill |
| `bento-card-profile` | 12 | White card + avatar on dot canvas |
| `upload-drop-zone` | 12 | Drag-and-drop area on canvas |

## Typography & motion

| Block ID | Source | Description |
|----------|--------|-------------|
| `kinetic-headline-blur` | 01 | Blurred word resolve on dark card |
| `kinetic-line-emphasis` | 10 | Colored rule + italic accent word on black |
| `mesh-gradient-kinetic-word` | 02,09,10 | Single word on coral/pink/aurora mesh |
| `gradient-kinetic-slide` | 06 | Oversized lowercase type sliding on purple |
| `premium-sparkle-title` | 05 | Word + 4-point star glint on purple mesh |
| `feature-list-opacity-stack` | 12 | Vertical feature list, center item brightest |
| `rainbow-glow-headline` | 11 | Text on horizontal spectral glow band |
| `interstitial-apology` | 05 | Minimal grey "Sorry to interrupt…" |

## Data viz & decor

| Block ID | Source | Description |
|----------|--------|-------------|
| `svg-curve-draw` | 06 | White S-curve path + dot — stroke-dashoffset |
| `radial-hub-diagram` | 06 | Center hub + spokes + traveling glow dots |
| `globe-trust-headline` | 07 | Network globe + "Trusted" centered |
| `neon-path-curves` | 11 | SVG gradient paths on black |

## CTA & outros

**Logo gate:** the `logo-*` blocks require a REAL logo asset ({{BRAND:logo}} or a user-attached {{ASSET:...}}). Never invent a mark, monogram, or placeholder wordmark to fill them — with no logo asset, use `cta-dark-minimal` / `url-sting-rainbow-arc` or a plain text lockup (headline + URL) instead.

| Block ID | Source | Description |
|----------|--------|-------------|
| `logo-lockup-cta` | 01 | Provided logo + tagline + URL on glow (requires logo asset) |
| `logo-sting-organic-blob` | 09 | Provided logo + soft peach blob on white (requires logo asset) |
| `cta-logo-stack-blue` | 04,06 | Bold blue wordmark + grey subline (requires real wordmark; else text CTA) |
| `url-sting-rainbow-arc` | 11 | URL on rainbow swoosh |
| `cta-dark-minimal` | 05 | "Let's talk!" on near-black |
| `logo-sting-gradient-mark` | 10 | Provided logo icon + "try now" (requires logo asset) |

## Canvas effects & visual textures (OMShaders + ls.graphics)

Requires `{{SHADERS}}` token. Read `shaders.md` for full API. Read `blocks/ls-visual-styles.md` for CSS patterns.

| Block ID | Token | Description |
|----------|-------|-------------|
| `om-aurora-bg` | `{{SHADERS}}` | Aurora borealis canvas background — cinematic/clean personality |
| `om-mesh-gradient-bg` | `{{SHADERS}}` | ColorFlow-style animated mesh gradient — brand color orbs |
| `om-plasma-bg` | `{{SHADERS}}` | Plasma waves — energetic/vibrant personality |
| `om-particles-bg` | `{{SHADERS}}` | Floating particle field — pairs with aurora |
| `om-glow-burst` | `{{SHADERS}}` | Pulsing radial glow — hero accent / ambient light |
| `om-sine-wave` | `{{SHADERS}}` | Animated sine wave lines — tech/AI/data scenes |
| `ls-grain-bg` | CSS | Grainy blur background — ls.graphics Grainy Blurs style |
| `ls-glass-card` | CSS | Frosted glass card — ls.graphics Glass Aberrations style |
| `ls-translucent-card` | CSS | Translucent layered card — ls.graphics Translucent Layers |
| `ls-aberration-text` | CSS | Chromatic aberration headline — channel split effect |
| `ls-device-iphone` | CSS | Pure CSS iPhone frame — product mockup scenes |
| `ls-device-macbook` | CSS | Pure CSS MacBook frame — SaaS demo scenes |
| `ls-colorflow-gradient` | CSS | Static ColorFlow mesh gradient (no canvas needed) |
| `screen-flyout-bottom` | GSAP+CSS | Screenshot/browser flies **bottom → front** (3D rotateX) — read `blocks/screen-flyout.md` |
| `screen-flyout-top` | GSAP+CSS | Screenshot/browser flies **top → front** |
| `screen-flyout-left` | GSAP+CSS | Screenshot/browser flies **left → front** (rotateY) |
| `screen-flyout-right` | GSAP+CSS | Screenshot/browser flies **right → front** (rotateY) |

**Screen flyout usage:** when the user says fly in, flyout, browser animation, or bottom/top/left/right to front — `read_skill('blocks/screen-flyout.md')` and pick the matching direction block. Embed chat screenshots with `{{ASSET:...}}`.

**Usage pattern:**
1. For canvas effects: create `<canvas id="bg" style="position:absolute;inset:0;width:100%;height:100%">`, set `canvas.width={{W}}; canvas.height={{H}}`, call `OMShaders.attachAurora(canvas, tl, {...})`.
2. For CSS blocks: add the class name to your element — no JS required.
3. For device frames: place UI / `{{ASSET:...}}` screenshots inside `.ls-phone-screen` or `.ls-macbook-screen`.

**Note:** there is also a separate, user-only curated gradient background picker in the Editor's scene Design panel (`<!-- background: preset colors -->` marker, `src/shared/sceneGradientBackground.ts`) that lets the *user* pick a preset and recolor it with no code. It is not something the agent authors — for agent-authored gradient backgrounds in freeform scene HTML, keep using the blocks above.

## Hand-drawn sketch blocks (OMRough + Rough.js)

Requires `{{ROUGH}}` token. Read `rough.md` for full API. Read `blocks/rough-hand-drawn.md` for copy-paste blocks.

| Block ID | Token | Description |
|----------|-------|-------------|
| `rough-paper-stage` | `{{ROUGH}}` | Paper background + full-frame SVG sketch layer |
| `rough-hero-card` | `{{ROUGH}}` | Sketchy bordered card behind headline |
| `rough-callout-arrow` | `{{ROUGH}}` | Hand-drawn arrow pointing at UI |
| `rough-emphasis-underline` | `{{ROUGH}}` | Wobbly underline under keyword |
| `rough-flow-box` | `{{ROUGH}}` | Whiteboard diagram node + HTML label |
| `rough-connector` | `{{ROUGH}}` | Arrow between diagram nodes |
| `rough-draw-on-circle` | `{{ROUGH}}` | Circle with GSAP stroke-dash draw-on |
| `rough-highlight-circle` | `{{ROUGH}}` | Ellipse highlight around icon/stat |

**When to use:** user asks for hand-made drawings, hand-drawn, sketchy, whiteboard, doodle, or notebook aesthetic. See `examples/rough-whiteboard-scene.md`.

**Usage pattern:**
1. Add `.om-paper-bg` on `.frame` and `<svg class="om-rough-svg" id="rough" viewBox="0 0 {{W}} {{H}}">`.
2. Call `OMRough.card` / `arrow` / `underline` etc. once at init with fixed `seed`.
3. Animate returned nodes with GSAP — text stays real HTML above the SVG.

## Composition rule

Pick a **pattern playbook** first → it lists which blocks each beat uses → adapt copy and brand colors → enforce **continuity.md** for any actor that appears in consecutive beats.
