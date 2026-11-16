import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {createEngine} from '../src/application/reference-engine.mjs';
import {observeReferenceView} from '../prototypes/state-map/reference-observer.mjs';
import {createAtmosphereModel} from '../prototypes/hospital-workshop/mockup/atmosphere-model.mjs';
const weatherConfig=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/mockup/atmosphere.json',import.meta.url)));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function session(){let value=.5,calls=0,context,last;const math=Object.create(Math);math.random=()=>{calls++;return value;};const engine=createEngine({Math:math});
 engine.connectPresentation(ctx=>{context=ctx;return observeReferenceView(ctx,tracked=>new Proxy({draw(){tracked.playable();},dispose(){}},{get(target,key){return key in target?target[key]:()=>{};}}),{onState:p=>last=p});});
 return {engine,get context(){return context;},get projection(){return last;},random(x){value=x;},calls:()=>calls};}
async function settle(t){for(let i=0;i<16;i++){await tick();const g=t.engine.snapshot();if(g.crossPending){const choice=t.context.crossroadsView().allowed.findIndex(Boolean);assert.ok(choice>=0);t.engine.dispatch('crossChoose',choice);continue;}if(t.projection?.blocked==='death'){t.engine.dispatch('deathContinue');continue;}if(t.projection?.blocked==='decision'&&t.context.opened==='leaderChoice'){t.engine.dispatch('chooseLeader',t.context.controls.group().find(p=>!p.dead).id);continue;}if(t.projection?.blocked==='handover'){t.engine.dispatch('confirmPass');continue;}return;}throw Error('Preparación no completada');}
function correspondence(t){const g=t.engine.snapshot(),p=t.projection;assert.equal(p.blocked,null);assert.equal(p.round,g.round);assert.equal(p.food,g.food);assert.equal(p.morale,g.morale);assert.equal(p.characters.length,[...g.humans,...g.bots].filter(c=>!c.dead).length);for(const c of p.characters){const real=[...g.humans,...g.bots].find(x=>x.id===c.id);assert.equal(c.locationId,'place-'+real.loc);assert.equal(c.wounds,real.wounds);assert.equal(c.frost,real.frost);}for(const z of p.locations){assert.equal(z.zombies,g.zones[z.engineIndex].z);assert.equal(z.barricades,g.zones[z.engineIndex].b);}assert.deepEqual(p.dice.available,g.turn==='ai'?g.botDice:g.dice);}

test('H3.4.1 real: movimiento, heridas, cura, barricadas, recursos, dados y ronda se sincronizan',async()=>{
 const t=session();t.engine.start('local');await settle(t);correspondence(t);const chosen=t.engine.snapshot().leaderChosen;
 const before=t.engine.snapshot(),rng=t.calls();t.context.catalog.resolve('pistol');await tick();assert.equal(t.engine.snapshot().leaderChosen,chosen);assert.deepEqual(t.engine.snapshot(),before);assert.equal(t.calls(),rng);
 t.engine.dispatch('chooseLeader','h0');await settle(t);t.random(.34);t.engine.dispatch('destination',2);t.engine.dispatch('doMove');await settle(t);correspondence(t);let g=t.engine.snapshot();assert.equal(g.humans[0].loc,2);assert.ok(g.humans[0].wounds>0);const injury=g.humans[0].wounds;
 t.engine.dispatch('playItem',1);await settle(t);correspondence(t);assert.ok(t.engine.snapshot().humans[0].wounds<injury);const weapon=t.engine.snapshot().items.findIndex(it=>it.cardId==='pistol');t.engine.dispatch('profile','h0');t.engine.dispatch('equipItem',weapon);t.engine.dispatch('hide');await settle(t);assert.equal(t.projection.characters.find(c=>c.id==='h0').equipment[0].id,'pistol');const geared=t.engine.snapshot(),gearRng=t.calls();await tick();assert.deepEqual(t.engine.snapshot(),geared);assert.equal(t.calls(),gearRng);
 t.engine.dispatch('select',1);t.engine.dispatch('special');await settle(t);assert.equal(t.engine.snapshot().zones[0].b,1);correspondence(t);
 const count=t.engine.snapshot().dice.length;t.engine.dispatch('barricade');await settle(t);assert.equal(t.engine.snapshot().dice.length,count-1);correspondence(t);
 const food=t.engine.snapshot().food;t.engine.dispatch('boostDie',0);await settle(t);assert.equal(t.engine.snapshot().food,food-1);correspondence(t);
 t.random(.5);await t.engine.dispatch('finishTurn');await tick();assert.equal(t.projection.blocked,'handover');assert.deepEqual(t.projection.characters,[]);await settle(t);assert.equal(t.projection.dice.ownerId,'ai');
 await t.engine.dispatch('finishTurn');await settle(t);assert.equal(t.engine.snapshot().round,2);correspondence(t);
});
test('H3.4.1 real: la ambientación activada/apagada no altera la partida ni el RNG observado',async()=>{
 async function run(enabled){const t=session(),weather=createAtmosphereModel(weatherConfig,{seed:93,settings:{enabled}});t.engine.start('local');await settle(t);for(const command of [['chooseLeader','h0'],['destination',2],['doMove'],['select',1],['special'],['barricade'],['boostDie',0]]){t.engine.dispatch(...command);await settle(t);const before=t.engine.snapshot(),rng=t.calls();for(let i=0;i<120;i++)weather.step(1/30);await tick();assert.deepEqual(t.engine.snapshot(),before);assert.equal(t.calls(),rng);}return {game:t.engine.snapshot(),rng:t.calls()};}
 assert.deepEqual(await run(true),await run(false));
});
