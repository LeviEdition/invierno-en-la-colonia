import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createAtmosphereModel,initialAtmosphereSettings,validateAtmosphere} from '../prototypes/hospital-workshop/mockup/atmosphere-model.mjs';
import {pickLocality} from '../prototypes/hospital-workshop/mockup/model.mjs';
const config=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/mockup/atmosphere.json',import.meta.url)));
const scene=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/mockup/scene.json',import.meta.url)));

test('H3.3 ambiente: límites, emisores documentados y calles configuradas fuera de edificios',()=>{
 assert.equal(validateAtmosphere(config),config);assert.equal(config.limits.snow+config.limits.smoke+config.limits.wind,120);
 for(const zone of config.windZones)for(const p of [{x:zone.x,y:zone.y},{x:zone.x+zone.width,y:zone.y+zone.height},{x:zone.x+zone.width/2,y:zone.y+zone.height/2}])assert.equal(pickLocality(scene,p),null);
 assert.ok(config.smokeEmitters.every(e=>e.source&&e.id&&e.x>0&&e.y>0));assert.ok(config.omissions.some(e=>e.locality==='hospital'&&e.reason));
 const bad=structuredClone(config);bad.limits.snow=10000;assert.throws(()=>validateAtmosphere(bad));
 const halo=structuredClone(config);halo.lightsHaloScale=Infinity;assert.throws(()=>validateAtmosphere(halo));
});
test('H3.3 ambiente: movimiento reducido inicia apagado y admite habilitación explícita',()=>{
 assert.equal(initialAtmosphereSettings(false).intensity,'normal');assert.equal(initialAtmosphereSettings(true).enabled,false);const m=createAtmosphereModel(config,{seed:7,settings:initialAtmosphereSettings(true)});assert.equal(m.isAnimating(),false);m.setSettings({enabled:true});assert.equal(m.isAnimating(),true);m.setSettings({snow:false,wind:false,smoke:false,lights:false});assert.equal(m.isAnimating(),false);
});
test('H3.3 ambiente: RNG propio, semilla reproducible y objetos reutilizados sin crecimiento',()=>{
 const saved=Math.random;Math.random=()=>{throw Error('RNG compartido');};
 try{const a=createAtmosphereModel(config,{seed:77}),b=createAtmosphereModel(config,{seed:77});const references=[...a.particles];for(let i=0;i<3600;i++){a.step(1/60);b.step(1/60);}assert.deepEqual(a.snapshot(),b.snapshot());assert.equal(a.particles.length,120);assert.ok(references.every((p,i)=>a.particles[i]===p));assert.ok(a.particles.every(p=>Number.isFinite(p.x+p.y+p.alpha)));}finally{Math.random=saved;}
});
test('H3.3 ambiente: tiempo transcurrido, pausa y delta limitado sin ráfaga al reanudar',()=>{
 const a=createAtmosphereModel(config,{seed:5}),b=createAtmosphereModel(config,{seed:5});for(let i=0;i<60;i++)a.step(1/60);for(let i=0;i<30;i++)b.step(1/30);assert.ok(Math.abs(a.particles[0].x-b.particles[0].x)<.1);assert.ok(Math.abs(a.particles[0].y-b.particles[0].y)<.1);
 a.setPaused(true);const before=a.snapshot();for(let i=0;i<60;i++)a.step(1);assert.deepEqual(a.snapshot(),before);a.setPaused(false);const time=a.snapshot().elapsed;a.step(60);assert.ok(a.snapshot().elapsed-time<=config.maxDelta+.00001);
});
test('H3.3 ambiente: controles independientes, baja/normal y apagado sin cambios tardíos',()=>{
 const m=createAtmosphereModel(config,{seed:21,settings:{...initialAtmosphereSettings(false),intensity:'low'}});const low=m.snapshot().visibleParticles;m.setSettings({intensity:'normal'});assert.ok(m.snapshot().visibleParticles>low);
 for(const kind of ['snow','wind','smoke','lights']){m.setSettings({snow:false,wind:false,smoke:false,lights:false,[kind]:true});assert.equal(m.isAnimating(),true);assert.ok(m.particles.every(p=>p.type===kind||p.alpha===0));if(kind!=='lights')assert.ok(m.lights.every(p=>p.alpha===0));}
 m.setSettings({enabled:false});const frozen=m.snapshot();m.step(1);assert.deepEqual(m.snapshot(),frozen);assert.ok(m.particles.every(p=>p.alpha===0));assert.ok(m.lights.every(p=>p.alpha===0));assert.throws(()=>m.setSettings({intensity:'storm'}));
});
test('H3.3 ambiente: partículas enteras dentro del mapa, estelas dentro de su zona y luces lentas',()=>{
 const m=createAtmosphereModel(config,{seed:99,settings:{...initialAtmosphereSettings(false),intensity:'normal'}});
 for(let i=0;i<1800;i++){
  const previous=m.lights.map(l=>l.alpha);m.step(1/60);
  for(const p of m.particles)if(p.alpha>0){assert.ok(p.x-p.width/2>=0&&p.x+p.width/2<=config.bounds.width);assert.ok(p.y-p.height/2>=0&&p.y+p.height/2<=config.bounds.height);if(p.type==='wind'){const z=config.windZones[p.zone];assert.ok(p.x-p.width/2>=z.x&&p.x+p.width/2<=z.x+z.width);assert.ok(p.y-p.height/2>=z.y&&p.y+p.height/2<=z.y+z.height);}}
  m.lights.forEach((l,j)=>assert.ok(Math.abs(l.alpha-previous[j])<.002));
 }
});
