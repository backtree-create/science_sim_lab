/* Perspective 3D renderer using Canvas: works without a WebGL context.
   3D mesh vertices, depth sorting and face lighting are recomputed on orbit. */
(()=>{'use strict';
const $=id=>document.getElementById(id),M=window.models,scene=$('scene3d'),chart=$('chart');
let elapsed=0,mass=100,running=false,last=0,yaw=-.55,pitch=.24,drag=null,phase=M.phase(0,100),sceneSize={w:0,h:0},chartSize={w:0,h:0};
const C={ice:'#0076b8',water:'#007c9b',gas:'#803daf',ink:'#193b53'};
// A fixed net 1000 W supplies 1 kJ per second to the existing energy model.
function stateAt(seconds){return M.phase(seconds,mass)}
function clock(seconds){const n=Math.round(seconds);return `${Math.floor(n/60)}分${String(n%60).padStart(2,'0')}秒`}
function tickLabel(seconds){return seconds%60===0?`${seconds/60}分`:seconds<60?`${seconds}秒`:`${Math.floor(seconds/60)}分${seconds%60}秒`}
function fit(canvas,set){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);set.w=r.width;set.h=r.height}
function project(p){const [x,Y,z]=p,y=Y-2.0,xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw),yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=y*Math.sin(pitch)+zz*Math.cos(pitch),f=8/(8-depth),s=Math.min(sceneSize.w/5.5,sceneSize.h/6.0);return{x:sceneSize.w*.48+xx*s*f,y:sceneSize.h*.51-yy*s*f,z:depth,s:s*f}}
function draw3d(){const ctx=scene.getContext('2d'),{w,h}=sceneSize;if(!w||!h)return;ctx.clearRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#e5eef5');bg.addColorStop(1,'#f7fbfd');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
const faces=[];function face(v,color,alpha=1,stroke){const p=v.map(project);faces.push({p,z:p.reduce((a,b)=>a+b.z,0)/p.length,color,alpha,stroke})}
function box(x,y,z,sx,sy,sz,colors){const v=[[x-sx/2,y,z-sz/2],[x+sx/2,y,z-sz/2],[x+sx/2,y,z+sz/2],[x-sx/2,y,z+sz/2],[x-sx/2,y+sy,z-sz/2],[x+sx/2,y+sy,z-sz/2],[x+sx/2,y+sy,z+sz/2],[x-sx/2,y+sy,z+sz/2]];[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach((ids,i)=>face(ids.map(j=>v[j]),colors[i%colors.length],1,colors[0]))}
function cylinder(radius,bottom,top,color,alpha=1,caps=true){const n=36;let topRing=[];for(let i=0;i<n;i++){const a=i/n*2*Math.PI,b=(i+1)/n*2*Math.PI,aa=[radius*Math.cos(a),bottom,radius*Math.sin(a)],bb=[radius*Math.cos(b),bottom,radius*Math.sin(b)],cc=[bb[0],top,bb[2]],dd=[aa[0],top,aa[2]];face([aa,bb,cc,dd],color,alpha);topRing.push(dd)}if(caps)face(topRing,color,alpha,'#618a9e')}
function ring(radius,y,color){const ps=Array.from({length:49},(_,i)=>project([radius*Math.cos(i/48*Math.PI*2),y,radius*Math.sin(i/48*Math.PI*2)]));return{ps,color}}
function label(p,text,color=C.ink){const q=project(p);ctx.font='12px Arial,sans-serif';const tw=ctx.measureText(text).width;let x=Math.min(w-tw-9,Math.max(7,q.x));let y=Math.max(22,Math.min(h-27,q.y));ctx.fillStyle='#ffffffee';ctx.fillRect(x-4,y-14,tw+8,20);ctx.fillStyle=color;ctx.fillText(text,x,y)}
box(0,-.38,0,2.9,.22,2.5,['#415b70','#2f465b','#57778e','#294459','#738da0']);cylinder(1.16,-.16,.04,running?'#d66217':'#8c6952');
const fillHeight=.8*mass/100*phase.l,lid=1.9+2.1*phase.g;
// Tank walls are lightly transparent; their fixed height is a schematic scale.
cylinder(1.04,.04,4.3,'#77a8c6',.08,false);
if(phase.l>1e-6)cylinder(.98,.06,.06+fillHeight,'#078ab5',.74);
if(phase.s>1e-6){let size=1.38*Math.cbrt(mass/100*phase.s),y=.06+Math.max(0,fillHeight-size*.917);box(0,y,0,size,size,size,['#8cd6f5','#56a6d0','#b1e9fc','#4c98c3','#dbf7ff']);}
// Gas space is intentionally not filled with white fog.
cylinder(1.04,lid,lid+.1,'#748fa2',.82);box(0,lid+.1,0,.10,.4,.10,['#6d899a','#aec0cd']);
const bubbles=[];if(phase.g>0&&phase.l>0){const t=elapsed;for(let i=0;i<12;i++){const angle=i*2.4,rad=.3+(i%3)*.2,bottom=.13,top=.06+fillHeight,y=bottom+((t*.22+i*.173)%1)*Math.max(0,top-bottom);const p=project([Math.cos(angle)*rad,y,Math.sin(angle)*rad]);bubbles.push({p,z:p.z})}}
for(const b of bubbles)faces.push({bubble:b.p,z:b.z});
faces.sort((a,b)=>a.z-b.z);for(const f of faces){if(f.bubble){const p=f.bubble;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(2,p.s*.045),0,2*Math.PI);ctx.fillStyle='#dcf7ff';ctx.fill();ctx.strokeStyle='#267793';ctx.lineWidth=1;ctx.stroke();continue}ctx.globalAlpha=f.alpha;ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();if(f.stroke){ctx.strokeStyle=f.stroke;ctx.lineWidth=.6;ctx.stroke()}}
ctx.globalAlpha=1;for(const r of [ring(1.04,.04,'#5686a1'),ring(1.04,4.3,'#7399ad')]){ctx.beginPath();r.ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=r.color;ctx.lineWidth=1.3;ctx.stroke()}
for(const a of [Math.PI*.25,Math.PI*1.25]){const p=project([1.04*Math.cos(a),.04,1.04*Math.sin(a)]),q=project([1.04*Math.cos(a),4.3,1.04*Math.sin(a)]);ctx.strokeStyle='#789bb2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
label([1.1,lid+.2,0],'可動ふた');if(phase.g>.02)label([.6,(lid+fillHeight)/2,0],'水蒸気（透明）',C.gas);if(phase.l>.02)label([.85,.06+fillHeight*.4,0],'水',C.water);if(phase.s>.02)label([-1.5,.8,0],'氷',C.ice);
}
function drawChart(){const c=chart.getContext('2d'),{w,h}=chartSize;if(!w||!h)return;c.clearRect(0,0,w,h);const max=+$('chartRange').value,L=47,R=w-16,T=32,B=h-36,x=t=>L+t/max*(R-L),y=t=>B-(t+20)/140*(B-T);c.font='12px Arial,sans-serif';c.textBaseline='alphabetic';
function line(x1,y1,x2,y2,color,width=1,dash=[]){c.beginPath();c.setLineDash(dash);c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();c.setLineDash([])}
for(const temp of [-20,0,20,40,60,80,100,120]){line(L,y(temp),R,y(temp),temp===0||temp===100?'#a1b8ca':'#e0e8ee');c.fillStyle=C.ink;c.textAlign='right';c.fillText(temp,L-8,y(temp)+4)}
const step=max===120?30:60;for(let t=0;t<=max;t+=step){line(x(t),T,x(t),B,'#e7edf2');c.textAlign='center';c.fillStyle=C.ink;let label=tickLabel(t);if(w<450&&max===660&&t%120!==0&&t!==max)label='';c.fillText(label,x(t),B+18)}
line(L,T,L,B,C.ink);line(L,B,R,B,C.ink);c.textAlign='left';c.fillText('温度（℃）',L,14);c.textAlign='right';c.fillText('加熱時間',R,h-3);
const end=Math.min(max,$('showCurve').checked?phase.max:elapsed),times=M.cuts.map(q=>q*mass/1000).filter(t=>t<end).concat([end]);c.save();c.beginPath();c.rect(L-1,T-1,R-L+2,B-T+2);c.clip();c.beginPath();times.forEach((t,i)=>i?c.lineTo(x(t),y(stateAt(t).t)):c.moveTo(x(t),y(stateAt(t).t)));c.lineWidth=3;c.strokeStyle='#006aad';c.stroke();
if(elapsed<=max){line(x(elapsed),T,x(elapsed),B,'#b25000',1.5,[4,4]);c.beginPath();c.arc(x(elapsed),y(phase.t),5,0,2*Math.PI);c.fillStyle='#b25000';c.fill();c.strokeStyle='#fff';c.lineWidth=1.5;c.stroke()}c.restore();
if(elapsed<=max){c.font='bold 12px Arial,sans-serif';const label=clock(elapsed),width=c.measureText(label).width+12,xx=Math.max(L,Math.min(R-width,x(elapsed)-width/2));c.fillStyle='#fff0dc';c.fillRect(xx,16,width,16);c.fillStyle='#884400';c.textAlign='left';c.fillText(label,xx+6,28)}
$('showAll').hidden=elapsed<=max;$('chartMessage').textContent=elapsed>max?`現在 ${clock(elapsed)}：表示範囲の右側です`:'縦：温度（℃）　横：加熱時間（分・秒）';
}
function update(){phase=stateAt(elapsed);$('temperature').textContent=phase.t.toFixed(1)+' ℃';$('state').textContent=phase.state;$('clock').textContent=clock(elapsed);$('elapsedOut').textContent=clock(elapsed);$('massOut').textContent=mass+' g';$('elapsed').max=phase.max.toFixed(2);$('elapsed').value=elapsed.toFixed(2);$('elapsed').setAttribute('aria-valuetext',clock(elapsed));$('fractions').innerHTML=[['氷',phase.s,C.ice],['水',phase.l,C.water],['水蒸気',phase.g,C.gas]].map(([n,f,col])=>`<span style="--c:${col};color:${col}">${n} ${(f*mass).toFixed(1)} g</span>`).join('');$('sceneCaption').textContent=phase.s>0&&phase.l>0?'融解中：氷が小さくなる':phase.l>0&&phase.g>0?'沸騰中：水が水蒸気になる':phase.s>0?'氷を加熱':phase.l>0?'水の温度が上がる':'すべて水蒸気';$('status').textContent=elapsed>=phase.max-.001?'加熱の記録はここまで。前の時刻と比べよう。':running?'加熱を再生中。温度と中の様子を見比べよう。':'再生するか、観察する時刻を動かそう。';$('play').disabled=running||elapsed>=phase.max-.001;$('pause').disabled=!running;draw3d();drawChart()}
function go(t){elapsed=Math.max(0,Math.min(stateAt(0).max,t));if(elapsed>=stateAt(0).max-.001)running=false;update()}
$('mass').oninput=()=>{mass=+$('mass').value;running=false;elapsed=0;update()};$('elapsed').oninput=()=>{running=false;go(+$('elapsed').value)};$('play').onclick=()=>{running=true;last=0;update()};$('pause').onclick=()=>{running=false;update()};$('back10').onclick=()=>{running=false;go(elapsed-10)};$('forward10').onclick=()=>{running=false;go(elapsed+10)};$('reset').onclick=()=>{running=false;go(0)};$('chartRange').onchange=drawChart;$('showCurve').onchange=drawChart;$('showAll').onclick=()=>{$('chartRange').value='660';drawChart()};$('modelOpen').onclick=()=>$('model').showModal();$('viewReset').onclick=()=>{yaw=-.55;pitch=.24;draw3d()};
scene.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId};scene.setPointerCapture(e.pointerId)};scene.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag.x)*.01;pitch=Math.max(-.1,Math.min(.7,pitch+(e.clientY-drag.y)*.005));drag.x=e.clientX;drag.y=e.clientY;draw3d()};scene.onpointerup=scene.onpointercancel=()=>drag=null;scene.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();yaw+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;pitch=Math.max(-.1,Math.min(.7,pitch+(e.key==='ArrowUp'?.05:e.key==='ArrowDown'?-.05:0)));draw3d()};
new ResizeObserver(()=>{fit(scene,sceneSize);fit(chart,chartSize);draw3d();drawChart()}).observe(document.querySelector('.observations'));
let redraw=0;function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(running){elapsed=Math.min(stateAt(0).max,elapsed+dt*+$('speed').value);if(elapsed>=stateAt(0).max-.001)running=false;redraw+=dt;if(redraw>.04||!running){redraw=0;update()}}requestAnimationFrame(frame)}update();requestAnimationFrame(frame);
})();
