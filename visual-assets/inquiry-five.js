
window.lab={
 canvas(id,draw){const c=document.getElementById(id),ctx=c.getContext('2d');function render(){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);c.width=r.width*d;c.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);draw(ctx,r.width,r.height)}new ResizeObserver(render).observe(c);return render},
 line(c,x,y,X,Y,color='#35485e',dash=[]){c.save();c.strokeStyle=color;c.lineWidth=2.5;c.setLineDash(dash);c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();c.restore()},
 arrow(c,x,y,X,Y,color,label=''){if(Math.hypot(X-x,Y-y)<1)return;this.line(c,x,y,X,Y,color);const a=Math.atan2(Y-y,X-x);c.fillStyle=color;c.beginPath();c.moveTo(X,Y);c.lineTo(X-9*Math.cos(a-.5),Y-9*Math.sin(a-.5));c.lineTo(X-9*Math.cos(a+.5),Y-9*Math.sin(a+.5));c.fill();if(label)this.text(c,label,X+7,Y-7,color)},
 text(c,t,x,y,color='#172438',align='left'){c.font='14px Arial,sans-serif';c.textAlign=align;c.fillStyle=color;c.fillText(t,x,y);c.textAlign='left'}
};
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-dialog]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.dialog).showModal());document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close())});
