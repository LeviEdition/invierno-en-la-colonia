import {createActionBroker} from '../action-map/action-broker.mjs';
import {uniqueToken} from '../movement-map/nonce.mjs';
const token=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
export function createInventoryBroker(engine,{session=uniqueToken(),readPublic}={}){
 const previous=createActionBroker(engine,{session,readPublic});if(!engine.inventorySnapshot)return previous;
 let revision=0,stamp=null;const completed=new Map();
 function snapshot(){const p=previous.snapshot(),s=engine.inventorySnapshot(),key=JSON.stringify([p.action.revision,s]);if(key!==stamp){stamp=key;revision++;}
  const privateState=!p.blocked?s:null,receipt=!['setup','handover','waiting'].includes(p.blocked)?s?.receipt||null:null;
  return {...p,movement:{...p.movement,revision},search:{...p.search,revision},action:{...p.action,revision},inventory:{session,revision,scope:s?.scope||null,private:privateState,receipt,presentation:receipt?{...readPublic(),log:[],last:null}:null}};
 }
 function project(p){previous.project(p);return snapshot();}
 function handle(r){
  const p=snapshot(),own=r?.type?.startsWith('inventory-');if(!own){if(p.inventory.receipt)return {type:r?.type==='move'?'move-result':r?.type?.startsWith('search')?'search-result':'action-result',requestId:r?.requestId,ok:false,reason:'decision',state:p};if(r?.session!==session||r.revision!==revision)return {type:r?.type==='move'?'move-result':r?.type?.startsWith('search')?'search-result':'action-result',requestId:r?.requestId,ok:false,reason:'stale',state:p};const result=previous.handle({...r,revision:previous.snapshot().action.revision});return {...result,state:snapshot()};}
  const answer=(ok,reason,extra={})=>({type:'inventory-result',requestId:token(r?.requestId)?r.requestId:null,ok,reason,...extra,state:snapshot()});
  const keys=r.type==='inventory-dismiss'?['receiptId']:['mode','cardId','actorId','targetId','destination'];
  if(!['inventory-use','inventory-dismiss'].includes(r.type)||Object.keys(r).some(k=>!['type','session','revision','requestId',...keys].includes(k))||['session','revision','requestId',...keys].some(k=>!Object.hasOwn(r,k))||!token(r.requestId)||!token(r.session)||!Number.isSafeInteger(r.revision)||!['use','contribute'].includes(r.mode)&&r.type==='inventory-use'||keys.some(k=>k==='mode'?false:k==='destination'?r[k]!==null&&!Number.isInteger(r[k]):['actorId','targetId'].includes(k)?r[k]!==null&&!token(r[k]):!token(r[k])))return answer(false,'invalid');
  const key=JSON.stringify(Object.keys(r).sort().map(k=>[k,r[k]])),cached=completed.get(r.requestId);
  if(cached){if(cached.scope!==p.inventory.scope||!p.inventory.scope)return answer(false,'stale');return cached.key===key?{...cached.result,state:snapshot()}:answer(false,'request-reused');}
  if(r.session!==session||r.revision!==revision||!p.inventory.scope)return answer(false,'stale');
  let execution;if(r.type==='inventory-dismiss')execution=engine.dismissInventory(r.receiptId);
  else if(!p.inventory.private||engine.searchSnapshot()?.operation||engine.actionSnapshot()?.operation||p.inventory.receipt)execution={ok:false,reason:'decision'};
  else execution=engine.inventoryExecute(r);
  const result=answer(execution.ok,execution.reason||null,{scope:p.inventory.scope,...execution});completed.set(r.requestId,{key,scope:p.inventory.scope,result});if(completed.size>128)completed.delete(completed.keys().next().value);return result;
 }
 return {project,snapshot,handle};
}
