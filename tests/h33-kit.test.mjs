import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateKit,textureEstimate,defaultState,sceneNodes,visibleCounts,representation} from '../prototypes/hospital-workshop/kit.mjs';
const kit=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/kit.json',import.meta.url)));
test('H3.3: contrato provisional, procedencia y referencias preservadas',async()=>{
 assert.equal(validateKit(kit),kit);
 const manifest=JSON.parse(await readFile(new URL('../test-support/h33-reference.json',import.meta.url)));
 for(const file of manifest.files){const bytes=await readFile(new URL('../'+file.path,import.meta.url));assert.equal(bytes.length,file.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
 for(const asset of kit.assets.filter(a=>a.kind==='image')){const bytes=await readFile(new URL('../prototypes/hospital-workshop/'+asset.file,import.meta.url));assert.equal(bytes.length,asset.bytes);assert.equal(bytes.readUInt32BE(16),asset.width);assert.equal(bytes.readUInt32BE(20),asset.height);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
});
test('H3.3: contrato rechaza pivotes, límites, procedencia y perfiles incoherentes',()=>{
 for(const mutate of [k=>k.assets[0].pivot.x=-1,k=>k.assets[0].visibleBounds.width=9999,k=>k.assets[0].sha256='sin hash',k=>k.assets[0].reference='otra',k=>k.assets.push(k.assets[0]),k=>k.profiles[1].factor=0,k=>k.accessPositions.pop(),k=>k.reference.projection.angle=30,k=>k.bounds.width=-1,k=>k.profiles[0].factor=.5,k=>k.assets[0].file='../../assets/hospital-workshop/../../../package.png']){const bad=structuredClone(kit);mutate(bad);assert.throws(()=>validateKit(bad));}
});
test('H3.3: memoria RGBA y mipmaps se calculan por dimensiones reales, no por archivos',()=>{
 const totals=kit.profiles.map(p=>kit.assets.filter(a=>a.kind==='image').reduce((sum,a)=>sum+textureEstimate(a,p.factor).rgbaWithMips,0));
 assert.deepEqual(totals,[55924052,22369620,13981012]);
 const ground=textureEstimate(kit.assets.find(a=>a.id==='ground'),1);assert.equal(ground.potWidth,2048);assert.equal(ground.potHeight,1024);
});
test('H3.3: apoyo y proporciones de contenido estables con derivados y escala',()=>{
 const asset=kit.assets.find(a=>a.id==='zombie'),point={x:710,y:670};
 for(const profile of kit.profiles)for(const multiplier of [.75,1,1.25]){
  const r=representation(asset,profile.factor,multiplier,point);
  assert.ok(Math.abs(r.content.x-(point.x-asset.pivot.x*asset.scale*multiplier))<1e-9);
  assert.ok(Math.abs(r.content.height-asset.height*asset.scale*multiplier)<1e-9);
  assert.ok(Math.abs(r.content.width/r.content.height-asset.width/asset.height)<1e-12);
 }
});
test('H3.3: casos de ocupación no duplican un acceso compartido',()=>{
 const state=defaultState(kit);state.case='max-zombies';let nodes=sceneNodes(kit,state);assert.deepEqual(visibleCounts(nodes),{survivors:4,zombies:4,barricades:0,testActors:0,accesses:4});
 state.case='max-barricades';assert.deepEqual(visibleCounts(sceneNodes(kit,state)),{survivors:4,zombies:0,barricades:4,testActors:0,accesses:4});
 state.case='mixed';nodes=sceneNodes(kit,state);assert.equal(visibleCounts(nodes).zombies,2);assert.equal(visibleCounts(nodes).barricades,2);
 state.case='custom';state.accesses=['empty','zombie','barricade','empty'];nodes=sceneNodes(kit,state);assert.equal(visibleCounts(nodes).accesses,2);
 state.layers.actors=false;assert.deepEqual(visibleCounts(sceneNodes(kit,state)),{survivors:0,zombies:0,barricades:0,testActors:0,accesses:0});
});
test('H3.3: superposición explícita y construcción sin mutación de datos',()=>{
 const state=defaultState(kit),before=structuredClone({kit,state});
 const front=sceneNodes(kit,state);assert.ok(front.find(n=>n.id==='test-actor').depth>front.find(n=>n.id==='hospital').depth);
 state.pose='detras';const back=sceneNodes(kit,state);assert.ok(back.find(n=>n.id==='test-actor').depth<back.find(n=>n.id==='hospital').depth);
 state.pose='delante';assert.deepEqual({kit,state},before);
});
