import test from 'node:test';import assert from 'node:assert/strict';
import {createStateMapServer} from '../scripts/serve-state-map.mjs';
import {buildStateMap} from '../scripts/build-state-map.mjs';
test('H3.4.1 build: motor solo en host y visor sin comandos ni datos QA en producto',async()=>{
 const result=await buildStateMap({write:false});assert.ok(result.host.inputs.includes('src/application/reference-engine.mjs'));assert.ok(!result.map.inputs.some(p=>p.startsWith('src/')));assert.ok(!result.host.inputs.some(p=>p.includes('node_modules/phaser')));assert.ok(!result.html.includes('h341Test'));assert.ok(!result.html.includes('testBindings'));assert.ok(!result.javascript.includes('h341Test'));assert.ok(result.javascript.includes('/dist/state-map/reference-host.html'));
});
test('H3.4.1 preview: rutas explícitas, sin fuente privada ni QA por defecto',async()=>{
 const server=createStateMapServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{assert.equal((await fetch(base+'/prototypes/state-map/')).status,200);assert.equal((await fetch(base+'/prototypes/hospital-workshop/')).status,200);for(const path of ['/dist/state-map-qa/index.html','/dist/state-map-qa/reference-host.html','/src/application/reference-engine.mjs','/.git/config','/package.json','/prototypes/state-map/%2e%2e%2f%2e%2e%2fpackage.json','/prototypes/state-map/%5c..%5cpackage.json'])assert.equal((await fetch(base+path)).status,404,path);}finally{await new Promise(r=>server.close(r));}
});
