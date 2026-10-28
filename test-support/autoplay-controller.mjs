// Estrategia de prueba explícita. Solo elige entradas; no simula ni aplica reglas.
// Se inyecta en el mismo ámbito del HTML tanto en VM como en Chromium.
export const controllerSource=String.raw`
globalThis.testController={
 strategy:'cooperativa-v1: muestras/notas, crisis exacta, tratamiento, defensor, exploración, defensa/búsqueda',
 decision(planOnly=false){
  this.plannedDecision=null;
  const dispatch=(name,args,command)=>{
   if(planOnly){this.plannedDecision={name,args};return command;}
   if(name==='deathContinue')deathDirector.continue();
   else ({chooseBite,confirmPass,chooseLeader,crossAiContinue,crossChoose,chooseLoot,chooseHeal,cancelAttract,chooseAttract,chooseTransfer,cancelTransfer,dismissRecruit})[name](...args);
   return command;
  };
  if(deathDirector.active){return dispatch('deathContinue',[],'confirmar-muerte');}
  if(pendingBite&&!game.ended){return dispatch('chooseBite',['risk'],'arriesgar-mordedura');}
  if(deathDirector.pending.length)return null;
  if(game.ended&&pendingRecruitInfo)return dispatch('dismissRecruit',[],'confirmar-rescate-final');
  if(game.ended)return null;
  if(passScreenActive){return dispatch('confirmPass',[],'confirmar-pase');}
  if(leaderChoiceReady()){
   const p=ownerGroup(pendingLeaderSide).filter(p=>!p.dead).sort((a,b)=>b.influence-a.influence)[0];
   if(!p)throw Error('sucesión sin candidato');return dispatch('chooseLeader',[p.id],'sucesor:'+p.id);
  }
  const kind=decisionKind();
  if(kind==='crossroads'){
   if(game.mode==='ai'&&game.crossOwner==='ai')return dispatch('crossAiContinue',[],'resolver-encrucijada');
   return dispatch('crossChoose',[chooseCrossOption(crossroadsDeck[game.crossCard],game.crossOwner)],'resolver-encrucijada');
  }
  if(kind==='lootChoice'){
   const score=it=>{const d=catalog.resolve(it);return d.effect==='research'||d.effect==='sample'?20:d.kind===game.crisis.type&&game.crisis.given<game.crisis.need?15:d.kind==='comida'?12:d.kind==='medicina'?8:d.kind==='superviviente'?7:d.effect==='equip'?6:3;};
   const index=pendingLoot.items.map((it,i)=>({i,s:score(it)})).sort((a,b)=>b.s-a.s||a.i-b.i)[0].i;
   return dispatch('chooseLoot',[index],'elegir-botín:'+index);
  }
  if(kind==='healTarget'){return dispatch('chooseHeal',[pendingHeal.targets[0]],'elegir-paciente');}
  if(kind==='attractTarget'){
   const i=game.zones.findIndex((z,i)=>i!==pendingAttract.loc&&z.z);return dispatch(i<0?'cancelAttract':'chooseAttract',i<0?[]:[i],'resolver-atracción');
  }
  if(kind==='transferTarget'){
   const p=all().find(x=>x.id===pendingTransfer.fromId),it=p?.equipment[pendingTransfer.itemIndex];
   const id=pendingTransfer.targets.find(id=>canReceiveTransfer(p,all().find(x=>x.id===id),it));
   return dispatch(id?'chooseTransfer':'cancelTransfer',id?[id]:[],'resolver-transferencia');
  }
  if(pendingRecruitInfo){return dispatch('dismissRecruit',[],'confirmar-rescate');}
  return null;
 },
 normal(planOnly=false){
  this.planned=null;
  const dispatch=(name,args,command)=>{
   if(planOnly){this.planned={name,args,selected,target,picked};return command;}
   ({playItem,contribute,special,doMove,clean,attack,search,boostDie,barricade})[name](...args);return command;
  };
  if(!playable())return null;
  const group=controls.group().filter(p=>!p.dead),hand=currentHand();
  if(!group.length)throw Error('sin superviviente y partida activa');
  const focus=p=>{selected=controls.group().indexOf(p);selectionBySide[controls.side]=selected;target=p.loc;};
  const use=(p,i)=>{focus(p);const id=catalog.resolve(hand[i]).id;return dispatch('playItem',[i],'usar:'+p.id+':'+id);};
  // Entregar muestras/notas inmediatamente, sin reservarlas para influir en resultados.
  let i=hand.findIndex(it=>['sample','research'].includes(catalog.resolve(it)?.effect));if(i>=0)return use(group[0],i);
  i=hand.findIndex(it=>kind(it)===game.crisis.type&&game.crisis.given<game.crisis.need);
  if(i>=0){return dispatch('contribute',[i],'aportar-crisis:'+i);}
  for(const p of group){
   const hurt=group.some(t=>t.loc===p.loc&&(p.skill==='medic'?t.wounds:t.frost));
   if(!p.skillUsed&&(['medic','nurse'].includes(p.skill)&&hurt||p.skill==='builder'&&openAccess(p.loc))){focus(p);return dispatch('special',[],'habilidad:'+p.id);}
  }
  for(let k=0;k<hand.length;k++){
   const d=catalog.resolve(hand[k]);
   if(['heal','frost'].includes(d.effect)){
    const p=group.find(p=>d.effect==='frost'?p.frost:p.wounds+p.frost);if(p)return use(p,k);
   }
   if(d.effect==='food'&&game.food<feedingNeed(game)+3)return use(group[0],k);
   if(d.effect==='equip'){
    const p=group.find(p=>!equipmentOf(p).some(it=>kind(it)===d.kind));if(p)return use(p,k);
   }
   if(d.effect==='manual'&&game.waste>=2)return use(group[0],k);
  }
  // Un defensor por grupo. Los demás exploran biblioteca/hospital y luego comida.
  const defender=group.slice().sort((a,b)=>effectiveAttack(a)-effectiveAttack(b)||a.id.localeCompare(b.id))[0];
  for(const p of group){
   if(p===defender||p.moved||p.loc!==0&&game.decks[p.loc]?.length)continue;
   const dest=[6,2,1,4,5,3].find(l=>l!==p.loc&&accessible(l)&&game.decks[l]?.length);
   if(dest!==undefined){focus(p);target=dest;const fuel=hand.findIndex(it=>kind(it)==='combustible');if(fuel>=0){return dispatch('playItem',[fuel],'mover-combustible:'+p.id+':'+dest);}return dispatch('doMove',[],'mover:'+p.id+':'+dest);}
  }
  const dice=actionDice();if(!dice.length)return 'terminar-turno';
  const pickMin=()=>dice.indexOf(Math.min(...dice));
  const home=group.find(p=>p.loc===0);
  if(home&&game.waste>=8){focus(home);picked=pickMin();return dispatch('clean',[],'limpiar:'+home.id);}
  for(const p of group){
   const z=game.zones[p.loc],arriving=alive().filter(x=>x.loc===p.loc).length;
   const risk=z.z+Math.max(1,arriving)>=zcap[p.loc];
   const di=dice.findIndex(d=>d>=effectiveAttack(p));
   if(z.z&&risk&&di>=0){focus(p);picked=di;return dispatch('attack',[],'atacar:'+p.id);}
  }
  const searcher=group.filter(p=>p.loc!==0&&game.decks[p.loc]?.length).sort((a,b)=>effectiveSearch(a)-effectiveSearch(b))[0];
  if(searcher){
   const di=dice.findIndex(d=>d>=effectiveSearch(searcher));
   if(di>=0){focus(searcher);picked=di;return dispatch('search',[],'buscar:'+searcher.id);}
   if(game.food>feedingNeed(game)+1&&Math.max(...dice)<6){picked=dice.indexOf(Math.max(...dice));return dispatch('boostDie',[],'mejorar-dado');}
  }
  for(const p of group){const di=dice.findIndex(d=>d>=effectiveAttack(p));if(game.zones[p.loc].z&&di>=0){focus(p);picked=di;return dispatch('attack',[],'atacar:'+p.id);}}
  const builder=group.find(p=>openAccess(p.loc));if(builder){focus(builder);picked=pickMin();return dispatch('barricade',[],'barricada:'+builder.id);}
  if(home&&game.waste){focus(home);picked=pickMin();return dispatch('clean',[],'limpiar:'+home.id);}
  return 'terminar-turno';
 },
 invariant(){
  const errors=[...gameAudit.violations],live=alive(),ids=all().map(p=>p.id);
  if(new Set(ids).size!==ids.length)errors.push('ids duplicados');
  for(const key of ['food','morale','hunger','samples','waste'])if(!Number.isFinite(game[key])||game[key]<0)errors.push('recurso inválido:'+key);
  if([...game.dice,...game.botDice].some(d=>!Number.isInteger(d)||d<1||d>6))errors.push('dado inválido');
  for(const [i,z] of game.zones.entries())if(z.z<0||z.b<0||z.z+z.b>zcap[i]||z.noise<0||z.noise>4)errors.push('zona inválida:'+i);
  if(!game.ended&&!game.biteResolving)for(const side of ['human','ai'])if(ownerGroup(side).some(p=>!p.dead)&&!groupLeader(side)&&!pendingLeaderSides.includes(side))errors.push('sucesión perdida:'+side);
  const objects=[...game.items,...game.botItems,...all().flatMap(equipmentOf),...Object.values(game.decks).flat(),...(pendingLoot?.items||[])].filter(it=>it&&typeof it==='object');
  if(new Set(objects).size!==objects.length)errors.push('misma carta en dos contenedores');
  if(all().some(p=>p.dead&&equipmentOf(p).length))errors.push('muerto conserva equipo');
  if(live.some(p=>p.loc<0||p.loc>=places.length))errors.push('localidad inválida');
  for(const side of ['human','ai'])if(ownerGroup(side).some(p=>ownerOf(p)!==side))errors.push('personaje en grupo ajeno');
  for(const p of all()){
   if(!Number.isInteger(p.wounds)||p.wounds<0||!Number.isInteger(p.frost)||p.frost<0)errors.push('daño inválido');
   const kinds=equipmentOf(p).map(kind);if(new Set(kinds).size!==kinds.length)errors.push('equipo de categoría duplicada');
  }
  for(let loc=0;loc<places.length;loc++)if(live.filter(p=>p.loc===loc).length+(loc===0?game.helpless:0)>capacity[loc])errors.push('capacidad excedida:'+loc);
  if(game.crisis.given!==game.crisis.contributions.length)errors.push('contador de aportes desincronizado');
  return errors;
 }
};
globalThis.gameAudit={violations:[],checks:{cards:0,dice:0},messages:game.log.slice().reverse(),deaths:[],recruits:[],leaders:[],crises:[],crossroads:[],choices:[]};
if(game.crossPending)gameAudit.crossroads.push({round:game.round,side:game.crossOwner,title:crossroadsDeck[game.crossCard].title});
{const original=message;message=t=>{original(t);gameAudit.messages.push(game.log[0]);};}
{const original=kill;kill=(p,reason,env=null)=>{const record=!env&&p&&!p.dead?{round:game.round,id:p.id,name:p.name,reason,loc:p.loc}:null;const out=original(p,reason,env);if(record)gameAudit.deaths.push(record);return out;};}
{const original=recruit;recruit=(side,emergency=false,env=null)=>{const out=original(side,emergency,env);if(!env&&out)gameAudit.recruits.push({round:game.round,side,replacement:emergency,id:ownerGroup(side).at(-1).id});return out;};}
{const original=reviewLeader;reviewLeader=(side,env=null)=>{const before=env?null:game.leaders[side],out=original(side,env);if(!env&&before!==game.leaders[side])gameAudit.leaders.push({round:game.round,side,id:game.leaders[side],automatic:true});return out;};}
{const original=chooseLeader;chooseLeader=id=>{const before=JSON.stringify(game.leaders),out=original(id);if(before!==JSON.stringify(game.leaders))gameAudit.leaders.push({round:game.round,id,automatic:false});return out;};}
{const original=resolveCrisis;resolveCrisis=()=>{gameAudit.crises.push({round:game.round,type:game.crisis.type,need:game.crisis.need,given:game.crisis.contributions.filter(x=>x===game.crisis.type).length});return original();};}
{const original=crossTrigger;crossTrigger=(kind,p)=>{const before=game.crossPending,out=original(kind,p);if(!before&&game.crossPending)gameAudit.crossroads.push({round:game.round,side:game.crossOwner,title:crossroadsDeck[game.crossCard].title});return out;};}
{const original=resolveCross;resolveCross=i=>{const title=crossroadsDeck[game.crossCard].title,side=game.crossOwner,out=original(i);if(out)gameAudit.choices.push({round:game.round,side,title,option:i});return out;};}

{const original=itemEngine.use;itemEngine.use=function(i,p,side='human'){
 const hand=side==='ai'?game.botItems:game.items,before=hand.length,ended=game.ended,out=original.call(this,i,p,side);
 if(out){gameAudit.checks.cards++;if(hand.length!==before-1)gameAudit.violations.push('consumo de carta no unitario');if(ended)gameAudit.violations.push('carta tras terminal');}return out;
};}
{const original=consume;consume=min=>{
 const dice=actionDice(),count=dice.length,other=JSON.stringify(controls.side==='human'?game.botDice:game.dice),ended=game.ended,out=original(min);
 if(out!==null){gameAudit.checks.dice++;if(dice.length!==count-1)gameAudit.violations.push('consumo de dado no unitario');if(ended)gameAudit.violations.push('dado tras terminal');if(other!==JSON.stringify(controls.side==='human'?game.botDice:game.dice))gameAudit.violations.push('dado ajeno alterado');}return out;
};}

`;

// Observadores: llaman al original y comprueban consumos, sin alterar sus resultados.
