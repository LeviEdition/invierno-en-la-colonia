// Transiciones de paneles (interfaz v2, docs/109 §8). La entrada es CSS. La salida no
// retrasa nada: el elemento real se oculta en el acto y una copia inerte, sin ids ni datos
// y sin recibir toques, se desvanece encima. Con movimiento reducido no hay copia.
export const EXIT_MS=180;
export function reducedMotion(){return matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.dataset.motion==='reduced';}
// Atributos que una copia no debe conservar: nada que un selector, la accesibilidad o un
// manejador pueda confundir con el panel real.
const STRIP=/^(id|for|name|role|tabindex|href|aria-.*|data-.*|on.*)$/i;
const MAX_NODES=600;
// Copia inerte con el estilo calculado de cada elemento: los estilos del mapa van por id,
// y la copia no tiene ids.
export function inertCopy(node){
 const sources=[node,...node.querySelectorAll('*')];if(sources.length>MAX_NODES)return null;
 const copy=node.cloneNode(true),targets=[copy,...copy.querySelectorAll('*')];
 sources.forEach((src,i)=>{const dst=targets[i],cs=getComputedStyle(src);for(const prop of cs)dst.style.setProperty(prop,cs.getPropertyValue(prop));for(const {name}of [...dst.attributes])if(STRIP.test(name))dst.removeAttribute(name);if('disabled' in dst)dst.disabled=true;});
 return copy;
}
// Sesión 4 (informe 122): cada panel sale hacia el borde de donde vino (--v2-shift, 8–12 px)
// y parte desde donde estaba (opacidad y desplazamiento del instante), así una salida a mitad
// de una entrada no salta. shift '0 0' hace un fundido cruzado sin desplazamiento.
export const ENTER_MS=200,SWAP_MS=200;
export function panelShift(node){try{return getComputedStyle(node).getPropertyValue('--v2-shift').trim()||'0 8px';}catch{return '0 8px';}}
export function exitGhost(node,{rect=node.getBoundingClientRect(),duration=EXIT_MS,shift=panelShift(node)}={}){
 if(reducedMotion()||!rect.width||!rect.height||!node.isConnected)return null;
 const now=getComputedStyle(node),startOpacity=Number(now.opacity)||1,startTranslate=now.translate&&now.translate!=='none'?now.translate:'0 0';
 const copy=inertCopy(node);if(!copy)return null;
 // Un <dialog> copiado no se muestra sin «open»: su contenido va en un div con su aspecto.
 let root=copy;if(copy.localName==='dialog'){root=document.createElement('div');root.style.cssText=copy.style.cssText;root.append(...copy.childNodes);}
 root.removeAttribute('hidden');Object.assign(root.style,{position:'static',inset:'auto',margin:'0',width:'100%',height:'100%',maxWidth:'none',maxHeight:'none',transform:'none',translate:'none',display:root.style.display==='none'?'block':root.style.display,opacity:'1',animation:'none',transition:'none'});
 const ghost=document.createElement('div');ghost.className='exit-ghost';ghost.inert=true;ghost.setAttribute('aria-hidden','true');
 // will-change solo mientras dura la salida: la copia se borra al terminar.
 Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',willChange:'opacity, translate'});
 ghost.append(root);document.body.append(ghost);
 const done=()=>ghost.remove();
 try{ghost.animate([{opacity:startOpacity,translate:startTranslate},{opacity:0,translate:shift}],{duration,easing:'ease-out',fill:'forwards'}).finished.then(done,done);}catch{done();}
 setTimeout(done,duration+120);
 return ghost;
}
// Se engancha a la instancia: cualquier «el.hidden=true» o «dialog.close()» del código
// existente deja su copia, sin cambiar a quien lo llama. Una entrada [el, marco] copia el
// marco (por ejemplo, la ficha entera cuando se oculta su contenido).
export function animateExits(elements,signal){
 const restore=[];
 for(const entry of elements){
  const [el,frame]=Array.isArray(entry)?entry:[entry,null];
  if(!el)continue;
  if(el.localName==='dialog'){const close=el.close;el.close=function(...args){if(this.open)exitGhost(this);return close.apply(this,args);};restore.push(()=>{el.close=close;});}
  else{const own=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'hidden');Object.defineProperty(el,'hidden',{configurable:true,get(){return own.get.call(this);},set(value){if(value&&!own.get.call(this))exitGhost(frame||this);own.set.call(this,value);}});restore.push(()=>{delete el.hidden;});}
 }
 signal?.addEventListener('abort',()=>{for(const undo of restore)undo();},{once:true});
}

// Fundido de entrada interrumpible: si el elemento ya estaba a mitad de otro, sigue desde la
// opacidad que tenía. Solo anima opacity (y, si se pide, una escala mínima).
export function fadeIn(el,{duration=SWAP_MS,from=null}={}){
 if(!el)return null;
 const start=from??Number(getComputedStyle(el).opacity);for(const a of el.getAnimations?.()||[])if(a.id==='v2-fade')a.cancel();
 if(reducedMotion()||start>=1)return null;
 try{el.style.willChange='opacity';const a=el.animate([{opacity:start},{opacity:1}],{duration:duration*(1-start),easing:'ease-out'});a.id='v2-fade';const clear=()=>{if(!el.getAnimations().some(x=>x.id==='v2-fade'&&x.playState==='running'))el.style.willChange='';};a.finished.then(clear,clear);return a;}catch{return null;}
}
// Fundido cruzado sin saltos de tamaño: lo viejo queda encima como copia inerte y se apaga en
// el lugar; lo nuevo aparece debajo. Con movimiento reducido, cambio instantáneo.
export function crossfade(el,apply,{duration=SWAP_MS}={}){
 if(!el||reducedMotion()||!el.isConnected||!el.getClientRects().length){apply();return false;}
 exitGhost(el,{duration,shift:'0 0'});apply();fadeIn(el,{duration,from:0});return true;
}
// Pulso de selección (1 → 1,06 → 1), solo transform.
export function pulse(el,{duration=220,scale=1.06}={}){
 if(!el||reducedMotion())return null;
 try{return el.animate([{transform:'scale(1)'},{transform:`scale(${scale})`},{transform:'scale(1)'}],{duration,easing:'ease-out'});}catch{return null;}
}
