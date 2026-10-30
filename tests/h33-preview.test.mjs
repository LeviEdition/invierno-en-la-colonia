import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkshopServer} from '../scripts/serve-workshop.mjs';
import {checkWorkshopKit} from '../scripts/check-workshop-kit.mjs';
test('H3.3: validador cruza PNG, canal alfa, hash y manifiesto original',async()=>{
 const {kit,profiles}=await checkWorkshopKit();assert.equal(kit.id,'hospital-pilot');assert.equal(profiles.length,3);
});
test('H3.3: preview sirve taller y referencias sin exponer archivos fuera de sus rutas',async()=>{
 const server=createWorkshopServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const path of ['/prototypes/hospital-workshop/','/prototypes/hospital-workshop/kit.json','/prototypes/hospital/','/prototypes/hospital-phaser/'])assert.equal((await fetch(base+path)).status,200,path);
  assert.equal(new URL((await fetch(base)).url).pathname,'/prototypes/hospital-workshop/');
  for(const path of ['/package.json','/src/domain/reference-state.mjs','/prototypes/hospital-workshop/%2e%2e%2f%2e%2e%2fpackage.json','/assets/hospital-workshop/%2e%2e%2f%2e%2e%2fpackage.json','/prototypes/hospital-workshop/%5c..%5cpackage.json'])assert.equal((await fetch(base+path)).status,404,path);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
