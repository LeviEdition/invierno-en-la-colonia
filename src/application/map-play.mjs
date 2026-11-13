// Adaptador de interfaz: consultas puras y operaciones originales del único motor.
export function createMapPlay(context,{generation,clear}){
 let gen=-1,serial=0,receipt=null,events=[],setup=true;
 const clone=x=>structuredClone(x),c=()=>context();
 function sync(){if(gen!==generation()){gen=generation();receipt=null;events=[];}}
 function event(type,data={},audience='public'){sync();events.push({id:'event_'+gen+'_'+(++serial),round:c().game?.round,type,audience,...clone(data)});if(events.length>200)events.shift();}
 function person(id){return c().all().find(p=>p.id===id);}
 const publicPerson=p=>p?{id:p.id,name:p.name,influence:p.influence,location:p.loc,wounds:p.wounds,frost:p.frost}:null;
 function decision(){
  const x=c(),g=x.game;if(!g||setup||x.passScreenActive||g.ended||x.deathDirector.active)return null;
  if(x.pendingBite){const p=person(x.pendingBite.target);return {kind:'bite',target:publicPerson(p),remaining:x.pendingBite.victims.map(id=>publicPerson(person(id))).filter(Boolean)};}
  if(x.deathDirector.pending.length||x.pendingLeader||x.pendingLoot)return null;
  if(g.crossPending){const v=x.crossroadsView();return {kind:'cross',owner:g.crossOwner,automated:g.crossOwner==='ai'&&g.mode!=='local',chosen:x.aiCrossChoice,card:v.card,allowed:v.allowed};}
  if(x.pendingRecruitInfo&&x.opened==='recruitSuccess')return {kind:'recruit',...clone(x.pendingRecruitInfo)};
  return null;
 }
 function snapshot(){sync();const x=c(),g=x.game;if(!g)return {generation:gen,setup:true,decision:null,receipt:null,events:[]};const audience=setup||x.passScreenActive?null:x.controls.side;
  return {generation:gen,setup,decision:decision(),receipt:audience&&receipt?.owner===audience?clone(receipt):null,events:events.filter(e=>e.audience==='public'||e.audience===audience).map(clone)};
 }
 function execute(r){sync();const x=c(),d=decision();
  if(r.kind==='ack'){if(!receipt||receipt.id!==r.receiptId||receipt.owner!==x.controls.side||x.passScreenActive)return {ok:false,reason:'stale'};receipt=null;return {ok:true};}
  if(r.kind==='bite'){
   if(d?.kind!=='bite'||!['sacrifice','risk'].includes(r.option))return {ok:false,reason:'decision'};
   const name=d.target.name;clear();x.chooseBite(r.option);receipt={id:'play_'+gen+'_'+(++serial),owner:x.controls.side,type:'bite',summary:r.option==='risk'?name+': se ejecutó la tirada original; revisá el resultado real.':name+': sacrificio; la propagación termina.'};return {ok:true};
  }
  if(r.kind==='cross'){
   if(d?.kind!=='cross'||d.automated||!Number.isInteger(r.index)||!d.allowed[r.index]||x.game.crossOwner!==x.controls.side||!x.canResolve('crossroads'))return {ok:false,reason:'target'};
   clear();x.crossChoose(r.index);return {ok:true};
  }
  if(r.kind==='cross-ai'){if(d?.kind!=='cross'||!d.automated||x.passScreenActive||x.deathWaiting())return {ok:false,reason:'decision'};clear();x.crossAiContinue();return {ok:true};}
  if(r.kind==='recruit'){if(d?.kind!=='recruit')return {ok:false,reason:'decision'};x.dismissRecruit();return {ok:true};}
  return {ok:false,reason:'invalid'};
 }
 return {event,decision,started(){setup=false;sync();},api:{playSnapshot:snapshot,playExecute:execute}};
}
