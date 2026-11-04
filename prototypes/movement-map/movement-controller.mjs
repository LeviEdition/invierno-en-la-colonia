import {uniqueToken} from './nonce.mjs';
export const movementMessages={stale:'La partida cambió. Elegí el movimiento otra vez.',ownership:'Ese superviviente pertenece al otro grupo.',dead:'Ese superviviente falleció.',missing:'El superviviente ya no está disponible.','already-moved':'Ya se movió durante este turno.',destination:'El destino no está permitido por el motor.',decision:'Resolvé la decisión pendiente en V9.9.',turn:'No es posible mover durante esta fase.',ended:'La partida terminó.',invalid:'La solicitud no es válida.','request-reused':'La solicitud ya fue usada con otros datos.'};
export function createMovementController({send,onChange=()=>{},requestId=uniqueToken}={}){
 let state=null,intent=null,phase='idle',pending=null,message='',response=null;
 const notify=()=>onChange(inspect());
 function inspect(){return {phase,intent:intent?{...intent}:null,pending,message,response};}
 function cancel(text='Movimiento cancelado.'){if(['sending','unknown','presenting','awaiting-decision'].includes(phase))return false;intent=null;phase='idle';message=text;notify();return true;}
 function update(next){
  if(!['presenting','awaiting-decision'].includes(phase)&&intent&&(next.blocked||next.movement.session!==intent.session||next.movement.revision!==intent.revision||!next.characters.some(c=>c.id===intent.actorId))){intent=null;if(!['sending','unknown'].includes(phase)){phase='idle';message='La partida cambió; se canceló el destino pendiente.';}}
  state=next;notify();
 }
 function begin(actorId){
  if(['sending','unknown','presenting','awaiting-decision'].includes(phase))return false;const info=state?.movement.options[actorId];
  if(!info?.allowed||state.blocked){message=movementMessages[info?.reason]||'Elegí un superviviente de tu turno.';notify();return false;}
  response=null;intent={actorId,origin:info.origin,destination:null,session:state.movement.session,revision:state.movement.revision};phase='choosing';message='Elegí un edificio iluminado.';notify();return true;
 }
 function choose(destination){if(!['choosing','confirming'].includes(phase)||!intent)return false;if(!state.movement.options[intent.actorId]?.destinations.includes(destination)){intent.destination=null;phase='choosing';message=destination===intent.origin?'El personaje ya está en esa localidad.':state.locations?.find(l=>l.engineIndex===destination)?.available===0?'No hay plazas libres en esa localidad.':'Ese destino no está disponible.';notify();return false;}intent.destination=destination;phase='confirming';message='Revisá el origen y destino antes de confirmar.';notify();return true;}
 function confirm(){if(phase!=='confirming'||intent.destination===null)return false;pending=requestId();phase='sending';message='Resolviendo el movimiento…';const request={type:'move',requestId:pending,session:intent.session,revision:intent.revision,actorId:intent.actorId,destination:intent.destination};notify();try{send(request);}catch{disconnect();}return true;}
 function result(value){if(!value||typeof value.ok!=='boolean'||typeof value.requestId!=='string'||value.requestId!==pending)return false;pending=null;response=value;phase=value.ok?'presenting':'idle';if(!value.ok)intent=null;message=value.ok?'Movimiento aceptado.':(movementMessages[value.reason]||'No se pudo realizar el movimiento.');notify();return true;}
 function back(){if(phase!=='confirming')return false;intent.destination=null;phase='choosing';message='Elegí otro edificio iluminado.';notify();return true;}
 function finishPresentation(text,awaitDecision=false){if(phase!=='presenting')return false;intent=null;phase=awaitDecision?'awaiting-decision':'idle';message=text;notify();return true;}
 function interruptPresentation(){if(!['presenting','awaiting-decision'].includes(phase))return false;intent=null;phase='idle';response=null;message='Movimiento resuelto. Se actualizó la vista.';notify();return true;}
 function disconnect(){if(['presenting','awaiting-decision'].includes(phase)){interruptPresentation();return;}if(phase==='sending'||phase==='unknown'){phase='unknown';message='Resultado sin confirmar. Consultá el estado actual; no se reenviará el movimiento.';}else{if(intent)message='Se canceló la elección al desconectar la vista.';intent=null;phase='idle';}notify();}
 function acknowledge(){if(phase==='unknown'){phase='idle';pending=null;intent=null;message='Estado actualizado. Revisá dónde quedó el superviviente antes de mover otra vez.';notify();}}
 return {inspect,update,begin,choose,confirm,cancel,back,result,finishPresentation,interruptPresentation,disconnect,acknowledge};
}
