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
 assert.throws(()=>Object.setPrototypeOf(view.game,{}),TypeError);assert.throws(()=>Object.preventExtensions(view.game),TypeError);
 assert.throws(()=>{Object.getOwnPropertyDescriptor(view.game,'humans').value[0].dead=true;},TypeError);
 assert.equal('kill' in view,false);assert.equal('view' in view,false);assert.equal(view.person(),view.controls.group()[0],'identidad estable en consultas');
 const list=view.alive().filter(p=>p.loc===0);assert.doesNotThrow(()=>list.sort((a,b)=>b.influence-a.influence));
 engine.start('local');assert.equal(view.game.food,6,'la vista recibe el nuevo estado, no una copia obsoleta');
});
test('D2: automatismo recibe estado de solo lectura y comandos, sin exigir DOM',()=>{
 let agent;const engine=createEngine();engine.connectAutomation(context=>{agent=context;return {botTurn:()=>Promise.resolve(),botContributeTools(){}};});
 engine.start('ai');assert.throws(()=>{agent.game.food=0;},TypeError);
 assert.throws(()=>agent.game.botDice.pop(),TypeError);assert.equal(typeof agent.actions.useItem,'function');
});
test('D2: dependencias de dominio/aplicación no consultan document o window',()=>{
 const descriptors=['document','window'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]);
 try{for(const [key] of descriptors)Object.defineProperty(globalThis,key,{configurable:true,get(){throw Error('DOM consultado: '+key);}});
  const engine=createEngine();engine.start('local');assert.equal(engine.snapshot().round,1);
 }finally{for(const [key,descriptor] of descriptors)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
});
test('D2: el planificador inyectado se llama como función, sin usar el contexto privado como receptor',()=>{
 let calls=0;const math=Object.create(Math);math.random=()=>0;
 const engine=createEngine({Math:math,queueMicrotask:function(fn){assert.equal(this,undefined);calls++;fn();}});
 engine.start('local');engine.dispatch('destination',1);engine.dispatch('doMove');assert.ok(calls>0);
});
test('D2: el catálogo de la vista permite consultas pero no crear mazos ni consumir RNG',()=>{
 const engine=createEngine();let view;engine.connectPresentation(context=>{view=context;return {};});engine.start('local');
 assert.equal(view.catalog.resolve('pistol').id,'pistol');assert.equal(view.catalog.definitions.ration.kind,'comida');assert.equal(Object.entries(view.catalog.definitions).length,17);
 assert.throws(()=>{Object.getOwnPropertyDescriptor(view.catalog.definitions,'ration').value.amount=99;},TypeError);assert.equal(view.catalog.deck,undefined);assert.equal(view.catalog.create,undefined);
});
