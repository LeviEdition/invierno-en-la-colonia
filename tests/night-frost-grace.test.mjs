import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,silentCross} from '../test-support/game-fixture.mjs';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {continueNight} from '../src/domain/reference-night.mjs';
import {eventText} from '../app/mapa/juego/information.mjs';

function setup(night=true){
 const t=fixture({mode:'solo',seed:5});
 t.run('setTestRules({laNoche:'+night+'});create();'+silentCross+
  'game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});game.food=40;game.waste=0;'+
  'game.crisis.contributions=Array(game.crisis.need).fill(game.crisis.type);game.crisis.given=game.crisis.need;'+
  'game.humans.forEach(p=>{p.loc=0;p.skill="";p.wounds=0;p.frost=0;});game.humans[0].loc=2;Math.random=()=>.12;');
 return t;
}
test('congelación nocturna: salta solo el inicio inmediato y cobra el siguiente',async()=>{
 const t=setup();await t.run('finishTurn()');
 assert.equal(t.state('game.round'),2);
 assert.equal(t.state('game.humans[0].frost'),1);
 assert.equal(t.state('game.humans[0].wounds'),0);
 assert.equal(t.state('!!game.humans[0].frostFresh'),false);
 t.run('game.round++;applyFrost("human");');
 assert.equal(t.state('game.humans[0].wounds'),1);
 assert.ok(t.state('game.log').some(s=>s.includes('el frío le pasará factura la ronda que viene')));
});

test('congelación diurna y regla apagada: conservan el cobro normal',()=>{
 for(const night of [false,true]){
  const t=setup(night);t.run('Math.random=()=>.25;expose(game.humans[0],"movimiento");');
  assert.equal(t.state('game.humans[0].frost'),1);assert.equal(t.state('!!game.humans[0].frostFresh'),false);
  t.run('applyFrost("human");');assert.equal(t.state('game.humans[0].wounds'),1);
 }
 const t=setup(false);t.run('game.humans[0].frost=1;game.humans[0].frostFresh=true;applyFrost("human");');
 assert.equal(t.state('game.humans[0].wounds'),1);
});

test('otra congelación diurna elimina la gracia; el frío anterior no recibe otra gracia',()=>{
 const t=setup();t.run('colony();');assert.equal(t.state('game.humans[0].frostFresh'),true);
 t.run('Math.random=()=>.25;expose(game.humans[0],"movimiento");');assert.equal(t.state('!!game.humans[0].frostFresh'),false);
 t.run('applyFrost("human");');assert.equal(t.state('game.humans[0].dead'),true,'dos congelaciones y una herida siguen matando');
 const old=setup();old.run('game.humans[0].frost=1;colony();');
 assert.equal(old.state('!!game.humans[0].frostFresh'),false);
 old.run('applyFrost("human");');assert.equal(old.state('game.humans[0].dead'),true);
});

test('la congelación nocturna sigue matando al sumar tres daños',()=>{
 const t=setup();t.run('game.humans[0].wounds=2;colony();');
 assert.equal(t.state('game.humans[0].dead'),true);
 assert.equal(t.state('!!game.humans[0].frostFresh'),false);
});

test('la enfermera quita la congelación y la marca, sin proteger un frío posterior',()=>{
 const t=setup();t.run('colony();game.humans[1].loc=2;game.humans[1].skill="nurse";selected=1;special();chooseHeal("h0");');
 assert.equal(t.state('game.humans[0].frost'),0);assert.equal(t.state('!!game.humans[0].frostFresh'),false);
 t.run('Math.random=()=>.25;expose(game.humans[0],"movimiento");applyFrost("human");');assert.equal(t.state('game.humans[0].wounds'),1);
});

for(const card of ['bandage','medkit','antifrost'])test('tratar con '+card+' elimina la marca',()=>{
 const t=setup();t.run('colony();game.items=[catalog.create("'+card+'")];itemEngine.use(0,game.humans[0]);');
 assert.equal(t.state('game.humans[0].frost'),0);assert.equal(t.state('!!game.humans[0].frostFresh'),false);
});

test('mapa D12: otra congelación diurna invalida la gracia sin azar adicional',()=>{
 let calls=0;const e=createEngine({queueMicrotask(){},Math:Object.assign(Object.create(Math),{random:()=>{calls++;return .12;}})});
 e.initialize();e.playExecute({kind:'test-rules',rule:'laNoche',value:'true'});e.playExecute({kind:'start',mode:'solo',confirmed:false});
 const c=e.testBindings,p=c.game.humans[0];p.frost=1;p.frostFresh=true;p.skill='';
 const before=calls;e.moveById({...e.movementOptions(p.id),destination:2});
 assert.equal(calls-before,1);assert.equal(p.frost,2);assert.equal(!!p.frostFresh,false);
});

test('curar solo una herida conserva la gracia',()=>{
 const t=setup();t.run('colony();game.humans[0].wounds=1;game.items=[catalog.create("bandage")];itemEngine.use(0,game.humans[0]);');
 assert.equal(t.state('game.humans[0].frostFresh'),true);
});

test('el Registro del mapa recibe el aviso de gracia sin otra tirada',()=>{
 let calls=0;const e=createEngine({queueMicrotask(){},Math:Object.assign(Object.create(Math),{random:()=>{calls++;return .12;}})});
 e.initialize();e.playExecute({kind:'test-rules',rule:'laNoche',value:'true'});e.playExecute({kind:'start',mode:'solo',confirmed:false});
 const c=e.testBindings;c.game.humans[0].loc=2;c.game.humans[0].skill='';c.game.nightRemaining=[2];
 const before=calls;continueNight(c);
 const event=e.playSnapshot().events.find(e=>e.type==='frost-grace');
 assert.ok(event);assert.match(eventText(event),/el frío le pasará factura/);assert.equal(calls-before,1);
});
