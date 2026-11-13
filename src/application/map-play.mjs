// Adaptador de interfaz: consultas puras y operaciones originales del único motor.
export function createMapPlay(context,{generation,clear}){
 let gen=-1,serial=0,receipt=null,events=[],setup=true,dieEpoch=0,dieStamp='';
 const clone=x=>structuredClone(x),c=()=>context();
 function sync(){if(gen!==generation()){gen=generation();receipt=null;events=[];}}
 function event(type,data={},audience='public'){sync();events.push({id:'event_'+gen+'_'+(++serial),round:c().game?.round,type,audience,...clone(data)});if(events.length>200)events.shift();}
 function person(id){return c().all().find(p=>p.id===id);}
 const publicPerson=p=>p?{id:p.id,name:p.name,influence:p.influence,location:p.loc,wounds:p.wounds,frost:p.frost}:null;
 function decision(){
  const x=c(),g=x.game;if(!g||setup||x.passScreenActive||g.ended||x.deathDirector.active)return null;
  if(x.pendingBite){const p=person(x.pendingBite.target);return {kind:'bite',target:publicPerson(p),remaining:x.pendingBite.victims.map(id=>publicPerson(person(id))).filter(Boolean)};}
  if(x.deathDirector.pending.length||x.pendingLeader||x.pendingLoot)return null;
  if(x.pendingHeal){const a=person(x.pendingHeal.actor);return {kind:'heal',actor:publicPerson(a),skill:a.skillName,patients:x.pendingHeal.targets.map(id=>person(id)).filter(t=>t&&!t.dead&&t.loc===a.loc&&(a.skill==='medic'?t.wounds:t.frost)).map(publicPerson)};}
  if(x.pendingAttract){const t=x.pendingAttract;return {kind:'attract',destination:t.loc,left:t.left,free:x.zcap[t.loc]-x.game.zones[t.loc].z-x.game.zones[t.loc].b,sources:x.places.flatMap((name,index)=>index!==t.loc&&x.game.zones[index].z>0&&x.openAccess(t.loc)?[{index,name,count:x.game.zones[index].z}]:[])};}
  if(g.crossPending){const v=x.crossroadsView();return {kind:'cross',owner:g.crossOwner,automated:g.crossOwner==='ai'&&g.mode!=='local',chosen:x.aiCrossChoice,card:v.card,allowed:v.allowed};}
  if(x.pendingRecruitInfo&&x.opened==='recruitSuccess')return {kind:'recruit',...clone(x.pendingRecruitInfo)};
  return null;
 }
 function dice(){const x=c(),g=x.game,key=JSON.stringify([generation(),g?.round,g?.turn,x.controls.dice()]);if(key!==dieStamp){dieStamp=key;dieEpoch++;}return x.controls.dice().map((value,index)=>({index,value,id:'die_'+generation()+'_'+dieEpoch+'_'+index}));}
 function option(kind,actorId=null){const x=c(),g=x.game,p=person(actorId);let reason=!g||setup?'setup':g.ended?'ended':x.passScreenActive?'handover':!x.playable()||x.mapCycle.api.cycleSnapshot()?.review?'decision':receipt?'receipt':null;
  if(!reason&&kind!=='boost'&&(!p||p.dead||x.ownerOf(p)!==x.controls.side))reason='ownership';
  let targets=[],summary='',usesDie=['clean','attract','boost'].includes(kind);
  if(!reason){
   if(kind==='clean'){if(p.loc!==0||!g.waste)reason='clean';summary='Retirar hasta '+x.Math.min(3,g.waste)+' residuos en colonia. Consume el dado seleccionado (1+).';}
   else if(kind==='attract'){targets=x.places.flatMap((name,index)=>index!==p.loc&&g.zones[index].z>0?[{index,name,count:g.zones[index].z}]:[]);if(!x.openAccess(p.loc)||!targets.length)reason='attract';summary='Atraer hasta dos zombis a '+x.places[p.loc]+'. Consume un dado (1+); terminar después no lo devuelve.';}
   else if(kind==='special'){if(!['medic','nurse'].includes(p.skill))reason=p.skill==='builder'?'builder':'automatic';else{targets=x.alive().filter(t=>t.loc===p.loc&&(p.skill==='medic'?t.wounds:t.frost)).map(publicPerson);if(p.skillUsed||!targets.length)reason='treatment';}summary=p.skillName+': '+p.skillDesc+' Sin dado ni carta; una vez por ronda.';}
   else if(kind==='boost'){if(g.food<1)reason='food';summary='Gastar una comida de la reserva para aumentar el dado seleccionado en +1, máximo 6.';}
   else reason='invalid';
  }
  const available=usesDie?dice().map(d=>({...d,allowed:kind==='boost'?d.value<6:d.value>=1})):[];if(!reason&&usesDie&&!available.some(d=>d.allowed))reason='dice';
  return {kind,actorId,allowed:!reason,reason,summary,targets,dice:available};
 }
 function snapshot(){sync();const x=c(),g=x.game;if(!g)return {generation:gen,setup:true,decision:null,receipt:null,events:[]};const audience=setup||x.passScreenActive?null:x.controls.side;
  return {generation:gen,setup,decision:decision(),receipt:audience&&receipt?.owner===audience?clone(receipt):null,events:events.filter(e=>e.audience==='public'||e.audience===audience).map(clone),options:audience?Object.fromEntries(x.controls.group().filter(p=>!p.dead).map(p=>[p.id,Object.fromEntries(['clean','attract','special'].map(k=>[k,option(k,p.id)]))])):{},boost:audience?option('boost'):null};
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
  if(['heal','heal-cancel','attract-choose','attract-end'].includes(r.kind)){
   const healing=r.kind.startsWith('heal');if(d?.kind!==(healing?'heal':'attract'))return {ok:false,reason:'decision'};
   if(r.kind==='heal'&&!d.patients.some(p=>p.id===r.target)||r.kind==='attract-choose'&&!d.sources.some(s=>s.index===r.source))return {ok:false,reason:'target'};
   if(r.kind==='heal')x.chooseHeal(r.target);else if(r.kind==='heal-cancel')x.cancelHeal();else if(r.kind==='attract-choose')x.chooseAttract(r.source);else x.cancelAttract();
   if(!decision())receipt={id:'play_'+gen+'_'+(++serial),owner:x.controls.side,type:r.kind,summary:r.kind==='attract-end'?'Atracción terminada. El dado ya gastado no se devuelve.':r.kind==='heal-cancel'?'Tratamiento cancelado sin gastar la habilidad.':'Operación original completada.'};return {ok:true};
  }
  if(['clean','attract','special','boost'].includes(r.kind)){
   const q=option(r.kind,r.actorId);if(!q.allowed)return {ok:false,reason:q.reason};
   const die=q.dice.find(d=>d.id===r.dieId&&d.index===r.dieIndex&&d.value===r.dieValue&&d.allowed);if(r.kind!=='special'&&!die)return {ok:false,reason:'die'};
   clear();const old=x.selected,oldPicked=x.picked,p=person(r.actorId);try{if(p)x.selected=x.controls.group().indexOf(p);if(die)x.picked=die.index;x[r.kind==='special'?'special':r.kind==='boost'?'boostDie':r.kind]();}finally{x.selected=old;x.picked=oldPicked;}
   event(r.kind,{actor:r.actorId,name:p?.name||null,die:die?.value??null,summary:q.summary});
   if(!decision())receipt={id:'play_'+gen+'_'+(++serial),owner:x.controls.side,type:r.kind,summary:q.summary};return {ok:true};
  }
  return {ok:false,reason:'invalid'};
 }
 return {event,decision,invalidateDice(){dieEpoch++;dieStamp='';},started(){setup=false;sync();},api:{playSnapshot:snapshot,playExecute:execute}};
}
