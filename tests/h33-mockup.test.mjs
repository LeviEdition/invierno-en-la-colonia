import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateScene,createFixture,sceneCounts,sceneNodes,pickCharacter} from '../prototypes/hospital-workshop/mockup/model.mjs';
import {fitMapCamera,constrainCamera,focusLocality} from '../prototypes/hospital-workshop/mockup/camera.mjs';
import {zoomCameraAt,screenToWorld} from '../prototypes/hospital/camera.mjs';
import {makeMockupKit} from '../prototypes/hospital-workshop/mockup/assets.mjs';
const scene=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/mockup/scene.json',import.meta.url)));
const uploaded=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/uploaded-kit.json',import.meta.url))),manifest=JSON.parse(await readFile(new URL('../kit_arte_h33/manifest.json',import.meta.url)));

test('H3.3 maqueta: siete localidades,36 posiciones distintas de cada tipo y accesos sobre terreno',()=>{
 assert.equal(validateScene(scene),scene);
 assert.equal(scene.zones.length,7);
 assert.equal(scene.zones.reduce((n,z)=>n+z.capacity,0),36);
 assert.equal(scene.zones.reduce((n,z)=>n+z.accesses.length,0),36);
 for(const id of ['hospital','comisaria'])assert.deepEqual(scene.zones.find(z=>z.id===id).accesses.map(p=>p.side),['front','front','side','side']);
 for(const mutate of [s=>s.zones[0].capacity=5,s=>s.zones[1].accesses.pop(),s=>s.zones[2].accesses[0].x=2000,s=>s.zones[3].portraits[1]=s.zones[3].portraits[0],s=>s.zones[2].accesses[0]={...s.zones[2].accesses[0],x:200,y:400}]){const bad=structuredClone(scene);mutate(bad);assert.throws(()=>validateScene(bad));}
});
test('H3.3 maqueta: hospital mixto y máximos son fixtures, con ocupación exclusiva e IDs estables',()=>{
 const before=structuredClone(scene),normal=createFixture(scene,'hospital'),max=createFixture(scene,'maximum'),single=createFixture(scene,'one-zombie');
 const hospital=normal.accesses.filter(a=>a.zoneId==='hospital');assert.equal(normal.characters.filter(c=>c.zoneId==='hospital').length,4);assert.equal(hospital.filter(a=>a.occupant==='zombie').length,2);assert.equal(hospital.filter(a=>a.occupant==='barricade').length,2);
 assert.deepEqual(sceneCounts(max),{characters:36,accesses:36,zombies:18,barricades:18,empty:0});
 assert.equal(max.characters.filter(c=>c.zoneId==='colonia').length,12);assert.equal(new Set(max.characters.map(c=>c.id)).size,36);
 assert.equal(sceneCounts(single).zombies,7);assert.equal(sceneCounts(single).empty,29);
 for(const c of normal.characters)assert.deepEqual(c,max.characters.find(x=>x.id===c.id));
 assert.ok(max.accesses.every(a=>['empty','zombie','barricade'].includes(a.occupant)));assert.deepEqual(scene,before);
});
test('H3.3 maqueta: retratos son fichas circulares seleccionables, fuente compartida y mapa único',()=>{
 const fixture=createFixture(scene,'maximum'),nodes=sceneNodes(scene,fixture);
 assert.equal(nodes.filter(n=>n.role==='ground').length,1);assert.equal(nodes.find(n=>n.role==='ground').assetId,'map');
 assert.equal(new Set(nodes.filter(n=>n.role==='survivor').map(n=>n.assetId)).size,4);
 const kit=makeMockupKit(scene,uploaded,manifest);assert.equal(kit.assets.length,7);assert.ok(!kit.assets.some(a=>['ground','hospital'].includes(a.id)));assert.equal(kit.assets.reduce((n,a)=>n+a.bytes,0),17996335);assert.equal(kit.assets[0].sha256,manifest.files.find(a=>a.file==='assets/mapa-prototipo.png').sha256);
 const c=fixture.characters[0];assert.equal(pickCharacter(fixture.characters,c.position),c.id);assert.equal(pickCharacter([c],{x:c.position.x+c.diameter*.48,y:c.position.y+c.diameter*.48}),null);
 assert.ok(nodes.filter(n=>n.role==='zombie'||n.role==='barricade').every(n=>n.depth>0));
});
test('H3.3 maqueta: cámara acotada, zoom anclado y foco hospital sin otro fondo',()=>{
 const viewport={width:1000,height:700},camera=fitMapCamera(scene.bounds,viewport);
 const p={x:500,y:350},before=screenToWorld(camera,p),zoomed=zoomCameraAt(camera,2,p),after=screenToWorld(zoomed,p);assert.deepEqual(after,before);
 const bounded=constrainCamera({...zoomed,x:99999,y:-99999},scene.bounds,viewport);
 assert.ok(bounded.x<=0&&bounded.x>=viewport.width-scene.bounds.width*bounded.zoom);assert.ok(bounded.y<=0&&bounded.y>=viewport.height-scene.bounds.height*bounded.zoom);
 const hospital=focusLocality(scene,'hospital',viewport);assert.ok(hospital.zoom>camera.zoom);assert.ok(hospital.zoom<=camera.maxZoom);assert.equal(scene.bounds.width,1448);
});
