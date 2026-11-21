// Small deterministic hand-drawn SVG helper injected by {{ROUGH}}.
// Original MIT implementation; no rough.js dependency at render time.
export const ROUGH_SOURCE = `<script data-om-rough-runtime>(function(){
  function hash(parts){
    var h=2166136261;
    for(var i=0;i<parts.length;i++){
      var s=String(parts[i]);
      for(var j=0;j<s.length;j++){h^=s.charCodeAt(j);h=(h*16777619)>>>0;}
    }
    return h>>>0;
  }
  function rng(seed){
    var s=seed>>>0;
    return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  }
  function n(value){return Math.round(value*100)/100;}
  function strokeLine(x1,y1,x2,y2,rand,rough){
    var dx=x2-x1,dy=y2-y1;
    function point(t){
      return [n(x1+dx*t+(rand()-0.5)*rough),n(y1+dy*t+(rand()-0.5)*rough)];
    }
    var a=point(0.05),b=point(0.95),m=point(0.5);
    return 'M'+a[0]+' '+a[1]+' Q'+m[0]+' '+m[1]+' '+b[0]+' '+b[1];
  }
  function style(opts){
    opts=opts||{};
    return 'fill="'+(opts.fill||'none')+'" stroke="'+(opts.stroke||'#1A1A1A')+
      '" stroke-width="'+(opts.strokeWidth||3)+'"';
  }
  function path(d,opts){return '<path d="'+d+'" '+style(opts)+'/>';}
  function lines(segments,opts,rand,rough){
    return segments.map(function(seg){return path(strokeLine(seg[0],seg[1],seg[2],seg[3],rand,rough),opts);}).join('');
  }
  window.OMRough={
    line:function(x1,y1,x2,y2,opts){
      var seed=hash(['line',x1,y1,x2,y2,opts&&opts.seed]);
      var rand=rng(seed),rough=(opts&&opts.roughness)==null?2:opts.roughness;
      return '<svg class="om-rough-svg" xmlns="http://www.w3.org/2000/svg" width="'+n(Math.max(x1,x2)+8)+'" height="'+n(Math.max(y1,y2)+8)+'">'+
        lines([[x1,y1,x2,y2],[x1,y1,x2,y2]],opts,rand,rough)+'</svg>';
    },
    rect:function(x,y,w,h,opts){
      var seed=hash(['rect',x,y,w,h,opts&&opts.seed]);
      var rand=rng(seed),rough=(opts&&opts.roughness)==null?2:opts.roughness;
      var segs=[[x,y,x+w,y],[x+w,y,x+w,y+h],[x+w,y+h,x,y+h],[x,y+h,x,y]];
      return '<svg class="om-rough-svg" xmlns="http://www.w3.org/2000/svg" width="'+n(x+w+8)+'" height="'+n(y+h+8)+'">'+
        lines(segs,opts,rand,rough)+lines(segs,opts,rng(seed+1),rough)+'</svg>';
    },
    ellipse:function(cx,cy,w,h,opts){
      var seed=hash(['ellipse',cx,cy,w,h,opts&&opts.seed]);
      var rand=rng(seed),rough=(opts&&opts.roughness)==null?2:opts.roughness;
      var d='';
      for(var k=0;k<=16;k++){
        var a=(k/16)*Math.PI*2;
        var px=cx+Math.cos(a)*w/2+(rand()-0.5)*rough;
        var py=cy+Math.sin(a)*h/2+(rand()-0.5)*rough;
        d+=(k===0?'M':'L')+n(px)+' '+n(py);
      }
      return '<svg class="om-rough-svg" xmlns="http://www.w3.org/2000/svg" width="'+n(cx+w/2+8)+'" height="'+n(cy+h/2+8)+'">'+
        path(d,opts)+'</svg>';
    },
    polygon:function(points,opts){
      var seed=hash(['polygon'].concat(points.map(function(p){return p[0]+','+p[1];}),[opts&&opts.seed]));
      var rand=rng(seed),rough=(opts&&opts.roughness)==null?2:opts.roughness;
      var segs=[];
      for(var i=0;i<points.length;i++){
        var a=points[i],b=points[(i+1)%points.length];
        segs.push([a[0],a[1],b[0],b[1]]);
      }
      return '<svg class="om-rough-svg" xmlns="http://www.w3.org/2000/svg" width="'+n(Math.max.apply(null,points.map(function(p){return p[0];}))+8)+'" height="'+n(Math.max.apply(null,points.map(function(p){return p[1];}))+8)+'">'+
        lines(segs,opts,rand,rough)+'</svg>';
    },
    prepareDrawOn:function(target){
      var root=typeof target==='string'?document.querySelector(target):target;
      if(!root)return[];
      return [].slice.call(root.querySelectorAll('path')).map(function(el){
        var length=el.getTotalLength?el.getTotalLength():0;
        el.style.strokeDasharray=length;
        el.style.strokeDashoffset=0;
        return length;
      });
    }
  };
  if(typeof document!=='undefined'&&!document.getElementById('om-rough-style')){
    var styleEl=document.createElement('style');
    styleEl.id='om-rough-style';
    styleEl.textContent='.om-rough-svg path{stroke-linecap:round;stroke-linejoin:round}.om-paper-bg{background:#F7F3E8}';
    document.head.appendChild(styleEl);
  }
})();<\/script>`;

export function loadRoughHelpers() {
  const window = {};
  const source = ROUGH_SOURCE.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  new Function('window', source)(window);
  return window.OMRough;
}
