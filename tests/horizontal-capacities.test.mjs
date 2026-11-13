import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {createReferenceData} from '../src/domain/reference-data.mjs';
import {projectVisibleState} from '../prototypes/state-map/projection.mjs';
const expected=[12,4,4,4,2,4,3];
const session=()=>{const e=createEngine({queueMicrotask(){},Math:Object.assign(Object.create(Math),{random:()=>.8})});e.start('local');return {e,c:e.testBindings};};
test('Capacidades mapa: motor/proyección/posiciones coinciden en33; plazas y referencia estables',()=>{
 const {e,c}=session(),p=projectVisibleState(c,{renderedPlayable:true});
 assert.deepEqual(c.zcap,expected);assert.deepEqual(c.capacity,[12,4,4,4,4,4,4]);assert.deepEqual(createReferenceData().zcap,[12,4,4,4,4,4,4]);
 const scene=JSON.parse(readFileSync(new URL('../prototypes/horizontal-map/scene.json',import.meta.url)));
 assert.equal(p.locations.reduce((n,l)=>n+l.exteriorCapacity,0),33);
 for(const l of p.locations)assert.equal(scene.zones.find(z=>z.id===['colonia','supermercado','hospital','comisaria','gasolinera','escuela','biblioteca'][l.engineIndex]).accesses.length,l.exteriorCapacity);
});
test('Capacidades mapa: mixtas llenas, rechazo sin coste y zombi que rompe barricada en las siete',()=>{
 for(let i=0;i<7;i++){const {e,c}=session(),p=c.game.humans[0],z=c.game.zones[i];p.loc=i;z.z=expected[i]-1;z.b=1;
 const before=e.snapshot();assert.equal(c.openAccess(i),false);assert.equal(e.actionOptions(p.id,'barricade').reason,'full');assert.equal(e.actById({...e.actionOptions(p.id,'barricade'),target:i,dieIndex:0,dieValue:5}).reason,'full');assert.deepEqual(e.snapshot(),before);
 c.addZombie(i);assert.equal(z.z,expected[i]-1);assert.equal(z.b,0);assert.equal(c.openAccess(i),true);c.addZombie(i);assert.equal(z.z,expected[i]);assert.equal(c.openAccess(i),false);
 }
});
test('Capacidades mapa: saturación mata según regla original; estado antiguo no se trunca ni resuelve retroactivamente',()=>{
 for(const i of [4,6]){const {e,c}=session(),p=c.game.humans[0],z=c.game.zones[i];p.loc=i;z.z=expected[i];z.b=0;c.addZombie(i);assert.equal(p.dead,true);assert.equal(z.z,expected[i]);
 const t=session();t.c.game.zones[i].z=4;const before=t.e.snapshot();const projection=projectVisibleState(t.c,{renderedPlayable:true});assert.equal(projection.locations[i].zombies,4);assert.equal(projection.locations[i].exteriorAvailable,expected[i]-4);assert.deepEqual(t.e.snapshot(),before);
 }
});
