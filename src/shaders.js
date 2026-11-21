// Local CSS utility layer that replaces the proprietary OMShaders bundle.
// Inline styles only: no WebGL, no canvas, no network, no dependency.
export const SHADERS_SOURCE = `<script data-om-shaders-runtime>(function(){
  function resolve(target){
    if(typeof target==='string')return document.querySelector(target);
    return target||null;
  }
  function rgba(hex,alpha){
    var value=String(hex||'#000000').replace('#','');
    if(value.length===3)value=value[0]+value[0]+value[1]+value[1]+value[2]+value[2];
    var num=parseInt(value,16);
    return 'rgba('+((num>>16)&255)+','+((num>>8)&255)+','+(num&255)+','+alpha+')';
  }
  var STYLE='.om-glass{background:rgba(255,255,255,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.16)}'+
    '.om-translucent{background:rgba(255,255,255,.12)}'+
    '.om-aberration{text-shadow:2px 0 rgba(255,60,60,.6),-2px 0 rgba(60,160,255,.6)}'+
    '.om-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.45) 100%)}';
  function ensureStyle(){
    if(document.getElementById&&document.getElementById('om-shaders-style'))return;
    if(!document.head||!document.createElement)return;
    var el=document.createElement('style');
    el.id='om-shaders-style';
    el.textContent=STYLE;
    document.head.appendChild(el);
  }
  window.OMShaders={
    inject:ensureStyle,
    translucent:function(target,color,alpha){
      var el=resolve(target);if(!el)return null;
      el.style.background=rgba(color||'#FFFFFF',alpha==null?0.12:alpha);
      ensureStyle();return el;
    },
    glass:function(target,opts){
      var el=resolve(target);if(!el)return null;
      opts=opts||{};
      el.style.background=rgba(opts.color||'#FFFFFF',opts.alpha==null?0.08:opts.alpha);
      el.style.backdropFilter='blur('+(opts.blur||12)+'px)';
      el.style.webkitBackdropFilter='blur('+(opts.blur||12)+'px)';
      el.style.border='1px solid '+rgba('#FFFFFF',0.16);
      ensureStyle();return el;
    },
    aberration:function(target,amount){
      var el=resolve(target);if(!el)return null;
      var d=amount||2;
      el.style.textShadow=d+'px 0 rgba(255,60,60,.6),'+(-d)+'px 0 rgba(60,160,255,.6)';
      ensureStyle();return el;
    },
    vignette:function(target){
      var el=resolve(target);if(!el)return null;
      var layer=document.createElement?document.createElement('div'):{style:{}};
      layer.setAttribute?layer.setAttribute('data-om-shaders','vignette'):null;
      layer.style.position='absolute';layer.style.inset='0';layer.style.pointerEvents='none';
      layer.style.background='radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.45) 100%)';
      el.appendChild?el.appendChild(layer):null;
      ensureStyle();return layer;
    }
  };
  ensureStyle();
})();<\/script>`;

export function loadShadersHelpers(documentStub = {}) {
  const window = {};
  const source = SHADERS_SOURCE.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  new Function('window', 'document', source)(window, documentStub);
  return window.OMShaders;
}
