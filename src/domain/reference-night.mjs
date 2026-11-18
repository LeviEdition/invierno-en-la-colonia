import {nightAvailable} from './test-rules.mjs';
import {resolveMapExposure} from './map-exposure.mjs';
// «La noche»: al terminar la fase de colonia, cada localidad exterior con al
// menos un superviviente del grupo humano recibe una tirada del D12 de
// exposición del mapa. La recibe el de menor influencia de esa localidad;
// empate, el primero en el orden del grupo. La colonia nunca tira y el grupo de
// la IA tampoco. La mordedura entra al flujo normal de muerte y sucesión.
//
// Una mordedura pendiente PAUSA la noche, no la corta: las localidades que
// faltan quedan anotadas en game.nightRemaining y siguen al resolver la
// decisión, en el mismo orden. La ronda siguiente no abre hasta terminarlas.

// Quién duerme a la intemperie en una localidad: el de menor influencia.
// El empate lo resuelve el orden del grupo porque filter lo conserva.
export function nightWatcher(group,loc){
 const present=group.filter(p=>!p.dead&&p.loc===loc);
 if(!present.length)return null;
 const lowest=Math.min(...present.map(p=>p.influence));
 return present.find(p=>p.influence===lowest)||null;
}
// Localidades exteriores ocupadas, en orden de localidad, con su centinela.
export function nightWatch(game){
 if(!game)return [];
 const occupied=[...new Set(game.humans.filter(p=>!p.dead&&p.loc!==0).map(p=>p.loc))].sort((a,b)=>a-b);
 return occupied.map(loc=>({loc,watcher:nightWatcher(game.humans,loc)})).filter(entry=>entry.watcher);
}
// Quiénes quedan afuera esta noche, para los avisos de la ficha.
export const sleepingOutside=game=>game?game.humans.filter(p=>!p.dead&&p.loc!==0):[];
export const nightEnabled=game=>!!game?.testRules?.laNoche&&nightAvailable(game.mode);
export const nightUnfinished=game=>!!game&&Array.isArray(game.nightRemaining)&&game.nightRemaining.length>0;

// Anota las localidades de la noche y tira las que pueda sin decisiones abiertas.
export function beginNight(ctx){
 const game=ctx.game;
 if(!game||game.ended||!nightEnabled(game))return [];
 const watch=nightWatch(game);
 game.nightRemaining=watch.map(entry=>entry.loc);
 if(!watch.length)return [];
 ctx.message('☾ La noche: '+watch.length+' localidad(es) con gente afuera.');
 return continueNight(ctx);
}
// Sigue por las localidades que faltan. Se detiene en cuanto hay una mordedura
// pendiente y se puede volver a llamar cuando se resuelva.
export function continueNight(ctx){
 const game=ctx.game,rolls=[];
 if(!game)return rolls;
 while(nightUnfinished(game)){
  if(game.ended){game.nightRemaining=[];break;}
  if(ctx.pendingBite)break;
  const loc=game.nightRemaining.shift();
  // El centinela se decide al tirar: alguien pudo morir en una tirada anterior.
  const watcher=nightWatcher(game.humans,loc);
  if(!watcher)continue;
  ctx.mapCycle?.before('night',{actorId:watcher.id,name:watcher.name,location:loc});
  const result=resolveMapExposure(ctx,watcher,'la noche en '+ctx.places[loc]);
  ctx.verify();
  ctx.mapCycle?.annotate({exposure:result});
  ctx.mapCycle?.after();
  rolls.push({loc,id:watcher.id,effect:result?.effect??null});
 }
 return rolls;
}
