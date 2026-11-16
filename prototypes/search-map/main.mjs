import {createSearchMapView} from './map-view.mjs';
import {createMovementController} from '../movement-map/movement-controller.mjs';
import {movementSummary} from '../movement-map/presentation-sequence.mjs';
import {createSearchController} from './search-controller.mjs';
const protocol='iec-search-map/v1',$=id=>document.getElementById(id),frame=$('reference-frame'),lifetime=new AbortController();
let port=null,state=null,lastPublic=null,viewer=null,attempt=null,serial=Promise.resolve(),generation=0,starts=0,lastDisposal=null,lastError=null,mode='reference',pageActive=true;
let requestTimer=0,searchTimer=0,presentationContext=null;
const movementPresenting=()=>['presenting','awaiting-decision'].includes(movement.inspect().phase);
const ownedSearch=p=>p?.search.private?.operation&&!['setup','handover','death','waiting'].includes(p.blocked);
const hardBarrier=p=>!p||['setup','handover','death','waiting'].includes(p.blocked);
function send(request){
 if(!port)throw Error('Sin conexión');port.postMessage({protocol,...request});clearTimeout(requestTimer);
 requestTimer=setTimeout(()=>{if(request.type==='move')movement.disconnect();else search.disconnect();port?.postMessage({protocol,type:'snapshot'});},8000);
}
const movement=createMovementController({send,onChange:()=>{viewer?.updateMovement();$('movement-result').textContent=['idle','unknown'].includes(movement.inspect().phase)?movement.inspect().message:'';}});
const search=createSearchController({send,onChange:()=>viewer?.updateSearch()});
const hostPath=__SEARCH_MAP_QA__?'/dist/search-map-qa/reference-host.html':'/dist/search-map/reference-host.html';
function status(text){$('connection-status').textContent=text;}
function validProjection(p){return p?.schema===1&&Number.isInteger(p.epoch)&&Array.isArray(p.characters)&&Array.isArray(p.locations)&&Array.isArray(p.players)&&p.dice&&typeof p.movement?.session==='string'&&Number.isSafeInteger(p.movement.revision)&&typeof p.search?.session==='string'&&Number.isSafeInteger(p.search.revision)&&p.search.options&&typeof p.search.options==='object';}
function stopSearchClock(){clearTimeout(searchTimer);searchTimer=0;}
function stopMovement(){presentationContext=null;viewer?.stopPresentation();movement.interruptPresentation();}
function focusReference(){requestAnimationFrame(()=>{if(mode==='reference'&&port)port.postMessage({protocol,type:'focus'});});}
function displayState(){
 if(search.inspect().phase==='presenting'&&lastPublic)return {...lastPublic,search:state.search};
 if(state.blocked&&ownedSearch(state)&&lastPublic)return {...lastPublic,search:state.search,movement:state.movement};
 return state;
}
function showReference(){
 stopSearchClock();search.interrupt();if(movementPresenting()){stopMovement();if(state)viewer?.setState(state);}
 mode='reference';$('map-app').hidden=true;frame.hidden=false;$('reference-mode').setAttribute('aria-pressed','true');$('map-mode').setAttribute('aria-pressed','false');viewer?.setActive(false);focusReference();
}
function applyAuthority(){
 if(!state)return;
 movement.update(state);if(!state.blocked)movement.acknowledge();
 const available=!state.blocked||!!ownedSearch(state);$('map-mode').disabled=!available;
 if(!state.blocked&&search.inspect().phase!=='presenting')lastPublic={...state,search:{...state.search,private:null}};
 if(viewer)viewer.setState(displayState());
 if(!available){showReference();status(({setup:'Completá la preparación en V9.9.',handover:'Confirmá el pase de dispositivo en V9.9.',death:'Confirmá el fallecimiento en V9.9.',decision:'Resolvé la decisión abierta en V9.9.',waiting:'Esperando partida.'})[state.blocked]||'Esperando partida.');}
 else{status('');if(mode==='map'&&!viewer&&(!attempt||attempt.signal.aborted))void mountViewer();}
}
function interruptSearch(){stopSearchClock();search.interrupt();if(state)applyAuthority();}
function disconnect(){clearTimeout(requestTimer);stopSearchClock();viewer?.stopPresentation();movement.disconnect();search.disconnect();if(port){port.onmessage=null;port.close();port=null;}}
async function clearViewer(){const previous=viewer;viewer=null;if(previous)lastDisposal=await previous.destroy();}
function mountViewer(){
 const id=++generation;attempt?.abort();attempt=new AbortController();const current=attempt;
 interruptSearch();if(movementPresenting()){stopMovement();applyAuthority();}
 serial=serial.catch(()=>{}).then(async()=>{
  if(['choosing','confirming'].includes(movement.inspect().phase))movement.cancel('Se reinició la vista; elegí el movimiento otra vez.');
  await clearViewer();if(!pageActive||id!==generation||current.signal.aborted)return;
  starts++;lastError=null;document.body.dataset.viewState='loading';$('loading').hidden=false;$('loading').setAttribute('role','status');$('loading').textContent='Preparando el mapa…';$('retry-view').hidden=true;
  try{
   const created=await createSearchMapView({signal:current.signal,movement,search,onSearchNative:showReference});
   if(!pageActive||id!==generation||current.signal.aborted){await created.destroy();return;}
   viewer=created;if(state)viewer.setState(displayState());viewer.setActive(mode==='map'&&(!state?.blocked||!!ownedSearch(state)));document.body.dataset.viewState='ready';
  }catch(error){if(current.signal.aborted||id!==generation)return;lastError=error.message;document.body.dataset.viewState='error';$('loading').hidden=false;$('loading').setAttribute('role','alert');$('loading').textContent=error.message==='WEBGL_UNAVAILABLE'?'Este navegador no ofrece WebGL. La interfaz V9.9 sigue disponible.':'No se pudo cargar el visor. '+error.message;$('retry-view').hidden=false;status('Podés continuar usando V9.9.');}
 });return serial;
}
function showMap(){
 if(!state||state.blocked&&!ownedSearch(state)){showReference();return;}
 mode='map';frame.hidden=true;$('map-app').hidden=false;$('reference-mode').setAttribute('aria-pressed','false');$('map-mode').setAttribute('aria-pressed','true');
 if(viewer){viewer.setState(displayState());viewer.setActive(true);}else void mountViewer();
}
function acceptState(next){
 const previous=state,changedGame=previous&&(next.epoch!==previous.epoch||next.movement.session!==previous.movement.session);
 state=next;if(changedGame){lastPublic=null;stopMovement();stopSearchClock();}
 search.update(state);
 // Redactar la búsqueda inmediatamente; la muerte del movimiento conserva su
 // revelación ya aceptada hasta «Continuar», como en H3.4.2.
 if(hardBarrier(state)){lastPublic=null;stopSearchClock();}
 if(movementPresenting()){
  movement.update(state);const c=presentationContext||previous;
  const changed=c&&(state.epoch!==c.epoch||state.movement.session!==(c.session||c.movement?.session)||!state.blocked&&(state.turn!==c.turn||state.round!==c.round));
  if(!changed)return;stopMovement();
 }
 applyAuthority();
}
function receive(event){
 const message=event.data;if(message?.protocol!==protocol)return;
 if(message.type==='search-result'){
  if(message.requestId!==search.inspect().pending)return;
  clearTimeout(requestTimer);stopSearchClock();
  if(!search.result(message))return;
  if(message.state&&validProjection(message.state))state=message.state;
  if(search.inspect().phase==='presenting'){
   if(mode==='map'&&!document.hidden&&viewer){
    const opId=state.search.private?.operation?.operationId;
    searchTimer=setTimeout(()=>{searchTimer=0;if(state?.search.private?.operation?.operationId!==opId)return;search.finishPresentation();applyAuthority();},matchMedia('(prefers-reduced-motion: reduce)').matches?100:750);
   }else search.interrupt();
  }
  applyAuthority();return;
 }
 if(message.type==='move-result'){
  if(message.requestId!==movement.inspect().pending)return;
  clearTimeout(requestTimer);if(!movement.result(message))return;
  if(message.ok&&mode==='map'&&viewer&&!document.hidden&&message.resolution&&message.presentation&&message.epoch===state?.epoch){
   presentationContext={epoch:state.epoch,turn:state.turn,round:state.round,session:state.movement.session};
   viewer.startPresentation(message,()=>{movement.finishPresentation(movementSummary(message,message.presentation.locations),!!state?.blocked);if(state?.blocked){$('map-mode').disabled=true;status('Hay una decisión pendiente. Continuá cuando estés listo.');viewer.updateMovement();$('resolve-decision').focus({preventScroll:true});}else applyAuthority();});
  }else{movement.interruptPresentation();applyAuthority();}return;
 }
 if(message.type==='error'){stopSearchClock();stopMovement();search.update(null);state=null;lastPublic=null;$('map-mode').disabled=true;status('La consulta no pudo actualizarse: '+message.message);showReference();void disposeViewer();return;}
 if(message.type==='state'&&validProjection(message.state))acceptState(message.state);
}
function connect(){disconnect();if(!pageActive)return;const channel=new MessageChannel();port=channel.port1;port.onmessage=receive;port.start();frame.contentWindow.postMessage({protocol,type:'connect'},location.origin,[channel.port2]);focusReference();}
frame.addEventListener('load',()=>{stopSearchClock();stopMovement();search.update(null);state=null;lastPublic=null;$('map-mode').disabled=true;showReference();status('Conectando con la partida…');connect();},{signal:lifetime.signal});
$('reference-mode').addEventListener('click',showReference,{signal:lifetime.signal});$('map-mode').addEventListener('click',showMap,{signal:lifetime.signal});$('resolve-decision').addEventListener('click',showReference,{signal:lifetime.signal});
for(const id of ['restart-view','retry-view'])$(id).addEventListener('click',()=>{if(mode==='map')void mountViewer();},{signal:lifetime.signal});
document.addEventListener('visibilitychange',()=>{if(document.hidden){interruptSearch();if(movementPresenting()){stopMovement();applyAuthority();}}},{signal:lifetime.signal});
export function inspect(){return {mode,connected:!!port,starts,generation,projection:state?structuredClone(state):null,movement:movement.inspect(),search:search.inspect(),view:viewer?.inspect()||null,lastDisposal,lastError};}
export function worldAt(point){return viewer?.worldAt(point);}
export function disposeViewer(){stopSearchClock();stopMovement();search.interrupt();attempt?.abort();generation++;serial=serial.catch(()=>{}).then(clearViewer);return serial;}
window.addEventListener('pagehide',event=>{pageActive=false;disconnect();search.update(null);lastPublic=null;if(state){state={...state,blocked:'waiting',characters:[],players:[],locations:[],dice:{ownerId:null,available:null,used:null},movement:{...state.movement,options:{}},search:{...state.search,private:null,options:{}}};viewer?.setState(state);}void disposeViewer();if(!event.persisted)lifetime.abort();});
window.addEventListener('pageshow',event=>{pageActive=true;if(event.persisted){connect();if(mode==='map'&&state&&(!state.blocked||ownedSearch(state)))void mountViewer();}});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches&&search.inspect().phase==='presenting'){stopSearchClock();search.finishPresentation();applyAuthority();}},{signal:lifetime.signal});
frame.src=hostPath;
