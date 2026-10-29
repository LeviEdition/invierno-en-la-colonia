import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../src/application/reference-engine.mjs';

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
