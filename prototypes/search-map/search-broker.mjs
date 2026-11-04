import {uniqueToken} from '../movement-map/nonce.mjs';
import {createMovementBroker} from '../movement-map/movement-broker.mjs';
const fields={move:['actorId','destination'],search:['actorId','dieIndex','dieValue'],'search-noise':['operationId'],'search-choose':['operationId','index'],'search-dismiss':['operationId']};
const token=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
// El registro heredado contiene nombres de cartas privadas: no cruza esta frontera.
const publicOnly=p=>({...p,log:[],last:null});
const hardBlock=x=>['setup','handover','death','waiting'].includes(x);
export function createSearchBroker(engine,{session=uniqueToken(),readPublic}={}){
 let raw=null,current=null,revision=0,stamp=null;const completed=new Map();
 const movement=createMovementBroker(engine,{session,presentationState:()=>publicOnly(readPublic())});
 function privateState(){return raw&&!hardBlock(raw.blocked)?engine.searchSnapshot():null;}
 function scope(){const p=privateState();return p?`${p.gameGeneration}/${p.round}/${p.ownerId}`:null;}
 function refresh(){
  const own=privateState(),nextStamp=JSON.stringify([engine.snapshot(),engine.searchSnapshot(),raw?.blocked,raw?.epoch]);
  if(nextStamp!==stamp){stamp=nextStamp;revision++;}
  let p;
  if(own&&(!raw.blocked||raw.blocked==='decision'&&own.operation&&!own.operation.generalDecision))p=publicOnly(readPublic());
  else p=publicOnly({...raw,blocked:raw?.blocked||'waiting',players:[],characters:[],locations:[],objective:null,crisis:null,dice:{ownerId:null,available:null,used:null},round:null,morale:null,food:null,turn:null});
  const m=movement.project(p).movement;
  current={...p,movement:{...m,session,revision},search:{session,revision,private:own,options:Object.fromEntries(p.characters.map(c=>[c.id,engine.searchOptions(c.id)]))}};
  return current;
 }
 function project(p){raw=p;return refresh();}
 function snapshot(){return refresh();}
 function handle(request){
  const answer=(ok,reason,extra={})=>({type:request?.type==='move'?'move-result':'search-result',requestId:token(request?.requestId)?request.requestId:null,ok,reason,...extra});
  const extra=Object.hasOwn(fields,request?.type)?fields[request.type]:null;
  if(!request||!extra||Object.keys(request).some(k=>!['type','requestId','session','revision',...extra].includes(k))||['type','requestId','session','revision',...extra].some(k=>!Object.hasOwn(request,k))||!token(request.requestId)||!token(request.session)||!Number.isSafeInteger(request.revision))return answer(false,'invalid');
  if(['move','search'].includes(request.type)&&!token(request.actorId)||request.type==='move'&&!Number.isInteger(request.destination)||request.type==='search'&&(!Number.isInteger(request.dieIndex)||!Number.isFinite(request.dieValue))||request.type.startsWith('search-')&&!token(request.operationId)||request.type==='search-choose'&&!Number.isInteger(request.index))return answer(false,'invalid');
  const fingerprint=JSON.stringify(['type','requestId','session','revision',...extra].map(k=>request[k]));
  const previous=completed.get(request.requestId);
  if(previous){if(previous.scope!==scope())return answer(false,'stale');return previous.fingerprint===fingerprint?previous.result:answer(false,'request-reused');}
  refresh();const beforeScope=scope();let result;
  if(!raw||request.session!==session||request.revision!==revision||!beforeScope)result=answer(false,'stale');
  else if(request.type==='move'){
   const response=movement.handle({...request,revision:movement.project(current).movement.revision});result={...response};
  }else{
   const op=privateState()?.operation;let execution;
   if(request.type==='search'){
    execution=op?{ok:false,reason:'search-pending'}:engine.searchById({...engine.searchOptions(request.actorId),actorId:request.actorId,dieIndex:request.dieIndex,dieValue:request.dieValue});
   }else if(request.operationId!==op?.operationId)execution={ok:false,reason:'stale'};
   else if(request.type==='search-noise')execution=engine.addSearchNoise(op);
   else if(request.type==='search-choose')execution=engine.chooseSearchCard({...op,index:request.index});
   else execution=engine.dismissSearchResult(request.operationId);
   result=answer(execution.ok,execution.reason||null,{operationId:execution.operationId||request.operationId||null});
  }
  const next=refresh();
  if(result.type==='search-result')result={...result,action:request.type,scope:beforeScope,state:next};
  completed.set(request.requestId,{fingerprint,result,scope:beforeScope});if(completed.size>128)completed.delete(completed.keys().next().value);
  return result;
 }
 return {project,snapshot,handle};
}
