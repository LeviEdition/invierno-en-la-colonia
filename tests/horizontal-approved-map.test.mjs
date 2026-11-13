import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createReferenceData} from '../src/domain/reference-data.mjs';
import {createStableLayout} from '../prototypes/movement-map/stable-layout.mjs';
import {capacityProjection} from '../test-support/horizontal-composition.mjs';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url))),scene=json('prototypes/horizontal-map/scene.json');
const locations=['colonia','supermercado','hospital','comisaria','gasolinera','escuela','biblioteca'].map((visualId,engineIndex)=>({id:'place-'+engineIndex,engineIndex,capacity:engineIndex?4:12,exteriorCapacity:engineIndex?4:12,zombies:0,barricades:0}));
const state={locations,characters:[{id:'h0',name:'Mara',playerId:'human',locationId:'place-0'}],movement:{},search:{},action:{}};
test('Mapa aprobado: capacidades exteriores menores conservan conteos y excedentes reales sin cambiar las reglas',()=>{
 const before=structuredClone(state),full=structuredClone(state);for(const l of full.locations)l.zombies=l.exteriorCapacity;
 const layout=createStableLayout(scene).project(full);
 assert.equal(layout.locations.flatMap(l=>l.accesses).length,33);
 for(const [index,shown,overflow]of [[4,2,2],[6,3,1]]){const l=layout.locations[index];assert.equal(l.zombies,4);assert.equal(l.exteriorCapacity,4);assert.equal(l.accesses.length,shown);assert.equal(l.externalOverflow,overflow);assert.deepEqual(l.accesses.map(a=>a.id),Array.from({length:shown},(_,i)=>'place-'+index+'-access-'+i));}
 assert.deepEqual(state,before);assert.deepEqual(createReferenceData().zcap,[12,4,4,4,4,4,4]);
});
test('Mapa aprobado QA: capacidad impar reparte actores enteros y conserva las 33 posiciones compartidas',()=>{
 const p=capacityProjection(state,'mixed',scene),layout=createStableLayout(scene).project(p);assert.equal(p.locations[6].zombies,2);assert.equal(p.locations[6].barricades,1);
 assert.ok(p.locations.every(l=>Number.isInteger(l.zombies)&&Number.isInteger(l.barricades)));
 assert.equal(layout.nodes.filter(n=>n.role==='zombie').length,17);assert.equal(layout.nodes.filter(n=>n.role==='barricade').length,16);assert.ok(layout.locations.every(l=>l.externalOverflow===0));
});
test('Mapa aprobado: tocar cada apoyo o cuerpo selecciona su localidad sin añadir reglas de objetivos individuales',async()=>{
 const {pickLocality}=await import('../prototypes/hospital-workshop/mockup/model.mjs');
 const enabled={...scene,selectExteriorAccesses:true};
 for(const zoom of [.51,.77,1.5])for(const z of scene.zones)for(const a of z.accesses){assert.equal(pickLocality(enabled,a,zoom),z.id,z.id+' apoyo');assert.equal(pickLocality(enabled,{x:a.x,y:a.y-24},zoom),z.id,z.id+' cuerpo');}
 assert.equal(pickLocality({...scene,selectExteriorAccesses:false},scene.zones.find(z=>z.id==='colonia').accesses[0]),null);
});
