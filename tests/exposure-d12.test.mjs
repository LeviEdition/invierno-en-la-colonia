import test from 'node:test';import assert from 'node:assert/strict';
import {EXPOSURE_FACES,rollExposureDie} from '../src/domain/exposure-die.mjs';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {createReferenceState} from '../src/domain/reference-state.mjs';
import {createPresentationSequence,exposureText} from '../prototypes/movement-map/presentation-sequence.mjs';
import {D12_FACES,projectExposureDie} from '../prototypes/movement-map/exposure-die-geometry.mjs';
import {eventText} from '../prototypes/play-map/information.mjs';
const outcomes=['bite','frost','frost','wound','wound','wound','none','none','none','none','none','none'];
function setup({name='Mara',equipment=[]}={}){
 let sample=.8,calls=0;const math=Object.create(Math);math.random=()=>{calls++;return sample;};
 const e=createEngine({Math:math,queueMicrotask(){},stateFactory:args=>{const g=createReferenceState(args);g.humans[0].name=name;return g;}});e.start('local');
 const c=e.testBindings,p=c.game.humans[0];c.game.crossResolved=true;c.game.crossPending=false;c.game.leaders.human='h1';c.game.leaderChosen=true;c.game.dice=[6,6];p.equipment=equipment.map(id=>c.catalog.create(id));
 return {e,c,p,roll(face){sample=(face-.5)/12;calls=0;},calls:()=>calls};
}
function perform(t,kind){
 if(kind==='move')return t.e.moveById({...t.e.movementOptions('h0'),destination:2});
 const q=t.e.actionOptions('h0','attack');return t.e.actById({...q,kind:'attack',actorId:'h0',target:q.origin,dieIndex:0,dieValue:q.dice[0].value});
}
test('D12: doce intervalos equiprobables y distribución exacta6/3/2/1',()=>{
 const counts={none:0,wound:0,frost:0,bite:0};for(let face=1;face<=12;face++){let calls=0;const r=rollExposureDie(()=>{calls++;return (face-.5)/12;});assert.equal(calls,1);assert.equal(r.face,face);assert.equal(r.outcome,outcomes[face-1]);assert.deepEqual(r.faces,outcomes);counts[r.outcome]++;assert.equal(rollExposureDie(()=>(face-1)/12).face,face);assert.equal(rollExposureDie(()=>(face-1)/12+1/12-1e-12).face,face);}
 assert.deepEqual(counts,{none:6,wound:3,frost:2,bite:1});assert.equal(EXPOSURE_FACES.length,12);assert.equal(rollExposureDie(()=>1-Number.EPSILON).face,12);for(const invalid of [1,-.01,NaN,Infinity])assert.throws(()=>rollExposureDie(()=>invalid),RangeError);
});
for(const kind of ['move','attack'])for(let face=1;face<=12;face++)test(`D12 ${kind}: cara${face}, efecto/registro/animación de una única tirada`,()=>{
 const t=setup();t.p.loc=kind==='move'?0:2;t.c.game.zones[2].z=2;const before=t.e.snapshot();t.roll(face);const r=perform(t,kind);assert.equal(r.ok,true);
 const e=r.resolution.exposure;assert.equal(t.calls(),1);assert.equal(e.value,face);assert.equal(e.die.face,face);assert.equal(e.die.outcome,outcomes[face-1]);assert.equal(e.effect,outcomes[face-1]);assert.equal(t.p.frost,e.effect==='frost'?1:0);assert.equal(t.p.wounds,e.effect==='wound'?1:0);assert.equal(t.p.dead,e.effect==='bite');
 const events=t.e.playSnapshot().events.filter(e=>e.type==='exposure');assert.equal(events.length,1);assert.deepEqual(events[0].die,e.die);assert.equal(events[0].name,t.p.name);assert.match(eventText(events[0]),new RegExp(e.die.label));if(e.effect==='none'){assert.equal(exposureText(e),'Sin efecto');assert.equal(eventText(events[0]).includes('Sin efecto'),true);}
 const after=t.e.snapshot(),sequence=createPresentationSequence(r);for(let frame=0;frame<100;frame++){const step=sequence.advanceFrame(100);projectExposureDie(e.die.face,{rolling:step.stage==='roll',progress:step.progress});}assert.deepEqual(t.e.snapshot(),after);assert.equal(t.calls(),1);
 assert.equal(after.dice.length,before.dice.length-(kind==='attack'?1:0));assert.equal(after.zones[2].z,kind==='attack'?1:2);assert.equal(t.e.playSnapshot().events.filter(e=>e.type==='exposure').length,1);
});
test('D12: se conservan Paso sigiloso, combustible y protección de armas sin tirar',()=>{
 const silent=setup({name:'Valeria'});silent.roll(1);assert.equal(perform(silent,'move').resolution.exposure.rolled,false);assert.equal(silent.calls(),0);
 for(const equipment of ['pistol','rifle']){const t=setup({equipment:[equipment]});t.p.loc=2;t.c.game.zones[2].z=2;t.roll(1);const e=perform(t,'attack').resolution.exposure;assert.equal(e.rolled,false);assert.equal(e.ability,equipment);assert.equal(t.calls(),0);assert.equal(t.p.dead,false);}
 const fuel=setup();fuel.c.game.items=[fuel.c.catalog.create('gascan')];fuel.roll(1);fuel.c.itemEngine.moveWithFuel(fuel.p,2,'human',0);assert.equal(fuel.calls(),0);assert.equal(fuel.p.loc,2);assert.equal(fuel.p.dead,false);
});
test('D12: Resistencia conserva la cara real y evita solo el primer daño de la ronda',()=>{
 const t=setup({name:'Sol'});t.p.loc=2;t.c.game.zones[2].z=3;t.roll(4);let r=perform(t,'attack');assert.equal(r.resolution.exposure.die.label,'Herida');assert.equal(r.resolution.exposure.effect,'avoided');assert.equal(t.p.wounds,0);assert.equal(t.calls(),1);t.e.dismissAction(t.e.actionSnapshot().operation.operationId);t.roll(4);r=perform(t,'attack');assert.equal(r.resolution.exposure.effect,'wound');assert.equal(t.p.wounds,1);assert.equal(t.calls(),1);
});
test('D12: veinte vértices, treinta aristas, doce pentágonos regulares y cara correcta al frente',()=>{
 const vertices=new Set(),edges=new Set();for(const f of D12_FACES){assert.equal(f.points.length,5);const lengths=[];for(let i=0;i<5;i++){const a=f.points[i],b=f.points[(i+1)%5],key=p=>p.map(x=>x.toFixed(8)).join(',');vertices.add(key(a));edges.add([key(a),key(b)].sort().join('|'));lengths.push(Math.hypot(...a.map((x,i)=>x-b[i])));}assert.ok(lengths.every(n=>Math.abs(n-lengths[0])<1e-8));const mesh=projectExposureDie(f.face),front=mesh.reduce((a,b)=>a.front>b.front?a:b);assert.equal(front.face,f.face);assert.ok(Math.abs(front.front-1)<1e-8);assert.deepEqual(projectExposureDie(f.face,{rolling:true,progress:1}),mesh);assert.deepEqual(projectExposureDie(f.face,{rolling:true,progress:0,reduced:true}),mesh);}
 assert.equal(vertices.size,20);assert.equal(edges.size,30);assert.equal(D12_FACES.length,12);
});
