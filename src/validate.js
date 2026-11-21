const FRAME = /\bclass\s*=\s*["'][^"']*\bframe\b/;
const BANNED_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Noto Sans', 'Arimo', 'Lato', 'Source Sans',
  'PT Sans', 'Nunito', 'Poppins', 'Outfit', 'Sora', 'Playfair Display',
  'Cormorant Garamond', 'Bodoni Moda', 'EB Garamond', 'Cinzel', 'Prata', 'Syne'
];

export function validateSceneHtml(html) {
  const text = String(html ?? '').trim();
  if (!text) return { ok: false, message: 'Scene html is empty.' };

  const missing = [];
  if (!FRAME.test(text) && !text.includes('class="frame"')) missing.push('a .frame element (class="frame" on the composition root)');
  if (!/window\.__SCENE_TIMELINE__/.test(text)) missing.push('window.__SCENE_TIMELINE__ assigned to a paused gsap.timeline');
  if (!/window\.__SCENE_DURATION__/.test(text)) missing.push('window.__SCENE_DURATION__ set to the scene length in seconds');
  if (missing.length) return { ok: false, message: `Scene html is missing ${missing.join(' and ')}. Use the injection tokens {{GSAP}}, {{FONTS_CSS}}, {{W}}, {{H}} and expose a single paused timeline.` };

  const fonts = new Set();
  for (const decl of text.match(/font-family\s*:\s*([^;}"']+|"[^"]*"|'[^']*')+/gi) ?? []) {
    for (const name of BANNED_FONTS) {
      if (new RegExp(`(^|[:,\\s"'])${name}\\b`, 'i').test(decl)) fonts.add(name);
    }
  }
  if (fonts.size) return { ok: false, message: `Scene html declares banned font(s): ${[...fonts].join(', ')}. Use only Display, Body and Mono, which are injected by {{FONTS_CSS}}.` };

  if (/`[^`\n]*\{\{ICON:\$\{[^}]+\}[^`]*\}\}[^`\n]*`/.test(text)) {
    return { ok: false, message: 'Dynamic {{ICON:...}} tokens must not be wrapped in JS backticks. Call the resolver directly.' };
  }
  return { ok: true };
}

export function frameBackground(html) {
  const start = html.search(/\.frame\s*\{/);
  if (start < 0) return null;
  let depth = 0;
  let end = html.length;
  for (let i = start; i < html.length; i += 1) {
    if (html[i] === '{' && html[i + 1] === '{') { i += 1; continue; }
    if (html[i] === '}' && html[i + 1] === '}') { i += 1; continue; }
    if (html[i] === '{') depth += 1;
    else if (html[i] === '}') { depth -= 1; if (depth === 0) { end = i; break; } }
  }
  return html.slice(start, end).match(/background\s*:\s*([^;]+)/i)?.[1]?.trim() ?? null;
}

export function evolveGuide(scene) {
  const ids = [...scene.html.matchAll(/data-om-id=["']([^"']+)["']/g)].map((m) => m[1]);
  const background = frameBackground(scene.html) ?? 'unset';
  return [
    `Fork this scene's HTML verbatim, then change only what the new beat needs.`,
    `Continuing actor ids: ${ids.length ? ids.join(', ') : 'none'}. Keep the same data-om-id for actors that stay visible.`,
    `Frame background: ${background}. Keep it identical for a matched cut.`,
    `Lock every continuing actor at t=0 with tl.set('[data-om-id="ID"]', { ...exact exit state... }, 0).`,
    `If this beat is intentionally unrelated, call add_scene with freshStart:true instead.`
  ].join('\n');
}

export function evolveWarnings(previous, next) {
  const warnings = [];
  const prevIds = new Set([...previous.html.matchAll(/data-om-id=["']([^"']+)["']/g)].map((m) => m[1]));
  if (frameBackground(previous.html) !== frameBackground(next.html)) warnings.push('The .frame background changed across an evolve cut; this reads as a hard cut, not a connected scene.');
  if (prevIds.size && ![...prevIds].some((id) => next.html.includes(`data-om-id="${id}"`) || next.html.includes(`data-om-id='${id}'`))) {
    warnings.push('No continuing data-om-id actors were kept from the previous scene.');
  }
  return warnings;
}
