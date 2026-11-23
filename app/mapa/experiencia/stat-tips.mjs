// Globos de las chapas de la colonia (interfaz v2, informe 123). Los textos son los de
// juego/information.mjs (adaptados de la ficha V9). Mouse, foco de teclado o pulsación larga.
// Solo presentación: no lee ni cambia la partida.
import {statistics} from '../juego/information.mjs';
export const STAT_KEYS=Object.freeze({round:'Ronda',turn:'Turno',morale:'Moral',food:'Comida',helpless:'Indefensos',waste:'Residuos',hunger:'Hambre'});
export const LONG_PRESS_MS=500;
export function statTip(id){const name=STAT_KEYS[id],entry=statistics.find(s=>s[0]===name);return entry?{title:entry[2]||entry[0],text:entry[1]}:null;}
// Debajo de la chapa, sin taparla y sin salir de la pantalla: si no entra abajo, va arriba.
export function tipPosition(chip,tip,viewport,{gap=8,margin=8}={}){
 const left=Math.round(Math.min(Math.max(margin,chip.left+chip.width/2-tip.width/2),Math.max(margin,viewport.width-margin-tip.width)));
 let top=chip.bottom+gap;if(top+tip.height>viewport.height-margin)top=chip.top-gap-tip.height;
 return {left,top:Math.round(Math.max(margin,top)),below:top>=chip.bottom};
}
export function mountStatTips({root=document,signal,longPressMs=LONG_PRESS_MS}={}){
 const tip=root.getElementById('stat-tip');if(!tip)return {hide(){}};
 let current=null,press=0;
 function show(item){
  const id=item.querySelector('dd')?.id,data=statTip(id);if(!data)return;
  tip.querySelector('.stat-tip-title').textContent=data.title;tip.querySelector('.stat-tip-text').textContent=data.text;
  tip.hidden=false;current=item;item.setAttribute('aria-describedby','stat-tip');
  const r=item.getBoundingClientRect(),t=tip.getBoundingClientRect(),p=tipPosition(r,t,{width:innerWidth,height:innerHeight});
  tip.style.left=p.left+'px';tip.style.top=p.top+'px';tip.dataset.side=p.below?'below':'above';
 }
 function hide(){clearTimeout(press);if(current)current.removeAttribute('aria-describedby');current=null;tip.hidden=true;}
 const items=[...root.querySelectorAll('#map-app .stats>div')];
 for(const item of items){
  if(!statTip(item.querySelector('dd')?.id))continue;
  item.tabIndex=0;
  item.addEventListener('mouseenter',()=>show(item),{signal});item.addEventListener('mouseleave',hide,{signal});
  item.addEventListener('focus',()=>show(item),{signal});item.addEventListener('blur',hide,{signal});
  item.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;clearTimeout(press);press=setTimeout(()=>show(item),longPressMs);},{signal});
  for(const type of ['pointerup','pointercancel','pointerleave'])item.addEventListener(type,e=>{if(e.pointerType==='touch')clearTimeout(press);},{signal});
  item.addEventListener('contextmenu',e=>{if(current===item)e.preventDefault();},{signal});
 }
 root.addEventListener('pointerdown',e=>{if(current&&!current.contains(e.target))hide();},{signal,capture:true});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&current)hide();},{signal});
 return {hide,inspect:()=>({visible:!tip.hidden,id:current?.querySelector('dd')?.id||null})};
}
