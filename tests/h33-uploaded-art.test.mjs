import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {checkWorkshopKit,checkUploadedArtwork} from '../scripts/check-workshop-kit.mjs';
import {validateKit,defaultState,sceneNodes,representation,resourceFactor,textureEstimate} from '../prototypes/hospital-workshop/kit.mjs';
import {pickNode} from '../prototypes/hospital-workshop/resources.mjs';

const load=async()=>JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/uploaded-kit.json',import.meta.url)));
test('H3.3 kit subido: originales y dos bocetos coinciden con la entrega versionada',async()=>{
 const result=await checkUploadedArtwork();
 assert.equal(result.files.length,9);
 assert.equal(result.files.filter(f=>f.role==='prototype_asset').length,7);
 assert.equal(result.files.find(f=>f.file==='assets/barricada.png').alpha_range[1],254);
 const {kit}=await checkWorkshopKit({uploaded:true});assert.equal(kit.id,'hospital-uploaded-pilot');
 for(const id of ['zombie','barricade-marker'])assert.match(kit.assets.find(a=>a.id===id).file,/kit_arte_h33\/assets\//);
 assert.equal(kit.assets.filter(a=>a.presentation==='circular-portrait').length,4);
 assert.ok(!kit.assets.some(a=>/mapa|boceto/.test(a.file||'')),'Mapa y bocetos no son fondos del sector ni texturas de la escena');
});
test('H3.3 kit subido: cuatro retratos distintos, acceso exclusivo y referencia anterior intacta',async()=>{
 const kit=validateKit(await load()),state=defaultState(kit);state.case='mixed';
 const before=structuredClone(kit),nodes=sceneNodes(kit,state),portraits=nodes.filter(n=>n.role==='survivor');
 assert.equal(new Set(portraits.map(n=>n.assetId)).size,4);
 assert.equal(new Set(nodes.filter(n=>n.access).map(n=>n.access)).size,4);
 assert.ok(nodes.filter(n=>n.role==='barricade').every(n=>kit.assets.find(a=>a.id===n.assetId).kind==='image'));
 assert.deepEqual(kit,before);
 const bad=structuredClone(kit);bad.survivorAssetIds[1]='unknown';assert.throws(()=>validateKit(bad));
 const path=structuredClone(kit);path.assets.find(a=>a.id==='zombie').file='../../kit_arte_h33/assets/../../package.png';assert.throws(()=>validateKit(path));
});
test('H3.3 kit subido: apoyo no depende del margen PNG y es estable con cada derivado',async()=>{
 const kit=await load();
 for(const a of kit.assets.filter(a=>a.kind==='image'))for(const factor of [1,.75,.5,384/1254]){
  const point={x:920,y:750},r=representation(a,factor,1,point);
  assert.ok(Math.abs(r.content.x+r.pivot.x*r.scale-point.x)<1e-9);
  assert.ok(Math.abs(r.content.y+r.pivot.y*r.scale-point.y)<1e-9);
 }
 for(const id of ['zombie','barricade-marker']){const a=kit.assets.find(a=>a.id===id);assert.ok(a.pivot.y<a.height);assert.ok(a.visibleBounds.height*a.scale<126);}
});
test('H3.3 kit subido: selección circular ignora las esquinas transparentadas del retrato',async()=>{
 const kit=await load(),a=kit.assets.find(a=>a.presentation==='circular-portrait'),scale=a.scale;
 const node={id:'s1',assetId:a.id,role:'survivor',visible:true,depth:5,position:{x:500,y:500},multiplier:1};
 const assets={[a.id]:a},originals={[a.id]:{alpha:null}};
 assert.equal(pickNode([node],assets,originals,{x:500,y:500}),'s1');
 assert.equal(pickNode([node],assets,originals,{x:500+(a.width*.48)*scale,y:500+(a.height*.48)*scale}),null);
 assert.equal(resourceFactor(a,1,'original'),1);
 const original=textureEstimate(a,resourceFactor(a,1,'original')),limited=textureEstimate(a,resourceFactor(a,1,'384'));
 assert.equal(original.width,1254);assert.equal(limited.width,384);assert.equal(original.potWidth,2048);assert.equal(limited.potWidth,512);
 assert.equal(original.derivedRgba,1254*1254*4,'Recortar un círculo también crea Canvas en resolución original');
 const totals=kit.profiles.map(p=>kit.assets.filter(a=>a.kind==='image').reduce((s,a)=>s+textureEstimate(a,resourceFactor(a,p.factor)).rgbaWithMips,0));
 assert.deepEqual(totals,[72701264,39146832,22369616]);
});
