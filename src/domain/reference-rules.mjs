// V9.9: extracción con enlaces vivos; las reglas se conservan.
export function createRules(ctx,{Math=globalThis.Math,setTimeout=globalThis.setTimeout}={}){
function equipmentOf(p){return p.equipment||[];}
function ownerGroup(side,g=ctx.game){return side==='ai'?g.bots:g.humans;}
function groupLeader(side,g=ctx.game){if(!g)return null;return ctx.ownerGroup(side,g).find(p=>!p.dead&&p.id===g.leaders?.[side])||null;}
function isLeader(p){return !!p&&!p.dead&&ctx.game.leaders?.[ctx.ownerOf(p)]===p.id;}
function canPickStartingLeader(){return !!ctx.game&&ctx.playable()&&ctx.game.round===1&&!(ctx.controls.side==='human'?ctx.game.leaderChosen:ctx.game.localLeaderChosen);}
const kind=x=>ctx.catalog.resolve(x)?.kind||'';
const ownerHand=g=>g.crossOwner==='ai'?g.botItems:g.items;
const crossActor=(g=ctx.game)=>ctx.all(g).find(p=>p.id===g.crossActorId)||ctx.groupLeader(g.crossOwner,g)||ctx.alive(g)[0]||{loc:0};
const ownerOf=p=>p.id[0]==='a'?'ai':'human';
const accessible=(loc,g=ctx.game)=>ctx.alive(g).filter(p=>p.loc===loc).length+(loc===0?g.helpless:0)<ctx.capacity[loc];
const openAccess=(i,g=ctx.game)=>g.zones[i].z+g.zones[i].b<ctx.zcap[i];
const hasAnyAccess=()=>ctx.game.zones.some((z,i)=>ctx.openAccess(i));
const itemTitle=it=>ctx.catalog.label(it);
function effectiveAttack(p){return Math.max(1,p.attack-(p.skill==='fighter'?1:0)-(ctx.itemEngine.has(p,'rifle')||ctx.itemEngine.has(p,'hatchet')?1:0));}
function effectiveSearch(p){return Math.max(1,p.search-(p.skill==='librarian'&&p.loc===6?1:0)-(ctx.itemEngine.has(p,'crowbar')?1:0));}
function gameOutcome(g){
 if(g.morale<=0)return 'morale';
 if(g.noReplacement||(!g.humans.some(p=>!p.dead)||!g.bots.some(p=>!p.dead))&&!g.biteResolving)return 'survivors';
 if(g.samples>=g.goal)return 'victory';
 return null;
}
function canReceiveTransfer(from,to,it){
 return !!from&&!!to&&!!it&&!to.dead&&from.id!==to.id&&from.loc===to.loc
  &&(ctx.game.mode==='local'||ctx.ownerOf(from)===ctx.ownerOf(to))
  &&!ctx.equipmentOf(to).some(eq=>ctx.kind(eq)===ctx.kind(it));
}
function crossHandIndex(g,resource){return ctx.ownerHand(g).findIndex(it=>ctx.kind(it)===resource);}
function ownerGroupHand(g,side){return side==='ai'?g.botItems:g.items;}
function colonyRoom(g,n){return ctx.alive(g).filter(p=>p.loc===0).length+g.helpless+n<=ctx.capacity[0];}
function crossOptionAllowed(card,i,side,g=ctx.game){
 const choice=card.choices[i];return !!choice&&(!choice[3]||choice[3](g,side));
}
function feedingNeed(g){
 const home=ctx.alive(g).filter(p=>p.loc===0);
 return Math.max(0,Math.ceil((home.length+g.helpless)/2)-(home.some(p=>p.skill==='cook')?1:0));
}
function crossResourceValue(g){
 // Comida guardada cuenta por cantidad; el resto de objetos, por unidad.
 return [...g.items,...g.botItems,...ctx.alive(g).flatMap(ctx.equipmentOf)].reduce((n,it)=>{
  const d=ctx.catalog.resolve(it);return n+(d?.effect==='food'?d.amount:1);
 },0);
}
function crossRank(before,after,deaths){
 const sum=(g,key)=>g.zones.reduce((n,z)=>n+z[key],0);
 const result=ctx.gameOutcome(after);
 const tie=.5*(after.food-before.food)+after.morale-before.morale+
  .5*(sum(after,'b')-sum(before,'b'))-(sum(after,'z')-sum(before,'z'))+
  .5*(ctx.crossResourceValue(after)-ctx.crossResourceValue(before))-
  .5*(sum(after,'noise')-sum(before,'noise'))-.1*(after.waste-before.waste);
 return [result==='victory'?2:result?0:1,-deaths,after.food>=ctx.feedingNeed(after)?1:0,
  before.morale<=3?after.morale-before.morale:0,after.samples-before.samples,tie];
}
function compareCrossRanks(a,b){
 for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];
 return 0;
}
function evaluateCrossOptions(card,side,g=ctx.game){
 return card.choices.flatMap((choice,index)=>{
  if(!ctx.crossOptionAllowed(card,index,side,g))return [];
  const outcomes=[],paths=[[]];
  // Reclutar es aleatorio: recorrer sus resultados posibles sin usar Math.random.
  // La carta se valora por el peor resultado inmediato, sin prometer un cocinero.
  while(paths.length){
   const path=paths.pop(),state=JSON.parse(JSON.stringify(g));let cursor=0;
   const branch={};
   const env={game:state,deaths:0,random(n){
    if(n===1)return 0;
    if(cursor===path.length){branch.count=n;throw branch;}
    return path[cursor++];
   }};
   try{
    state.crossPending=false;state.crossResolved=true;
    choice[2](state,env);ctx.verify(env);
    outcomes.push({state,deaths:env.deaths,result:ctx.gameOutcome(state),need:ctx.feedingNeed(state),fed:state.food>=ctx.feedingNeed(state),rank:ctx.crossRank(g,state,env.deaths)});
   }catch(error){
    if(error!==branch)throw error;
    for(let i=branch.count-1;i>=0;i--)paths.push([...path,i]);
   }
  }
  const rank=outcomes.reduce((worst,o)=>ctx.compareCrossRanks(o.rank,worst)<0?o.rank:worst,outcomes[0].rank);
  return [{index,rank,outcomes}];
 });
}
function chooseCrossOption(card,side,g=ctx.game){
 const options=ctx.evaluateCrossOptions(card,side,g);
 // Solo reemplazar al mejor con una mejora estricta conserva el orden del catálogo.
 return options.reduce((best,o)=>!best||ctx.compareCrossRanks(o.rank,best.rank)>0?o:best,null)?.index??null;
}
return {get equipmentOf(){return equipmentOf;},set equipmentOf(value){equipmentOf=value;},
get ownerGroup(){return ownerGroup;},set ownerGroup(value){ownerGroup=value;},
get groupLeader(){return groupLeader;},set groupLeader(value){groupLeader=value;},
get isLeader(){return isLeader;},set isLeader(value){isLeader=value;},
get canPickStartingLeader(){return canPickStartingLeader;},set canPickStartingLeader(value){canPickStartingLeader=value;},
get kind(){return kind;},
get ownerHand(){return ownerHand;},
get crossActor(){return crossActor;},
get ownerOf(){return ownerOf;},
get accessible(){return accessible;},
get openAccess(){return openAccess;},
get hasAnyAccess(){return hasAnyAccess;},
get itemTitle(){return itemTitle;},
get effectiveAttack(){return effectiveAttack;},set effectiveAttack(value){effectiveAttack=value;},
get effectiveSearch(){return effectiveSearch;},set effectiveSearch(value){effectiveSearch=value;},
get gameOutcome(){return gameOutcome;},set gameOutcome(value){gameOutcome=value;},
get canReceiveTransfer(){return canReceiveTransfer;},set canReceiveTransfer(value){canReceiveTransfer=value;},
get crossHandIndex(){return crossHandIndex;},set crossHandIndex(value){crossHandIndex=value;},
get ownerGroupHand(){return ownerGroupHand;},set ownerGroupHand(value){ownerGroupHand=value;},
get colonyRoom(){return colonyRoom;},set colonyRoom(value){colonyRoom=value;},
get crossOptionAllowed(){return crossOptionAllowed;},set crossOptionAllowed(value){crossOptionAllowed=value;},
get feedingNeed(){return feedingNeed;},set feedingNeed(value){feedingNeed=value;},
get crossResourceValue(){return crossResourceValue;},set crossResourceValue(value){crossResourceValue=value;},
get crossRank(){return crossRank;},set crossRank(value){crossRank=value;},
get compareCrossRanks(){return compareCrossRanks;},set compareCrossRanks(value){compareCrossRanks=value;},
get evaluateCrossOptions(){return evaluateCrossOptions;},set evaluateCrossOptions(value){evaluateCrossOptions=value;},
get chooseCrossOption(){return chooseCrossOption;},set chooseCrossOption(value){chooseCrossOption=value;}};
}
