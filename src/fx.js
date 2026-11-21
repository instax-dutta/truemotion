// Small deterministic visual-effect helpers injected by {{FX}}.
// Original MIT implementation: no dependency, no canvas, no network.
export const FX_SOURCE = `<script data-om-fx-runtime>(function(){
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
  window.OMFX={
    outline:function(target,color,width){
      var el=resolve(target);if(!el)return null;
      el.style.boxShadow='0 0 0 '+(width||4)+'px '+(color||'#F5A524');
      return el;
    },
    glow:function(target,color,radius){
      var el=resolve(target);if(!el)return null;
      el.style.backgroundImage='radial-gradient(circle,'+rgba(color||'#F5A524',0.28)+' 0%,'+rgba(color||'#F5A524',0)+' '+(radius||60)+'%)';
      return el;
    },
    aberration:function(target,amount){
      var el=resolve(target);if(!el)return null;
      var d=amount||2;
      el.style.textShadow=d+'px 0 rgba(255,60,60,0.65),'+(-d)+'px 0 rgba(60,160,255,0.65)';
      return el;
    },
    scanlines:function(target,opts){
      var el=resolve(target);if(!el)return null;
      opts=opts||{};
      var size=(opts.size||4),alpha=opts.opacity==null?0.22:opts.opacity;
      var layer=document.createElement('div');
      layer.setAttribute('data-om-fx','scanlines');
      layer.style.position='absolute';
      layer.style.inset='0';
      layer.style.pointerEvents='none';
      layer.style.background='repeating-linear-gradient(to bottom,'+rgba('#000000',alpha)+' 0 '+size+'px,transparent '+size+'px '+(size*2)+'px)';
      el.appendChild(layer);
      return layer;
    },
    grain:function(target,opts){
      var el=resolve(target);if(!el)return null;
      opts=opts||{};
      var svg='<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="'+(opts.opacity==null?0.18:opts.opacity)+'"/></svg>';
      el.style.backgroundImage='url(data:image/svg+xml;base64,'+btoa(svg)+')';
      return el;
    }
  };
})();<\/script>`;

export function loadFxHelpers(documentStub = {}) {
  const window = {};
  const source = FX_SOURCE.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  new Function('window', 'document', source)(window, documentStub);
  return window.OMFX;
}
