/* Educational cross-section: relative pore-pressure index, not a geotechnical solver. */
'use strict';
const canvas=document.getElementById('simCanvas'),ctx=canvas.getContext('2d');
const W=1000,H=650,GROUND=294,BOTTOM=590;
let isQuaking=false,quakeIntensity=2,porePressure=0,quakeTime=0,sink=0,rise=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
let showContacts=true,lastFrame=0,lastPhase=-1;
const grains=[];
function hash(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
for(let row=0;row<8;row++)for(let col=0;col<25;col++){const i=row*25+col;grains.push({x:62+col*35+(row%2)*17,y:320+row*34,r:14+hash(i)*3,a:hash(i+900)*6.28});}
function setupCanvas(){const d=Math.min(devicePixelRatio||1,2);canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);}
new ResizeObserver(setupCanvas).observe(canvas);setupCanvas();
function polygon(pts,fill,stroke){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function line(pts,color,width=2){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function tag(text,x,y,tx,ty){ctx.font='600 22px sans-serif';const tw=ctx.measureText(text).width;line([[x,y+8],[x,y+23],[tx,ty]],'#263f51',2);ctx.fillStyle='#f8fbfd';ctx.fillRect(x-tw/2-12,y-27,tw+24,36);ctx.fillStyle='#263f51';ctx.textAlign='center';ctx.fillText(text,x,y);}
function arrow(x,y,dy,color){ctx.save();line([[x,y],[x,y+dy]],'#233c50',8);line([[x,y],[x,y+dy]],color,4);const s=Math.sign(dy);ctx.lineWidth=2;polygon([[x,y+dy],[x-8,y+dy-s*12],[x+8,y+dy-s*12]],color,'#233c50');ctx.restore();}
function draw(){
 ctx.clearRect(0,0,W,H);const sky=ctx.createLinearGradient(0,0,0,GROUND);sky.addColorStop(0,'#e9f2f8');sky.addColorStop(1,'#ffffff');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 const q=porePressure/100,sh=isQuaking&&!paused?Math.sin(quakeTime*29)*quakeIntensity*1.8:0;
 ctx.save();ctx.translate(sh,0);
 // A shallow perspective top and two cut faces keep surface and subsurface aligned.
 polygon([[40,GROUND],[930,GROUND],[968,GROUND-28],[78,GROUND-28]],'#456342');
 polygon([[930,GROUND],[968,GROUND-28],[968,BOTTOM-28],[930,BOTTOM]],'#6a5947');
 const soil=ctx.createLinearGradient(0,GROUND,0,BOTTOM);soil.addColorStop(0,'#74abc2');soil.addColorStop(.65,'#47839f');soil.addColorStop(1,'#305c77');ctx.fillStyle=soil;ctx.fillRect(40,GROUND,890,BOTTOM-GROUND);
 ctx.fillStyle=`rgba(0,91,151,${.08+q*.18})`;ctx.fillRect(40,GROUND+15,890,BOTTOM-GROUND-15);
 for(let n=0;n<1400;n++){ctx.fillStyle=n%2?'#fff8e912':'#4d3f3517';ctx.fillRect(45+hash(n+5000)*880,GROUND+20+hash(n+7000)*268,1.5,1.5);}
 // Contact chains fade as the effective supporting force is lost.
 const positions=grains.map((g,i)=>({x:g.x+Math.sin(quakeTime*2.8+g.a)*q*7,y:g.y+Math.cos(quakeTime*2.1+g.a)*q*5}));
 if(showContacts){for(let i=0;i<grains.length;i++){for(const j of [i+1,i+25,i+24]){if(j>=grains.length||Math.abs(grains[j].x-grains[i].x)>46)continue;line([[positions[i].x,positions[i].y],[positions[j].x,positions[j].y]],`rgba(62,36,14,${(1-q)*.95})`,3.5);}}}
 grains.forEach((g,i)=>{const p=positions[i];ctx.save();ctx.translate(p.x,p.y);ctx.rotate(g.a);const grad=ctx.createLinearGradient(-g.r,-g.r,g.r,g.r);grad.addColorStop(0,'#ffe5a3');grad.addColorStop(.5,'#e6b95f');grad.addColorStop(1,'#b17b2f');const pts=[];for(let k=0;k<9;k++){const a=k/9*Math.PI*2,r=g.r*(.9+.12*hash(i*9+k));pts.push([Math.cos(a)*r,Math.sin(a)*r]);}polygon(pts,grad,'#62421b');ctx.restore();});
 line([[40,GROUND+14],[930,GROUND+14]],'#004c80',4);
 // Building including foundation and perspective side; its base begins at the surface.
 ctx.save();ctx.translate(270,GROUND+sink);ctx.rotate(sink*.0014);
 ctx.fillStyle='rgba(26,42,46,.16)';ctx.beginPath();ctx.ellipse(14,2,98,14,0,0,Math.PI*2);ctx.fill();
 polygon([[-65,0],[67,0],[67,-163],[-65,-163]],'#e8ebeb','#344c5e');
 polygon([[67,0],[98,-21],[98,-184],[67,-163]],'#486679');
 polygon([[-65,-163],[67,-163],[98,-184],[-34,-184]],'#f8faf8','#344c5e');
 ctx.fillStyle='#344c5e';ctx.fillRect(-77,-2,156,14);ctx.fillStyle='#546e80';ctx.fillRect(-70,12,14,20);ctx.fillRect(58,12,14,20);
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=-50+col*30,y=-147+row*35;ctx.fillStyle='#526f7c';ctx.fillRect(x,y,18,23);ctx.fillStyle='#a4c0ca';ctx.fillRect(x+2,y+2,14,7);line([[x-1,y+24],[x+19,y+24]],'#fff',2);}
 ctx.restore();
 // Buried hollow concrete shaft, not merely a floating cover.
 const my=GROUND-rise;ctx.save();ctx.translate(714,my);
 polygon([[-43,0],[43,0],[43,166],[-43,166]],'#f0f3f5','#233c50');ctx.fillStyle='#233c50';ctx.fillRect(-29,15,58,139);ctx.fillStyle='#658196';ctx.fillRect(-22,21,44,132);
 for(let n=0;n<7;n++)line([[-12,29+n*17],[12,29+n*17]],'#516c75',3);
 polygon([[43,0],[63,-14],[63,152],[43,166]],'#415e73');
 polygon([[-49,0],[49,0],[65,-14],[-33,-14]],'#596b70','#334c55');
 for(let n=0;n<5;n++)line([[-32+n*16,-3],[-21+n*16,-11]],'#93a3a6',2);ctx.restore();
 if(q>.35){arrow(386,GROUND-80,20+sink*.5,'#a72d12');arrow(808,GROUND+90,-25-rise*.7,'#ffffff');}
 if(q>.55){for(let i=0;i<8;i++){const x=470+i*15;const u=(quakeTime*.6+i/8)%1;arrow(x,GROUND+185-u*140,-18,`rgba(255,255,255,${q*.95})`);}}
 if(q>.75){for(let i=0;i<35;i++){const u=(quakeTime*.9+i/35)%1,x=524+(hash(i)-.5)*100*u,y=GROUND-Math.sin(u*Math.PI)*(25+hash(i+70)*55);ctx.beginPath();ctx.ellipse(x,y,2+hash(i)*2,4,0,0,Math.PI*2);ctx.fillStyle=i%3?'#00639f':'#9c6021';ctx.fill();}}
 tag('建物と基礎',236,66,280,GROUND-169+sink);
 tag('マンホールの地下構造物',712,150,735,my-4);
 ctx.textAlign='left';ctx.font='600 20px sans-serif';ctx.fillStyle='#004c80';ctx.fillText('地下水面',51,GROUND-40);line([[104,GROUND-33],[104,GROUND+14]],'#004c80',2);
 ctx.fillStyle='#334155';ctx.font='18px sans-serif';ctx.fillText('地下の拡大断面（粒子・構造物の大きさは模式的）',48,628);
 ctx.restore();
}
function updateExplanation(){const phase=porePressure<25?0:porePressure<60?1:2;if(phase===lastPhase)return;lastPhase=phase;const texts=[['安定した地盤','砂粒子の接触が骨組みをつくり、建物を支えています。青色は砂粒の間を満たす水です。'],['間隙水圧が上昇','ゆれが続くと水圧が高まり、砂粒子の間で伝わる支える力が小さくなります。'],['液状化した地盤','地盤の支持力が低下し、建物が沈下します。浮力の影響で地下構造物が浮上し、水と砂が地表に噴き出します。']];document.getElementById('statusText').innerHTML='<strong>'+texts[phase][0]+'</strong><br>'+texts[phase][1];document.querySelectorAll('[data-phase]').forEach((el,i)=>el.setAttribute('aria-current',i===phase?'step':'false'));}
function updateIntensity(v){quakeIntensity=+v;document.getElementById('intensityVal').textContent=['弱','中','強'][quakeIntensity-1];}
function toggleQuake(){isQuaking=!isQuaking;const b=document.getElementById('quakeBtn');b.classList.toggle('active',isQuaking);b.setAttribute('aria-pressed',String(isQuaking));b.textContent=isQuaking?'ゆれを止める':'震動を開始する';}
function resetSim(){isQuaking=false;porePressure=0;quakeTime=0;sink=0;rise=0;lastPhase=-1;const b=document.getElementById('quakeBtn');b.classList.remove('active');b.setAttribute('aria-pressed','false');b.textContent='震動を開始する';updateExplanation();}
function advance(dt){if(paused)return;quakeTime+=dt;if(isQuaking)porePressure=Math.min(100,porePressure+18*quakeIntensity*dt);else porePressure=Math.max(0,porePressure-12*dt);const q=porePressure/100;if(q>.35)sink=Math.min(48,sink+q*15*dt);if(q>.5)rise=Math.min(56,rise+q*16*dt);}
function animate(now){requestAnimationFrame(animate);const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):0;lastFrame=now;if(!document.hidden)advance(dt);document.getElementById('pressureBar').style.width=porePressure+'%';document.getElementById('pressureVal').textContent=Math.round(porePressure)+' / 100';updateExplanation();draw();}
document.getElementById('liqPause').textContent=paused?'再生':'一時停止';
document.getElementById('liqPause').onclick=function(){paused=!paused;this.textContent=paused?'再生':'一時停止';this.setAttribute('aria-pressed',String(paused));};
document.getElementById('liqContacts').onclick=function(){showContacts=!showContacts;this.setAttribute('aria-pressed',String(showContacts));};
resetSim();updateIntensity(2);requestAnimationFrame(animate);
