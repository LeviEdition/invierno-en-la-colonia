import {projectVisibleState} from './projection.mjs';
const notifications=new Set(['draw','paintDice','renderModal','toast','resetToasts','showSetup','hideHandover','showPass','hidePass','openDeath','closeDeath','openBackdrop','closeBackdrop']);
// Un único receptor conserva el UI original. El segundo consumidor observa su
// salida; no llama paint ni añade consultas a playable (que sincroniza líderes).
export function observeReferenceView(context,createView,{enqueue=queueMicrotask,onState,onError=()=>{},onDispose=()=>{}}){
 let disposed=false,scheduled=false,renderedPlayable=false,previousGame,epoch=0;
 const gate={setup:true,pass:false,death:false,modal:false};
 const tracked=new Proxy(context,{get(target,key,receiver){if(key==='playable')return (...args)=>{const result=target.playable(...args);renderedPlayable=!!result;return result;};return Reflect.get(target,key,receiver);}});
 const ui=createView(tracked),wrappers=new Map();
 function schedule(){if(disposed||scheduled)return;scheduled=true;enqueue(()=>{scheduled=false;if(disposed)return;try{const game=context.game;if(game!==previousGame){previousGame=game;epoch++;}onState(projectVisibleState(context,{gate,renderedPlayable,epoch}));}catch(error){onError(error);}});}
 function transition(key){
  if(key==='showSetup')gate.setup=true;
  if(key==='hideHandover'){gate.setup=false;gate.pass=false;}
  if(key==='showPass')gate.pass=true;if(key==='hidePass')gate.pass=false;
  if(key==='openDeath')gate.death=true;if(key==='closeDeath')gate.death=false;
  if(key==='openBackdrop')gate.modal=true;if(key==='closeBackdrop')gate.modal=false;
 }
 return new Proxy(ui,{get(target,key,receiver){
  if(key==='dispose')return ()=>{if(disposed)return;disposed=true;try{onDispose();}finally{target.dispose();}};
  const value=Reflect.get(target,key,receiver);if(!notifications.has(key)||typeof value!=='function')return value;
  const cached=wrappers.get(key);if(cached?.original===value)return cached.wrapper;
  const wrapper=function(...args){const result=Reflect.apply(value,this,args);transition(key);schedule();return result;};wrappers.set(key,{original:value,wrapper});return wrapper;
 }});
}
