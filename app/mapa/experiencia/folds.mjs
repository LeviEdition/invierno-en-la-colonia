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
// «H»: si queda algo desplegado, pliega todo; si no, despliega todo.
export function toggleAll(state){const fold=FOLD_KEYS.some(k=>!state[k]);return Object.fromEntries(FOLD_KEYS.map(k=>[k,fold]));}
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
