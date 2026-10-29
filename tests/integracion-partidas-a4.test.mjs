import {readTestProgram} from '../test-support/game-source.mjs';
// A4: Integración sobre V9.9 intacta. DOM simulado, RNG y mazos preparados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createContext,runInContext} from 'node:vm';
const source=readTestProgram().runtimeSource;
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

test('A4 | victoria bloquea gastar recursos y terminar otro turno',async()=>{
 const t=fixture();t.run('game.samples=game.goal-1;game.items=[catalog.create("notes")];playItem(0);');
 assert.equal(t.val('game.ended'),true);
 const before=t.val('({food:game.food,samples:game.samples,round:game.round})');
 await t.run('finishTurn()');assert.deepEqual(t.val('({food:game.food,samples:game.samples,round:game.round})'),before);
});
test('A4 | dos jugadores aportan muestras a la misma victoria',async()=>{
 const t=fixture();stable(t);
 t.run('game.goal=7;game.items=Array.from({length:3},()=>catalog.create("notes"));game.botItems=Array.from({length:4},()=>catalog.create("notes"));for(let i=0;i<3;i++)playItem(0);');
 assert.equal(t.val('game.samples'),3);
 await t.run('finishTurn()');t.run('confirmPass();for(let i=0;i<4;i++)playItem(0);');
 assert.deepEqual(t.val('({samples:game.samples,ended:game.ended,turn:game.turn,round:game.round})'),
 {samples:7,ended:true,turn:'end',round:1});
});
test('A4 | una encrucijada activada durante búsqueda frena fin de turno',async()=>{
 const t=fixture();
 t.run('game.humans[0].loc=1;game.dice=[6];game.decks[1].unshift(catalog.create("ration"));game.crossCard=crossroadsDeck.findIndex(c=>c.title==="La radio encendida");game.crossOwner="human";game.crossPending=false;game.crossResolved=false;search();chooseLoot(0);');
 assert.equal(t.val('game.crossPending'),true);
 const food=t.val('game.food');
 await t.run('finishTurn()');assert.equal(t.val('game.turn'),'human');
 t.run('crossChoose(1);');
 assert.equal(t.val('game.crossPending'),false);
 assert.equal(t.val('game.food'),food);
 assert.equal(t.val('game.morale'),10);
 await t.run('finishTurn()');assert.equal(t.val('game.turn'),'ai');
});
test('A4 | el rescate queda esperando si colonia llena y llega cuando se libera',()=>{
 const t=fixture();
 t.run('game.helpless=6;stashLoot(catalog.create("rescue"),game.humans[0],"human");');
 assert.deepEqual(t.val('({queue:game.rescueQueue.length,group:game.humans.length})'),{queue:1,group:3});
 t.run('game.helpless=5;processRescueQueue();');
 assert.deepEqual(t.val('({queue:game.rescueQueue.length,group:game.humans.length})'),{queue:0,group:4});
});
test('A4 | IA completa turno y fase colonia sin asistencia',async()=>{
 const t=fixture('ai');stable(t);
 t.run('game.botItems=[];game.botDice=[];game.bots.forEach(p=>p.moved=true);');
 await t.run('finishTurn()');
 assert.deepEqual(t.val('({round:game.round,turn:game.turn,mode:game.mode,ended:game.ended})'),
 {round:2,turn:'human',mode:'ai',ended:false});
 assert.equal(t.val('game.log.some(x=>x.includes("Comienza el turno de la IA"))'),true);
 assert.equal(t.val('game.log.some(x=>x.includes("Fase de colonia:"))'),true);
});
test('A4 | IA encuentra muestra en mazo usando búsqueda real',async()=>{
 const t=fixture('ai');stable(t);
 t.run('game.botItems=[];game.botDice=[6];game.bots[0].loc=1;game.bots.forEach(p=>p.moved=true);game.decks[1].unshift(catalog.create("sample"));');
 await t.run('finishTurn()');
 assert.equal(t.val('game.samples'),1);
 assert.equal(t.val('game.round'),2);
 assert.equal(t.val('game.ended'),false);
});
test('A4 | modo IA también alcanza derrota por límite de rondas',async()=>{
 const t=fixture('ai');stable(t);
 t.run('game.max=1;game.botItems=[];game.botDice=[];game.bots.forEach(p=>p.moved=true);');
 await t.run('finishTurn()');
 assert.deepEqual(t.val('({ended:game.ended,turn:game.turn,round:game.round})'),{ended:true,turn:'end',round:2});
 assert.match(t.val('game.last'),/agotaron las rondas/);
});
test('A4 | IA puede ganar por notas si la colonia resiste hasta verificar',async()=>{
 const t=fixture('ai');stable(t);
 t.run('game.goal=2;game.botItems=[catalog.create("notes"),catalog.create("notes")];game.botDice=[];game.bots.forEach(p=>p.moved=true);');
 await t.run('finishTurn()');
 assert.equal(t.val('game.samples'),2);assert.equal(t.val('game.ended'),true);
 assert.match(t.val('game.last'),/Victoria/);
});
test('C1 #11 | IA gana al completar muestras antes de hambre y fase de colonia',async()=>{
 const t=fixture('ai');quiet(t);
 t.run('game.goal=2;game.food=0;game.morale=1;game.botItems=[catalog.create("notes"),catalog.create("notes")];game.botDice=[];game.bots.forEach(p=>p.moved=true);game.zones.forEach(z=>z.z=0);game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
 await t.run('finishTurn()');
 assert.deepEqual(t.val('({samples:game.samples,ended:game.ended,morale:game.morale,round:game.round,turn:game.turn})'),
  {samples:2,ended:true,morale:1,round:1,turn:'end'});
 assert.equal(t.val('game.log.some(x=>x.includes("Resolviendo fase de colonia"))'),false);
 assert.match(t.val('game.last'),/Victoria/);
});
test('A4 | victoria de J2 evita fase de colonia posterior',async()=>{
 const t=fixture();stable(t);
 t.run('game.samples=game.goal-1;game.botItems=[catalog.create("notes")];');
 await t.run('finishTurn()');t.run('confirmPass();playItem(0);');
 assert.equal(t.val('game.ended'),true);
 const food=t.val('game.food');
 await t.run('finishTurn()');
 assert.equal(t.val('game.food'),food);assert.equal(t.val('game.round'),1);
});
test('A4 | nueva partida reinicia progresos y reservas tras avanzar a J2',async()=>{
 const t=fixture();stable(t);await t.run('finishTurn()');
 t.run('confirmPass();game.food=0;game.items=[];game.samples=3;startGame("local");');
 assert.deepEqual(t.val('({round:game.round,food:game.food,items:game.items.length,samples:game.samples,turn:game.turn})'),
 {round:1,food:6,items:7,samples:0,turn:'human'});
});
test('A4 | reinicio tras ronda elimina las contribuciones anteriores a crisis',async()=>{
 const t=fixture();stable(t);await both(t);
 assert.deepEqual(t.val('({given:game.crisis.given,cards:game.crisis.contributions,round:game.round})'),
 {given:0,cards:[],round:2});
});

test('A4 | campaña local llega al límite original de 10 rondas si no se cumple el objetivo',async()=>{
 const t=fixture();stable(t);
 assert.equal(t.val('game.objective.rounds'),10);
 assert.equal(t.val('game.objective.need'),9);
 for(let r=1;r<=10;r++){
  t.run('game.food=60;game.morale=9;game.zones.forEach(z=>{z.z=0;z.noise=0;z.b=0;});game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
  if(r>1)t.run('confirmPass();');
  await both(t);
  assert.equal(t.val('game.round'),r+1);
 }
 assert.equal(t.val('game.ended'),true);
 assert.equal(t.val('game.turn'),'end');
 assert.match(t.val('game.last'),/agotaron las rondas/);
 assert.equal(t.val('game.log.filter(x=>x.includes("Fase de colonia:")).length'),10);
});

test('A4 | campaña IA también puede completar el máximo original sin victoria',async()=>{
 const t=fixture('ai');stable(t);
 assert.equal(t.val('game.max'),10);
 for(let r=1;r<=10;r++){
  t.run('game.food=60;game.morale=9;game.botItems=[];game.botDice=[];game.bots.forEach(p=>p.moved=true);game.zones.forEach(z=>{z.z=0;z.noise=0;z.b=0;});game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
  await t.run('finishTurn()');
  assert.equal(t.val('game.round'),r+1);
 }
 assert.equal(t.val('game.ended'),true);
 assert.match(t.val('game.last'),/agotaron las rondas/);
 assert.equal(t.val('game.log.filter(x=>x.includes("Fase de colonia:")).length'),10);
});

test('C1 #11 | IA no sigue consumiendo otras notas tras ganar',async()=>{
 const t=fixture('ai');stable(t);
 t.run('game.goal=1;game.botItems=[catalog.create("notes"),catalog.create("notes")];game.botDice=[];game.bots.forEach(p=>p.moved=true);');
 await t.run('finishTurn()');
 assert.deepEqual(t.val('({samples:game.samples,ended:game.ended,round:game.round,items:game.botItems.length})'),
  {samples:1,ended:true,round:1,items:1});
 assert.match(t.val('game.last'),/Victoria/);
});
