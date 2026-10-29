import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../src/application/reference-engine.mjs';
import {createReferenceState} from '../src/domain/reference-state.mjs';

test('Integración B1: reflexión sobre controles no permite obtener el grupo mutable',()=>{
 const engine=createEngine();let view;engine.connectPresentation(context=>{view=context;return {};});engine.start('local');
 const before=engine.snapshot();
 assert.throws(()=>{Object.getPrototypeOf(view.controls).group.call(view.controls)[0].wounds=2;},TypeError);
 assert.deepEqual(engine.snapshot(),before);
 assert.throws(()=>{Object.getOwnPropertyDescriptor(view.controls,'group').value()[0].wounds=2;},TypeError);
 assert.equal(view.controls.group()[0],view.person(),'identidad de consultas conservada');
 assert.equal(view.controls.hand().length,7);assert.equal(view.controls.dice().length,4);assert.equal(view.controls.display(),'Jugador 1');
 engine.dispatch('contribute',0);assert.equal(view.controls.hand().length,engine.snapshot().items.length,'vista viva, no snapshot obsoleto');
});

test('Integración B2: la vista no puede reclutar ejecutando callbacks del catálogo',()=>{
 const engine=createEngine();let view;engine.connectPresentation(context=>{view=context;return {};});engine.start('local');const before=engine.snapshot();
 assert.throws(()=>view.crossroadsDeck.find(card=>card.title==='El rescate de la plaza').choices[0][2](view.game),TypeError);
 assert.deepEqual(engine.snapshot(),before);
 assert.equal('crossroadsDeck' in view,false);assert.equal('crossOptionAllowed' in view,false);
});
test('Integración B2: presentación recibe textos y elegibilidad real, sin efectos ni RNG',()=>{
 let state,view,draws=0;const math=Object.create(Math);math.random=()=>{draws++;return .45;};
 const engine=createEngine({Math:math,stateFactory:args=>(state=createReferenceState(args))});engine.connectPresentation(context=>{view=context;return {};});engine.start('local');
 state.crossCard=0;state.crossOwner='human';state.crossPending=true;state.food=1;
 const before=engine.snapshot(),randomBefore=draws,data=view.crossroadsView();
 assert.equal(data.card.title,'Golpes en la puerta');assert.deepEqual(data.allowed,[true,false]);
 assert.ok(data.count>=20);assert.equal(data.card.choices.length,2);assert.ok(data.card.choices.every(choice=>choice.length===2&&choice.every(value=>typeof value==='string')));
 assert.deepEqual(engine.snapshot(),before);assert.equal(draws,randomBefore);
 data.card.choices[0][0]='Texto modificado en la vista';assert.notEqual(view.crossroadsView().card.choices[0][0],data.card.choices[0][0]);
 state.food=3;assert.deepEqual(view.crossroadsView().allowed,[true,true]);assert.equal(draws,randomBefore,'consultas no consumen azar');
});
