import test from 'node:test';
import assert from 'node:assert/strict';
import {createApplication} from '../src/application/create-application.mjs';
import {createUi} from '../src/presentation/reference-view.mjs';
test('H3.4.1: la fábrica de presentación conserva un único UI y su limpieza',()=>{
 const active=[],document={addEventListener(...args){active.push(args);},removeEventListener(...args){const i=active.findIndex(a=>a[0]===args[0]&&a[1]===args[1]);assert.ok(i>=0);active.splice(i,1);}};let calls=0;
 const app=createApplication({environment:{document},autoStart:false,createPresentation(context,environment){calls++;assert.equal(context.game,undefined);return createUi(context,environment);}});
 assert.equal(calls,1);assert.equal(active.length,10);assert.equal(app.engine.snapshot(),null);app.dispose();app.dispose();assert.equal(active.length,0);
});
