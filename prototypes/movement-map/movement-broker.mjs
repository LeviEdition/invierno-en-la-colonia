import {uniqueToken} from './nonce.mjs';
// Frontera acotada: admite una intención de movimiento, nunca dispatch arbitrario.
const keys=['type','requestId','session','revision','actorId','destination'];
const token=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
export function createMovementBroker(engine,{session=uniqueToken()}={}){
 let revision=0,signature=null,base=null,current=null;const completed=new Map();
 function refresh(){
  const game=engine.snapshot(),stamp=JSON.stringify([game,base?.blocked,engine.movementOptions('').gameGeneration]);
  if(stamp!==signature){signature=stamp;revision++;}
  const options=Object.fromEntries((base?.characters||[]).map(c=>[c.id,engine.movementOptions(c.id)]));
  current={...base,movement:{session,revision,options}};return current;
 }
 function project(state){base=state;return refresh();}
 function handle(request){
  const answer=(ok,reason,extra={})=>({type:'move-result',requestId:token(request?.requestId)?request.requestId:null,ok,reason,...extra});
  if(!request||Object.keys(request).some(k=>!keys.includes(k))||request.type!=='move'||!token(request.requestId)||!token(request.actorId)||!token(request.session)||!Number.isSafeInteger(request.revision)||!Number.isInteger(request.destination))return answer(false,'invalid');
  const fingerprint=JSON.stringify(keys.map(k=>request[k])),previous=completed.get(request.requestId);
  if(previous)return previous.fingerprint===fingerprint?previous.result:answer(false,'request-reused');
  refresh();let result;
  if(request.session!==session||request.revision!==revision||!base||base.blocked)result=answer(false,'stale');
  else{
   const info=engine.movementOptions(request.actorId),name=base.characters.find(c=>c.id===request.actorId)?.name;
   const execution=engine.moveById({...info,actorId:request.actorId,destination:request.destination});
   result=answer(execution.ok,execution.reason||null,{...execution,name,requestId:request.requestId,type:'move-result'});refresh();
  }
  completed.set(request.requestId,{fingerprint,result});if(completed.size>128)completed.delete(completed.keys().next().value);
  return result;
 }
 return {project,handle};
}
