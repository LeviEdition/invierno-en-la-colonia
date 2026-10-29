// Reglas de referencia; solo reciben capacidades explícitas del motor.
export function createCrisisManager(ctx){
class CrisisManager {
 static canContribute(item){return !!item&&ctx.kind(item)===ctx.game.crisis.type&&ctx.game.crisis.contributions.length<ctx.game.crisis.need+2;}
 static add(item,source){
  if(!this.canContribute(item)){ctx.message('⚠ Solo se aceptan objetos del tipo '+ctx.game.crisis.type+'; máximo '+(ctx.game.crisis.need+2)+' cartas.');return false;}
  ctx.game.crisis.contributions.push(ctx.kind(item));ctx.game.crisis.given=ctx.game.crisis.contributions.length;
  ctx.message('📦 '+source+' aportó '+ctx.itemTitle(item)+' a la crisis ('+ctx.game.crisis.given+'/'+ctx.game.crisis.need+').');return true;
 }
 static fromHand(index){
  const current=ctx.currentHand(),it=current[index];if(!this.add(it,ctx.controls.display()))return false;
  current.splice(index,1);ctx.paint();return true;
 }
 static fromEquipment(id,index){
  const p=ctx.all().find(x=>x.id===id);
  if(!p||p.dead||ctx.ownerOf(p)!==ctx.controls.side||p.equipment[index]===undefined)return false;
  if(!this.add(p.equipment[index],p.name))return false;
  p.equipment.splice(index,1);ctx.paint();return true;
 }
}
return CrisisManager;
}
