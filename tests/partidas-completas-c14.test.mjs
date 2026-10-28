import test from 'node:test';
import assert from 'node:assert/strict';
import {runGame} from '../test-support/run-game.mjs';
for(const mode of ['ai','local'])test('C14 | veinte partidas completas con motor real: '+mode,{timeout:90000},async()=>{
 for(let i=1;i<=20;i++){
  const seed=Math.imul(i,2654435761)>>>0,record=await runGame({mode,seed});
  const label=mode+'/'+seed;
  assert.deepEqual(record.exceptions,[],label);assert.deepEqual(record.invariants,[],label);
  assert.equal(record.completed,true,label);assert.equal(record.final.ended,true,label);
  assert.ok(['victory','morale','survivors','time'].includes(record.final.result),label);
  for(const [key,value] of Object.entries(record.final.pending))assert.ok(key==='leaders'?value.length===0:!value,label+': pendiente '+key);
 }
});
