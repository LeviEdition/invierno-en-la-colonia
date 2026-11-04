import {uniqueToken} from './nonce.mjs';
export const movementMessages={stale:'La partida cambió. Elegí el movimiento otra vez.',ownership:'Ese superviviente pertenece al otro grupo.',dead:'Ese superviviente falleció.',missing:'El superviviente ya no está disponible.','already-moved':'Ya se movió durante este turno.',destination:'El destino no está permitido por el motor.',decision:'Resolvé la decisión pendiente en V9.9.',turn:'No es posible mover durante esta fase.',ended:'La partida terminó.',invalid:'La solicitud no es válida.','request-reused':'La solicitud ya fue usada con otros datos.'};
export function createMovementController({send,onChange=()=>{},requestId=uniqueToken}={}){
 let state=null,intent=null,phase='idle',pending=null,message='';
 const notify=()=>onChange(inspect());
 function inspect(){return {phase,intent:intent?{...intent}:null,pending,message};}
 function cancel(text='Movimiento cancelado.'){if(phase==='sending'||phase==='unknown')return false;intent=null;phase='idle';message=text;notify();return true;}
 function update(next){
  if(intent&&(next.blocked||next.movement.session!==intent.session||next.movement.revision!==intent.revision||!next.characters.some(c=>c.id===intent.actorId))){intent=null;if(phase!=='sending'){phase='idle';message='La partida cambió; se canceló el destino pendiente.';}}
  state=next;notify();
 }
 function begin(actorId){
  if(phase==='sending'||phase==='unknown')return false;const info=state?.movement.options[actorId];
  if(!info?.allowed||state.blocked){message=movementMessages[info?.reason]||'Elegí un superviviente de tu turno.';notify();return false;}
  intent={actorId,origin:info.origin,destination:null,session:state.movement.session,revision:state.movement.revision};phase='choosing';message='Elegí el destino en el mapa o en el selector.';notify();return true;
 }
 function choose(destination){if(phase!=='choosing'||!state.movement.options[intent.actorId]?.destinations.includes(destination)){message='Ese destino no está disponible.';notify();return false;}intent.destination=destination;message='Revisá el origen y destino antes de confirmar.';notify();return true;}
 function confirm(){if(phase!=='choosing'||intent.destination===null)return false;pending=requestId();phase='sending';message='Resolviendo el movimiento…';const request={type:'move',requestId:pending,session:intent.session,revision:intent.revision,actorId:intent.actorId,destination:intent.destination};notify();try{send(request);}catch{disconnect();}return true;}
 function result(response){if(!response||typeof response.ok!=='boolean'||typeof response.requestId!=='string'||response.requestId!==pending)return false;pending=null;intent=null;phase='idle';message=response.ok?(response.name||response.actorId)+(response.dead?' falleció durante el movimiento. Resolvé los diálogos en V9.9.':' llegó a '+(state?.locations?.find(l=>l.engineIndex===response.location)?.name||'su destino')+'.'):(movementMessages[response.reason]||'No se pudo realizar el movimiento.');notify();return true;}
 function disconnect(){if(phase==='sending'||phase==='unknown'){phase='unknown';message='Resultado sin confirmar. Consultá el estado actual; no se reenviará el movimiento.';}else{if(intent)message='Se canceló la elección al desconectar la vista.';intent=null;phase='idle';}notify();}
 function acknowledge(){if(phase==='unknown'){phase='idle';pending=null;intent=null;message='Estado actualizado. Revisá dónde quedó el superviviente antes de mover otra vez.';notify();}}
 return {inspect,update,begin,choose,confirm,cancel,result,disconnect,acknowledge};
}
