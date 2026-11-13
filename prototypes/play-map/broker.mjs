import {createCycleBroker} from '../cycle-map/broker.mjs';
import {uniqueToken} from '../movement-map/nonce.mjs';
const token=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
const fields={start:['mode','confirmed'],bite:['option'],cross:['index'],'cross-ai':[],recruit:[],ack:['receiptId'],'starting-leader':['target'],heal:['target'],'heal-cancel':[],'attract-choose':['source'],'attract-end':[],clean:['actorId','dieId','dieIndex','dieValue'],attract:['actorId','dieId','dieIndex','dieValue'],special:['actorId','dieId','dieIndex','dieValue'],boost:['actorId','dieId','dieIndex','dieValue']};
export function createPlayBroker(engine,{session=uniqueToken(),readPublic}={}){
 const previous=createCycleBroker(engine,{session,readPublic});if(!engine.playSnapshot)return previous;
 let revision=0,stamp=null,unknown=null;const completed=new Map();
 function snapshot(){const p=previous.snapshot(),s=engine.playSnapshot();if(unknown&&unknown.generation!==s.generation)unknown=null;const key=JSON.stringify([p.action.revision,s,unknown]);if(key!==stamp){stamp=key;revision++;}
  const managed=!!(s.setup||s.decision||s.receipt||unknown),q=managed&&!['setup','handover','waiting'].includes(p.blocked)?{...readPublic(),log:[],last:null}:p;
  const barrier=managed||p.cycle?.barrier,redacted=s.setup||p.cycle?.decision?.kind==='handover';
  return {...q,epoch:p.epoch,log:[],last:null,movement:{...p.movement,revision,...(barrier?{options:{}}:{})},search:{...p.search,revision,...(managed?{options:{},private:null}:{})},action:{...p.action,revision,...(managed?{options:{}}:{})},inventory:{...p.inventory,revision,...(managed?{private:null}:{})},dice:barrier?{ownerId:null,available:null,used:null}:p.dice,cycle:p.cycle?{...p.cycle,revision,managed:managed?false:p.cycle.managed}:null,play:{...s,session,revision,managed,unknown,events:redacted?[]:s.events}};
 }
 function project(p){previous.project(p);return snapshot();}
 function handle(r){const p=snapshot(),answer=(ok,reason,extra={})=>({type:'play-result',requestId:token(r?.requestId)?r.requestId:null,ok,reason,...extra,state:snapshot()});
  if(r?.type!=='play-command'){
   const type=r?.type==='move'?'move-result':r?.type?.startsWith('search')?'search-result':r?.type?.startsWith('inventory')?'inventory-result':r?.type?.startsWith('cycle')?'cycle-result':'action-result';
   if(r?.session!==session||r?.revision!==revision)return {type,requestId:r?.requestId,ok:false,reason:'stale',state:p};
   if(p.play.managed)return {type,requestId:r?.requestId,ok:false,reason:'decision',state:p};
   const result=previous.handle({...r,revision:previous.snapshot().action.revision});return {...result,state:snapshot()};
  }
  const extra=fields[r.kind];if(!extra||Object.keys(r).some(k=>!['type','session','revision','requestId','kind',...extra].includes(k))||['type','session','revision','requestId','kind',...extra].some(k=>!Object.hasOwn(r,k))||!token(r.session)||!token(r.requestId)||!Number.isSafeInteger(r.revision)||extra.some(k=>k==='confirmed'?typeof r[k]!=='boolean':['index','source','dieIndex','dieValue'].includes(k)?r[k]!==null&&!Number.isInteger(r[k]):r[k]!==null&&!token(r[k])))return answer(false,'invalid');
  const key=JSON.stringify(Object.keys(r).sort().map(k=>[k,r[k]])),cached=completed.get(r.requestId);
  if(cached){if(cached.generation!==p.play.generation)return answer(false,'stale');return cached.key===key?{...cached.result,state:snapshot()}:answer(false,'request-reused');}
  if(r.session!==session||r.revision!==revision)return answer(false,'stale');if(unknown)return answer(false,'unknown');
  let result;try{const execution=engine.playExecute(r);result=answer(execution.ok,execution.reason||null,execution);}catch{unknown={generation:p.play.generation,requestId:r.requestId};result=answer(false,'unknown');}
  completed.set(r.requestId,{key,generation:engine.playSnapshot().generation,result});return result;
 }
 return {project,snapshot,handle};
}
