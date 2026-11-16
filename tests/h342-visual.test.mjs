import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {portraitFor,initials,layoutState} from '../prototypes/movement-map/layout.mjs';
import {dieFace} from '../prototypes/movement-map/dice.mjs';
import {createAtmosphereModel,initialAtmosphereSettings} from '../prototypes/movement-map/storm-model.mjs';
const config=JSON.parse(await readFile(new URL('../prototypes/movement-map/storm.json',import.meta.url)));
test('H342 identidad: cuatro retratos únicos; fallecimientos/reclutas no reasignan identidades',()=>{
 const ids=['h0','h1','h2','a0','a1','a2','h6'],used=ids.map(portraitFor).filter(Boolean);assert.equal(used.length,4);assert.equal(new Set(used).size,4);assert.notEqual(portraitFor('a1'),portraitFor('h0'));assert.equal(portraitFor('h2'),null);assert.equal(portraitFor('a2'),null);assert.equal(portraitFor('h6'),null);assert.equal(initials('Bruno'),'B');const before=Object.fromEntries(ids.map(id=>[id,portraitFor(id)]));ids.splice(0,1);assert.deepEqual(Object.fromEntries(ids.map(id=>[id,portraitFor(id)])),Object.fromEntries(Object.entries(before).filter(([id])=>id!=='h0')));
});
test('H342 dados: puntos 1–6; valores adicionales fieles sin recortes',()=>{for(let n=1;n<=6;n++)assert.equal(dieFace(n).pips.length,n);for(const n of [0,7,12,-1,1.5]){assert.equal(dieFace(n).pips,null);assert.equal(dieFace(n).label,String(n));}});
test('H342 tormenta: pool acotado/reutilizado, perfiles diferentes, tiempo/delta/pausa y RNG propios',()=>{
 assert.equal(initialAtmosphereSettings().intensity,'storm');assert.equal(initialAtmosphereSettings(true).enabled,false);const soft=createAtmosphereModel(config,{seed:12,settings:{intensity:'soft'}}),storm=createAtmosphereModel(config,{seed:12,settings:{intensity:'storm'}}),pool=storm.particles.slice();assert.equal(storm.particles.length,158);assert.ok(storm.particles.some(p=>p.foreground));for(let i=0;i<60;i++){soft.step(1/30);storm.step(1/30);}assert.ok(storm.snapshot().visibleParticles>soft.snapshot().visibleParticles);assert.notEqual(storm.particles[1].x,soft.particles[1].x);assert.notEqual(storm.particles[1].y,soft.particles[1].y);assert.ok(pool.every((p,i)=>p===storm.particles[i]));storm.setPaused(true);const before=storm.snapshot();storm.step(100);assert.deepEqual(storm.snapshot(),before);storm.setPaused(false);const elapsed=storm.snapshot().elapsed;storm.step(100);assert.ok(storm.snapshot().elapsed-elapsed<=config.maxDelta+.00001);storm.setSettings({enabled:false});assert.equal(storm.isAnimating(),false);
});

test('H342: identificadores sin randomUUID para HTTP de red local',async()=>{const {uniqueToken}=await import('../prototypes/movement-map/nonce.mjs');const source={getRandomValues:a=>a.fill(42)};assert.equal(uniqueToken(source),'2a'.repeat(16));});
