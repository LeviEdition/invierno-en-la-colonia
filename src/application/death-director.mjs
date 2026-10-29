// Reglas de referencia; solo reciben capacidades explícitas del motor.
export function createDeathDirector(ctx){
class DeathDirector {
 constructor(){this.pending=[];this.active=false;this.waiters=[];this.scheduled=false;}
 record(p,reason){this.pending.push({name:p.name,reason,loc:ctx.places[p.loc],side:ctx.ownerOf(p)});if(!this.scheduled){this.scheduled=true;ctx.queueMicrotask(()=>{this.scheduled=false;this.open();});}}
 open(){if(this.active||!this.pending.length||ctx.pendingBite)return;
  this.active=true;
  const entries=this.pending.splice(0);
  ctx.view.openDeath(entries);
  ctx.syncHandoverAccessibility();
 }
 continue(){if(!this.active)return;this.active=false;ctx.view.closeDeath();
  if(this.pending.length){this.open();return;}
  this.waiters.splice(0).forEach(resolve=>resolve());ctx.paint();ctx.view.clearDeathOpener();
 }
 wait(){return this.active||this.pending.length?new Promise(resolve=>this.waiters.push(resolve)):Promise.resolve();}
 reset(){this.pending=[];this.active=false;ctx.view.clearDeathOpener();ctx.view.closeDeath();this.waiters.splice(0).forEach(resolve=>resolve());}
}
return DeathDirector;
}
