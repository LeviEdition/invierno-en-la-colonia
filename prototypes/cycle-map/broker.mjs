import {createInventoryBroker} from '../inventory-map/broker.mjs';
import {uniqueToken} from '../movement-map/nonce.mjs';
const token=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
export function createCycleBroker(engine,{session=uniqueToken(),readPublic}={}){
 const previous=createInventoryBroker(engine,{session,readPublic});if(!engine.cycleSnapshot)return previous;
 let revision=0,stamp=null,rawBlocked='waiting';const completed=new Map();
 function snapshot(){const base=previous.snapshot(),s=engine.cycleSnapshot(),visible=s&&!['setup','waiting'].includes(rawBlocked),key=JSON.stringify([base.action.revision,visible?s:null]);if(key!==stamp){stamp=key;revision++;}
  const ownsCycle=!!visible&&(s.processing||s.review||s.operation?.status==='unknown'),delegated=!!(base.search.private?.operation||base.action.operation||base.inventory.receipt);
  const managed=!!visible&&(ownsCycle||!!s.outcome||!!s.decision&&!delegated),barrier=managed;
  const p=managed?{...readPublic(),blocked:rawBlocked,log:[],last:null}:base;
  const cycle=visible?{...s,session,revision,managed,barrier}:null;
  return {...p,round:s?.operation?.colony&&(s.processing||s.review)?s.operation.round:p.round,epoch:base.epoch,movement:{...base.movement,revision,...(barrier?{options:{}}:{})},search:{...base.search,revision,...(barrier?{private:null,options:{}}:{})},action:{...base.action,revision,...(barrier?{options:{}}:{})},inventory:{...base.inventory,revision,...(barrier?{private:null}:{})},dice:barrier?{ownerId:null,available:null,used:null}:p.dice,cycle};
 }
 function project(p){rawBlocked=p.blocked;previous.project(p);return snapshot();}
 function handle(r){
  const p=snapshot(),answer=(ok,reason,more={})=>({type:'cycle-result',requestId:token(r?.requestId)?r.requestId:null,ok,reason,...more,state:snapshot()});
  if(!r||typeof r.type!=='string')return answer(false,'invalid');
  if(!r.type.startsWith('cycle-')){
   const type=r.type==='move'?'move-result':r.type.startsWith('search')?'search-result':r.type.startsWith('inventory')?'inventory-result':'action-result';
   if(r.session!==session||r.revision!==revision)return {type,requestId:r.requestId,ok:false,reason:'stale',state:p};
   if(p.cycle?.barrier&&!['search-dismiss','action-dismiss','inventory-dismiss'].includes(r.type))return {type,requestId:r.requestId,ok:false,reason:'decision',state:p};
   const result=previous.handle({...r,revision:previous.snapshot().action.revision});return {...result,state:snapshot()};
  }
  const kind=r.type.slice(6),extra=kind==='leader'?['target']:kind==='ack'?['operationId']:[];
  if(!['finish','pass','death','leader','ack','speed'].includes(kind)||Object.keys(r).some(k=>!['type','session','revision','requestId',...extra].includes(k))||['type','session','revision','requestId',...extra].some(k=>!Object.hasOwn(r,k))||!token(r.requestId)||!token(r.session)||!Number.isSafeInteger(r.revision)||extra.some(k=>!token(r[k])))return answer(false,'invalid');
  const key=JSON.stringify(Object.keys(r).sort().map(k=>[k,r[k]])),cached=completed.get(r.requestId);
  if(cached){if(cached.generation!==p.cycle?.generation)return answer(false,'stale');return cached.key===key?{...cached.result,state:snapshot()}:answer(false,'request-reused');}
  if(!p.cycle||r.session!==session||r.revision!==revision)return answer(false,'stale');
  const execution=engine.cycleExecute({...r,kind}),result=answer(execution.ok,execution.reason||null,execution);completed.set(r.requestId,{key,generation:p.cycle.generation,result});if(completed.size>128)completed.delete(completed.keys().next().value);return result;
 }
 return {project,snapshot,handle};
}
