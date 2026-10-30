import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createPreviewServer} from '../scripts/serve-hospital.mjs';
import {buildHospital,projectRoot} from '../scripts/build-hospital-phaser.mjs';

test('H3.2: servidor entrega HTML/módulos/PNG, revalida caché y limita sus rutas',async()=>{
 const server=createPreviewServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const html=await fetch(base+'/prototypes/hospital-phaser/');assert.equal(html.status,200);assert.match(html.headers.get('content-type'),/text\/html/);await html.text();
  const module=await fetch(base+'/prototypes/hospital/camera.mjs');assert.equal(module.status,200);assert.match(module.headers.get('content-type'),/javascript/);await module.text();
  const image=await fetch(base+'/assets/prototipo-hospital/hospital.png');assert.equal(image.status,200);
  const bytes=Buffer.from(await image.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),'fc85ae8199e1d94b7f4636bed4b8f293c0e15ce64b8235dbbf63b2b3e0e76159');
  const cached=await fetch(base+'/assets/prototipo-hospital/hospital.png',{headers:{'If-None-Match':image.headers.get('etag')}});assert.equal(cached.status,304);
  for(const path of ['/package.json','/.git/config','/node_modules/phaser/package.json','/assets/prototipo-hospital/..%2f..%2fpackage.json','/assets/prototipo-hospital/%2e%2e/%2e%2e/package.json'])assert.equal((await fetch(base+path)).status,404);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('H3.2: build esbuild reproducible sin reescribir el HTML V9.9',async()=>{
 const path=projectRoot+'/invierno_colonia_v9_9.html',before=await readFile(path);
 const first=await buildHospital(),second=await buildHospital({check:true});
 assert.equal(first.sha256,second.sha256);assert.equal(first.phaser,'4.2.1');
 assert.deepEqual(await readFile(path),before);
});
