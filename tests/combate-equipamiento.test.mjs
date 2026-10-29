import {readTestProgram} from '../test-support/game-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

// Caracterización de V9.9: ejecutamos las reglas originales y aislamos solo la interfaz.
const source=readTestProgram().runtimeSource;

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

// C8/#4: se valida la nueva política por modo, incluso ante invocación directa
// a chooseTransfer(), cambios de turno o modificaciones del estado del destino.
test('C8 IA: permite transferir dentro del grupo humano y excluye a IA de candidatos', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('profileId="h0";startTransfer(0);');
  assert.deepEqual(t.val('pendingTransfer.targets'),['h1','h2']);
  t.exec('chooseTransfer("h1");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.humans[1].equipment.map(it=>it.cardId)})'),{source:0,dest:['pistol']});
});
test('C8 IA: rechaza selección forzada de destinatario IA desde transferencia válida', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('profileId="h0";startTransfer(0);chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.map(it=>it.cardId),dest:game.bots[0].equipment,pending:!!pendingTransfer})'),{source:['pistol'],dest:[],pending:true});
});
test('C8 IA: rechaza destino IA aun si se falsifica lista de destinatarios', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('profileId="h0";startTransfer(0);pendingTransfer.targets.push("a0");chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.map(it=>it.cardId),dest:game.bots[0].equipment,pending:!!pendingTransfer})'),{source:['pistol'],dest:[],pending:true});
});
test('C8 local: J1 puede ceder objeto equipado a J2 en misma localidad', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);');
  assert.equal(t.val('pendingTransfer.targets.includes("a0")'),true);
  t.exec('chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.bots[0].equipment.map(it=>it.cardId),pending:pendingTransfer})'),{source:0,dest:['pistol'],pending:null});
});
test('C8 local: J2 puede ceder objeto equipado a J1 en su propio turno', () => {
  const t=fixture();
  t.exec('game.mode="local";game.turn="ai";game.bots[0].equipment=[catalog.create("crowbar")];profileId="a0";startTransfer(0);');
  assert.equal(t.val('pendingTransfer.targets.includes("h0")'),true);
  t.exec('chooseTransfer("h0");');
  assert.deepEqual(t.val('({source:game.bots[0].equipment.length,dest:game.humans[0].equipment.map(it=>it.cardId),pending:pendingTransfer})'),{source:0,dest:['crowbar'],pending:null});
});
test('C8 local: J2 también conserva transferencia dentro de su grupo', () => {
  const t=fixture();
  t.exec('game.mode="local";game.turn="ai";game.bots[0].equipment=[catalog.create("pistol")];profileId="a0";startTransfer(0);');
  assert.equal(t.val('pendingTransfer.targets.includes("a1")'),true);
  t.exec('chooseTransfer("a1");');
  assert.deepEqual(t.val('({source:game.bots[0].equipment.length,dest:game.bots[1].equipment.map(it=>it.cardId)})'),{source:0,dest:['pistol']});
});
test('C8: impide confirmar un traspaso con pase de turno sin confirmar', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);passScreenActive=true;chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.bots[0].equipment.length,pending:!!pendingTransfer})'),{source:1,dest:0,pending:true});
});
test('C8: impide confirmar un traspaso si cambió el turno al otro propietario', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);game.turn="ai";chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.bots[0].equipment.length,pending:!!pendingTransfer})'),{source:1,dest:0,pending:true});
});
test('C8: si cambia el modo de local a IA, deja de autorizar destino contrario', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);game.mode="ai";chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.bots[0].equipment.length,pending:!!pendingTransfer})'),{source:1,dest:0,pending:true});
});
test('C8: si el receptor cambia de localidad, no permite transferencia pendiente', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);game.bots[0].loc=3;chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.bots[0].equipment.length,pending:!!pendingTransfer})'),{source:1,dest:0,pending:true});
});
test('C8: si el receptor muere durante la selección, no permite transferencia', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);game.bots[0].dead=true;chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.bots[0].equipment.length,pending:!!pendingTransfer})'),{source:1,dest:0,pending:true});
});
test('C8: si receptor consigue equipamiento del mismo tipo entre apertura y confirmación, no duplica', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);game.bots[0].equipment=[catalog.create("rifle")];chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.map(it=>it.cardId),dest:game.bots[0].equipment.map(it=>it.cardId),pending:!!pendingTransfer})'),{source:['pistol'],dest:['rifle'],pending:true});
});
test('C8: no transfiere un objeto diferente que ocupó su índice durante el modal', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);game.humans[0].equipment[0]=catalog.create("crowbar");chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.map(it=>it.cardId),dest:game.bots[0].equipment.map(it=>it.cardId),pending:!!pendingTransfer})'),{source:['crowbar'],dest:[],pending:true});
});
test('C8: una vez transferido el objeto, una segunda confirmación no lo duplica', () => {
  const t=fixture();equip(t,'pistol');
  t.exec('game.mode="local";profileId="h0";startTransfer(0);chooseTransfer("a0");chooseTransfer("a0");');
  assert.deepEqual(t.val('({source:game.humans[0].equipment.length,dest:game.bots[0].equipment.map(it=>it.cardId),pending:pendingTransfer})'),{source:0,dest:['pistol'],pending:null});
});
