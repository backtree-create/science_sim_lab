/* Parametric volcano cutaway. Viscosity is an illustrative control, not a CFD solver. */
window.VolcanoView=class {
  constructor(mount){
    this.mount=mount;this.value=-1;this.cut=true;this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.time=0;
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(38,1,.1,300);this.camera.position.set(35,27,40);
    this.renderer=Lab3D.renderer(new THREE.WebGLRenderer({antialias:true,alpha:true}));this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));mount.appendChild(this.renderer.domElement);
    this.controls=new THREE.OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,4,0);this.controls.enableDamping=true;this.controls.enablePan=false;this.controls.minDistance=24;this.controls.maxDistance=85;this.controls.maxPolarAngle=Math.PI*.64;
    this.scene.add(new THREE.HemisphereLight(0xf3faff,0x5e493a,.65));const sun=new THREE.DirectionalLight(0xffefd8,1.1);sun.position.set(-15,30,20);this.scene.add(sun);const rim=new THREE.DirectionalLight(0xb0d8ed,.7);rim.position.set(15,15,-18);this.scene.add(rim);
    this.rock=new THREE.Group();this.flow=new THREE.Group();this.annotations=new THREE.Group();this.scene.add(this.rock,this.flow,this.annotations);
    this.smoke=[];for(let i=0;i<28;i++){const m=new THREE.SpriteMaterial({map:Lab3D.cloudTexture(),transparent:true,depthWrite:false,color:0xc5c3c1,opacity:0});const p=new THREE.Sprite(m);this.scene.add(p);this.smoke.push(p);}
    this.resize=()=>{const w=mount.clientWidth||760,h=mount.clientHeight||560;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();};new ResizeObserver(this.resize).observe(mount);this.resize();
    this.controls.addEventListener('start',()=>{this.interacting=true});this.controls.addEventListener('end',()=>{this.interacting=false});
    let last=0;const loop=(now)=>{requestAnimationFrame(loop);const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!this.paused&&!document.hidden)this.time+=dt;this.animate();this.controls.update();this.renderer.render(this.scene,this.camera);};requestAnimationFrame(loop);
  }
  height(r,a){const v=this.value/100,R=13-6*v,h=3+8*v,u=Math.min(1,r/R),q=Math.max(0,1-u);const shield=Math.pow(q,2.1),cone=Math.pow(q,1.15),dome=Math.pow(Math.max(0,1-u*u),.62);let shape=v<.5?THREE.MathUtils.lerp(shield,cone,v*2):THREE.MathUtils.lerp(cone,dome,(v-.5)*2);let y=h*shape;y+=Math.sin(a*13+r*1.9)*Math.sin(r*.55)*.17*q;return Math.max(0,y);}

  setValue(v,force=false){
    if(v===this.value&&!force)return;this.value=v;Lab3D.dispose(this.rock);Lab3D.dispose(this.flow);Lab3D.dispose(this.annotations);this.beads=[];
    const N=96,M=44,R=14,start=this.cut?Math.PI/2:0,len=this.cut?Math.PI*1.5:Math.PI*2;
    const pos=[],col=[],idx=[];const base=new THREE.Color().setHSL(.08,.13,.14+.24*v/100);
    for(let j=0;j<=M;j++){const r=.02+(R-.02)*j/M;for(let i=0;i<=N;i++){const a=start+len*i/N,y=this.height(r,a);pos.push(Math.sin(a)*r,y,Math.cos(a)*r);const c=base.clone().multiplyScalar(.83+.20*Math.sin(a*11+r*1.7)+.18*y/11);col.push(c.r,c.g,c.b);}}
    for(let j=0;j<M;j++)for(let i=0;i<N;i++){const k=j*(N+1)+i;idx.push(k,k+N+1,k+1,k+1,k+N+1,k+N+2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
    this.rock.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide})));
    const earth=new THREE.Mesh(new THREE.CylinderGeometry(R,R,5,96,1,false,start,len),new THREE.MeshStandardMaterial({map:Lab3D.strataTexture(),roughness:1}));earth.position.y=-2.52;this.rock.add(earth);
    if(this.cut){
      for(const a of [start,start+len]){const p=[],uv=[],ind=[];for(let j=0;j<=M;j++){const r=R*j/M,y=this.height(r,a);p.push(Math.sin(a)*r,-5,Math.cos(a)*r,Math.sin(a)*r,y,Math.cos(a)*r);uv.push(r/R,0,r/R,(y+5)/16);if(j<M){const k=j*2;ind.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();this.rock.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:Lab3D.strataTexture(),roughness:.95,side:THREE.DoubleSide})));}
      const chamber=new THREE.Mesh(new THREE.SphereGeometry(2,36,20),new THREE.MeshStandardMaterial({color:0xe65718,emissive:0xc92a05,emissiveIntensity:.8,roughness:.55}));chamber.scale.set(1.5,.75,1.1);chamber.position.set(.5,-2.8,.5);this.flow.add(chamber);
      const h=this.height(0,0),pipe=new THREE.Mesh(new THREE.CylinderGeometry(.28,.55,h+2.6,20),new THREE.MeshStandardMaterial({color:0xffa341,emissive:0xee3f05,emissiveIntensity:.9}));pipe.position.set(.16,(h-2.6)/2,.16);this.flow.add(pipe);
      const lab=Lab3D.label('マグマだまり','#993d1c',1.1);lab.position.set(5,-3.6,5);this.annotations.add(lab);
      const l=Lab3D.label('地下の断面','#58493d',1);l.position.set(10,-4.8,6);this.annotations.add(l);
    }
    const tip=this.height(0,0);const crater=new THREE.Mesh(new THREE.TorusGeometry(.68,.19,10,36),new THREE.MeshStandardMaterial({color:0x6c3b24,emissive:0xaf3104,emissiveIntensity:.6}));crater.rotation.x=Math.PI/2;crater.position.y=tip+.05;this.flow.add(crater);
    // Lava follows the surface; high viscosity restricts runout and slows the moving tracers.
    for(let k=0;k<4;k++){const pts=[];const a=start+.35+k*(len-.7)/4;const run=(12-8.3*v/100);for(let j=0;j<=55;j++){const r=.6+run*j/55,ang=a+Math.sin(r*.7+k)*.035;pts.push(new THREE.Vector3(Math.sin(ang)*r,this.height(r,ang)+.08,Math.cos(ang)*r));}const curve=new THREE.CatmullRomCurve3(pts);const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,70,.16+v/1000,7,false),new THREE.MeshStandardMaterial({color:0xe45613,emissive:0xfa4707,emissiveIntensity:.8,roughness:.8}));this.flow.add(tube);for(let b=0;b<4;b++){const bead=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:0xffcf72}));this.flow.add(bead);this.beads.push({mesh:bead,curve,offset:b/4+k*.13});}}
    const l=Lab3D.label(v<35?'広く流れる溶岩':v<70?'斜面に積み重なる溶岩':'火口近くに盛り上がる溶岩','#793a22',1.1);l.position.set(-7,tip+2.5,0);this.annotations.add(l);
  }
  animate(){if(this.value<0)return;const v=this.value/100;this.beads.forEach(b=>b.mesh.position.copy(b.curve.getPointAt((this.time*(.10-.075*v)+b.offset)%1)));const tip=this.height(0,0);this.smoke.forEach((p,i)=>{const t=(this.time*(.12+v*.08)+i/28)%1,a=i*2.4;const spread=(.5+t*3)*(1+v);p.position.set(Math.cos(a)*spread*.6+t*2,tip+.5+t*(4+v*8),Math.sin(a)*spread*.5);p.scale.setScalar((.8+t*4)*(1+v*.5));p.material.opacity=Math.sin(t*Math.PI)*(.38+v*.30);p.material.color.setHSL(.1,.02,.38-v*.16);});}
  setCut(value){this.cut=value;this.setValue(this.value,true);}
  home(){this.camera.position.set(35,27,40);this.controls.target.set(0,4,0);this.controls.update();}
};
