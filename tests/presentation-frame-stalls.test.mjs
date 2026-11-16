import test from 'node:test';
import assert from 'node:assert/strict';
import {createPresentationSequence} from '../prototypes/movement-map/presentation-sequence.mjs';

const response={resolution:{exposure:{rolled:true,value:3,effect:'wound'}}};
function stages(sequence,delays){
 const result=[sequence.inspect().stage];
 for(let i=0;i<200&&result.at(-1)!=='done';i++){
  const step=sequence.advanceFrame(delays[i%delays.length]);
  if(step.stage!==result.at(-1))result.push(step.stage);
 }
 assert.equal(result.at(-1),'done');
 return result;
}
test('Presentación: fotogramas de 500ms y pausas largas conservan todas las fases',()=>{
 const sequence=createPresentationSequence(response);
 assert.deepEqual(stages(sequence,[500,10000,17,250]),['travel','roll','reveal','consequence','done']);
 assert.equal(sequence.inspect().exposure.value,3);
});
test('Presentación: reducido conserva fases breves y permite finalización expresa e interrupción',()=>{
 assert.deepEqual(stages(createPresentationSequence(response,{reduced:true}),[500]),['travel','roll','reveal','consequence','done']);
 const immediate=createPresentationSequence(response);immediate.advanceFrame(500);assert.equal(immediate.advance(1e6).stage,'done');
 const interrupted=createPresentationSequence(response);interrupted.interrupt();assert.equal(interrupted.advanceFrame(500).stage,'interrupted');
});
test('Presentación: ataque y barricada no inventan fases ausentes con un render lento',()=>{
 const attack=createPresentationSequence(response,{introDuration:550});
 assert.deepEqual(stages(attack,[500]),['travel','roll','reveal','consequence','done']);
 const barricade=createPresentationSequence({resolution:{exposure:{rolled:false,effect:'none'}}},{introDuration:550,resultDuration:0});
 assert.deepEqual(stages(barricade,[500]),['travel','consequence','done']);
});
