import test from 'node:test';import assert from 'node:assert/strict';import {createApplication} from '../src/application/create-application.mjs';
test('D2: conectar/desconectar aplicación libera todos los listeners sin iniciar partida',()=>{
 const active=[],document={addEventListener(...args){active.push(args);},removeEventListener(...args){const index=active.findIndex(a=>a[0]===args[0]&&a[1]===args[1]&&a[2]===args[2]);assert.ok(index>=0);active.splice(index,1);}};
 const app=createApplication({environment:{document},autoStart:false});assert.equal(app.engine.snapshot(),null);assert.equal(active.length,10);
 app.dispose();app.dispose();assert.equal(active.length,0);
 const next=createApplication({environment:{document},autoStart:false});next.dispose();assert.equal(active.length,0);
});
test('Integración B3: segundo montaje rechazado no deja listeners que afecten a la aplicación viva',()=>{
 const active=[],document={addEventListener(...args){active.push(args);},removeEventListener(...args){const index=active.findIndex(a=>a[0]===args[0]&&a[1]===args[1]&&a[2]===args[2]);assert.ok(index>=0);active.splice(index,1);}};
 const environment={document},app=createApplication({environment,autoStart:false});assert.equal(active.length,10);
 assert.throws(()=>createApplication({environment,autoStart:false}),/ya están conectados/);
 assert.equal(active.length,10,'un intento fallido no agrega seis listeners residuales');app.dispose();assert.equal(active.length,0);
});
test('Integración B3: fallo de inicialización libera listeners y permite volver a conectar',()=>{
 const active=[],document={addEventListener(...args){active.push(args);},removeEventListener(...args){const index=active.findIndex(a=>a[0]===args[0]&&a[1]===args[1]&&a[2]===args[2]);assert.ok(index>=0);active.splice(index,1);},getElementById(){throw Error('DOM de prueba incompleto');}};
 const environment={document};assert.throws(()=>createApplication({environment}),/DOM de prueba incompleto/);assert.equal(active.length,0);
 const app=createApplication({environment,autoStart:false});assert.equal(active.length,10);app.dispose();assert.equal(active.length,0);
});
