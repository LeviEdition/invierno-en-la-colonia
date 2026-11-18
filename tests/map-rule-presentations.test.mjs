import test from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {projectVisibleState} from '../app/mapa/estado/projection.mjs';
import {createPlayBroker} from '../app/mapa/juego/broker.mjs';
import {createEventPresentations} from '../app/mapa/experiencia/event-presentations.mjs';
import {createPresentationSequence,sequenceDurations} from '../app/mapa/movimiento/presentation-sequence.mjs';
import {createPlayController} from '../app/mapa/juego/controller.mjs';
import {createCycleController} from '../app/mapa/ciclo/controller.mjs';

const tick=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function setup(){
 let calls=0,value=.8;
 const e=createEngine({queueMicrotask(){},setTimeout:f=>{f();return 0;},Math:Object.assign(Object.create(Math),{random:()=>{calls++;return value;}})});
 e.initialize();
 for(const rule of ['laNoche','regreso'])e.playExecute({kind:'test-rules',rule,value:'true'});
 e.playExecute({kind:'start',mode:'solo',confirmed:false});
 const c=e.testBindings,g=c.game;
 g.crossResolved=true;g.crossPending=false;g.crossRemaining=Array(32).fill(0);g.food=40;g.waste=0;
 g.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);g.crisis.given=g.crisis.need;
 g.humans.forEach(p=>{p.loc=0;p.wounds=0;p.frost=0;p.skill='';});
 const read=()=>projectVisibleState(c,{renderedPlayable:true,epoch:1}),b=createPlayBroker(e,{session:'rules',readPublic:read});
 b.project(read());e.subscribeCycle(change=>b.capturePresentation(change));
 let serial=0;
 const request=(type,extra={})=>({type,session:'rules',revision:b.snapshot().play.revision,requestId:'request_'+(++serial),...extra});
 return {e,c,g,b,read,request,calls:()=>calls,roll:v=>{value=v;}};
}
function queue(){
 const started=[],callbacks=[],q=createEventPresentations({start:(f,done)=>{started.push(f);callbacks.push(done);}});
 return {q,started,callbacks};
}

test('presentación de Regresar: evento move, reloj compartido y una sola ejecución sin azar',()=>{
 const t=setup(),p=t.g.humans[0];p.loc=2;t.g.dice=[1];
 const d=t.e.playSnapshot().options[p.id]['return-home'].dice[0];
 const r=t.request('play-command',{kind:'return-home',actorId:p.id,dieId:d.id,dieIndex:d.index,dieValue:d.value});
 const calls=t.calls(),before=t.e.snapshot(),a=t.b.handle(r),frame=a.state.play.presentation;
 assert.equal(a.ok,true);assert.equal(t.calls(),calls);assert.equal(t.g.dice.length,0);assert.equal(p.loc,0);
 const move=t.e.playSnapshot().events.find(e=>e.id===frame.id);
 assert.deepEqual([move.type,move.actor,move.from,move.destination],['move',p.id,2,0]);
 const normal=setup(),normalResult=normal.e.moveById({...normal.e.movementOptions('h0'),destination:2});
 assert.equal(normalResult.ok,true);assert.equal(normal.e.playSnapshot().events.find(e=>e.type==='move').type,move.type);
 assert.deepEqual(frame.resolution.exposure,move.exposure);
 assert.equal(frame.before.characters.find(c=>c.id===p.id).locationId,'place-2');
 assert.equal(frame.presentation.characters.find(c=>c.id===p.id).locationId,'place-0');
 const clock=createPresentationSequence(frame);clock.advance(sequenceDurations.travel-1);
 const normalClock=createPresentationSequence(normalResult);normalClock.advance(sequenceDurations.travel-1);
 assert.deepEqual(clock.inspect().stage,normalClock.inspect().stage);
 assert.equal(clock.inspect().stage,'travel');clock.advance(1);assert.equal(clock.inspect().stage,'reveal');
 assert.equal(clock.inspect().exposure.rolled,false);
 const accepted=t.e.snapshot();assert.notDeepEqual(accepted,before);
 clock.advance(10000);assert.deepEqual(t.b.handle(r),a);assert.deepEqual(t.e.snapshot(),accepted);assert.equal(t.calls(),calls);
});

test('presentación nocturna: una cara y dos instantáneas por localidad, en el orden del motor',async()=>{
 const t=setup();t.g.humans[0].loc=5;t.g.humans[1].loc=2;t.roll(.3);
 const before=t.b.snapshot(),{q,started,callbacks}=queue();q.update(before);
 assert.equal(t.b.handle(t.request('cycle-finish')).ok,true);await tick();
 const after=t.b.snapshot(),frames=after.cycle.presentations,events=after.play.events.filter(e=>e.type==='exposure');
 assert.equal(frames.length,2);assert.equal(events.length,2);
 assert.deepEqual(frames.map(f=>f.origin),[2,5]);
 assert.deepEqual(frames.map(f=>f.actorId),[t.g.humans[1].id,t.g.humans[0].id]);
 assert.deepEqual(frames.map(f=>f.resolution.exposure.die),events.map(e=>e.die));
 assert.ok(frames[0].order<frames[1].order);
 for(const f of frames){
  assert.equal(f.before.characters.find(c=>c.id===f.actorId).wounds,0);
  assert.equal(f.presentation.characters.find(c=>c.id===f.actorId).wounds,1);
  for(const key of ['items','botItems','decks','crossCard'])assert.equal(JSON.stringify(f).includes('"'+key+'"'),false);
  assert.equal(f.before.dice.available,null);
 }
 const accepted=t.e.snapshot(),calls=t.calls();
 assert.equal(q.update(after),true);assert.equal(started.length,1);
 q.update(after);assert.equal(started.length,1,'la consulta repetida no vuelve a animar');
 const play=createPlayController({send:()=>assert.fail('no debe mandar acciones'),isPresenting:q.busy});play.update(after);
 const cycle=createCycleController({send:()=>assert.fail('no debe mandar cierres'),isPresenting:q.busy});cycle.update(before);
 assert.equal(play.submit('return-home'),false);assert.equal(cycle.begin(),false);assert.equal(cycle.resolve('death'),false);
 callbacks[0]();assert.equal(started.length,2);assert.equal(q.busy(),true);
 const clock=createPresentationSequence(started[1],{introDuration:0});clock.advance(10000);callbacks[1]();
 assert.equal(q.busy(),false);assert.equal(q.update(after),false);assert.equal(started.length,2);
 assert.deepEqual(t.e.snapshot(),accepted);assert.equal(t.calls(),calls);
});

for(const [face,effect]of [[7,'none'],[2,'frost']])test('presentación nocturna: conserva la cara '+effect+' aunque la ronda siguiente ya esté resuelta',async()=>{
 const t=setup();t.g.humans[0].loc=2;t.roll((face-.5)/12);
 const {q,started}=queue();q.update(t.b.snapshot());t.b.handle(t.request('cycle-finish'));await tick();
 const state=t.b.snapshot(),f=state.cycle.presentations[0],after=f.presentation.characters.find(p=>p.id==='h0');
 assert.equal(f.resolution.exposure.die.face,face);assert.equal(f.resolution.exposure.effect,effect);
 assert.equal(after.wounds,0);assert.equal(after.frost,effect==='frost'?1:0);
 assert.equal(q.update(state),true);assert.equal(started.length,1,'también se anima Sin efecto');
});

test('presentación nocturna: la mordedura pausa la cola y la siguiente localidad conserva su tirada',async()=>{
 const t=setup(),[a,b,c]=t.g.humans;
 a.loc=b.loc=2;c.loc=5;a.influence=40;b.influence=70;t.roll(.01);
 const {q,started,callbacks}=queue();q.update(t.b.snapshot());
 t.b.handle(t.request('cycle-finish'));await tick();
 const paused=t.b.snapshot();assert.equal(paused.play.decision.kind,'bite');assert.equal(paused.cycle.presentations.length,1);
 const f=paused.cycle.presentations[0];assert.equal(f.resolution.exposure.die.outcome,'bite');
 assert.ok(f.before.characters.some(p=>p.id===a.id));assert.equal(f.presentation.characters.some(p=>p.id===a.id),false);
 q.update(paused);assert.equal(q.busy(),true);callbacks[0]();assert.equal(q.busy(),false);
 t.roll(.3);const calls=t.calls(),r=t.request('play-command',{kind:'bite',option:'sacrifice'});
 assert.equal(t.b.handle(r).ok,true);await tick();
 const resumed=t.b.snapshot();assert.equal(resumed.cycle.presentations.length,2);
 q.update(resumed);assert.equal(started.length,2);assert.equal(started[1].origin,5);
 assert.equal(started[1].resolution.exposure.die.outcome,'wound');assert.equal(c.wounds,1);assert.equal(t.calls()-calls,1);
 callbacks[1]();const accepted=t.e.snapshot(),rng=t.calls();
 assert.equal(t.b.handle(r).ok,true);q.update(t.b.snapshot());assert.equal(started.length,2);
 assert.deepEqual(t.e.snapshot(),accepted);assert.equal(t.calls(),rng);
 t.c.deathContinue();await tick();
});

test('recuperación visual: no repite la historia ni callbacks interrumpidos',()=>{
 const frame=id=>({id,order:Number(id),kind:'exposure'}),state=frames=>({epoch:1,movement:{session:'same'},play:{generation:1},cycle:{presentations:frames}});
 const {q,started,callbacks}=queue();q.update(state([frame('1')]));assert.equal(started.length,0);
 q.update(state([frame('1'),frame('2')]));assert.equal(started.length,1);
 q.interrupt();q.update(state([frame('1'),frame('2')]));assert.equal(started.length,1);
 q.update(state([frame('1'),frame('2'),frame('3')]));assert.equal(started.length,2);
 callbacks[0]();assert.equal(q.busy(),true,'un callback viejo no termina la animación nueva');callbacks[1]();assert.equal(q.busy(),false);
});
