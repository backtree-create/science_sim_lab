(function(root){
const table={kno3:[13.25,31.66,63.9,109.9,169],nacl:[35.6,35.8,36.42,37.05,38.05]};
function solubility(kind,t){const i=Math.min(3,Math.floor(t/20));return table[kind][i]+(table[kind][i+1]-table[kind][i])*(t-i*20)/20}
function solution(kind,t,water,total){const capacity=solubility(kind,t)*water/100,dissolved=Math.min(total,capacity);return{capacity,dissolved,solid:total-dissolved}}
function saturation(t){return 216.7*6.112*Math.exp(17.67*t/(t+243.5))/(t+273.15)}
function dew(total){if(total<=0)return null;let lo=-80,hi=80;for(let i=0;i<70;i++){const mid=(lo+hi)/2;if(saturation(mid)<total)lo=mid;else hi=mid}return(lo+hi)/2}
function humidity(t,total){const capacity=saturation(t),vapor=Math.min(total,capacity);return{capacity,vapor,liquid:total-vapor,rh:vapor/capacity*100,dew:dew(total)}}
// kJ/kg: ice warming, fusion, water warming, vaporization, steam warming.
const cuts=[0,42,376,796,3052,3092];
function phase(q,mass){const e=Math.max(0,Math.min(3092,q/(mass/1000)));let t,s=0,l=0,g=0,state;
if(e<42){t=-20+e/2.1;s=1;state='氷'}else if(e<376){t=0;l=(e-42)/334;s=1-l;state='氷 ＋ 水'}else if(e<796){t=(e-376)/4.2;l=1;state='水'}else if(e<3052){t=100;g=(e-796)/2256;l=1-g;state='水 ＋ 水蒸気'}else{t=100+(e-3052)/2;g=1;state='水蒸気'}return{t,s,l,g,state,max:3092*mass/1000}}
const api={table,solubility,solution,saturation,dew,humidity,phase,cuts};if(typeof module!=='undefined')module.exports=api;else root.models=api;
})(typeof window!=='undefined'?window:this);