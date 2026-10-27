import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createContext, runInContext } from 'node:vm';

// Ejecuta las reglas de V9.9. Aislamos DOM, tiempos de animación y encrucijadas.
// Estas últimas se auditarán por separado: NO quedan cubiertas por este archivo.
const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'invierno_colonia_v9_9.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const bootstrap = /\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1], bootstrap);
const oldPause = /const pause=async\(\)=>\{paint\(\);await waitForAiCross\(\);await waitForLeader\(\);await deathDirector\.wait\(\);if\(!skipAI\)await new Promise\(r=>setTimeout\(r,1750\)\);\};/;
assert.match(scripts[0][1], oldPause, 'Si cambió la coordinación de animaciones, actualizar el adaptador de pruebas');
const source = scripts[0][1].replace(bootstrap, '').replace(oldPause, 'const pause=async()=>{};');

function fixture() {
  const rng = { value: (4 - 0.5) / 6 };
  const math = Object.create(Math);
  math.random = () => rng.value;
  const elements = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        hidden:true,disabled:false,innerHTML:'',textContent:'',dataset:{},
        classList:{add(){},remove(){}},
      });
      return elements.get(id);
    },
  };
  const context = createContext({ Math:math, document, queueMicrotask() {} });
  runInContext(source, context, { filename:'invierno_colonia_v9_9.js', timeout:2000 });
  runInContext('paint=()=>{};toast=()=>{};show=()=>{};hide=()=>{};toggleFab=()=>{};deathDirector.open=()=>{};crossDraw=side=>{game.crossOwner=side;game.crossResolved=true;game.crossPending=false;};crossAction=()=>false;', context);
  runInContext('gameMode="ai";create();passScreenActive=false;game.turn="ai";',context);
  return {
    exec: code => runInContext(code,context,{timeout:3000}),
    val: expr => JSON.parse(runInContext('JSON.stringify('+expr+')',context)),
    async ai() { await runInContext('botTurn()',context,{timeout:3000}); },
    async finish() { await runInContext('finishTurn()',context,{timeout:3000}); },
    roll(face) { assert.ok(Number.isInteger(face)&&face>=1&&face<=6);rng.value=(face-0.5)/6; },
  };
}
const stay = t => t.exec('game.bots.forEach(p=>p.moved=true);');

test('IA equipa un arma automáticamente',async()=>{
 const t=fixture();stay(t);t.exec('game.botItems=[catalog.create("pistol")];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('game.bots.map(p=>p.equipment.map(x=>x.cardId))'),[['pistol'],[],[]]);
 assert.equal(t.val('game.botItems.length'),0);
});
test('IA respeta el límite de armas y conserva la sobrante',async()=>{
 const t=fixture();stay(t);
 t.exec('game.botItems=["pistol","rifle","shotgun","hatchet"].map(id=>catalog.create(id));game.botDice=[];');
 await t.ai();
 assert.deepEqual(t.val('({hand:game.botItems.map(x=>x.cardId),counts:game.bots.map(p=>p.equipment.filter(x=>x.kind==="arma").length)})'),{hand:['pistol'],counts:[1,1,1]});
});
test('IA aporta los objetos de la categoría solicitada por la crisis',async()=>{
 const t=fixture();stay(t);
 t.exec('game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"moral"};game.botItems=["ration","canned","bandage"].map(id=>catalog.create(id));game.botDice=[];');
 await t.ai();
 assert.deepEqual(t.val('({given:game.crisis.given,types:game.crisis.contributions,food:game.food,hand:game.botItems.map(x=>x.cardId)})'),{given:2,types:['comida','comida'],food:6,hand:['bandage']});
});
test('IA cura con botiquín a su superviviente herido',async()=>{
 const t=fixture();stay(t);
 t.exec('game.bots[1].wounds=2;game.bots[0].skillUsed=true;game.botItems=[catalog.create("medkit")];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('({w:game.bots[1].wounds,hand:game.botItems.length,waste:game.waste})'),{w:0,hand:0,waste:1});
});
test('IA consume comida cuando las reservas son insuficientes',async()=>{
 const t=fixture();stay(t);
 t.exec('game.food=0;game.crisis.type="herramienta";game.botItems=[catalog.create("canned")];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('({food:game.food,hand:game.botItems.length,waste:game.waste})'),{food:2,hand:0,waste:1});
});
test('IA utiliza notas de laboratorio para sumar una muestra',async()=>{
 const t=fixture();stay(t);
 t.exec('game.crisis.type="comida";game.botItems=[catalog.create("notes")];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('({samples:game.samples,hand:game.botItems.length,waste:game.waste})'),{samples:1,hand:0,waste:1});
});
test('IA utiliza el manual para retirar residuos y construir barricada',async()=>{
 const t=fixture();stay(t);
 t.exec('game.waste=4;game.crisis.type="comida";game.botItems=[catalog.create("manual")];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('({waste:game.waste,b:game.zones[0].b,hand:game.botItems.length})'),{waste:3,b:1,hand:0});
});
test('Ada atiende automáticamente una congelación sin gastar dado',async()=>{
 const t=fixture();stay(t);
 t.exec('game.bots[1].frost=1;game.botItems=[];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('({frost:game.bots[1].frost,used:game.bots[0].skillUsed})'),{frost:0,used:true});
});
test('IA elige destinos según capacidad y aptitud de búsqueda',async()=>{
 const t=fixture();t.exec('game.botItems=[];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('game.bots.map(p=>({loc:p.loc,moved:p.moved}))'),[{loc:2,moved:true},{loc:1,moved:true},{loc:2,moved:true}]);
});
test('IA consume combustible para evitar exposición al moverse',async()=>{
 const t=fixture();t.roll(1);
 t.exec('game.botItems=[catalog.create("gascan")];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('({loc:game.bots[0].loc,dead:game.bots[0].dead,hand:game.botItems.length,waste:game.waste})'),{loc:2,dead:false,hand:0,waste:1});
});
test('IA sin combustible se expone: Sol evita el primer daño por su habilidad',async()=>{
 const t=fixture();t.roll(3);t.exec('game.botItems=[];game.botDice=[];');await t.ai();
 assert.deepEqual(t.val('game.bots.map(p=>p.wounds)'),[1,1,0]);
 assert.equal(t.val('game.bots[2].skillUsed'),true);
});
test('IA consume un dado por búsqueda y obtiene objetos del mazo',async()=>{
 const t=fixture();stay(t);
 t.exec('game.bots[0].loc=2;game.botItems=[];game.botDice=[6,6];game.decks[2]=["ration","bandage"].map(id=>catalog.create(id));');await t.ai();
 assert.deepEqual(t.val('({dice:game.botDice,hand:game.botItems.map(x=>x.cardId),deck:game.decks[2].length})'),{dice:[],hand:['ration','bandage'],deck:0});
});
test('IA incorpora una muestra encontrada directamente al objetivo',async()=>{
 const t=fixture();stay(t);
 t.exec('game.botItems=[];game.botDice=[6];game.bots[0].loc=2;game.decks[2]=[catalog.create("sample")];');await t.ai();
 assert.deepEqual(t.val('({samples:game.samples,hand:game.botItems.length,dice:game.botDice.length})'),{samples:1,hand:0,dice:0});
});
test('IA utiliza el dado para atacar cuando no puede buscar',async()=>{
 const t=fixture();stay(t);
 t.exec('game.botItems=[];game.botDice=[6];game.zones[0].z=3;');await t.ai();
 assert.deepEqual(t.val('({dice:game.botDice,z:game.zones[0].z})'),{dice:[],z:2});
});
test('IA construye barricada si no puede buscar ni atacar',async()=>{
 const t=fixture();stay(t);
 t.exec('game.botItems=[];game.botDice=[1];game.zones[0].z=0;');await t.ai();
 assert.deepEqual(t.val('({dice:game.botDice,b:game.zones[0].b})'),{dice:[],b:1});
});
test('IA limpia residuos cuando no puede buscar, atacar o construir',async()=>{
 const t=fixture();stay(t);
 t.exec('game.botItems=[];game.botDice=[1];game.zones[0].z=0;game.zones[0].b=12;game.waste=5;');await t.ai();
 assert.deepEqual(t.val('({dice:game.botDice,waste:game.waste})'),{dice:[],waste:2});
});
test('IA termina con dados sin gastar si no queda acción posible',async()=>{
 const t=fixture();stay(t);
 t.exec('game.botItems=[];game.botDice=[1];game.zones[0].z=0;game.zones[0].b=12;game.waste=0;');await t.ai();
 assert.deepEqual(t.val('({dice:game.botDice,waste:game.waste})'),{dice:[1],waste:0});
});
test('IA recluta un reemplazo cuando pierde a sus últimos personajes',async()=>{
 const t=fixture();
 t.exec('game.bots.forEach(p=>p.dead=true);game.botDice=[6];game.botItems=[];');await t.ai();
 assert.deepEqual(t.val('({ended:game.ended,alive:game.bots.filter(p=>!p.dead).length})'),{ended:false,alive:1});
 assert.ok(t.val('game.log.some(msg=>msg.includes("Se descartaron 0 cartas"))'));
});
test('turno integrado: humano, IA, colonia y siguiente ronda',async()=>{
 const t=fixture();t.exec('game.turn="human";game.botItems=[];game.botDice=[6];game.food=20;');await t.finish();
 assert.deepEqual(t.val('({round:game.round,turn:game.turn,ai:aiRunning,ended:game.ended})'),{round:2,turn:'human',ai:false,ended:false});
 assert.ok(t.val('game.log.some(x=>x.includes("Comienza el turno de la IA"))'));
 assert.ok(t.val('game.log.some(x=>x.includes("Fase de colonia"))'));
});
test('IA: derrota por tiempo tras la última ronda',async()=>{
 const t=fixture();t.exec('game.turn="human";game.max=1;game.botItems=[];game.botDice=[];game.food=20;');await t.finish();
 assert.deepEqual(t.val('({round:game.round,turn:game.turn,ended:game.ended})'),{round:2,turn:'end',ended:true});
});
