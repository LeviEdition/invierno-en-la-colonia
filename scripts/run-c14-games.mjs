import {writeFile,mkdir} from 'node:fs/promises';
import {runGame} from '../test-support/run-game.mjs';
const count=Number(process.env.C14_COUNT||20),out=process.env.C14_OUTPUT_DIR||'/tmp/c14-games';await mkdir(out,{recursive:true});
if(!Number.isInteger(count)||count<1)throw Error('C14_COUNT debe ser entero positivo');
const records=[];
for(const mode of ['ai','local'])for(let i=1;i<=count;i++){
 const seed=Math.imul(i,2654435761)>>>0;
 const record=await runGame({mode,seed});records.push(record);
 console.log(JSON.stringify({mode,seed,completed:record.completed,result:record.final.result,round:record.final.round,violations:record.invariants,exceptions:record.exceptions.map(x=>x.split('\n')[0])}));
}
const summary={strategy:records[0]?.strategy,modes:Object.fromEntries(['ai','local'].map(mode=>{const games=records.filter(r=>r.mode===mode);return [mode,{attempts:games.length,completed:games.filter(r=>r.completed).length,wins:games.filter(r=>r.completed&&r.final.result==='victory').length,losses:games.filter(r=>r.completed&&r.final.result!=='victory').length,interruptions:games.filter(r=>!r.completed).length,rounds:games.map(r=>r.roundsPlayed),roundStats:{min:Math.min(...games.map(r=>r.roundsPlayed)),max:Math.max(...games.map(r=>r.roundsPlayed)),mean:games.reduce((n,r)=>n+r.roundsPlayed,0)/games.length},
 outcomes:Object.fromEntries(['victory','morale','survivors','time'].map(key=>[key,games.filter(r=>r.completed&&r.final.result===key).length])),
 characterDeaths:games.reduce((n,r)=>n+r.events.deaths.length,0),helplessDeaths:games.reduce((n,r)=>n+r.events.messages.filter(m=>m.includes('Murió un superviviente indefenso')).length,0),
 recruits:games.reduce((n,r)=>n+r.events.recruits.length,0),replacements:games.reduce((n,r)=>n+r.events.recruits.filter(e=>e.replacement).length,0),leaderChanges:games.reduce((n,r)=>n+r.events.leaders.length,0),
 crises:games.reduce((n,r)=>n+r.events.crises.length,0),crisesSucceeded:games.reduce((n,r)=>n+r.events.crises.filter(c=>c.given>=c.need).length,0),crossroads:games.reduce((n,r)=>n+r.events.crossroads.length,0),
 objectives:games.reduce((a,r)=>{a[r.initial.objective.name]=(a[r.initial.objective.name]||0)+1;return a;},{}),
 exceptions:games.flatMap(r=>r.exceptions),invariants:games.flatMap(r=>r.invariants)}];}))};
await writeFile(out+'/partidas.jsonl',records.map(r=>JSON.stringify(r)).join('\n')+'\n');await writeFile(out+'/resumen.json',JSON.stringify(summary,null,2)+'\n');
if(records.some(r=>!r.completed||r.invariants.length||r.exceptions.length))process.exitCode=1;
