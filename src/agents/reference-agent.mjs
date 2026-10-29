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
   if(!ctx.CrisisManager.add(ctx.game.botItems[i],'La IA'))return;
   ctx.game.botItems.splice(i,1);
  }else{
   const p=ctx.game.bots.find(p=>!p.dead&&ctx.equipmentOf(p).some(it=>ctx.kind(it)==='herramienta'));
   if(!p)return;
   const j=ctx.equipmentOf(p).findIndex(it=>ctx.kind(it)==='herramienta');
   if(j<0||!ctx.CrisisManager.add(p.equipment[j],p.name))return;
   p.equipment.splice(j,1);
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
  if(['medic','nurse'].includes(p.skill)&&!p.skillUsed){const t=ctx.alive().filter(x=>x.loc===p.loc&&(p.skill==='medic'?x.wounds:x.frost)).sort((a,b)=>b.wounds-a.wounds)[0];if(t){if(p.skill==='medic')t.wounds--;else t.frost--;p.skillUsed=true;ctx.message('★ '+p.name+' atendió a '+t.name+'.');await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}}
  if(p.skill==='builder'&&!p.skillUsed&&ctx.openAccess(p.loc)){ctx.game.zones[p.loc].b++;p.skillUsed=true;ctx.message('★ '+p.name+' construyó una barricada sin dado.');await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
 }
 // IA: utiliza el mismo motor de objetos que el humano; equipamiento y consumibles requieren condiciones reales.
 for(const p of bots.filter(p=>!p.dead)){
  for(let k=ctx.game.botItems.length-1;k>=0;k--){
   const d=ctx.catalog.resolve(ctx.game.botItems[k]);
   if(d?.effect==='equip'&&!p.equipment.some(it=>ctx.kind(it)===d.kind)){
    if(ctx.itemEngine.use(k,p,'ai'))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;
   }
  }
 }
 for(let k=ctx.game.botItems.length-1;k>=0;k--){
  const it=ctx.game.botItems[k],d=ctx.catalog.resolve(it);if(!d)continue;
  if(d.kind===ctx.game.crisis.type&&d.kind!=='herramienta'&&ctx.game.crisis.contributions.length<ctx.game.crisis.need){
   if(ctx.CrisisManager.add(it,'La IA')){ctx.game.botItems.splice(k,1);await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}continue;
  }
  const injured=ctx.game.bots.filter(p=>!p.dead&&(d.effect==='frost'?p.frost:p.wounds+p.frost)).sort((a,b)=>(b.wounds+b.frost)-(a.wounds+a.frost))[0];
  if((d.effect==='heal'||d.effect==='frost')&&injured){if(ctx.itemEngine.use(k,injured,'ai'))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
  else if(d.effect==='food'&&ctx.game.food<Math.ceil((ctx.alive().filter(p=>p.loc===0).length+ctx.game.helpless)/2)+1){if(ctx.itemEngine.use(k,bots.find(p=>!p.dead),'ai'))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
  else if(d.effect==='research'){
   if(ctx.itemEngine.use(k,bots.find(p=>!p.dead),'ai')){
    // C1/#11: una muestra completada por la IA debe ganar antes de procesar la colonia.
    ctx.verify();
    if(ctx.game.ended)return;
    await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;
   }
  }
  else if(d.effect==='manual'&&ctx.game.waste>=2){if(ctx.itemEngine.use(k,bots.find(p=>!p.dead),'ai'))await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
 }

 // Distribución de desplazamientos (una vez por personaje): según necesidades.
 for(const p of bots){
  if(p.dead||p.moved||ctx.game.ended)continue;
  const dest=p.search<=3?([2,6,1].find(i=>ctx.accessible(i)&&ctx.game.decks[i].length)||p.loc):([1,3,4,5].find(i=>ctx.accessible(i)&&ctx.game.decks[i].length)||p.loc);
  if(dest!==p.loc){
   const fuelIdx=ctx.game.botItems.findIndex(it=>ctx.kind(it)==='combustible');
   const fueled=fuelIdx>=0&&ctx.itemEngine.moveWithFuel(p,dest,'ai',fuelIdx);
   if(!fueled){p.loc=dest;p.moved=true;ctx.message('🤖 '+p.name+' se movió a '+ctx.places[dest]+'.');}
   await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;if(!fueled){if(p.skill==='silent'&&!p.skillUsed){p.skillUsed=true;}else ctx.expose(p,'movimiento IA');}
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
  const {p,di,type}=action,d=dice.splice(di,1)[0];
  if(type==='search'){ctx.beginSearch(p,'ai');ctx.message('🎲 IA '+p.name+' usó dado '+d+' para buscar.');ctx.crossAction('search',p);}
  else if(type==='attack'){ctx.message('🎲 IA '+p.name+' gastó dado '+d+' al combatir.');ctx.itemEngine.attack(p,'ai');if(ctx.pendingBite)await ctx.waitForBite();if(ctx.game!==turnGame||ctx.game.ended)return;if(!ctx.pendingBite)ctx.crossAction('attack',p);}
  else if(type==='clean'){const n=Math.min(3,ctx.game.waste);ctx.game.waste-=n;ctx.message('♻ IA limpió '+n+' residuos con dado '+d+'.');}
  else{const n=(p.skill==='guard'?2:1)+(ctx.itemEngine.has(p,'repairkit')?1:0);for(let j=0;j<n&&ctx.openAccess(p.loc);j++)ctx.game.zones[p.loc].b++;ctx.message('▥ IA '+p.name+' colocó barricadas con dado '+d+'.');}
  ctx.verify();await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;
 }
 // C7: comprobar los recursos disponibles solo después de las acciones y búsquedas.
 ctx.botContributeTools();
}
return {get botContributeTools(){return botContributeTools;},set botContributeTools(value){botContributeTools=value;},
get botTurn(){return botTurn;},set botTurn(value){botTurn=value;}};
}
