# Example: True 3D Product Object

Use this as the baseline for a dimensional product mark, object stack, or studio-lit hero. It demonstrates real geometry and occlusion—not CSS perspective.

```html
<!doctype html>
<html>
  <head>
    <style>
      /* {{FONTS_CSS}} */
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html,body{width:100%;height:100%;overflow:hidden;background:#07090d}
      .frame{position:relative;width:{{W}}px;height:{{H}}px;overflow:hidden;background:#07090d;font-family:'Display',sans-serif}
      #world{position:absolute;inset:0;width:100%;height:100%;display:block}
      .copy{position:absolute;left:90px;bottom:82px;color:#f5f7fb;pointer-events:none}
      .copy h1{font-size:78px;line-height:.96;letter-spacing:-.035em}
      .copy p{margin-top:18px;font-family:'Body',sans-serif;font-size:25px;color:#9ba6b8}
    </style>
  </head>
  <body>
    <div class="frame">
      <canvas id="world"></canvas>
      <div class="copy">
        <h1 data-om-id="headline" data-om-label="Headline">Built with depth.</h1>
        <p data-om-id="tagline" data-om-label="Tagline">Real geometry. Real light.</p>
      </div>
    </div>
    {{THREE}} {{GSAP}}
    <script>
      const T = THREE;
      const duration = 6;
      const stage = OM3D.create({canvas:'#world',width:{{W}},height:{{H}},background:'#07090d',camera:[4.8,3.2,8.5],target:[0,.1,0],fov:32,exposure:1.2,shadows:true});
      OM3D.addStudioLights(stage,{ambient:1.25,key:5,rim:3.5,rimColor:0x7aa7ff});
      OM3D.addGround(stage,{y:-1.65,color:0x0c1018,roughness:.72});

      const stack = new T.Group();
      const coverMat = new T.MeshStandardMaterial({color:0x171c26,metalness:.48,roughness:.26});
      const pageMat = new T.MeshStandardMaterial({color:0xdbe3ef,metalness:.08,roughness:.48});
      for(let i=0;i<4;i++){
        const pages=new T.Mesh(new T.BoxGeometry(2.75,.42,2.05),pageMat);
        const cover=new T.Mesh(new T.BoxGeometry(2.92,.12,2.22),coverMat);
        pages.position.y=i*.58-1.05;
        cover.position.y=pages.position.y+.27;
        pages.rotation.y=cover.rotation.y=(i-1.5)*.055;
        pages.castShadow=cover.castShadow=true;
        stack.add(pages,cover);
      }
      stage.scene.add(stack);

      const tl=gsap.timeline({paused:true});
      tl.fromTo('.copy',{x:-42,opacity:0},{x:0,opacity:1,duration:.75,ease:'power4.out'},.35);
      stage.bindTimeline(tl,duration,(time,world)=>{
        const settle=1-Math.pow(1-Math.min(1,time/1.25),3);
        stack.position.y=-.5+(settle*.5)+Math.sin(time*.9)*.035;
        stack.rotation.y=-.55+(settle*.42)+Math.sin(time*.32)*.08;
        stack.rotation.x=-.08+Math.sin(time*.45)*.025;
        world.camera.position.x=4.8-Math.min(time/6,1)*.6;
        world.target.y=.05;
      });
      window.__SCENE_TIMELINE__=tl;
      window.__SCENE_DURATION__=duration;
    </script>
  </body>
</html>
```

Adapt geometry, copy, and materials to the brief. Keep the deterministic `bindTimeline` structure intact.
