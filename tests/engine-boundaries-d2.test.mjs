import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../src/application/reference-engine.mjs';

test('D2: dos motores sin DOM conservan estados y RNG independientes',()=>{
 const make=()=>createEngine({Math:{...Math,random:()=>.25,floor:Math.floor,ceil:Math.ceil,max:Math.max,min:Math.min},queueMicrotask(){}});
 const a=make(),b=make();a.start('local');b.start('local');
 assert.deepEqual(a.snapshot(),b.snapshot());
 const copy=a.snapshot();copy.food=-99;copy.humans[0].dead=true;
 assert.equal(a.snapshot().food,6);assert.equal(a.snapshot().humans[0].dead,false);
 a.dispatch('contribute',0);assert.equal(b.snapshot().items.length,7);
 assert.throws(()=>a.dispatch('destruirPartida'),/Comando desconocido/);
 assert.equal('testBindings' in a,false,'no exponer el adaptador de pruebas en el motor normal');
});
test('D2: iniciar IA sin cliente explícito es un error de composición, sin alterar la partida',()=>{
 const engine=createEngine();engine.start('local');const before=engine.snapshot();
 assert.throws(()=>engine.start('ai'),/automatismo/);assert.deepEqual(engine.snapshot(),before);
});
test('D2: la presentación observa estado vivo pero no puede modificarlo',()=>{
 const engine=createEngine({queueMicrotask(){}});let view;
 engine.connectPresentation(context=>{view=context;return {};});engine.start('local');
 assert.throws(()=>{view.game.food=-1;},TypeError);
 assert.throws(()=>view.game.items.splice(0,1),TypeError);
 assert.throws(()=>{view.game={};},TypeError);
 assert.equal(view.person(),view.controls.group()[0],'identidad estable en consultas');
 const list=view.alive().filter(p=>p.loc===0);assert.doesNotThrow(()=>list.sort((a,b)=>b.influence-a.influence));
 engine.start('local');assert.equal(view.game.food,6,'la vista recibe el nuevo estado, no una copia obsoleta');
});
