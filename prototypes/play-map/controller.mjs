import {uniqueToken} from '../movement-map/nonce.mjs';
export function createPlayController({send,onChange=()=>{},requestId=uniqueToken}={}){
 let state=null,pending=null,phase='closed',message='',page=null,intent=null,revision=null;
 const inspect=()=>({phase,pending,message,page,intent}),notify=()=>onChange(inspect());
 function update(s){const old=state?.play;state=s;const p=s?.play;if(!p){phase='closed';page=null;intent=null;pending=null;notify();return;}
  if(old&&(old.generation!==p.generation||old.session!==p.session||s.cycle?.decision?.kind==='handover')){phase='closed';pending=null;page=null;intent=null;message='';}
  if(intent&&revision!==p.revision){intent=null;message='El estado cambió. Revisá la selección antes de confirmar.';}
  if(p.unknown){phase='unknown';message='No se pudo determinar el resultado. La repetición está bloqueada. Reconectá para consultar el estado; no se reinicia la partida.';}
  else if(phase==='unknown'){pending=null;phase='open';message='Estado recuperado sin repetir la operación.';}
  if(p.managed&&phase!=='sending'&&phase!=='unknown')phase='open';notify();
 }
 function open(next,args=null){if(!state?.play||pending||phase==='unknown')return false;page=next;intent=args;revision=state.play.revision;phase='open';message='';notify();return true;}
 function close(){if(state?.play.managed||pending||phase==='unknown')return false;phase='closed';page=null;intent=null;notify();return true;}
 function submit(kind,args={}){if(pending||!state?.play||phase==='unknown')return false;pending=requestId();phase='sending';message='Confirmando…';notify();try{send({type:'play-command',kind,session:state.play.session,revision:state.play.revision,requestId:pending,...args});}catch{disconnect();}return true;}
 function result(r){if(r.requestId!==pending)return false;pending=null;phase='open';message=r.ok?'Operación confirmada.':r.reason==='stale'?'El estado cambió. Revisá antes de confirmar.':r.reason==='unknown'?'Resultado no confirmado. Consultando estado.':'La operación ya no es legal; no se aplicó.';if(r.state)state=r.state;intent=null;if(!state?.play?.managed){phase='closed';page=null;}notify();return true;}
 function disconnect(){if(pending){phase='unknown';message='Consultando estado y recibos antes de permitir otra operación.';}else intent=null;notify();}
 return {inspect,update,open,close,submit,result,disconnect};
}
