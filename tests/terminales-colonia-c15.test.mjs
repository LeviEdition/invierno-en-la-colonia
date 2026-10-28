import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from '../test-support/game-fixture.mjs';

function prepared(){
 const t=fixture();
 t.run('game.food=30;game.morale=1;game.waste=0;game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0});game.crisis={type:"comida",need:2,given:4,contributions:Array(4).fill("comida"),fail:"moral"};');
 return t;
}
const zones=t=>t.state('game.zones');
test('C15 | hambre termina en moral cero antes de que una bonificación de crisis la recupere',()=>{
 const t=prepared();t.run('game.food=0;');const before=zones(t);t.run('colony();');
 assert.deepEqual(t.state('({morale:game.morale,ended:game.ended,hunger:game.hunger,given:game.crisis.given})'),{morale:0,ended:true,hunger:1,given:4});
 assert.deepEqual(zones(t),before);
});
test('C15 | residuos terminan la partida después de alimentar y antes de resolver crisis',()=>{
 const t=prepared();t.run('game.waste=10;');const before=zones(t);t.run('colony();');
 assert.deepEqual(t.state('({morale:game.morale,ended:game.ended,food:game.food,given:game.crisis.given})'),{morale:0,ended:true,food:27,given:4});
 assert.deepEqual(zones(t),before);
});
test('C15 | una crisis terminal se resuelve una vez y no añade oleadas posteriores',()=>{
 const t=prepared();t.run('game.crisis.given=0;game.crisis.contributions=[];');const before=zones(t);t.run('colony();');
 assert.equal(t.state('game.ended'),true);assert.equal(t.state('game.morale'),0);assert.deepEqual(zones(t),before);
 assert.equal(t.state('game.log.filter(x=>x.includes("Crisis fallida")).length'),1);
});
test('C15 | una oleada se detiene en el primer desbordamiento que provoca derrota',()=>{
 const t=prepared();t.run('game.crisis.given=2;game.crisis.contributions=["comida","comida"];game.zones[0].z=zcap[0];colony();');
 assert.equal(t.state('game.ended'),true);assert.equal(t.state('game.morale'),0);
 assert.deepEqual(t.state('all().filter(p=>p.dead).map(p=>p.name)'),['Sol']);
 assert.equal(t.state('game.zones[0].z'),12);
});
test('C15 | ruido terminal no provoca otra muerte ni retira fichas posteriores',()=>{
 const t=prepared();
 t.run('game.crisis.given=2;game.crisis.contributions=["comida","comida"];game.humans.forEach(p=>p.loc=1);game.bots.forEach(p=>p.loc=3);game.zones[0].z=zcap[0];game.zones[0].noise=2;game.helpless=1;');
 // La oleada base ocupa el último acceso; el primer ruido desborda.
 t.run('game.zones[0].z=zcap[0]-1;game.zones[2].noise=1;');t.roll(1);t.run('colony();');
 assert.equal(t.state('game.ended'),true);assert.equal(t.state('game.morale'),0);
 assert.equal(t.state('game.helpless'),0);
 assert.equal(t.state('game.log.filter(x=>x.includes("ruido")).length'),1);
 assert.equal(t.state('game.zones[2].noise'),1);
});
test('C15 | invocar colonia después del final no cambia la partida',()=>{
 const t=prepared();t.run('game.morale=0;verify();');const before=t.state('game');t.run('colony();');
 assert.deepEqual(t.state('game'),before);
});
for(const phase of ['en cola','visible'])test('C15 | sucesión espera confirmación del fallecimiento '+phase,async()=>{
 const t=fixture({render:true});
 t.run('game.leaderChosen=true;kill(game.humans[0],"regresión C15");paint();');
 if(phase==='visible')await Promise.resolve();
 const before=t.state('({leaders:game.leaders,queue:pendingLeaderSides})');
 t.run('chooseLeader("h1");');
 assert.deepEqual(t.state('({leaders:game.leaders,queue:pendingLeaderSides})'),before);
 await Promise.resolve();t.run('deathDirector.continue();chooseLeader("h1");');
 assert.equal(t.state('game.leaders.human'),'h1');
 assert.deepEqual(t.state('pendingLeaderSides'),[]);
});
