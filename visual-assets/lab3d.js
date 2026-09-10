/* Lightweight shared materials for scientific, live-rendered models. Three r128. */
window.Lab3D = (() => {
  function renderer(r){r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.9;return r;}
  function cloudTexture(){
    if(cloudTexture.cache)return cloudTexture.cache;
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
    // Stable overlapping lobes give clouds volume without per-frame texture work.
    for(let i=0;i<24;i++){
      const a=i*2.39996,r=8+Math.sqrt(i/24)*26,x=64+Math.cos(a)*r,y=66+Math.sin(a)*r*.65;
      const rad=19+(i%5)*2,grad=g.createRadialGradient(x-5,y-8,1,x,y,rad);
      grad.addColorStop(0,'rgba(255,255,255,.62)');grad.addColorStop(.45,'rgba(217,230,240,.38)');grad.addColorStop(1,'rgba(132,157,180,0)');
      g.fillStyle=grad;g.fillRect(x-rad,y-rad,rad*2,rad*2);
    }
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t._labShared=true;cloudTexture.cache=t;return t;
  }
  function strataTexture(){
    if(strataTexture.cache)return strataTexture.cache;
    const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');
    const colors=['#70462e','#c29b64','#503628','#dbb97c','#795033','#b88751','#49352c','#a97443'];
    for(let y=0;y<256;y++){
      g.fillStyle=colors[Math.floor(y/32)%8];g.fillRect(0,y,512,1);
      g.fillStyle=`rgba(48,30,20,${.02+(Math.sin(y*5.37)+1)*.035})`;g.fillRect(0,y,512,1);
    }
    let seed=77;for(let i=0;i<5200;i++){seed=(seed*16807)%2147483647;const x=seed%512;seed=(seed*16807)%2147483647;const y=seed%256;g.fillStyle=i%2?'#ffffff16':'#34211320';g.fillRect(x,y,1+i%3,1);}
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t._labShared=true;strataTexture.cache=t;return t;
  }
  function label(text,color='#243a4a',height=1.2){
    const c=document.createElement('canvas'),g=c.getContext('2d');g.font='600 28px sans-serif';c.width=Math.ceil(g.measureText(text).width)+32;c.height=54;
    g.fillStyle='#ffffff';g.fillRect(0,0,c.width,54);g.font='600 28px sans-serif';g.fillStyle=color;g.textBaseline='middle';g.fillText(text,16,27);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,depthWrite:false,toneMapped:false}));s.scale.set(height*c.width/54,height,1);s.renderOrder=10;return s;
  }
  function dispose(group){group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const a=Array.isArray(o.material)?o.material:[o.material];a.forEach(m=>{if(m.map&&!m.map._labShared)m.map.dispose();m.dispose();});}});group.clear();}
  return {renderer,cloudTexture,strataTexture,label,dispose};
})();
