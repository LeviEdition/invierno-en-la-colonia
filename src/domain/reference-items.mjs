// Reglas de referencia; solo reciben capacidades explícitas del motor.
export function createItemEngine(ctx){
class ItemEngine {
 has(p,id){return !!p&&ctx.equipmentOf(p).some(it=>ctx.catalog.resolve(it)?.id===id);}
 equipped(p,id){return ctx.equipmentOf(p).find(it=>ctx.catalog.resolve(it)?.id===id);}
 useFlashlight(p){const it=this.equipped(p,'flashlight');if(!it||it.usedRound)return false;it.usedRound=1;return true;}
 equip(p,it){const d=ctx.catalog.resolve(it);if(!p||p.dead||!d||d.effect!=='equip')return false;if(ctx.equipmentOf(p).some(x=>ctx.kind(x)===d.kind)){ctx.message('⚠ '+p.name+' ya lleva un objeto de '+d.kind+'. Transferilo antes de equipar otro.');return false;}p.equipment.push(it);ctx.message('🎒 '+p.name+' equipó '+d.name+': '+d.desc);return true;}
 attack(p,side){
  const z=ctx.game.zones[p.loc];if(!z.z)return false;
  const shotgun=this.has(p,'shotgun'),count=ctx.Math.min(z.z,shotgun?2:1);z.z-=count;
  ctx.message('⚔ '+p.name+' eliminó '+count+' zombi'+(count>1?'s':'')+' en '+ctx.places[p.loc]+(shotgun?' con escopeta':'')+'.');
  let safe=false;
  for(const id of ['pistol','rifle']){const it=this.equipped(p,id);if(it&&!it.usedRound&&(id==='pistol'||p.loc!==0)){it.usedRound=1;safe=true;ctx.message('🔫 '+ctx.catalog.resolve(it).name+': ataque sin exposición.');break;}}
  if(!safe)ctx.expose(p,'ataque '+(side==='ai'?'IA':''));
  const axe=this.equipped(p,'hatchet');if(axe&&!axe.usedRound&&p.loc===0&&ctx.openAccess(0)&&!p.dead){axe.usedRound=1;z.b++;ctx.message('🪓 '+p.name+' reforzó una barricada después del combate.');}
  return true;
 }
 moveWithFuel(p,dest,side,i){
  const hand=side==='ai'?ctx.game.botItems:ctx.game.items;
  if(!p||p.dead)return false;
  // UX: combustible no permite un segundo movimiento; informar igual que «Mover».
  if(p.moved){
   if(ctx.controls.interactive&&side===ctx.controls.side)ctx.message('⚠ El superviviente ya se movió durante este turno.');
   return false;
  }
  if(!ctx.accessible(dest)||dest===p.loc||!hand[i]||ctx.kind(hand[i])!=='combustible')return false;
  const old=p.loc;p.loc=dest;p.moved=true;hand.splice(i,1);ctx.addWaste();
  ctx.message('⛽ '+p.name+' se movió de '+ctx.places[old]+' a '+ctx.places[dest]+' sin exposición.');
  if(ctx.controls.interactive&&side===ctx.controls.side)ctx.crossAction('move',p);return true;
 }
 use(i,p,side='human'){
  const hand=side==='ai'?ctx.game.botItems:ctx.game.items,it=hand[i],d=ctx.catalog.resolve(it);if(!d)return false;
  if(d.effect==='equip'){if(!this.equip(p,it))return false;hand.splice(i,1);return true;}
  if(d.effect==='move')return this.moveWithFuel(p,ctx.target,side,i);
  if(d.effect==='heal'||d.effect==='frost'){
   if(!p||p.dead||!p.wounds&&!p.frost){ctx.message('⚠ Seleccioná a un superviviente que necesite tratamiento.');return false;}
   if(d.effect==='frost'&&!p.frost){ctx.message('⚠ Este tratamiento solo elimina congelaciones.');return false;}
   const qty=d.amount+(p.skill==='paramedic'?1:0);let healed=0;
   for(let j=0;j<qty;j++){if(d.effect==='frost'&&p.frost){p.frost--;healed++;}else if(d.effect==='heal'){if(p.wounds){p.wounds--;healed++;}else if(p.frost){p.frost--;healed++;}}}
   if(!healed)return false;ctx.message('✚ '+p.name+' recibió '+d.name+' y curó '+healed+' daño(s).');
  }else if(d.effect==='food'){ctx.game.food+=d.amount;ctx.message('🥫 '+d.name+': +'+d.amount+' comida(s) a la reserva.');}
  else if(d.effect==='sample'){const finder=ctx.all().find(x=>x.id===it.finderId);ctx.gainSample(finder||p);ctx.message('◈ Muestra entregada al objetivo.');}
  else if(d.effect==='manual'){
   if(!p||p.dead){ctx.message('⚠ Seleccioná un superviviente vivo.');return false;}
   const removed=ctx.Math.min(ctx.game.waste,2);ctx.game.waste-=removed;
   const added=ctx.openAccess(p.loc)?1:0;if(added)ctx.game.zones[p.loc].b++;
   if(!removed&&!added){ctx.message('⚠ No hay residuos ni accesos libres para aprovechar el manual.');return false;}
   ctx.message('📖 Manual: -'+removed+' residuos, +'+added+' barricada(s) en '+ctx.places[p.loc]+'.');
  }else if(d.effect==='research'){
   if(!p||p.dead){ctx.message('⚠ Seleccioná un superviviente vivo.');return false;}
   ctx.gainSample(p);ctx.message('📖 Notas de laboratorio utilizadas por '+p.name+'.');
  }else if(d.effect==='rescue'){if(!ctx.recruit(side)){return false;}}
  else return false;
  hand.splice(i,1);
  if(!['sample','rescue'].includes(d.effect))ctx.addWaste();
  return true;
 }
}
return ItemEngine;
}
