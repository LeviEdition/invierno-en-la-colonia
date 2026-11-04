import {uniqueToken} from '../movement-map/nonce.mjs';
export const searchMessages={colony:'Buscar requiere estar fuera de la colonia.','deck-empty':'No quedan cartas en esta localidad.','no-dice':'No quedan dados disponibles.',insufficient:'Ningún dado alcanza el requisito efectivo.',ownership:'El superviviente pertenece al otro grupo.',dead:'El superviviente falleció.',missing:'El superviviente no está disponible.',decision:'Hay una decisión pendiente en V9.9.',turn:'No es posible buscar durante esta fase.',ended:'La partida terminó.',stale:'La partida cambió. Revisá los dados y la búsqueda actual.',die:'Ese dado ya no es válido.',noise:'No se puede revelar otra carta con ruido.','search-pending':'Primero completá la búsqueda pendiente.','request-reused':'La solicitud ya se utilizó con otros datos.'};
const scope=p=>p?.search?.private?`${p.search.private.gameGeneration}/${p.search.private.round}/${p.search.private.ownerId}`:null;
export function createSearchController({send,requestId=uniqueToken,onChange=()=>{}}={}){
 let state=null,phase='idle',intent=null,pending=null,action=null,message='',operation=null,hand=[],ownerId=null,presentedId=null;
 function inspect(){return {phase,intent:intent?{...intent}:null,pending,action,message,operation,hand,ownerId,busy:phase!=='idle'};}
 const notify=()=>onChange(inspect());
 function adopt(){operation=state?.search.private?.operation||null;phase=operation?(operation.status==='choice'?'choice':'result'):'idle';intent=null;presentedId=null;}
 function clear(){phase='idle';intent=null;pending=null;action=null;operation=null;hand=[];ownerId=null;presentedId=null;}
 function update(next){
  const changed=scope(next)!==scope(state)||next?.search.session!==state?.search.session;
  state=next;if(changed)clear();
  const own=next?.search.private;
  if(!own){clear();notify();return;}
  hand=own.hand;ownerId=own.ownerId;
  if(phase==='picking'&&intent.revision!==next.search.revision){message=searchMessages.stale;adopt();}
  else if(phase==='presenting'){if(own.operation?.operationId!==presentedId)adopt();}
  else if(phase==='unknown'){pending=null;action=null;message='Estado recuperado. No se repitió la búsqueda.';adopt();}
  else if(!['sending','picking'].includes(phase))adopt();
  notify();
 }
 function begin(actorId){
  if(phase!=='idle')return false;const q=state?.search.options[actorId];
  if(!q?.allowed){message=searchMessages[q?.reason]||'Elegí un superviviente propio disponible.';notify();return false;}
  intent={actorId,origin:q.origin,requirement:q.requirement,dieIndex:null,dieValue:null,revision:state.search.revision,session:state.search.session};phase='picking';message='Elegí un dado disponible que alcance el requisito.';notify();return true;
 }
 function chooseDie(index){if(phase!=='picking')return false;const die=state.search.options[intent.actorId]?.dice.find(d=>d.index===index&&d.allowed);if(!die)return false;intent.dieIndex=index;intent.dieValue=die.value;notify();return true;}
 function submit(type,fields){pending=requestId();action=type;phase='sending';message='Resolviendo la búsqueda…';const request={type,requestId:pending,session:state.search.session,revision:state.search.revision,...fields};notify();try{send(request);}catch{disconnect();}return true;}
 function confirm(){if(phase!=='picking'||intent.dieIndex===null)return false;return submit('search',{actorId:intent.actorId,dieIndex:intent.dieIndex,dieValue:intent.dieValue});}
 function noise(){if(phase!=='choice'||!operation.canNoise)return false;return submit('search-noise',{operationId:operation.operationId});}
 function choose(index){if(phase!=='choice'||!operation.cards.some(c=>c.index===index))return false;return submit('search-choose',{operationId:operation.operationId,index});}
 function dismiss(){if(phase!=='result'||operation.generalDecision)return false;return submit('search-dismiss',{operationId:operation.operationId});}
 function cancel(){if(phase!=='picking')return false;intent=null;phase='idle';message='Búsqueda cancelada antes de gastar el dado.';notify();return true;}
 function result(value){
  if(!value||value.requestId!==pending||typeof value.ok!=='boolean'||value.ok&&value.scope!==scope(state))return false;
  if(value.state)update(value.state);
  pending=null;action=null;
  if(!value.ok){message=searchMessages[value.reason]||'No se pudo completar la solicitud.';adopt();notify();return true;}
  const own=state?.search.private;
  if(!own){clear();notify();return true;}
  if(value.action==='search'&&own.operation){phase='presenting';presentedId=own.operation.operationId;operation=null;intent=null;message='Buscando en la localidad…';}
  else {adopt();message=value.action==='search-dismiss'?'Búsqueda completada.':'';}
  action=null;notify();return true;
 }
 function finishPresentation(){if(phase!=='presenting')return false;adopt();notify();return true;}
 function interrupt(){if(phase==='picking'){cancel();return;}if(phase==='sending'||phase==='unknown'){disconnect();return;}adopt();notify();}
 function disconnect(){if(phase==='sending'||phase==='unknown'){phase='unknown';message='Resultado sin confirmar. Consultando la partida; no se reenviará la acción.';}else{adopt();}notify();}
 return {inspect,update,begin,chooseDie,confirm,noise,choose,dismiss,cancel,result,finishPresentation,interrupt,disconnect};
}
