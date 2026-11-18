import {nightAvailable} from './test-rules.mjs';
import {resolveMapExposure} from './map-exposure.mjs';
// «La noche»: al terminar la fase de colonia, cada localidad exterior con al
// menos un superviviente del grupo humano recibe una tirada del D12 de
// exposición del mapa. La recibe el de menor influencia de esa localidad;
// empate, el primero en el orden del grupo. La colonia nunca tira y el grupo de
// la IA tampoco. La mordedura entra al flujo normal de muerte y sucesión.

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
export function resolveNight(ctx){
 const game=ctx.game;
 if(!game||game.ended||!nightEnabled(game))return [];
 const watch=nightWatch(game);
 if(!watch.length)return [];
 ctx.message('☾ La noche: '+watch.length+' localidad(es) con gente afuera.');
 const rolls=[];
 for(const {loc,watcher} of watch){
  // Una mordedura pendiente detiene la noche: las demás localidades no tiran.
  if(game.ended||ctx.pendingBite)break;
  if(watcher.dead)continue;
  const result=resolveMapExposure(ctx,watcher,'la noche en '+ctx.places[loc]);
  ctx.verify();
  rolls.push({loc,id:watcher.id,effect:result?.effect??null});
 }
 return rolls;
}
