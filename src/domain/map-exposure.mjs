import {rollExposureDie} from './exposure-die.mjs';
// Movimiento y combate entran por expose del único motor. La referencia V9.9
// conserva su D6; esta resolución pertenece a la variante jugable del mapa.
// «La noche» la usa en las dos construcciones, así que mapPlay es opcional.
export function resolveMapExposure(ctx,p,reason){
 if(!p||p.dead)return;
 const before={wounds:p.wounds,frost:p.frost},die=rollExposureDie(()=>ctx.Math.random());
 const result={rolled:true,value:die.face,die,effect:die.outcome,ability:null,wounds:0,frost:0,fatal:false};
 ctx.mapPlay?.event?.('exposure',{actor:p.id,name:p.name,reason,value:die.face,die});
 ctx.message('🎲 Exposición de '+p.name+' ('+reason+'): '+({none:'BLANCO',wound:'HERIDA',frost:'CONGELACIÓN',bite:'MORDEDURA'}[die.outcome])+'.');
 if(die.outcome!=='none'&&p.skill==='resilient'&&!p.skillUsed){
  p.skillUsed=true;ctx.mapPlay?.event?.('ability',{name:p.name,skill:p.skillName,effect:'Evitó la exposición.',value:die.face,die});
  ctx.message('★ '+p.name+' evitó la exposición gracias a su habilidad.');return {...result,effect:'avoided',ability:'resilient'};
 }
 if(die.outcome==='bite'){
  const victims=ctx.alive().filter(x=>x.id!==p.id&&x.loc===p.loc).sort((a,b)=>a.influence-b.influence).map(x=>x.id);
  ctx.game.biteResolving=true;ctx.pendingBite={victims,target:null};ctx.kill(p,'mordedura');ctx.biteNext();
 }else if(die.outcome==='frost'||die.outcome==='wound'){
  if(die.outcome==='frost'){delete p.frostFresh;p.frost++;}else p.wounds++;
  ctx.message((die.outcome==='frost'?'❄ Congelación de ':'♥ Herida de ')+p.name+'.');
  if(p.frost+p.wounds>=3)ctx.kill(p,'tres daños acumulados');
 }
 return {...result,wounds:p.wounds-before.wounds,frost:p.frost-before.frost,fatal:!!p.dead};
}
