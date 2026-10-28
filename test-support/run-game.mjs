import {fixture,engineMetadata} from './game-fixture.mjs';
import {controllerSource} from './autoplay-controller.mjs';
export async function runGame({mode,seed,maxSteps=2500}){
 const t=fixture({mode,seed,natural:true});t.run(controllerSource);
 const record={mode,seed,source:engineMetadata,strategy:t.state('testController.strategy'),category:'motor real, DOM mínimo, decisiones iniciales intactas, azar LCG reproducible',initial:t.state('({objective:game.objective,food:game.food,morale:game.morale,goal:game.goal,max:game.max,leaders:game.leaders})'),trace:[],invariants:[],exceptions:[]};
 let task=null,done=false,exception=null,idle=0;
 try{
  for(let step=0;step<maxSteps;step++){
   await Promise.resolve();
   if(exception)throw exception;
   const violations=t.state('testController.invariant()');if(violations.length){record.invariants.push(...violations);break;}
   const command=t.run('testController.decision()');
   if(command){record.trace.push({step,command,...t.state('({round:game.round,side:game.turn,morale:game.morale,food:game.food,samples:game.samples})')});idle=0;continue;}
   if(task){if(done){task=null;done=false;}else{if(++idle>250)throw Error('resolución asíncrona sin progreso');continue;}}
   if(t.state('game.ended')){record.completed=true;break;}
   const action=t.run('testController.normal()');
   if(!action){if(++idle>10)throw Error('controlador sin acción ni decisión');continue;}
   idle=0;
   record.trace.push({step,command:action,...t.state('({round:game.round,side:game.turn,morale:game.morale,food:game.food,samples:game.samples})')});
   if(action==='terminar-turno'){
    task=t.run('finishTurn()');task.then(()=>done=true,error=>{exception=error;done=true;});
   }
  }
 }catch(error){record.exceptions.push(error.stack||String(error));}
 record.completed=!!record.completed;
 record.final=t.state('({round:game.round,max:game.max,ended:game.ended,result:gameOutcome(game)||(game.round>game.max?"time":null),morale:game.morale,food:game.food,samples:game.samples,goal:game.goal,pending:{bite:!!pendingBite,loot:!!pendingLoot,heal:!!pendingHeal,transfer:!!pendingTransfer,attract:!!pendingAttract,cross:game.crossPending,recruitInfo:!!pendingRecruitInfo,leaders:pendingLeaderSides,death:deathDirector.active||deathDirector.pending.length>0,pass:passScreenActive,aiRunning},opened})');
 record.roundsPlayed=Math.min(record.final.round,record.final.max);
 record.interruption=record.completed?null:{classification:'requiere investigar: juego o controlador',reason:record.exceptions.length?'exception':record.invariants.length?'invariant':'maxSteps',maxSteps};
 record.events=t.state('gameAudit');
 return record;
}
