// Globos de las chapas de la colonia (interfaz v2, informe 123) y del detalle de las tarjetas (125). Los textos son los de
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
// Detalle de las tarjetas de Objetivo y Crisis (informe 125, ajustes): lo escribe map-view con la
// misma presentación que tenía el diálogo de información, en data-tip-title y data-tip-text.
export function itemTip(item){const id=item?.querySelector?.('dd')?.id;if(id)return statTip(id);const title=item?.dataset?.tipTitle,text=item?.dataset?.tipText;return title||text?{title:title||'',text:text||''}:null;}
// Una pulsación larga muestra el globo y NO pliega: el clic que la sigue se marca como consumido.
export const LONG_PRESS_CLICK_MS=1500;
export function createPressMemory(now=()=>Date.now()){let item=null,at=-Infinity;return {mark(el){item=el;at=now();},consume(target){if(!item||now()-at>LONG_PRESS_CLICK_MS||!(target===item||item.contains?.(target)))return false;item=null;return true;}};}
export function mountStatTips({root=document,signal,longPressMs=LONG_PRESS_MS}={}){
 const tip=root.getElementById('stat-tip');if(!tip)return {hide(){}};
 let current=null,press=0;const pressed=createPressMemory();
 function show(item){
  const data=itemTip(item);if(!data)return;
  tip.querySelector('.stat-tip-title').textContent=data.title;tip.querySelector('.stat-tip-text').textContent=data.text;
  tip.hidden=false;current=item;item.setAttribute('aria-describedby','stat-tip');
  const r=item.getBoundingClientRect(),t=tip.getBoundingClientRect(),p=tipPosition(r,t,{width:innerWidth,height:innerHeight});
  tip.style.left=p.left+'px';tip.style.top=p.top+'px';tip.dataset.side=p.below?'below':'above';
 }
 function hide(){clearTimeout(press);if(current)current.removeAttribute('aria-describedby');current=null;tip.hidden=true;}
 const items=[...root.querySelectorAll('#map-app .stats>div,#map-app [data-tip]')];
 for(const item of items){
  if(!item.hasAttribute('data-tip')&&!statTip(item.querySelector('dd')?.id))continue;
  // Enfocable para el globo, pero el toque pasa al panel y lo pliega (folds.mjs).
  // Sesión 7: el motivo de una acción apagada de la barra (data-no-fold) muestra su globo pero
  // nunca pliega la barra; map-view lo hace enfocable solo cuando hay motivo.
  item.tabIndex=0;if(!item.hasAttribute('data-no-fold'))item.dataset.foldPass='';
  item.addEventListener('mouseenter',()=>show(item),{signal});item.addEventListener('mouseleave',hide,{signal});
  item.addEventListener('focus',()=>show(item),{signal});item.addEventListener('blur',hide,{signal});
  item.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;clearTimeout(press);press=setTimeout(()=>{show(item);pressed.mark(item);},longPressMs);},{signal});
  for(const type of ['pointerup','pointercancel','pointerleave'])item.addEventListener(type,e=>{if(e.pointerType==='touch')clearTimeout(press);},{signal});
  item.addEventListener('contextmenu',e=>{if(current===item)e.preventDefault();},{signal});
 }
 root.addEventListener('pointerdown',e=>{if(current&&!current.contains(e.target))hide();},{signal,capture:true});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&current)hide();},{signal});
 return {hide,longPressed:target=>pressed.consume(target),inspect:()=>({visible:!tip.hidden,id:current?.querySelector('dd')?.id||current?.id||null})};
}
