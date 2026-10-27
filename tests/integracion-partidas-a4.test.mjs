// A4: Integración sobre V9.9 intacta. DOM simulado, RNG y mazos preparados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createContext,runInContext} from 'node:vm';
const html=readFileSync(join(dirname(fileURLToPath(import.meta.url)),'..','invierno_colonia_v9_9.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1);
const boot=/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1],boot);const source=scripts[0][1].replace(boot,'');
function fixture(mode='local'){
 const math=Object.create(Math);math.random=()=>5.5/6;
 const nodes=new Map();
 function node(id){
  if(!nodes.has(id)){const cls=new Set();nodes.set(id,{
   hidden:true,disabled:false,innerHTML:'',textContent:'',style:{},dataset:{},
   classList:{add(x){cls.add(x)},remove(x){cls.delete(x)},contains(x){return cls.has(x)}},
   setAttribute(){},focus(){},appendChild(){},remove(){}
  });}
  return nodes.get(id);
 }
 const document={getElementById:node,addEventListener(){},querySelector(s){return node(s)}};
 const ctx=createContext({document,Math:math,queueMicrotask(){},setTimeout(fn){fn();return 0}});
 runInContext(source,ctx,{filename:'invierno_colonia_v9_9.js',timeout:3000});
 runInContext('toast=()=>{};toggleFab=()=>{};gameMode='+JSON.stringify(mode)+';create();passScreenActive=false;game.crossPending=false;game.crossResolved=true;',ctx);
 return {run(s){return runInContext(s,ctx,{timeout:3000})},val(s){return JSON.parse(runInContext('JSON.stringify('+s+')',ctx,{timeout:3000}))},node};
}
function quiet(t){
 t.run('game.crossRemaining=Array(30).fill(crossroadsDeck.findIndex(c=>c.title==="Un almacén bajo el hielo"));game.crossPending=false;game.crossResolved=true;');
}
function stable(t){
 quiet(t);
 t.run('game.food=30;game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
}
async function both(t){
 await t.run('finishTurn()');assert.equal(t.val('passScreenActive'),true);
 t.run('confirmPass();game.crossPending=false;game.crossResolved=true;');
 await t.run('finishTurn()');
}
test('A4 | local recorre J1, pase, J2, fase colonia y ronda siguiente',async()=>{
 const t=fixture();stable(t);await t.run('finishTurn()');
 assert.deepEqual(t.val('({turn:game.turn,round:game.round,pass:passScreenActive,food:game.food})'),{turn:'ai',round:1,pass:true,food:30});
 t.run('confirmPass();');await t.run('finishTurn()');
 assert.deepEqual(t.val('({turn:game.turn,round:game.round,pass:passScreenActive,food:game.food})'),{turn:'human',round:2,pass:true,food:27});
});
test('A4 | dos rondas locales procesan colonia exactamente dos veces',async()=>{
 const t=fixture();stable(t);await both(t);
 t.run('confirmPass();game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
 await both(t);
 assert.equal(t.val('game.round'),3);assert.equal(t.val('game.food'),24);
 assert.equal(t.val('game.log.filter(x=>x.includes("Fase de colonia:")).length'),2);
});
test('A4 | nueva ronda local restablece dados y movimientos',async()=>{
 const t=fixture();stable(t);
 t.run('game.dice=[];game.botDice=[];all().forEach(p=>p.moved=true);');
 await both(t);
 assert.equal(t.val('game.round'),2);assert.equal(t.val('game.dice.length'),4);assert.equal(t.val('game.botDice.length'),4);
 assert.equal(t.val('all().every(p=>!p.moved)'),true);
});
test('A4 | límite temporal produce derrota después de ambos turnos locales',async()=>{
 const t=fixture();stable(t);t.run('game.max=1;');
 await t.run('finishTurn()');assert.equal(t.val('game.ended'),false);
 t.run('confirmPass();');await t.run('finishTurn()');
 assert.deepEqual(t.val('({end:game.ended,round:game.round,turn:game.turn})'),{end:true,round:2,turn:'end'});
 assert.match(t.val('game.last'),/agotaron las rondas/);
});
test('A4 | tras derrota temporal no puede avanzar otra ronda',async()=>{
 const t=fixture();stable(t);t.run('game.max=1;');await both(t);await t.run('finishTurn()');
 assert.equal(t.val('game.round'),2);assert.equal(t.val('game.ended'),true);
});
test('A4 | hambre y moral cero causan derrota al resolver colonia',async()=>{
 const t=fixture();quiet(t);
 t.run('game.food=0;game.morale=1;game.zones.forEach(z=>{z.z=0;z.noise=0});game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
 await t.run('finishTurn()');assert.equal(t.val('game.ended'),false);t.run('confirmPass();');await t.run('finishTurn()');
 assert.equal(t.val('game.ended'),true);assert.equal(t.val('game.morale'),0);assert.match(t.val('game.last'),/moral llegó a cero/);
});
test('A4 | muestra obtenida por búsqueda se guarda y puntúa al usarse',()=>{
 const t=fixture();
 t.run('game.humans[0].loc=1;game.decks[1].unshift(catalog.create("sample"));game.dice=[6];game.crossResolved=true;search();');
 assert.equal(t.val('!!pendingLoot'),true);t.run('chooseLoot(0);');
 assert.equal(t.val('game.items.at(-1).cardId'),'sample');assert.equal(t.val('game.items.at(-1).finderId'),'h0');
 t.run('playItem(game.items.length-1);');assert.equal(t.val('game.samples'),1);assert.equal(t.val('game.ended'),false);
});
test('A4 | buscar mazo agotado no gasta dado',()=>{
 const t=fixture();
 t.run('game.humans[0].loc=1;game.decks[1]=[];game.dice=[6];game.crossResolved=true;search();');
 assert.deepEqual(t.val('({dice:game.dice,pending:pendingLoot})'),{dice:[6],pending:null});
});
test('A4 | ganar mediante búsqueda y uso de recursos de tres localidades',()=>{
 const t=fixture();
 t.run('game.goal=7;game.dice=Array(15).fill(6);game.crossResolved=true;for(const loc of [1,3,6])game.decks[loc].sort((a,b)=>Number(kind(b)==="muestra")-Number(kind(a)==="muestra"));');
 t.run('for(const [idx,loc,count] of [[0,1,2],[1,3,2],[2,6,3]]){select(idx);destination(loc);doMove();for(let k=0;k<count;k++){search();if(!pendingLoot)throw Error("Sin botín");chooseLoot(0);playItem(game.items.length-1);}}');
 assert.deepEqual(t.val('({samples:game.samples,goal:game.goal,end:game.ended,turn:game.turn,round:game.round})'),
 {samples:7,goal:7,end:true,turn:'end',round:1});
 assert.match(t.val('game.last'),/Victoria/);
});
