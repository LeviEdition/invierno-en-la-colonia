import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

// Caracterización de V9.9: ejecutamos las reglas originales y aislamos solo la interfaz.
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'invierno_colonia_v9_9.html');
const html = readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const bootstrap = /\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1], bootstrap);
const source = scripts[0][1].replace(bootstrap, '');

function fixture() {
  const rng = { value: 0.6 };
  const math = Object.create(Math);
  math.random = () => rng.value;
  const elements = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        innerHTML: '', textContent: '', hidden: true, dataset: {},
        classList: { add() {}, remove() {} },
      });
      return elements.get(id);
    },
  };
  // La presentación de muertes requiere un DOM real; no forma parte de estas pruebas.
  const ctx = createContext({ document, Math: math, queueMicrotask() {} });
  runInContext(source, ctx, { filename: 'invierno_colonia_v9_9.js', timeout: 2000 });
  runInContext('paint=()=>{};toast=()=>{};show=()=>{};hide=()=>{};deathDirector.open=()=>{};', ctx);
  runInContext('gameMode="ai";create();game.crossPending=false;game.crossResolved=true;', ctx, { timeout: 2000 });
  return {
    exec: code => runInContext(code, ctx, { timeout: 2000 }),
    val: expr => JSON.parse(runInContext('JSON.stringify(' + expr + ')', ctx)),
    roll(face) {
      assert.ok(Number.isInteger(face) && face >= 1 && face <= 6);
      rng.value = (face - 0.5) / 6;
    },
  };
}

function equip(t, id) {
  t.exec("game.items=[catalog.create(" + JSON.stringify(id) + ")];itemEngine.use(0,game.humans[0],'human');");
}

test('ataque normal: consume dado suficiente y elimina un solo zombi', () => {
  const t = fixture(); t.roll(4);
  t.exec('game.dice=[4]; game.zones[0].z=3; attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,dice:game.dice,wounds:game.humans[0].wounds})'), {
    z: 2, dice: [], wounds: 0,
  });
});

test('ataque: un dado menor que el requisito no se consume', () => {
  const t = fixture();
  t.exec('game.dice=[3];attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,dice:game.dice})'), { z: 3, dice: [3] });
});

test('ataque: sin zombis no consume dados', () => {
  const t = fixture();
  t.exec('game.zones[0].z=0;game.dice=[6];attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,dice:game.dice})'), { z: 0, dice: [6] });
});

test('escopeta: elimina hasta dos zombis, pero exige exposición', () => {
  const t = fixture(); equip(t, 'shotgun'); t.roll(3);
  t.exec('game.dice=[6];game.zones[0].z=3;attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,wounds:game.humans[0].wounds,dice:game.dice,equipment:game.humans[0].equipment.length})'), {
    z: 1, wounds: 1, dice: [], equipment: 1,
  });
});

test('escopeta: si solo queda un zombi, no elimina más de uno', () => {
  const t = fixture();equip(t,'shotgun');t.roll(4);
  t.exec('game.dice=[6];game.zones[0].z=1;attack();');
  assert.equal(t.val('game.zones[0].z'), 0);
});

test('pistola: protege únicamente del primer ataque de la ronda', () => {
  const t = fixture();equip(t,'pistol');t.roll(3);
  t.exec('game.dice=[4,4];game.zones[0].z=3;attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,w:game.humans[0].wounds,used:game.humans[0].equipment[0].usedRound})'), {
    z: 2, w: 0, used: 1,
  });
  t.exec('attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,w:game.humans[0].wounds})'), { z: 1, w: 1 });
});

test('pistola: recupera su protección al comenzar una nueva ronda', () => {
  const t = fixture();equip(t,'pistol');t.roll(3);
  t.exec('game.dice=[4];attack();newRound();game.crossPending=false;game.crossResolved=true;');
  assert.equal(t.val('game.humans[0].equipment[0].usedRound'), 0);
  t.exec('game.dice=[4];attack();');
  assert.deepEqual(t.val('({w:game.humans[0].wounds,used:game.humans[0].equipment[0].usedRound})'), { w: 0, used: 1 });
});

test('rifle: reduce requisito en uno y evita exposición fuera de colonia', () => {
  const t = fixture();equip(t,'rifle');t.roll(3);
  t.exec('game.humans[0].loc=1;game.zones[1].z=2;game.dice=[3];attack();');
  assert.deepEqual(t.val('({z:game.zones[1].z,w:game.humans[0].wounds,dice:game.dice,used:game.humans[0].equipment[0].usedRound})'), {
    z: 1, w: 0, dice: [], used: 1,
  });
});

test('rifle: en colonia reduce requisito pero no protege de exposición', () => {
  const t = fixture();equip(t,'rifle');t.roll(3);
  t.exec('game.dice=[3];attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,w:game.humans[0].wounds,used:game.humans[0].equipment[0].usedRound||0})'), {
    z: 2, w: 1, used: 0,
  });
});

test('hacha: reduce requisito y construye una sola barricada por ronda en colonia', () => {
  const t=fixture();equip(t,'hatchet');t.roll(4);
  t.exec('game.dice=[3,3];attack();attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,b:game.zones[0].b,used:game.humans[0].equipment[0].usedRound})'), {
    z: 1, b: 1, used: 1,
  });
});

test('hacha: fuera de la colonia no construye barricadas después de atacar', () => {
  const t=fixture();equip(t,'hatchet');t.roll(4);
  t.exec('game.humans[0].loc=1;game.dice=[3];attack();');
  assert.deepEqual(t.val('({z:game.zones[1].z,b:game.zones[1].b})'), { z: 0, b: 0 });
});

test('palanca: reduce en uno el requisito de búsqueda', () => {
  const t=fixture();equip(t,'crowbar');
  t.exec('game.humans[0].loc=1;game.dice=[2];search();');
  assert.deepEqual(t.val('({dice:game.dice,loot:pendingLoot?.items.length})'), { dice: [], loot: 1 });
});

test('herramientas de reparación: construir una barricada adicional por dado', () => {
  const t=fixture();equip(t,'repairkit');
  t.exec('game.zones[0].z=2;game.dice=[1];barricade();');
  assert.deepEqual(t.val('({b:game.zones[0].b,dice:game.dice})'), { b: 2, dice: [] });
});

test('transferencia: se puede entregar equipamiento a otro humano en la misma localidad', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('profileId="h0";startTransfer(0);');
  assert.equal(t.val('pendingTransfer.targets.includes("h1")'), true);
  t.exec('chooseTransfer("h1");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,target:game.humans[1].equipment.map(it=>it.cardId),pending:pendingTransfer})'), {
    source: 0, target: ['pistol'], pending: null,
  });
});

test('transferencia: un receptor con equipo de igual tipo se excluye', () => {
  const t=fixture();equip(t,'crowbar');
  t.exec('game.humans[1].equipment=[catalog.create("flashlight")];profileId="h0";startTransfer(0);');
  assert.equal(t.val('pendingTransfer.targets.includes("h1")'), false);
});

test('crisis: rechaza cartas de tipo incorrecto, acepta las correctas y no produce residuo', () => {
  const t=fixture();
  t.exec('game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"moral"};game.items=[catalog.create("bandage"),catalog.create("ration")];');
  assert.equal(t.exec('CrisisManager.fromHand(0)'),false);
  assert.equal(t.exec('CrisisManager.fromHand(1)'),true);
  assert.deepEqual(t.val('({hand:game.items.map(i=>i.cardId),contributions:game.crisis.contributions,waste:game.waste})'), {
    hand: ['bandage'], contributions: ['comida'], waste: 0,
  });
});

test('crisis: admite objetos equipados del tipo necesario', () => {
  const t=fixture();equip(t,'repairkit');
  t.exec('game.crisis={type:"herramienta",need:2,given:0,contributions:[],fail:"moral"};contributeEquipment("h0",0);');
  assert.deepEqual(t.val('({eq:game.humans[0].equipment.length,given:game.crisis.given,types:game.crisis.contributions})'), {
    eq: 0, given: 1, types: ['herramienta'],
  });
});

test('crisis: máximo de necesidad + 2 cartas y sobreaporte aumenta moral', () => {
  const t=fixture();
  t.exec('game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"moral"};game.items=Array.from({length:5},()=>catalog.create("ration"));');
  t.exec('for(let i=0;i<5;i++)CrisisManager.fromHand(0);');
  assert.deepEqual(t.val('({hand:game.items.length,given:game.crisis.given})'), { hand: 1, given: 4 });
  t.exec('resolveCrisis();');
  assert.equal(t.val('game.morale'),10);
});

test('muerte en colonia: el equipamiento vuelve a la mano del grupo', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('kill(game.humans[0],"prueba");');
  assert.deepEqual(t.val('({dead:game.humans[0].dead,equipment:game.humans[0].equipment.length,hand:game.items.map(it=>it.cardId),morale:game.morale})'), {
    dead: true, equipment: 0, hand: ['pistol'], morale: 8,
  });
});

test('muerte fuera de colonia: equipo regresa al mazo de esa localidad, no a la mano', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.humans[0].loc=1;kill(game.humans[0],"prueba");');
  assert.deepEqual(t.val('({dead:game.humans[0].dead,hand:game.items.length,deck:game.decks[1].length,hasPistol:game.decks[1].some(it=>it.cardId==="pistol")})'), {
    dead: true, hand: 0, deck: 21, hasPistol: true,
  });
});

test('habilidad de Bruno: reduce el requisito de ataque a uno en modo local', () => {
  const t=fixture();t.roll(4);
  t.exec('game.mode="local";game.turn="ai";selected=1;game.botDice=[1];attack();');
  assert.deepEqual(t.val('({z:game.zones[0].z,remaining:game.botDice.length,original:game.dice.length})'), {
    z: 2, remaining: 0, original: 4,
  });
});

test('barricada: sin accesos libres rechaza la acción y no consume dado', () => {
  const t=fixture();
  t.exec('game.zones[0].z=3;game.zones[0].b=9;game.dice=[6];barricade();');
  assert.deepEqual(t.val('({b:game.zones[0].b,z:game.zones[0].z,dice:game.dice})'), {b:9,z:3,dice:[6]});
});

// Defecto observado independientemente: startTransfer permite receptores del bando contrario.
// No fijamos ese comportamiento incorrecto como requisito de regresión.
test.todo('transferencia: impedir destinatarios del grupo adversario (issue #4)');
