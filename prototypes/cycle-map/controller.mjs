import {uniqueToken} from '../movement-map/nonce.mjs';
export const cycleMessages={ended:'La partida terminó.',processing:'El motor está resolviendo el ciclo. No se repetirá.',handover:'Primero completá el pase de dispositivo.',death:'Confirmá los fallecimientos pendientes.',leaderChoice:'Hay una sucesión pendiente.',biteChoice:'Hay una mordedura pendiente.',lootChoice:'Completá la elección de búsqueda.',healTarget:'Completá el tratamiento pendiente.',attractTarget:'Completá la atracción pendiente.',transferTarget:'Completá la transferencia pendiente.',crossroads:'Hay una encrucijada pendiente.',review:'Revisá el resultado de colonia antes de continuar.',stale:'La partida cambió. Revisá el turno antes de confirmar.',invalid:'La operación no está disponible.',target:'Esa opción ya no es legal.'};
export function createCycleController({send,onChange=()=>{},requestId=uniqueToken}={}){
 let state=null,phase='closed',pending=null,message='',index=0,seen=null,hiddenFinal=null;
 const meta=()=>state?.cycle,inspect=()=>({phase,pending,message,index}),notify=()=>onChange(inspect());
 function update(next){const old=meta(),fresh=next?.cycle;state=next;if(!fresh){phase='closed';pending=null;seen=null;index=0;notify();return;}
  if(old?.generation!==fresh.generation||old?.session!==fresh.session){phase='closed';pending=null;index=0;seen=null;hiddenFinal=null;}
  if(fresh.operation?.id!==seen){seen=fresh.operation?.id||null;index=0;}
  if(phase==='confirming'&&old?.revision!==fresh.revision){phase='closed';message=cycleMessages.stale;}
  if(['sending','unknown'].includes(phase)&&fresh.operation?.requestId===pending){if(phase==='unknown'){phase='showing';pending=null;message='Estado recuperado sin repetir el cierre.';}}
  else if(phase==='unknown'){phase='showing';pending=null;message='Estado consultado. Revisá el resultado antes de otro cierre.';}
  if(!['sending','unknown','confirming'].includes(phase)&&(fresh.managed||fresh.operation?.review)&&!(fresh.outcome&&hiddenFinal===fresh.generation&&!fresh.review&&!fresh.decision&&!fresh.processing))phase='showing';if(phase==='showing'&&!fresh.managed&&!fresh.review)phase='closed';notify();
 }
 function begin(){if(!meta()?.finish.allowed||meta()?.review||['sending','unknown'].includes(phase))return false;phase='confirming';message=meta().finish.diceRemaining?`Quedan ${meta().finish.diceRemaining} dados. V9 permite terminar igualmente; no garantizan una acción legal.`:'Confirmá el fin del turno actual.';notify();return true;}
 function submit(kind,extra={}){if(pending)return false;phase='sending';pending=requestId();message='Consultando al motor…';notify();try{send({type:'cycle-'+kind,session:meta().session,revision:meta().revision,requestId:pending,...extra});}catch{disconnect();}return true;}
 function confirm(){if(phase!=='confirming')return false;return submit('finish');}
 function cancel(){if(phase!=='confirming')return false;phase='closed';message='Cierre cancelado sin cambios.';notify();return true;}
 function resolve(kind,target){if(['sending','unknown'].includes(phase))return false;return submit(kind,target?{target}:{});}
 function next(){const op=meta()?.operation;if(op&&index<op.steps.length-1){index++;notify();return true;}return op&&op.status==='resolved'?submit('ack',{operationId:op.id}):false;}
 function all(){if(!meta()?.review)return false;index=meta().operation.steps.length;notify();return true;}
 function result(r){if(r?.requestId!==pending||typeof r.ok!=='boolean')return false;pending=null;if(r.state)state=r.state;phase=r.ok?'showing':'closed';message=r.ok?'':cycleMessages[r.reason]||'Revisá el estado actual.';if(!meta()?.managed&&!meta()?.operation?.review)phase='closed';notify();return true;}
 function disconnect(){if(phase==='sending'){phase='unknown';message='Consultando el estado antes de permitir otro cierre.';}else if(phase==='confirming'){phase='closed';}notify();}
 function hide(){if(meta()?.processing||meta()?.review||meta()?.decision)return false;hiddenFinal=meta()?.outcome?meta().generation:null;phase='closed';notify();return true;}
 function show(){phase='showing';hiddenFinal=null;notify();}
 return {inspect,update,begin,confirm,cancel,resolve,next,result,disconnect,hide,show,all};
}
