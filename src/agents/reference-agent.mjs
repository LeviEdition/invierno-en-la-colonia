// V9.9: extracción con enlaces vivos; las reglas se conservan.
export function createAgent(ctx,{Math=globalThis.Math,setTimeout=globalThis.setTimeout}={}){
function botContributeTools(){
 const c=ctx.game.crisis;
 if(ctx.game.ended||!c||c.type!=='herramienta')return;
 const remaining=Math.max(0,c.need-c.contributions.filter(type=>type==='herramienta').length);
 if(!remaining)return;
 const available=ctx.game.botItems.filter(it=>ctx.kind(it)==='herramienta').length+
  ctx.game.bots.filter(p=>!p.dead).reduce((n,p)=>n+ctx.equipmentOf(p).filter(it=>ctx.kind(it)==='herramienta').length,0);
 if(available<remaining)return;
 // Desempate determinista: primero mano en orden; después supervivientes vivos IA en orden.
 for(let n=0;n<remaining;n++){
  const i=ctx.game.botItems.findIndex(it=>ctx.kind(it)==='herramienta');
  if(i>=0){
   if(!ctx.actions.contributeHand(i))return;
  }else{
   const p=ctx.game.bots.find(p=>!p.dead&&ctx.equipmentOf(p).some(it=>ctx.kind(it)==='herramienta'));
   if(!p)return;
   const j=ctx.equipmentOf(p).findIndex(it=>ctx.kind(it)==='herramienta');
   if(j<0||!ctx.actions.contributeEquipment(p.id,j))return;
  }
 }
}
async function botTurn(){
 if(!ctx.game||ctx.game.ended)return;
 const turnGame=ctx.game;
 ctx.message('🤖 Comienza el turno de la IA.');ctx.applyFrost('ai');ctx.replaceLastSurvivors();ctx.verify();if(ctx.game.ended)return;
 ctx.crossDraw('ai');ctx.crossTrigger('round',null);await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;
 const bots=ctx.game.bots.filter(p=>!p.dead);
 const dice=ctx.game.botDice; // Reserva única real: nunca copiar para evitar estados divergentes.
 // Los dados son un fondo común: no pertenecen a un personaje concreto.
 for(const p of bots){
  if(p.dead||ctx.game.ended)continue;
  if(['medic','nurse'].includes(p.skill)&&!p.skillUsed){const t=ctx.alive().filter(x=>x.loc===p.loc&&(p.skill==='medic'?x.wounds:x.frost)).sort((a,b)=>b.wounds-a.wounds)[0];if(t){ctx.actions.treat(p.id,t.id);await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}}
  if(p.skill==='builder'&&!p.skillUsed&&ctx.openAccess(p.loc)){ctx.actions.buildFree(p.id);await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
 }
 // IA: utiliza el mismo motor de objetos que el humano; equipamiento y consumibles requieren condiciones reales.
 for(const p of bots.filter(p=>!p.dead)){
  for(let k=ctx.game.botItems.length-1;k>=0;k--){
   const d=ctx.catalog.resolve(ctx.game.botItems[k]);
   if(d?.effect==='equip'&&!p.equipment.some(it=>ctx.kind(it)===d.kind)){
    if(ctx.actions.useItem(k,p.id))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;
   }
  }
 }
 for(let k=ctx.game.botItems.length-1;k>=0;k--){
  const it=ctx.game.botItems[k],d=ctx.catalog.resolve(it);if(!d)continue;
  if(d.kind===ctx.game.crisis.type&&d.kind!=='herramienta'&&ctx.game.crisis.contributions.length<ctx.game.crisis.need){
   if(ctx.actions.contributeHand(k)){await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}continue;
  }
  const injured=ctx.game.bots.filter(p=>!p.dead&&(d.effect==='frost'?p.frost:p.wounds+p.frost)).sort((a,b)=>(b.wounds+b.frost)-(a.wounds+a.frost))[0];
  if((d.effect==='heal'||d.effect==='frost')&&injured){if(ctx.actions.useItem(k,injured.id))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
  else if(d.effect==='food'&&ctx.game.food<Math.ceil((ctx.alive().filter(p=>p.loc===0).length+ctx.game.helpless)/2)+1){if(ctx.actions.useItem(k,bots.find(p=>!p.dead)?.id))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
  else if(d.effect==='research'){
   if(ctx.actions.useItem(k,bots.find(p=>!p.dead)?.id)){
    // C1/#11: una muestra completada por la IA debe ganar antes de procesar la colonia.
    ctx.verify();
    if(ctx.game.ended)return;
    await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;
   }
  }
  else if(d.effect==='manual'&&ctx.game.waste>=2){if(ctx.actions.useItem(k,bots.find(p=>!p.dead)?.id))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
 }

 // Distribución de desplazamientos (una vez por personaje): según necesidades.
 for(const p of bots){
  if(p.dead||p.moved||ctx.game.ended)continue;
  const dest=p.search<=3?([2,6,1].find(i=>ctx.accessible(i)&&ctx.game.decks[i].length)||p.loc):([1,3,4,5].find(i=>ctx.accessible(i)&&ctx.game.decks[i].length)||p.loc);
  if(dest!==p.loc){
   const fuelIdx=ctx.game.botItems.findIndex(it=>ctx.kind(it)==='combustible');
   const fueled=fuelIdx>=0&&ctx.actions.moveWithFuel(p.id,dest,fuelIdx);
   if(!fueled){ctx.actions.move(p.id,dest);}
   await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;if(!fueled){ctx.actions.exposeMove(p.id);}
   if(ctx.pendingBite)await ctx.waitForBite();if(ctx.game!==turnGame||ctx.game.ended)return;await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;if(p.dead){ctx.verify();continue;}if(!ctx.pendingBite)ctx.crossAction('move',p);
  }
 }
 let turns=0;
 while(dice.length&&turns++<40&&!ctx.game.ended){
  const candidates=ctx.game.bots.filter(p=>!p.dead);if(!candidates.length)break;
  let action=null;
  for(const p of candidates){
   const z=ctx.game.zones[p.loc];
   const di=dice.findIndex(d=>d>=ctx.effectiveSearch(p));
   if(p.loc!==0&&ctx.game.decks[p.loc].length&&di>=0){action={p,di,type:'search'};break;}
  }
  if(!action)for(const p of candidates){const di=dice.findIndex(d=>d>=ctx.effectiveAttack(p));if(di>=0&&ctx.game.zones[p.loc].z>0){action={p,di,type:'attack'};break;}}
  if(!action){const p=candidates.find(p=>ctx.openAccess(p.loc));if(p)action={p,di:0,type:'barricade'};}
  if(!action){const p=candidates.find(p=>p.loc===0&&ctx.game.waste);if(p)action={p,di:0,type:'clean'};}
  if(!action)break;
  const {p,di,type}=action,d=ctx.actions.spendDie(di);
  if(type==='search'){ctx.actions.search(p.id,d);}
  else if(type==='attack'){ctx.actions.attack(p.id,d);if(ctx.pendingBite)await ctx.waitForBite();if(ctx.game!==turnGame||ctx.game.ended)return;if(!ctx.pendingBite)ctx.crossAction('attack',p);}
  else if(type==='clean'){ctx.actions.clean(d);}
  else{ctx.actions.barricade(p.id,d);}
  ctx.verify();await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;
 }
 // C7: comprobar los recursos disponibles solo después de las acciones y búsquedas.
 ctx.botContributeTools();
}
return {get botContributeTools(){return botContributeTools;},set botContributeTools(value){botContributeTools=value;},
get botTurn(){return botTurn;},set botTurn(value){botTurn=value;}};
}
