import {uniqueToken} from '../movement-map/nonce.mjs';
import {createSearchBroker} from '../search-map/search-broker.mjs';
const token=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x),previousTypes=new Set(['move','search','search-noise','search-choose','search-dismiss']);
const redact=p=>({...p,log:[],last:null});
export function createActionBroker(engine,{session=uniqueToken(),readPublic}={}){
 const previous=createSearchBroker(engine,{session,readPublic}),completed=new Map();let raw=null,revision=0,stamp=null;
 const currentAction=()=>raw&&!['setup','handover','waiting'].includes(raw.blocked)?engine.actionSnapshot():null;
 const scope=()=>{const x=currentAction();return x?`${x.gameGeneration}/${x.round}/${x.ownerId}`:null;};
 function snapshot(){
  const p=previous.snapshot(),a=currentAction(),next=JSON.stringify([p.search.revision,a]);if(next!==stamp){stamp=next;revision++;}
  return {...p,movement:{...p.movement,revision},search:{...p.search,revision},action:{session,revision,gameGeneration:a?.gameGeneration??null,round:a?.round??null,ownerId:a?.ownerId??null,operation:a?.operation||null,presentation:a?.operation?redact(readPublic()):null,options:Object.fromEntries(p.characters.map(c=>[c.id,Object.fromEntries(['attack','barricade','barricade-ability'].map(kind=>[kind,engine.actionOptions(c.id,kind)]))]))}};
 }
 function project(p){raw=p;previous.project(p);return snapshot();}
 function handle(request){
  const old=previousTypes.has(request?.type),extra=request?.type==='action-dismiss'?['operationId']:['actorId','target','dieIndex','dieValue'];
  const answer=(ok,reason,more={})=>({type:old?(request.type==='move'?'move-result':'search-result'):'action-result',requestId:token(request?.requestId)?request.requestId:null,action:request?.type,ok,reason,...more});
  if(!request||!old&&!['attack','barricade','barricade-ability','action-dismiss'].includes(request.type))return answer(false,'invalid');
  if(!old&&(Object.keys(request).some(k=>!['type','requestId','session','revision',...extra].includes(k))||['type','requestId','session','revision',...extra].some(k=>!Object.hasOwn(request,k))||!token(request.requestId)||!token(request.session)||!Number.isSafeInteger(request.revision)||request.type==='action-dismiss'&&!token(request.operationId)||request.type!=='action-dismiss'&&(!token(request.actorId)||!Number.isInteger(request.target)||request.type!=='barricade-ability'&&(!Number.isInteger(request.dieIndex)||!Number.isFinite(request.dieValue))||request.type==='barricade-ability'&&(request.dieIndex!==null||request.dieValue!==null))))return answer(false,'invalid');
  const key=JSON.stringify(Object.keys(request).sort().map(k=>[k,request[k]])),cached=completed.get(request.requestId);
  if(cached){if(cached.scope!==scope())return answer(false,'stale');return cached.key===key?cached.result:answer(false,'request-reused');}
  const p=snapshot(),before=scope();let result;
  if(request.session!==session||request.revision!==revision||!before)result=answer(false,'stale');
  else if(p.action.operation&&request.type!=='action-dismiss')result=old?{type:request.type==='move'?'move-result':'search-result',requestId:request.requestId,ok:false,reason:'decision',state:p}:answer(false,'decision');
  else if(old)result=previous.handle({...request,revision:previous.snapshot().search.revision});
  else if(request.type==='action-dismiss')result=answer(...(()=>{const r=engine.dismissAction(request.operationId);return [r.ok,r.reason||null];})());
  else if(engine.searchSnapshot()?.operation)result=answer(false,'decision');
  else{
   const execution=engine.actById({...engine.actionOptions(request.actorId,request.type),kind:request.type,actorId:request.actorId,target:request.target,dieIndex:request.dieIndex,dieValue:request.dieValue});
   result=answer(execution.ok,execution.reason||null,execution.ok?execution:{});
  }
  const state=snapshot();result={...result,state};
  if(result.type==='action-result')result={...result,scope:before,presentation:state.action.presentation,epoch:state.epoch};
  completed.set(request.requestId,{key,result,scope:before});if(completed.size>128)completed.delete(completed.keys().next().value);return result;
 }
 return {project,snapshot,handle};
}
