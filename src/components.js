// Small local component library for {{COMPONENT:id}}. Original MIT markup.
export const BUILTIN_COMPONENTS = {
  button: '<button class="om-btn" data-om-id="cta" type="button">Get started</button>',
  card: '<div class="om-card" data-om-id="card"><div class="om-card-title">A clear title</div><div class="om-card-body">One line of supporting copy.</div></div>',
  stat: '<div class="om-stat" data-om-id="stat"><b>288</b><span>FRAMES</span></div>',
  pill: '<span class="om-pill" data-om-id="pill">OPEN SOURCE</span>',
  promptbar: '<div class="om-promptbar" data-om-id="promptbar"><span>Describe your video</span></div>'
};

export const COMPONENT_CSS = [
  '.om-btn{border:0;border-radius:12px;padding:18px 34px;background:var(--brand-primary,#F5A524);color:#0B0E14;font-family:Display;font-weight:900;font-size:30px;cursor:pointer}',
  '.om-card{min-width:420px;padding:32px;border:2px solid rgba(243,239,231,.16);border-radius:18px;background:rgba(243,239,231,.05)}',
  '.om-card-title{font-family:Display;font-weight:900;font-size:44px;color:var(--brand-text,#F3EFE9)}',
  '.om-card-body{font-family:Body;font-weight:300;font-size:28px;color:rgba(243,239,231,.66);margin-top:10px}',
  '.om-stat{display:flex;align-items:baseline;gap:16px;font-family:Mono;font-weight:500}',
  '.om-stat b{font-size:86px;color:var(--brand-primary,#F5A524);font-variant-numeric:tabular-nums}',
  '.om-stat span{font-size:20px;letter-spacing:.18em;color:rgba(243,239,231,.6)}',
  '.om-pill{display:inline-block;border:2px solid var(--brand-primary,#F5A524);border-radius:999px;padding:10px 22px;font-family:Mono;font-weight:500;font-size:19px;letter-spacing:.14em;color:var(--brand-primary,#F5A524)}',
  '.om-promptbar{min-width:640px;padding:24px 32px;border:2px solid rgba(245,165,36,.4);border-radius:16px;font-family:Body;font-weight:300;font-size:30px;color:rgba(243,239,231,.78)}'
].join('');

export function resolveComponent(components, id) {
  const key = String(id ?? '').trim();
  if (!/^[a-z0-9_-]+$/i.test(key)) return '';
  if (components && Object.prototype.hasOwnProperty.call(components, key)) {
    return String(components[key]);
  }
  return BUILTIN_COMPONENTS[key] ?? '';
}
