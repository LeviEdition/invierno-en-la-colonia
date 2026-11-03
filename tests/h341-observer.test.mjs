import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../src/application/reference-engine.mjs';
import {observeReferenceView} from '../prototypes/state-map/reference-observer.mjs';
function setup(options={}){
 let context,queries=0,draws=0,disposals=0;const engine=createEngine({queueMicrotask(){}});engine.connectPresentation(c=>{context=c;return {};});engine.start('local');const tasks=[],states=[],errors=[];
 const supplied=new Proxy(context,{get(target,key){if(key==='playable')return ()=>{queries++;return true;};return Reflect.get(target,key);}});
 const view=observeReferenceView(supplied,c=>({draw(){draws++;c.playable();return 17;},dispose(){disposals++;},get live(){return draws;},showSetup(){},hideHandover(){},showPass(){},hidePass(){},openBackdrop(){},closeBackdrop(){},openDeath(){},closeDeath(){}}),{enqueue:fn=>tasks.push(fn),onState:p=>states.push(p),onError:e=>errors.push(e.message),...options});
 return {engine,view,tasks,states,errors,counts:()=>({queries,draws,disposals}),flush(){while(tasks.length)tasks.shift()();}};
}
test('H3.4.1 observador: encadena UI, conserva getters y registra consultas existentes sin añadirlas',()=>{
 const t=setup();t.view.hideHandover();assert.equal(t.view.draw(),17);t.view.draw();assert.equal(t.view.live,2);assert.equal(t.tasks.length,1);const before=t.engine.snapshot();t.flush();assert.equal(t.states.length,1);assert.equal(t.states[0].blocked,null);assert.equal(t.states[0].dice.available.length,4);assert.deepEqual(t.counts(),{queries:2,draws:2,disposals:0});assert.deepEqual(t.engine.snapshot(),before);
});
test('H3.4.1 observador: preparación, pase y decisiones ocultan la proyección sin consultar reglas',()=>{
 const t=setup();t.view.draw();t.flush();assert.equal(t.states.at(-1).blocked,'setup');t.view.hideHandover();t.flush();assert.equal(t.states.at(-1).blocked,null);
 for(const [open,close,kind] of [['showPass','hidePass','handover'],['openBackdrop','closeBackdrop','decision'],['openDeath','closeDeath','death'],['showSetup','hideHandover','setup']]){t.view[open]();t.flush();assert.equal(t.states.at(-1).blocked,kind);assert.deepEqual(t.states.at(-1).characters,[]);t.view[close]();t.flush();assert.equal(t.states.at(-1).blocked,null);}
 assert.equal(t.counts().queries,1);
});
test('H3.4.1 observador: descarta publicaciones pendientes, limpia una vez y distingue una nueva partida',()=>{
 const t=setup();t.view.hideHandover();t.view.draw();t.flush();const epoch=t.states[0].epoch;t.engine.start('local');t.view.draw();t.flush();assert.ok(t.states.at(-1).epoch>epoch);t.view.draw();const n=t.states.length;t.view.dispose();t.view.dispose();t.flush();assert.equal(t.states.length,n);assert.equal(t.counts().disposals,1);
});
test('H3.4.1 observador: un fallo del visor no reemplaza ni bloquea el draw original',()=>{
 const t=setup({onState(){throw Error('Visor desconectado');}});assert.equal(t.view.draw(),17);assert.doesNotThrow(()=>t.flush());assert.deepEqual(t.errors,['Visor desconectado']);assert.equal(t.counts().draws,1);
});
