// Extensión compilada solo en el host horizontal. La ejecución usa V9.9.
export function createMapInventory(c,{generation,block,clear,canRecruit,canContribute,contribute,visible}){
 const refs=new WeakMap();let serial=0,receipt=null,after=null;
 const scope=()=>visible()?`${generation()}/${c.game.round}/${c.controls.side}`:null;
 const stamp=()=>JSON.stringify(c.game);
 function uid(it,source,owner,index){if(it&&typeof it==='object'){if(!refs.has(it))refs.set(it,'card_'+(++serial));return refs.get(it);}return `legacy_${generation()}_${c.controls.side}_${source}_${owner||'hand'}_${index}`;}
 function entries(){if(!scope())return [];const hand=c.controls.hand().map((it,index)=>({it,index,source:'hand',owner:null})),equipped=c.controls.group().filter(p=>!p.dead).flatMap(p=>c.equipmentOf(p).map((it,index)=>({it,index,source:'equipment',owner:p.id})));return [...hand,...equipped].map(e=>({...e,uid:uid(e.it,e.source,e.owner,e.index),d:c.catalog.resolve(e.it)})).filter(e=>e.d);}
 const needsActor=e=>e.source==='equipment'||['equip','heal','frost','manual','research','move'].includes(e.d.effect)||e.d.effect==='sample'&&!c.all().some(p=>p.id===e.it.finderId);
 function option({mode='use',cardId,actorId=null,targetId=null,destination=null}={}){
  const e=entries().find(e=>e.uid===cardId),p=c.game&&c.all().find(p=>p.id===actorId),own=c.game&&c.controls.group().find(p=>!p.dead);
  let reason=block(p||own);if(!reason&&!e)reason='card';if(!reason&&mode!=='contribute'&&needsActor(e)&&!p)reason='target';if(!reason&&p&&(p.dead||c.ownerOf(p)!==c.controls.side))reason=p.dead?'dead':'ownership';
  if(!reason&&(e.source!=='equipment'&&targetId!==null||e.d.effect!=='move'&&destination!==null))reason='target';
  let summary='',waste=0;
  if(!reason){const d=e.d;
   if(mode==='contribute'){if(!canContribute(e.it))reason='crisis';if(e.source==='equipment'&&actorId!==e.owner)reason='ownership';summary='Aportar '+d.name+' a la crisis de '+c.game.crisis.type+'. '+(e.source==='equipment'?'Se retira del equipo actual. ':'')+'Consume esta carta, sin dado ni residuos.';}else if(e.source==='equipment'){
    const t=c.all().find(p=>p.id===targetId);if(actorId!==e.owner||!t||!c.canReceiveTransfer(p,t,e.it))reason='transfer';
    summary='Transferir '+d.name+' de '+p?.name+' a '+t?.name+'. Sin dado ni residuos.';
   }else if(d.effect==='equip'){
    if(c.equipmentOf(p).some(it=>c.kind(it)===d.kind))reason='equipment-kind';
    summary='Equipar '+d.name+' a '+p.name+'. Conserva el equipo de otros tipos; sin dado ni residuos. '+d.desc;
   }else if(['heal','frost'].includes(d.effect)){
    const n=c.Math.min(d.amount+(p.skill==='paramedic'?1:0),d.effect==='frost'?p.frost:p.wounds+p.frost);if(!n)reason='treatment';
    summary=p.name+': curar hasta '+n+' daño(s)'+(d.effect==='frost'?' de congelación':' (heridas primero)')+'.';waste=1;
   }else if(d.effect==='manual'){
    const n=c.Math.min(c.game.waste,2),b=c.openAccess(p.loc)?1:0;if(!n&&!b)reason='manual';summary='Retirar '+n+' residuos y construir '+b+' barricada(s) en '+c.places[p.loc]+'.';waste=1;
   }else if(d.effect==='food'){summary='Reserva común: +'+d.amount+' comida(s).';waste=1;}
   else if(d.effect==='sample'||d.effect==='research'){
    const finder=d.effect==='sample'?c.all().find(p=>p.id===e.it.finderId)||p:p;
    summary='Objetivo: +'+(finder?.skill==='researcher'&&!finder.bonusUsed?2:1)+' muestra(s).';waste=d.effect==='research'?1:0;
   }else if(d.effect==='move'){
    if(p.moved)reason='already-moved';else if(!Number.isInteger(destination)||destination===p.loc||destination<0||destination>=c.places.length||!c.accessible(destination))reason='destination';
    summary='Mover a '+p.name+' a '+(c.places[destination]||'un destino disponible')+' sin exposición. Marca movimiento usado; consume este bidón, sin dado.';waste=1;
   }else if(d.effect==='rescue'){if(!canRecruit())reason='rescue';summary='Incorporar un superviviente a la colonia mediante el reclutamiento original.';}
   else reason='unsupported';
   if(mode!=='contribute'&&e.source==='hand'&&d.effect!=='equip')summary+=' Consume esta carta'+(waste?'; +1 residuo.':'; sin residuos.');
  }
  return {mode,cardId,actorId,targetId,destination,allowed:!reason,reason,summary,waste};
 }
 function inventorySnapshot(){
  const s=scope();if(!s)return null;if(receipt&&(receipt.scope!==s||after!==stamp()))receipt=null;
  return {scope:s,ownerId:c.controls.side,receipt,hand:entries().filter(e=>e.source==='hand').map(e=>({uid:e.uid,name:e.d.name,description:e.d.desc,kind:e.d.kind,effect:e.d.effect,requiresActor:needsActor(e),quantity:1})),equipment:entries().filter(e=>e.source==='equipment').map(e=>({uid:e.uid,ownerId:e.owner,name:e.d.name,description:e.d.desc,kind:e.d.kind,effect:e.d.effect,usedRound:e.it?.usedRound||0})),actors:c.controls.group().filter(p=>!p.dead).map(p=>({id:p.id,name:p.name,location:p.loc})),recipients:c.alive().map(p=>({id:p.id,name:p.name,location:p.loc,player:c.controls.display(c.ownerOf(p))})),options:entries().flatMap(e=>{
   const actors=needsActor(e)?c.controls.group().filter(p=>!p.dead):[null];return actors.flatMap(p=>e.source==='equipment'?c.alive().filter(t=>t.id!==p?.id).map(t=>option({cardId:e.uid,actorId:p?.id,targetId:t.id})):e.d.effect==='move'?c.places.map((_,i)=>option({cardId:e.uid,actorId:p?.id,destination:i})):[option({cardId:e.uid,actorId:p?.id})]);
  }).concat(entries().map(e=>option({mode:'contribute',cardId:e.uid,actorId:e.owner})))};
 }
 function inventoryExecute(request){
  const q=option(request);if(!q.allowed)return {ok:false,reason:q.reason};const e=entries().find(e=>e.uid===q.cardId),p=c.all().find(p=>p.id===q.actorId),before=stamp(),s=scope();let ok=false;
  clear();
  if(q.mode==='contribute'){ok=contribute(e);}else if(e.source==='equipment'){
   const profile=c.profileId;try{c.profileId=p.id;c.startTransfer(e.index);c.chooseTransfer(q.targetId);ok=!c.equipmentOf(p).includes(e.it);}finally{c.profileId=profile;}
  }else{
   const target=c.target;try{if(e.d.effect==='move')c.target=q.destination;ok=c.itemEngine.use(e.index,p,c.controls.side);}finally{c.target=target;}
   if(ok&&e.d.effect!=='equip'){c.confirmStartingLeader();c.verify();}c.paint();
  }
  if(!ok)return {ok:false,reason:'unavailable'};
  receipt={id:'inventory_'+generation()+'_'+(++serial),scope:s,summary:q.summary,cardName:e.d.name,generalDecision:!!block(c.controls.group().find(p=>!p.dead)),changed:stamp()!==before};after=stamp();c.view.draw();return {ok:true,receipt:{...receipt}};
 }
 function dismissInventory(id){if(!receipt||receipt.id!==id||receipt.scope!==scope()||receipt.generalDecision)return {ok:false,reason:'stale'};receipt=null;return {ok:true};}
 return {inventorySnapshot,inventoryExecute,dismissInventory};
}
