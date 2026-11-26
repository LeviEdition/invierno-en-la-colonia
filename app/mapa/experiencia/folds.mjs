// Paneles plegables (interfaz v2, informe 123). Solo presentación: plegar nunca ejecuta una
// acción del juego ni consume azar. El estado se recuerda entre partidas en localStorage; si el
// almacenamiento falla (privado, bloqueado, lleno), todo empieza desplegado y sigue andando.
export const FOLD_KEYS=Object.freeze(['objective','crisis','resources','dossier','bar']);
export const FOLD_STORAGE='invierno-en-la-colonia.pliegues.v1';
export const FOLD_LABELS=Object.freeze({objective:'el objetivo',crisis:'la crisis',resources:'los recursos',dossier:'la ficha',bar:'la barra de acción'});
const unfolded=()=>Object.fromEntries(FOLD_KEYS.map(k=>[k,false]));
// El acceso mismo a localStorage puede tirar error (SecurityError): se pide adentro del try.
export function foldStorage(getStorage=()=>globalThis.localStorage){try{return getStorage()||null;}catch{return null;}}
export function loadFolds(storage){
 try{const raw=storage?.getItem(FOLD_STORAGE);if(!raw)return unfolded();const saved=JSON.parse(raw),state=unfolded();for(const k of FOLD_KEYS)if(typeof saved?.[k]==='boolean')state[k]=saved[k];return state;}
 catch{return unfolded();}
}
export function saveFolds(storage,state){try{storage?.setItem(FOLD_STORAGE,JSON.stringify(state));return !!storage;}catch{return false;}}
// En escritorio la barra de acción queda siempre desplegada (informe 129): tocar junto al retrato
// la plegaba y escondía «Buscar», «Atacar» y «Moverse». En el teléfono se pliega como antes. Lo
// guardado no se borra: solo no se aplica mientras el panel esté fijo.
export const DESKTOP_QUERY='(min-width:601px) and (min-height:501px)';
export function lockedFolds(desktop){return desktop?['bar']:[];}
// «H»: si queda algo desplegado, pliega todo; si no, despliega todo. Los fijos no cuentan.
export function toggleAll(state,locked=[]){const free=FOLD_KEYS.filter(k=>!locked.includes(k)),fold=free.some(k=>!state[k]);return Object.fromEntries(FOLD_KEYS.map(k=>[k,locked.includes(k)?!!state[k]:fold]));}
export function foldLabel(key,folded){return (folded?'Desplegar ':'Plegar ')+FOLD_LABELS[key];}
// Una crisis NUEVA (otra ronda u otro pedido) despliega su tarjeta una vez. La primera que se
// ve al abrir no cuenta como nueva; en el pase (proyección bloqueada) no hay crisis.
export function crisisKey(p){const c=p?.crisis;return c&&!p.blocked?[p.round,c.type,c.need].join('|'):null;}
export function createCrisisWatcher(){let last=null;return p=>{const k=crisisKey(p);if(k===null)return false;const fresh=last!==null&&k!==last;last=k;return fresh;};}
// Tecla simple, sin modificadores, fuera de campos de texto y sin diálogos modales abiertos.
export function isFoldShortcut(e,{modalOpen=false}={}){
 if(modalOpen||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||(e.key!=='h'&&e.key!=='H'))return false;
 const t=e.target,tag=t?.localName;return !(tag==='input'||tag==='select'||tag==='textarea'||t?.isContentEditable);
}
// Sesión 6 (informe 125): sin pestañas. El panel mismo se pliega al tocarlo, resuelto por
// delegación: un toque que cae en un control interno (botón, dado, chapa con globo, campo) nunca
// pliega ni despliega; el control ejecuta solo lo suyo (acá no se frena ni se previene el evento).
export const FOLD_CONTROLS='button,a[href],input,select,textarea,label,summary,[role=button],[contenteditable=true],[tabindex]:not([tabindex="-1"]),[data-no-fold]';
export const FOLD_GUARD_MS=320;
// ¿Este toque pliega o despliega el panel? `hit` es el botón real del panel (teclado y lectores):
// Enter o Espacio sobre él llegan como clic y sí cuentan. Desplegado, si el panel define `zone`
// (la ficha: solo su encabezado), el toque tiene que caer adentro; plegado, cualquier papel sirve.
export function foldTouch(target,panel,{folded=false,hit=null,zone=null}={}){
 if(!target||!panel||!(target===panel||panel.contains?.(target)))return false;
 if(hit&&(target===hit||hit.contains?.(target)))return true;
 // data-fold-pass: enfocable (globo de chapa o de tarjeta) pero el toque pliega igual (informe 125, ajustes).
 const control=target.closest?.(FOLD_CONTROLS);
 if(control&&control!==panel&&panel.contains?.(control)&&!control.hasAttribute?.('data-fold-pass'))return false;
 if(!folded&&zone&&!target.closest?.(zone))return false;
 return true;
}
// Doble toque rápido: el segundo toque del mismo panel dentro de la ventana se ignora, así el
// panel nunca queda a mitad de camino ni parpadea plegar→desplegar.
export function createFoldGate(ms=FOLD_GUARD_MS,now=()=>globalThis.performance?.now?.()??Date.now()){
 const last=new Map();return key=>{const t=now(),prev=last.get(key);if(prev!==undefined&&t-prev<ms)return false;last.set(key,t);return true;};
}
// Un oyente por panel. `toggle(key)` es el único efecto: cambia el plegado, nunca el juego.
// `skip(e)`: toques que ya usó otra cosa (la pulsación larga que mostró un globo).
export function mountFoldPanels(panels,{isFolded,toggle,signal,gate=createFoldGate(),skip=()=>false}){
 for(const {key,el,hit=null,zone=null} of panels){if(!el)continue;
  el.addEventListener('click',e=>{if(skip(e)||!foldTouch(e.target,el,{folded:isFolded(key),hit,zone})||!gate(key))return;toggle(key);},{signal});}
}
// Ajustes de la sesión 7: mientras hay un papel al centro, Objetivo y Crisis se muestran
// plegadas para no montarse sobre él. Es solo presentación: el plegado guardado no cambia y,
// al cerrarse el papel, cada tarjeta vuelve como estaba.
export const STAGE_FOLDS=Object.freeze(['objective','crisis']);
export function shownFolded(folds,key,staged=false,locked=[]){return !locked.includes(key)&&(!!folds?.[key]||(staged&&STAGE_FOLDS.includes(key)));}
