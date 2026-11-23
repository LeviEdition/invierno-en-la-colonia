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
export function exitGhost(node,{rect=node.getBoundingClientRect(),duration=EXIT_MS}={}){
 if(reducedMotion()||!rect.width||!rect.height||!node.isConnected)return null;
 const copy=inertCopy(node);if(!copy)return null;
 // Un <dialog> copiado no se muestra sin «open»: su contenido va en un div con su aspecto.
 let root=copy;if(copy.localName==='dialog'){root=document.createElement('div');root.style.cssText=copy.style.cssText;root.append(...copy.childNodes);}
 root.removeAttribute('hidden');Object.assign(root.style,{position:'static',inset:'auto',margin:'0',width:'100%',height:'100%',maxWidth:'none',maxHeight:'none',transform:'none',display:root.style.display==='none'?'block':root.style.display,opacity:'1',animation:'none'});
 const ghost=document.createElement('div');ghost.className='exit-ghost';ghost.inert=true;ghost.setAttribute('aria-hidden','true');
 Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
 ghost.append(root);document.body.append(ghost);
 const done=()=>ghost.remove();
 try{ghost.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(6px)'}],{duration,easing:'ease-in',fill:'forwards'}).finished.then(done,done);}catch{done();}
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
