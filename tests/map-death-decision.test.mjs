import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {createPlayBroker} from '../prototypes/play-map/broker.mjs';import {projectVisibleState} from '../prototypes/state-map/projection.mjs';
import {createCycleController,cycleOwnedDecision,decisionLabel} from '../prototypes/cycle-map/controller.mjs';
import {actionSummary,actionNotice} from '../prototypes/action-map/action-presentation.mjs';
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
// Exposición fija en 1 (mordedura). El motor y sus decisiones son los reales.
function make(){let calls=0;const math=Object.create(Math);math.random=()=>{calls++;return 0;};const e=createEngine({Math:math,queueMicrotask:f=>queueMicrotask(f),setTimeout:f=>{f();return 0;}});e.start('local');const c=e.testBindings;c.game.crossResolved=true;c.game.crossPending=false;c.game.dice=[6,6];for(const z of c.game.zones)z.z=0;c.game.zones[2].z=2;return {e,c,calls:()=>calls};}
function wire(t){const read=()=>projectVisibleState(t.c,{renderedPlayable:true,epoch:1}),b=createPlayBroker(t.e,{session:'test',readPublic:read});const state=()=>b.project(read());state();return {b,state};}
function attack(t,{b,state},actorId){const s=state(),q=t.e.actionOptions(actorId,'attack'),die=q.dice.find(d=>d.allowed);return b.handle({type:'attack',requestId:'attack_1',session:s.action.session,revision:s.action.revision,actorId,target:q.origin,dieIndex:die.index,dieValue:die.value});}
async function deadlyAttack(actor='h0',company=[]){const t=make();for(const h of t.c.game.humans)h.loc=[actor,...company].includes(h.id)?2:0;const w=wire(t);const r=attack(t,w,actor);assert.equal(r.ok,true);await flush();return {t,w,s:w.state()};}
test('Muerte del atacante: la decisión llega al ciclo y el resultado de la acción no la tapa',async()=>{
 const {t,w,s}=await deadlyAttack('h2');/* Iris no es líder: solo hay un fallecimiento que confirmar */
 assert.equal(s.action.operation.generalDecision,true);assert.equal(s.play.decision,null);assert.equal(s.play.managed,false);
 assert.equal(s.cycle.decision.kind,'death');assert.equal(s.cycle.decision.ready,true);assert.deepEqual(s.cycle.decision.entries.map(e=>e.name),['Iris']);assert.equal(cycleOwnedDecision(s.cycle.decision),true);
 assert.equal(decisionLabel(s),'Ver qué pasó');assert.equal(s.cycle.finish.allowed,false);
 // Antes de la corrección el ciclo no se mostraba porque la acción delegada lo dejaba sin gestionar.
 const sent=[],ctrl=createCycleController({send:r=>sent.push(r),requestId:()=> 'death_once'});ctrl.update(s);assert.equal(ctrl.inspect().phase,'closed');
 const before=t.e.snapshot(),rng=t.calls();assert.equal(ctrl.attend(),true);ctrl.update(w.state());assert.equal(ctrl.inspect().phase,'showing','decisión visible');assert.deepEqual(t.e.snapshot(),before,'mostrar no cambia la partida');
 assert.equal(ctrl.resolve('death'),true);assert.equal(ctrl.resolve('death'),false,'doble confirmación ignorada');assert.equal(sent.length,1);assert.equal(sent[0].type,'cycle-death');
 const answer=w.b.handle(sent[0]);assert.equal(answer.ok,true);w.b.handle(sent[0]);/* un reintento no vuelve a ejecutar: se comprueba abajo con muertes y azar */ctrl.result(answer);await flush();const after=w.state();ctrl.update(after);
 assert.equal(t.calls(),rng,'confirmar no consume azar');assert.equal(after.cycle.decision,null);assert.equal(ctrl.inspect().phase,'closed');assert.equal(ctrl.inspect().attending,false);
 assert.equal(after.action.operation.generalDecision,false,'el resultado vuelve a poder cerrarse');assert.equal(after.cycle.finish.allowed,true,'terminar turno disponible');
 assert.equal(t.c.game.humans.filter(h=>h.dead).length,1);
});
test('Muerte del líder: tras confirmar, la sucesión sigue en el mismo panel y la partida continúa',async()=>{
 const {t,w,s}=await deadlyAttack('h0');/* Mara es la líder inicial del motor */const sent=[];let n=0;const ctrl=createCycleController({send:r=>sent.push(r),requestId:()=> 'req_'+(++n)});ctrl.update(s);ctrl.attend();
 ctrl.resolve('death');let answer=w.b.handle(sent.at(-1));ctrl.result(answer);await flush();let next=w.state();ctrl.update(next);
 assert.equal(next.cycle.decision.kind,'leaderChoice');assert.equal(ctrl.inspect().phase,'showing','la sucesión conserva la atención');assert.equal(decisionLabel(next),'Resolver decisión');
 ctrl.resolve('leader','h2');answer=w.b.handle(sent.at(-1));assert.equal(answer.ok,true);ctrl.result(answer);await flush();next=w.state();ctrl.update(next);
 assert.equal(t.c.game.leaders.human,'h2');assert.equal(next.cycle.decision,null);assert.equal(ctrl.inspect().phase,'closed');assert.equal(next.cycle.finish.allowed,true);
});
test('Contagio: la mordedura queda en el panel de juego y, al cerrarlo, el fallecimiento pasa al ciclo',async()=>{
 const {t,w,s}=await deadlyAttack('h0',['h2']);assert.equal(s.play.decision.kind,'bite');assert.equal(s.play.managed,true);assert.equal(decisionLabel(s),'Resolver decisión');
 const sent=[];let n=0;const ctrl=createCycleController({send:r=>sent.push(r),requestId:()=> 'req_'+(++n)});ctrl.update(s);ctrl.attend();assert.equal(ctrl.inspect().phase,'closed','la mordedura no es del ciclo');assert.equal(ctrl.inspect().attending,true);
 const bite=w.b.handle({type:'play-command',kind:'bite',option:'sacrifice',session:s.play.session,revision:s.play.revision,requestId:'bite_1'});assert.equal(bite.ok,true);await flush();let next=w.state();ctrl.update(next);
 assert.equal(next.play.receipt.type,'bite');assert.equal(next.cycle.decision.kind,'death');assert.deepEqual(next.cycle.decision.entries.map(e=>e.name),['Mara','Iris']);
 const ack=w.b.handle({type:'play-command',kind:'ack',receiptId:next.play.receipt.id,session:next.play.session,revision:next.play.revision,requestId:'ack_1'});assert.equal(ack.ok,true);next=w.state();ctrl.update(next);
 assert.equal(next.play.managed,false);assert.equal(ctrl.inspect().phase,'showing','la cadena sigue en el ciclo');assert.equal(decisionLabel(next),'Ver qué pasó');
});
test('Textos: el resultado mortal se lee como una frase y no promete una elección',()=>{
 const base={name:'Mara',kind:'attack',target:2,resolution:{killed:1,exposure:{effect:'bite',rolled:true,value:1},actorAfter:{dead:true},zoneBefore:{b:0},zoneAfter:{b:0}}},locations=[{engineIndex:2,name:'Hospital'}];
 assert.equal(actionSummary(base),'Mara eliminó 1 zombi, pero murió por la mordedura.');
 assert.equal(actionNotice(base,locations),'Mara eliminó 1 zombi en el Hospital, pero murió por la mordedura.');
 const worn={...base,resolution:{...base.resolution,killed:2,exposure:{effect:'wound',rolled:true,value:3}}};assert.equal(actionSummary(worn),'Mara eliminó 2 zombis, pero murió por el daño acumulado.');
 const alive={...base,resolution:{...base.resolution,exposure:{effect:'frost',rolled:true,value:2},actorAfter:{dead:false}}};assert.equal(actionSummary(alive),'Mara eliminó 1 zombi. ❄ Congelación');assert.equal(actionNotice(alive,locations),'Mara eliminó 1 zombi en el Hospital y sufrió congelación.');
 assert.equal(decisionLabel({cycle:{outcome:{reason:'time'}}}),'Ver resultado final');
});
