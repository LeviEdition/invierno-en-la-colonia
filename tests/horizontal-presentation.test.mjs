import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fitMapCamera,resizeMapCamera} from '../prototypes/horizontal-map/camera.mjs';
import {localityFrame} from '../prototypes/horizontal-map/presentation.mjs';
import {createStableLayout,destinationPosition} from '../prototypes/movement-map/stable-layout.mjs';
import {capacityProjection,exteriorVolumes,boundsIntersectPolygon} from '../test-support/horizontal-composition.mjs';
import {pickCharacter,pickMapTarget} from '../prototypes/hospital-workshop/mockup/model.mjs';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const scene=json('prototypes/horizontal-map/scene.json'),colony=scene.zones.find(z=>z.id==='colonia');
const locations=['colonia','supermercado','hospital','comisaria','gasolinera','escuela','biblioteca'].map((id,engineIndex)=>({id:'place-'+engineIndex,engineIndex,capacity:engineIndex?4:12,exteriorCapacity:engineIndex?4:12}));
const seed={locations,characters:[{id:'h0',name:'Mara',playerId:'human',locationId:'place-0'}],movement:{},search:{},action:{}};
function state(n){const p=capacityProjection(seed,'mixed',scene),ids=p.characters.filter(c=>c.locationId==='place-0').slice(0,n).map(c=>c.id);p.characters=p.characters.filter(c=>c.locationId!=='place-0'||ids.includes(c.id));return p;}
test('Presentación: vista general contiene zonas completas y grupos máximos, también al abrir/cerrar ficha',()=>{
 for(const viewport of [{width:1365,height:618},{width:1055,height:618},{width:852,height:294}]){
  const c=fitMapCamera(scene.bounds,viewport);
  for(const z of scene.zones){const b=localityFrame(z,0);assert.ok(c.x+b.x*c.zoom>=-1&&c.y+b.y*c.zoom>=-1&&c.x+(b.x+b.width)*c.zoom<=viewport.width+1&&c.y+(b.y+b.height)*c.zoom<=viewport.height+1,z.id+' completa');}
  const small={...viewport,width:viewport.width-310},open=resizeMapCamera(c,{x:835.5,y:470.5},scene.bounds,small),closed=resizeMapCamera(open,{x:835.5,y:470.5},scene.bounds,viewport);
  assert.deepEqual(closed,c,'restaura exactamente la vista general');
 }
});
test('Presentación: colonia1/6/12 centrada y sin reducir fichas ni tocar cuerpos posteriores',()=>{
 const volumes=exteriorVolumes(scene,json('prototypes/hospital-workshop/uploaded-kit.json').assets);
 for(const n of [1,6,12]){const l=createStableLayout(scene).project(state(n)),members=l.characters.filter(c=>c.locationId==='place-0');
  const xs=members.map(c=>c.position.x);assert.ok(Math.abs((Math.min(...xs)+Math.max(...xs))/2-835)<1,'ocupación'+n+' centrada');
  assert.ok(members.every(c=>c.diameter===36));
  for(const c of members)for(const a of volumes){const r=c.diameter/2;assert.equal(c.position.x-r<a.x+a.width&&c.position.x+r>a.x&&c.position.y-r<a.y+a.height&&c.position.y+r>a.y,false,'ficha sobre actor');}
 }
});
test('Presentación: cuatro apoyos posteriores repartidos por el ancho, no concentración3+1',()=>{
 const back=colony.accesses.slice(0,4),xs=back.map(a=>a.x);assert.ok(xs[3]-xs[0]>=380);
 for(let i=1;i<xs.length;i++)assert.ok(xs[i]-xs[i-1]>=100&&xs[i]-xs[i-1]<=190);
 assert.ok(new Set(back.map(a=>a.y)).size>1);
});
test('Presentación: pertenencia conserva identidad y orden; llegada coincide con destino y solo cambia con ocupación',()=>{
 const layout=createStableLayout(scene),p=state(6),first=layout.project(p),again=layout.project(structuredClone(p));
 assert.deepEqual(first.characters,again.characters);
 const incoming={id:'new',name:'Nueva',playerId:'human',locationId:'place-0'},to=destinationPosition(first,scene,0);
 p.characters.push(incoming);const arrived=layout.project(p);
 assert.deepEqual(arrived.characters.find(c=>c.id==='new').position,to,'destino de animación coincide con llegada');
 for(const c of first.characters){const after=arrived.characters.find(a=>a.id===c.id);assert.equal(after.portraitId,c.portraitId);assert.equal(after.name,c.name);}
 const order=arrived.characters.filter(c=>c.locationId==='place-0').map(c=>c.id);p.characters=p.characters.filter(c=>c.id!=='h0');
 const after=layout.project(p);assert.deepEqual(after.characters.filter(c=>c.locationId==='place-0').map(c=>c.id),order.filter(id=>id!=='h0'));
 assert.deepEqual(after.characters,layout.project(structuredClone(p)).characters,'sin saltos al repetir estado');
});
test('Presentación: los arbustos pintados conocidos detectan las posiciones descartadas de gasolinera y comisaría',()=>{
 const vegetation=json('test-support/horizontal-obstacles.json').obstacles.filter(o=>['gasolinera-arbusto','comisaria-arbusto'].includes(o.id));assert.equal(vegetation.length,2);
 const assets=json('prototypes/hospital-workshop/uploaded-kit.json').assets,old=structuredClone(scene);
 old.zones.find(z=>z.id==='gasolinera').accesses[0]={x:233,y:724};old.zones.find(z=>z.id==='comisaria').accesses[3]={x:1430,y:737};
 for(const id of ['gasolinera','comisaria'])assert.ok(exteriorVolumes(old,assets).filter(a=>a.locality===id).some(a=>vegetation.some(o=>boundsIntersectPolygon(a,o.polygon))),id+' rojo conservado');
 for(const a of exteriorVolumes(scene,assets))for(const o of vegetation)assert.equal(boundsIntersectPolygon(a,o.polygon),false,a.locality+' invade vegetación');
});
test('Presentación: objetivos de fichas conservan44px CSS en vista general; en proximidad se elige la más cercana',()=>{
 const a={id:'a',diameter:36,position:{x:835,y:228}},b={...a,id:'b',position:{x:879,y:228}},options={zoom:.29,minSize:44};
 assert.equal(pickCharacter([a],{x:835,y:228-20/.29},options),'a');
 assert.equal(pickCharacter([a,b],a.position,options),'a');
 assert.equal(pickCharacter([a,b],b.position,options),'b');
 assert.equal(pickCharacter([a],{x:835,y:228-20/.29}),null,'prototipos sin opt-in conservan su comportamiento');
 for(const n of [1,6,12]){const layout=createStableLayout(scene).project(state(n));for(const z of scene.zones)for(const a of z.accesses)assert.equal(pickMapTarget(scene,layout.characters,a,.29).localityId,z.id,'el margen táctil no captura la casilla');}
});
