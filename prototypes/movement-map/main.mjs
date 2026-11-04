import {createMovementMapView} from './map-view.mjs';
import {createMovementController} from './movement-controller.mjs';
import {movementSummary} from './presentation-sequence.mjs';
const protocol='iec-movement-map/v1',$=id=>document.getElementById(id),frame=$('reference-frame'),lifetime=new AbortController();
let presentationContext=null;
let requestTimer=0,port=null,state=null,viewer=null,attempt=null,serial=Promise.resolve(),generation=0,starts=0,lastDisposal=null,lastError=null,mode='reference',pageActive=true;
const presenting=()=>['presenting','awaiting-decision'].includes(movement.inspect().phase);
const movement=createMovementController({
 send:request=>{if(!port)throw Error('Sin conexión');port.postMessage({protocol,...request});clearTimeout(requestTimer);requestTimer=setTimeout(()=>{movement.disconnect();port?.postMessage({protocol,type:'snapshot'});},8000);},
 onChange:()=>{viewer?.updateMovement();$('movement-result').textContent=['idle','unknown'].includes(movement.inspect().phase)?movement.inspect().message:'';}
});
const hostPath=__MOVEMENT_MAP_QA__?'/dist/movement-map-qa/reference-host.html':'/dist/movement-map/reference-host.html';
function status(text){$('connection-status').textContent=text;}
function validProjection(p){return p?.schema===1&&Number.isInteger(p.epoch)&&['setup','handover','death','decision','waiting',null].includes(p.blocked)&&Array.isArray(p.characters)&&Array.isArray(p.locations)&&Array.isArray(p.players)&&p.dice&&Array.isArray(p.log)&&typeof p.movement?.session==='string'&&Number.isSafeInteger(p.movement.revision)&&p.movement.options&&typeof p.movement.options==='object';}
function disconnect(){clearTimeout(requestTimer);viewer?.stopPresentation();movement.disconnect();if(port){port.onmessage=null;port.close();port=null;}}
function focusReference(){requestAnimationFrame(()=>{if(mode==='reference'&&port)port.postMessage({protocol,type:'focus'});});}
function stopSequence(){presentationContext=null;viewer?.stopPresentation();movement.interruptPresentation();}
function showReference(){
 if(presenting()){stopSequence();if(state)viewer?.setState(state);}
 mode='reference';$('map-app').hidden=true;frame.hidden=false;$('reference-mode').setAttribute('aria-pressed','true');$('map-mode').setAttribute('aria-pressed','false');viewer?.setActive(false);focusReference();
}
function applyAuthority(){
 if(!state)return;movement.update(state);if(!state.blocked)movement.acknowledge();$('map-mode').disabled=!!state.blocked;viewer?.setState(state);
 if(state.blocked){showReference();status(({setup:'Completá la preparación en V9.9.',handover:'Confirmá el pase de dispositivo en V9.9.',death:'Confirmá el fallecimiento en V9.9.',decision:'Resolvé la decisión abierta en V9.9.',waiting:'Esperando partida.'})[state.blocked]);}
 else status('');
}
function interruptSequence(){if(!presenting())return;stopSequence();applyAuthority();}
async function clearViewer(){const previous=viewer;viewer=null;if(previous)lastDisposal=await previous.destroy();}
function mountViewer(){
 interruptSequence();const id=++generation;attempt?.abort();attempt=new AbortController();const current=attempt;
 serial=serial.catch(()=>{}).then(async()=>{
  if(['choosing','confirming'].includes(movement.inspect().phase))movement.cancel('Se reinició la vista; elegí el movimiento de nuevo.');await clearViewer();if(!pageActive||id!==generation||current.signal.aborted)return;
  starts++;lastError=null;document.body.dataset.viewState='loading';$('loading').hidden=false;$('loading').setAttribute('role','status');$('loading').textContent='Preparando el mapa…';$('retry-view').hidden=true;
  try{const created=await createMovementMapView({signal:current.signal,movement});if(!pageActive||id!==generation||current.signal.aborted){await created.destroy();return;}viewer=created;if(state)viewer.setState(state);viewer.setActive(mode==='map'&&!state?.blocked);document.body.dataset.viewState='ready';}
  catch(error){if(current.signal.aborted||id!==generation)return;lastError=error.message;document.body.dataset.viewState='error';$('loading').hidden=false;$('loading').setAttribute('role','alert');$('loading').textContent=error.message==='WEBGL_UNAVAILABLE'?'Este navegador no ofrece WebGL para el mapa. La interfaz V9.9 sigue disponible.':'No se pudo cargar el visor. '+error.message;$('retry-view').hidden=false;status('El mapa no está disponible; podés continuar usando V9.9.');}
 });return serial;
}
function showMap(){
 if(!state||state.blocked){showReference();return;}
 mode='map';frame.hidden=true;$('map-app').hidden=false;$('reference-mode').setAttribute('aria-pressed','false');$('map-mode').setAttribute('aria-pressed','true');
 if(viewer){viewer.setState(state);viewer.setActive(true);}else void mountViewer();
}
function receive(event){
 const message=event.data;if(message?.protocol!==protocol)return;
 if(message.type==='move-result'){
  clearTimeout(requestTimer);if(!movement.result(message))return;
  if(message.ok&&mode==='map'&&viewer&&!document.hidden&&message.resolution&&message.presentation&&message.epoch===state?.epoch){
   presentationContext={epoch:state.epoch,turn:state.turn,round:state.round,session:state.movement.session};
   viewer.startPresentation(message,()=>{const text=movementSummary(message,message.presentation.locations);movement.finishPresentation(text,!!state?.blocked);if(state?.blocked){$('map-mode').disabled=true;status('Hay una decisión pendiente. Continuá cuando estés listo.');viewer.updateMovement();$('resolve-decision').focus({preventScroll:true});}else applyAuthority();});
  }else{movement.interruptPresentation();applyAuthority();}return;
 }
 if(message.type==='error'){stopSequence();state=null;$('map-mode').disabled=true;status('La consulta no pudo actualizarse: '+message.message);showReference();void disposeViewer();return;}
 if(message.type!=='state'||!validProjection(message.state))return;
 const previous=state;state=message.state;
 if(presenting()){
  movement.update(state);
  const context=presentationContext||previous;const changedGame=context&&(state.epoch!==context.epoch||state.movement.session!==(context.session||context.movement?.session)),changedTurn=!state.blocked&&context&&(state.turn!==context.turn||state.round!==context.round);
  if(!changedGame&&!changedTurn)return;
  stopSequence();
 }
 applyAuthority();
}
function connect(){disconnect();if(!pageActive)return;const channel=new MessageChannel();port=channel.port1;port.onmessage=receive;port.start();frame.contentWindow.postMessage({protocol,type:'connect'},location.origin,[channel.port2]);focusReference();}
frame.addEventListener('load',()=>{stopSequence();state=null;$('map-mode').disabled=true;showReference();status('Conectando con la partida…');connect();},{signal:lifetime.signal});
$('reference-mode').addEventListener('click',showReference,{signal:lifetime.signal});$('map-mode').addEventListener('click',showMap,{signal:lifetime.signal});$('resolve-decision').addEventListener('click',showReference,{signal:lifetime.signal});
for(const id of ['restart-view','retry-view'])$(id).addEventListener('click',()=>{if(mode==='map')void mountViewer();},{signal:lifetime.signal});
document.addEventListener('visibilitychange',()=>{if(document.hidden)interruptSequence();},{signal:lifetime.signal});
export function inspect(){return {mode,connected:!!port,starts,generation,projection:state?structuredClone(state):null,movement:movement.inspect(),view:viewer?.inspect()||null,lastDisposal,lastError};}
export function worldAt(point){return viewer?.worldAt(point);}
export function disposeViewer(){stopSequence();attempt?.abort();generation++;serial=serial.catch(()=>{}).then(clearViewer);return serial;}
window.addEventListener('pagehide',event=>{pageActive=false;disconnect();void disposeViewer();if(!event.persisted)lifetime.abort();});
window.addEventListener('pageshow',event=>{pageActive=true;if(event.persisted){connect();if(mode==='map'&&state&&!state.blocked)void mountViewer();}});
frame.src=hostPath;
