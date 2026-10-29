import test from 'node:test';import assert from 'node:assert/strict';import {fixture} from '../test-support/game-fixture.mjs';
test('D2: draw presenta rescates pendientes sin procesarlos ni alterar estado/azar',()=>{
 const t=fixture({render:true});t.run('game.rescueQueue=[{side:"human"}];processRescueQueue=()=>{throw Error("La vista procesó una regla")};Math.random=()=>{throw Error("La vista consumió azar")};');
 const before=t.state('game');t.run('draw()');assert.deepEqual(t.state('game'),before);assert.equal(t.node('status').innerHTML.includes('Rescates'),true);
});
