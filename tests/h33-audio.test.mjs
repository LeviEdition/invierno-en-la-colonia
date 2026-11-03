import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindAudio} from '../prototypes/hospital-workshop/mockup/atmosphere-audio.mjs';
const config={bufferSeconds:4,volume:.4,highpass:90,lowpass:1600,gustPeriod:11,maxGain:.35};
function fakeContext(){
 const nodes=[];const param=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;}});
 const node=()=>{const n={gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){this.disconnected=true;},start(){this.started=true;},stop(){this.stopped=true;},getFloatTimeDomainData(a){a.fill(.02);}};nodes.push(n);return n;};
 const ctx={state:'suspended',sampleRate:8000,currentTime:0,destination:{},nodes,createGain:node,createBiquadFilter:node,createAnalyser:node,createBufferSource:node,createOscillator:node,createBuffer:(channels,n)=>({getChannelData:()=>new Float32Array(n)}),resume(){this.state='running';return Promise.resolve();},suspend(){this.state='suspended';return Promise.resolve();},close(){this.state='closed';return Promise.resolve();}};return ctx;
}
test('H3.3 audio: inicia sin contexto ni sonido y activa solo expresamente',async()=>{
 let created=0;const ctx=fakeContext(),audio=createWindAudio(config,{contextFactory:()=>{created++;return ctx;},seed:8});assert.equal(created,0);assert.equal(audio.inspect().enabled,false);audio.setEnabled(true);await Promise.resolve();assert.equal(created,1);assert.equal(audio.inspect().state,'running');assert.ok(audio.inspect().rms>0);audio.setVolume(.25);assert.equal(audio.inspect().volume,.25);audio.setEnabled(false);assert.equal(audio.inspect().state,'suspended');audio.setEnabled(true);assert.equal(created,1);await audio.destroy();assert.equal(ctx.state,'closed');assert.ok(ctx.nodes.every(n=>n.disconnected));assert.ok(ctx.nodes.filter(n=>n.started).every(n=>n.stopped));
});
test('H3.3 audio: pausa independiente, silencio inmediato y reanudación de la misma instancia',async()=>{
 const ctx=fakeContext(),audio=createWindAudio(config,{contextFactory:()=>ctx,seed:4});audio.setEnabled(true);audio.setPaused(true);assert.equal(audio.inspect().enabled,true);assert.equal(audio.inspect().state,'suspended');assert.equal(audio.inspect().rms,0);audio.setPaused(false);assert.equal(audio.inspect().state,'running');audio.setVolume(0);assert.equal(audio.inspect().volume,0);await audio.destroy();
});
test('H3.3 audio: fallo recuperable y resume tardío después de destruir no publica estado',async()=>{
 let notifications=0,calls=0;const ctx=fakeContext();let finish;ctx.resume=()=>new Promise(resolve=>finish=resolve);const audio=createWindAudio(config,{contextFactory:()=>{if(!calls++)throw Error('Audio no disponible');return ctx;},seed:2,onChange:()=>notifications++});audio.setEnabled(true);assert.equal(audio.inspect().enabled,false);assert.match(audio.inspect().error,/Audio no disponible/);audio.setEnabled(true);assert.equal(audio.inspect().enabled,true);await audio.destroy();const before=notifications;finish();await Promise.resolve();assert.equal(notifications,before);assert.equal(ctx.state,'closed');assert.equal(audio.inspect().enabled,false);
});
