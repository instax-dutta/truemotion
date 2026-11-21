// Lightweight CSS-3D stage helper injected by {{THREE}}.
// Original MIT implementation: no WebGL bundle, no canvas, no network.
export const THREE_SOURCE = `<script data-om-three-runtime>(function(){
  var STYLE='.om3d-stage{perspective:1200px;transform-style:preserve-3d}'+
    '.om3d-plane{position:absolute;transform-style:preserve-3d;backface-visibility:hidden}';
  function ensureStyle(){
    if(document.getElementById&&document.getElementById('om-three-style'))return;
    if(!document.head||!document.createElement)return;
    var el=document.createElement('style');
    el.id='om-three-style';
    el.textContent=STYLE;
    document.head.appendChild(el);
  }
  function resolve(target){
    if(typeof target==='string')return document.querySelector(target);
    return target||null;
  }
  window.OM3D={
    create:function(target,opts){
      opts=opts||{};
      var stage=resolve(target);
      if(!stage)return null;
      if(stage.classList&&stage.classList.add)stage.classList.add('om3d-stage');
      stage.style.perspective=(opts.perspective||1200)+'px';
      stage.style.transformStyle='preserve-3d';
      var state={rotation:0,progress:0};
      return {
        element:stage,
        addPlane:function(el,p){
          p=p||{};
          el=resolve(el);
          if(!el)return null;
          if(el.classList&&el.classList.add)el.classList.add('om3d-plane');
          el.style.transformStyle='preserve-3d';
          el.style.transform='translate3d('+(p.x||0)+'px,'+(p.y||0)+'px,'+(p.z||0)+'px) rotateY('+(p.rotationY||0)+'deg) rotateX('+(p.rotationX||0)+'deg)';
          return el;
        },
        bindTimeline:function(tl,duration,onFrame){
          if(!tl)return null;
          var update=function(){
            var time=typeof tl.time==='function'?tl.time():0;
            var progress=duration?time/duration:0;
            state.progress=progress;
            state.rotation=(opts.maxRotation||6)*Math.sin(progress*Math.PI*2);
            stage.style.transform='rotateY('+state.rotation.toFixed(3)+'deg) rotateX('+(-state.rotation/2).toFixed(3)+'deg)';
            if(typeof onFrame==='function')onFrame(progress,state);
          };
          var seek=tl.seek;
          if(typeof seek==='function'){
            tl.seek=function(){var result=seek.apply(this,arguments);update();return result;};
          }
          update();
          return update;
        },
        state:state
      };
    }
  };
  ensureStyle();
})();<\/script>`;

export function loadThreeHelpers(documentStub = {}) {
  const window = {};
  const source = THREE_SOURCE.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  new Function('window', 'document', source)(window, documentStub);
  return window.OM3D;
}
