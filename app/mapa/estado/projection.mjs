// Proyección pública. No llama paint/playable ni serializa la partida completa.
const number=value=>Number.isFinite(value)?value:null;
const text=value=>typeof value==='string'?value:null;
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
const placeId=index=>Number.isInteger(index)?'place-'+index:null;
export function projectVisibleState(context,{gate={},renderedPlayable=false,epoch=0}={}){
 const g=context.game,blocked=gate.setup?'setup':gate.pass?'handover':gate.death?'death':gate.modal?'decision':!g?'waiting':null;
 if(blocked)return freeze({schema:1,epoch,blocked,players:[],characters:[],locations:[],objective:null,crisis:null,log:[],dice:{ownerId:null,available:null,used:null},round:null,morale:null,food:null});
 const players=['human','ai'].map(id=>({id,label:context.controls.display(id),leaderId:text(g.leaders?.[id]),initialLeaderConfirmed:!!(id==='human'?g.leaderChosen:g.localLeaderChosen)}));
 const characters=players.flatMap(player=>(player.id==='human'?g.humans:g.bots).filter(p=>!p.dead).map(p=>({
  id:String(p.id),name:text(p.name),job:text(p.job),playerId:player.id,locationId:placeId(p.loc),
  influence:number(p.influence),attack:number(p.attack),search:number(p.search),effectiveAttack:number(context.effectiveAttack(p)),effectiveSearch:number(context.effectiveSearch(p)),
  wounds:number(p.wounds),frost:number(p.frost),moved:typeof p.moved==='boolean'?p.moved:null,leader:g.leaders?.[player.id]===p.id,
  skill:{id:text(p.skill),name:text(p.skillName),description:text(p.skillDesc),used:typeof p.skillUsed==='boolean'?p.skillUsed:null},
  equipment:context.equipmentOf(p).map(item=>{const d=context.catalog.resolve(item);return {id:text(d?.id),name:text(d?.name),kind:text(d?.kind),description:text(d?.desc),usedRound:number(item?.usedRound)};})
 })));
 const locations=context.places.map((_,index)=>{
  const z=g.zones[index],id=placeId(index),members=characters.filter(c=>c.locationId===id),helpless=index===0?number(g.helpless):0,capacity=number(context.capacity[index]),exteriorCapacity=number(context.zcap[index]),zombies=number(z?.z),barricades=number(z?.b),occupied=helpless===null?null:members.length+helpless;
  return {id,engineIndex:index,name:text(z?.name)||text(context.places[index]),survivors:members.length,characterIds:members.map(c=>c.id),helpless,occupied,capacity,available:capacity===null||occupied===null?null:capacity-occupied,zombies,barricades,exteriorCapacity,exteriorAvailable:[exteriorCapacity,zombies,barricades].some(x=>x===null)?null:exteriorCapacity-zombies-barricades,noise:number(z?.noise)};
 });
 return freeze({schema:1,epoch,blocked:null,mode:text(g.mode),round:number(g.round),maxRounds:number(g.max),morale:number(g.morale),food:number(g.food),ended:!!g.ended,turn:text(g.turn),automationRunning:!!context.aiRunning,players,characters,locations,
  objective:g.objective?{name:text(g.objective.name),description:text(g.objective.description),samples:number(g.samples),goal:number(g.goal)}:null,
  crisis:g.crisis?{type:text(g.crisis.type),need:number(g.crisis.need),given:number(g.crisis.given),failure:text(g.crisis.fail)}:null,
  log:g.log.filter(entry=>typeof entry==='string').slice(),last:text(g.last),
  dice:{ownerId:g.ended?null:context.controls.side,available:renderedPlayable?Array.from(context.controls.dice()||[]):null,used:null}
 });
}
