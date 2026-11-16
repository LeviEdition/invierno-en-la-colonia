import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../src/application/reference-engine.mjs';
function session(value=.5,options={}){let calls=0;const math=Object.create(Math);math.random=()=>{calls++;return value;};const engine=createEngine({Math:math,queueMicrotask(){},...options});engine.start('local');return {engine,calls:()=>calls};}
const intent=(engine,id='h0',destination=2)=>({...engine.movementOptions(id),actorId:id,destination});
test('H342: consulta pura y movimiento por ID equivalentes a V9.9, sin depender de la selección',()=>{
 for(const random of [.8,.2,.34,0]){const a=session(random),b=session(random),before=a.engine.snapshot(),calls=a.calls(),request=intent(a.engine);assert.deepEqual(a.engine.snapshot(),before);assert.equal(a.calls(),calls);a.engine.dispatch('select',2);assert.equal(a.engine.moveById(request).ok,true);b.engine.dispatch('destination',2);b.engine.dispatch('doMove');assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());assert.equal(a.calls(),b.calls());}
});
test('H342: rechazos puros por propiedad, movimiento repetido, destino y contexto obsoleto',()=>{
 const t=session(),e=t.engine;for(const [id,destination]of [['a0',2],['h0',0],['h0',-1],['h0',99],['missing',2]]){const before=e.snapshot(),calls=t.calls();assert.equal(e.moveById(intent(e,id,destination)).ok,false);assert.deepEqual(e.snapshot(),before);assert.equal(t.calls(),calls);}
 const request=intent(e);e.start('local');const before=e.snapshot();assert.equal(e.moveById(request).reason,'stale');assert.deepEqual(e.snapshot(),before);assert.equal(e.moveById(intent(e)).ok,true);e.dispatch('crossChoose',0);e.dispatch('hide');const moved=e.snapshot();assert.equal(e.moveById(intent(e)).reason,'already-moved');assert.deepEqual(e.snapshot(),moved);
});
test('H342: capacidad real, personaje muerto y decisiones pendientes son autoridad del motor',()=>{
 const {engine:e}=session();for(const i of [0,1,2]){e.dispatch('select',i);e.dispatch('destination',2);e.dispatch('doMove');} // Tres ocupantes, cupo real4.
 assert.equal(e.snapshot().zones[2].name,'Hospital');
 const t=session();t.engine.dispatch('show','group');const before=t.engine.snapshot();assert.equal(t.engine.movementOptions('h0').reason,'decision');assert.equal(t.engine.moveById(intent(t.engine)).ok,false);assert.deepEqual(t.engine.snapshot(),before);
 const d=session(0);assert.equal(d.engine.moveById(intent(d.engine)).ok,true);assert.equal(d.engine.snapshot().humans[0].dead,true);assert.equal(d.engine.movementOptions('h0').allowed,false);
});

test('H342: capacidad4 real en gasolinera y rechazo al llenarse, incluso si el dibujo tiene2',async()=>{
 const {createReferenceState}=await import('../src/domain/reference-state.mjs');
 for(const count of [3,4]){const t=session(.8,{stateFactory:args=>{const g=createReferenceState(args);for(const p of [...g.humans.slice(1),...g.bots].slice(0,count))p.loc=4;return g;}}),request=intent(t.engine,'h0',4),before=t.engine.snapshot();assert.equal(t.engine.movementOptions('h0').destinations.includes(4),count===3);const r=t.engine.moveById(request);assert.equal(r.ok,count===3);if(count===4)assert.deepEqual(t.engine.snapshot(),before);}
});
test('H342: turno cambiado y muerto confirmado rechazan sin mutación',async()=>{
 const {createReferenceState}=await import('../src/domain/reference-state.mjs');const t=session(.8),r=intent(t.engine);await t.engine.dispatch('finishTurn');t.engine.dispatch('confirmPass');const before=t.engine.snapshot();assert.equal(t.engine.moveById(r).reason,'stale');assert.deepEqual(t.engine.snapshot(),before);
 const d=session(.8,{stateFactory:args=>{const g=createReferenceState(args);g.humans[0].dead=true;g.leaders.human='h1';g.leaderChosen=true;return g;}});const start=d.engine.snapshot();assert.equal(d.engine.movementOptions('h0').reason,'dead');assert.equal(d.engine.moveById(intent(d.engine)).ok,false);assert.deepEqual(d.engine.snapshot(),start);
});
