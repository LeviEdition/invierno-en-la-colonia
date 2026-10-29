// V9.9: extracción con enlaces vivos; las reglas se conservan.
export function createTurns(ctx,{Math=globalThis.Math,setTimeout=globalThis.setTimeout}={}){
function newRound(){
 if(ctx.game.ended)return;
 ctx.game.turn='human';ctx.selected=ctx.selectionBySide.human;ctx.game.crossPending=false;ctx.game.crossResolved=false;ctx.game.noReplacement=false;
 ctx.reviewLeader('human');ctx.reviewLeader('ai');
 ctx.all().forEach(p=>{p.moved=false;p.skillUsed=false;for(const eq of ctx.equipmentOf(p))if(eq&&typeof eq==='object')eq.usedRound=0;});
 const types=['comida','medicina','herramienta','combustible'];const crisisType=types[ctx.random(types.length)];
 ctx.game.crisis={type:crisisType,need:2,given:0,contributions:[],fail:['moral','zombie','food','wound'][ctx.random(4)]};
 ctx.game.dice=Array.from({length:1+ctx.game.humans.filter(p=>!p.dead).length},ctx.die);
 ctx.game.botDice=Array.from({length:1+ctx.game.bots.filter(p=>!p.dead).length},ctx.die);
 ctx.picked=0;ctx.game.crossAttempts=0;ctx.crossDraw('human');
 ctx.message('⚠ Crisis: aportar 2 '+crisisType+'.');
 ctx.applyFrost('human');ctx.replaceLastSurvivors();ctx.verify();
 if(!ctx.game.ended)ctx.crossTrigger('round',null);
 ctx.paint();
}
function applyFrost(side){
 const group=side==='human'?ctx.game.humans:ctx.game.bots;
 for(const p of [...group])if(!p.dead&&p.frost>0){p.wounds++;ctx.message('❄ '+p.name+' recibe una herida por congelación (inicio de turno).');if(p.wounds+p.frost>=3)ctx.kill(p,'heridas por congelación');}
}
async function finishTurn(){
 const turnGame=ctx.game;
 // El turno no puede avanzar hasta confirmar el pase o los fallecimientos, incluso en cola.
 if(ctx.game.ended||ctx.aiRunning||ctx.passScreenActive||ctx.deathDirector.active||ctx.deathDirector.pending.length)return;
 if(ctx.leaderChoiceReady()){ctx.show('leaderChoice');return;}
 if(ctx.pendingHeal||ctx.pendingLoot||ctx.pendingBite||ctx.pendingAttract||ctx.pendingTransfer){ctx.show(ctx.pendingHeal?'healTarget':ctx.pendingLoot?'lootChoice':ctx.pendingBite?'biteChoice':ctx.pendingAttract?'attractTarget':'transferTarget');return;}
 if(ctx.game.crossPending){ctx.show('crossroads');return;}
 ctx.hide();
 if(ctx.game.mode==='local'){
  if(ctx.game.turn==='human'){
   ctx.selectionBySide.human=ctx.selected;
   ctx.game.turn='ai';ctx.selected=ctx.selectionBySide.ai;ctx.picked=0;
   ctx.target=ctx.person()?.loc??0;
   ctx.applyFrost('ai');ctx.replaceLastSurvivors();ctx.verify();
   if(!ctx.game.ended){ctx.crossDraw('ai');ctx.crossTrigger('round',null);ctx.showPass('ai');}
   ctx.paint();return;
  }
  if(ctx.game.turn==='ai'){
   ctx.selectionBySide.ai=ctx.selected;
   ctx.aiRunning=true;
   try{
    ctx.message('⌂ Ambos jugadores terminaron. Resolviendo fase de colonia.');
    ctx.colony();
    await ctx.deathDirector.wait();if(ctx.game!==turnGame)return;
    if(!ctx.game.ended){
     ctx.game.round++;
     if(ctx.game.round>ctx.game.max){ctx.game.ended=true;ctx.game.turn='end';ctx.cancelPendingDecisions();ctx.message('☠ Derrota: se agotaron las rondas.');}
     else ctx.newRound();
    }
   }finally{
    if(ctx.game===turnGame){ctx.aiRunning=false;if(!ctx.game.ended)ctx.showPass('human');ctx.paint();}
   }
   return;
  }
 }
 ctx.aiRunning=true;ctx.skipAI=false;ctx.game.turn='ai';ctx.paint();
 try{
  await ctx.botTurn();if(ctx.game!==turnGame||ctx.game.ended)return;
  if(!ctx.game.ended){ctx.message('⌂ Resolviendo fase de colonia.');await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;ctx.colony();await ctx.pause();if(ctx.game!==turnGame||ctx.game.ended)return;}
  if(!ctx.game.ended){ctx.game.round++;if(ctx.game.round>ctx.game.max){ctx.game.ended=true;ctx.game.turn='end';ctx.cancelPendingDecisions();ctx.message('☠ Derrota: se agotaron las rondas.');}else ctx.newRound();}
 }finally{if(ctx.game===turnGame){ctx.aiRunning=false;ctx.skipAI=false;ctx.paint();}}
}
return {get newRound(){return newRound;},set newRound(value){newRound=value;},
get applyFrost(){return applyFrost;},set applyFrost(value){applyFrost=value;},
get finishTurn(){return finishTurn;},set finishTurn(value){finishTurn=value;}};
}
