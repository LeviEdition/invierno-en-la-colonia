import {uniqueToken} from '../movement-map/nonce.mjs';
export const inventoryMessages={crisis:'La crisis requiere otro tipo de carta o ya alcanzó su máximo de aportes.',stale:'La partida o el inventario cambió. Revisá la operación.',card:'Esta copia de la carta ya no está disponible.',target:'Elegí un superviviente de tu grupo.',ownership:'El superviviente debe pertenecer al jugador activo.',dead:'El superviviente falleció.',turn:'Esperá tu turno.',ended:'La partida terminó.',decision:'Primero completá la acción o decisión pendiente.',transfer:'Elegí otro superviviente de tu grupo en la misma localidad que pueda recibir ese tipo de equipo.','equipment-kind':'Ya tiene equipo de ese tipo. Transferilo antes de equipar otro.',treatment:'Este superviviente no necesita ese tratamiento.',manual:'No hay residuos ni accesos libres para aprovechar el manual.',destination:'Elegí otra localidad con plazas disponibles.','already-moved':'Este superviviente ya se movió durante el turno.',rescue:'No hay plaza o superviviente disponible para reclutar.',unavailable:'La operación ya no está disponible.',invalid:'Operación no válida.'};
export function createInventoryController({send,onChange=()=>{},requestId=uniqueToken}={}){
 let state=null,phase='closed',intent=null,pending=null,message='',preferred=null;
 const inspect=()=>({phase,intent,pending,message,busy:['picking','sending','unknown','result'].includes(phase)}),notify=()=>onChange(inspect()),meta=()=>state?.inventory;
 const receipt=()=>meta()?.receipt;
 function update(next){const changed=next?.inventory?.scope!==meta()?.scope||next?.inventory?.session!==meta()?.session,oldRevision=meta()?.revision;state=next;
  if(changed){intent=null;pending=null;phase=receipt()?'result':'closed';message='';}
  else if(phase==='unknown'){phase=receipt()?'result':meta()?.private?'browsing':'closed';pending=null;intent=null;message=receipt()?'Operación recuperada sin repetirla.':'Estado consultado. Revisá el inventario antes de una nueva operación.';}
  else if(phase==='picking'&&oldRevision!==meta()?.revision){phase='browsing';intent=null;message=inventoryMessages.stale;}
  else if(!['sending','picking'].includes(phase)&&receipt())phase='result';notify();
 }
 function open(actorId){if(!meta()?.private||['sending','unknown','result'].includes(phase))return false;preferred=actorId;phase='browsing';intent=null;message='';notify();return true;}
 function chooseCard(cardId,mode='use'){if(!['browsing','picking'].includes(phase))return false;const s=meta()?.private,c=[...s.hand,...s.equipment].find(c=>c.uid===cardId);if(!c)return false;intent={mode,cardId,actorId:c.ownerId||(mode!=='contribute'&&c.requiresActor&&s.actors.some(p=>p.id===preferred)?preferred:null),targetId:null,destination:null};phase='picking';message='';notify();return true;}
 function choose(patch){if(phase!=='picking')return false;intent={...intent,...patch};notify();return true;}
 function option(){return meta()?.private?.options.find(q=>q.mode===intent?.mode&&q.cardId===intent?.cardId&&q.actorId===intent?.actorId&&q.targetId===intent?.targetId&&q.destination===intent?.destination)||{allowed:false,reason:'target',summary:'Elegí los objetivos de esta carta.'};}
 function submit(type,extra){phase='sending';pending=requestId();message='Resolviendo…';notify();try{send({type,session:meta().session,revision:meta().revision,requestId:pending,...extra});}catch{disconnect();}return true;}
 function confirm(){if(phase!=='picking'||!option().allowed)return false;return submit('inventory-use',intent);}
 function cancel(){if(!['picking','browsing'].includes(phase))return false;intent=null;phase=phase==='picking'?'browsing':'closed';message='Cancelado sin consumir cartas ni recursos.';notify();return true;}
 function result(r){if(r?.requestId!==pending||typeof r.ok!=='boolean')return false;if(r.scope&&r.scope!==meta()?.scope)return false;pending=null;intent=null;if(r.state)state=r.state;phase=receipt()?'result':r.ok?'browsing':meta()?.private?'browsing':'closed';message=r.ok?r.receipt?.summary||'Operación completada.':inventoryMessages[r.reason]||'Revisá la operación.';notify();return true;}
 function dismiss(){if(phase!=='result'||receipt()?.generalDecision)return false;return submit('inventory-dismiss',{receiptId:receipt().id});}
 function close(){if(phase==='result')return dismiss();if(['sending','unknown'].includes(phase))return false;phase='closed';intent=null;notify();return true;}
 function disconnect(){if(phase==='sending'){phase='unknown';message='Consultando el resultado antes de permitir otra operación.';}else if(!['unknown','result'].includes(phase)){phase='closed';intent=null;}notify();}
 return {inspect,update,open,chooseCard,choose,option,confirm,cancel,result,dismiss,close,disconnect};
}
