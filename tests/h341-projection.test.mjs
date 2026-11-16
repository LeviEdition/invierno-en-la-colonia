import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../src/application/reference-engine.mjs';
import {projectVisibleState} from '../prototypes/state-map/projection.mjs';
function real(){let calls=0;const math=Object.create(Math);math.random=()=>{calls++;return .37;};const engine=createEngine({Math:math,queueMicrotask(){}});let context;engine.connectPresentation(c=>{context=c;return {};});engine.start('local');return {engine,context,rng:()=>calls};}
test('H3.4.1 proyección: datos reales, IDs y cantidades sin invocar consultas con efectos',()=>{
 const t=real(),before=t.engine.snapshot(),rng=t.rng(),context=new Proxy(t.context,{get(target,key){if(['playable','canPickStartingLeader','show','finishTurn'].includes(key))throw Error('Consulta no permitida: '+key);return Reflect.get(target,key);}});
 const p=projectVisibleState(context,{gate:{},renderedPlayable:true,epoch:2});assert.equal(p.epoch,2);assert.equal(p.round,before.round);assert.equal(p.food,before.food);assert.equal(p.morale,before.morale);assert.equal(p.characters.length,6);assert.equal(p.locations[0].survivors,6);assert.equal(p.locations[0].zombies,3);assert.equal(p.locations[4].capacity,4);assert.equal(p.characters.find(c=>c.id==='h1').name,'Leo');assert.equal(p.characters.find(c=>c.id==='a0').playerId,'ai');assert.deepEqual(p.dice.available,before.dice);assert.equal(p.dice.ownerId,'human');assert.equal(p.dice.used,null);assert.equal(p.players[0].initialLeaderConfirmed,before.leaderChosen);assert.deepEqual(t.engine.snapshot(),before);assert.equal(t.rng(),rng);
});
test('H3.4.1 proyección: sin manos, mazos, cartas futuras ni datos ocultos durante pase',()=>{
 const {context}=real();const p=projectVisibleState(context,{gate:{},renderedPlayable:false});assert.equal(p.dice.available,null);for(const key of ['items','botItems','decks','crossCard','crossRemaining','contributions'])assert.ok(!JSON.stringify(p).includes('"'+key+'"'),key);
 for(const gate of [{setup:true},{pass:true},{death:true},{modal:true}]){const hidden=projectVisibleState(context,{gate,renderedPlayable:true});assert.ok(hidden.blocked);assert.deepEqual(hidden.characters,[]);assert.deepEqual(hidden.locations,[]);assert.equal(hidden.objective,null);assert.equal(hidden.dice.available,null);assert.deepEqual(hidden.log,[]);}
});
test('H3.4.1 proyección: los datos entregados no comparten referencias mutables con el motor',()=>{
 const {engine,context}=real(),before=engine.snapshot();const p=projectVisibleState(context,{gate:{},renderedPlayable:true});assert.throws(()=>p.characters[0].name='Otro',TypeError);assert.throws(()=>p.locations.pop(),TypeError);assert.deepEqual(engine.snapshot(),before);
});
