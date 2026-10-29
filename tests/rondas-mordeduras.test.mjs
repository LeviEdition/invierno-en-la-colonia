import {readTestProgram} from '../test-support/game-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createContext, runInContext } from 'node:vm';

// Pruebas de caracterización: sin cambiar el juego; se neutraliza solo la presentación.
const program=readTestProgram().runtimeSource;

function fixture({ mode = 'ai' } = {}) {
  const random = { value: 0.6 };
  const math = Object.create(Math);
  math.random = () => random.value;
  const nodes = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { hidden: true, textContent: '', innerHTML: '', dataset: {}, classList: { add() {}, remove() {} } });
      return nodes.get(id);
    },
  };
  const context = createContext({ Math: math, document, queueMicrotask() {} });
  runInContext(program, context, { timeout: 2000 });
  runInContext('paint = () => {}; toast = () => {}; show = () => {}; deathDirector.open = () => {};', context);
  runInContext('gameMode = ' + JSON.stringify(mode) + '; create(); game.crossPending=false;game.crossResolved=true;', context);
  return {
    execute(code) { return runInContext(code, context, { timeout: 2000 }); },
    value(code) { return JSON.parse(runInContext('JSON.stringify(' + code + ')', context)); },
    die(face) {
      assert.ok(Number.isInteger(face) && face >= 1 && face <= 6);
      random.value = (face - 0.5) / 6;
    },
  };
}

test('ronda siguiente: reinicia movimientos y habilidades de ambos grupos', () => {
  const t = fixture();
  t.execute('game.humans[0].moved=true;game.bots[1].moved=true;game.humans[0].skillUsed=true;game.bots[1].skillUsed=true;game.round=2;newRound();');
  assert.deepEqual(t.value('all().map(p=>({moved:p.moved,skillUsed:p.skillUsed}))'), Array.from({ length: 6 }, () => ({ moved: false, skillUsed: false })));
  assert.equal(t.value('game.round'), 2); // newRound prepara la ronda; no incrementa el contador.
});

test('ronda siguiente: genera dados por superviviente vivo y crisis nueva', () => {
  const t = fixture();
  t.execute('game.bots[1].dead=true;game.dice=[];game.botDice=[];newRound();');
  assert.deepEqual(t.value('({human:game.dice.length,other:game.botDice.length,need:game.crisis.need,given:game.crisis.given})'), { human: 4, other: 3, need: 2, given: 0 });
});

test('congelación: al comenzar un turno, cada ficha añade una herida', () => {
  const t = fixture();
  t.execute('game.humans[0].frost=1;applyFrost(\'human\');');
  assert.deepEqual(t.value('({w:game.humans[0].wounds,f:game.humans[0].frost,dead:game.humans[0].dead})'), { w: 1, f: 1, dead: false });
});

test('tres daños acumulados producen muerte y pérdida de moral', () => {
  const t = fixture();
  t.die(3);
  t.execute('game.humans[0].wounds=1;game.humans[0].frost=1;expose(game.humans[0],\'prueba\');');
  assert.deepEqual(t.value('({dead:game.humans[0].dead,morale:game.morale})'), { dead: true, morale: 8 });
});

test('mordedura compartida: abre una decisión para el siguiente superviviente', () => {
  const t = fixture();
  t.die(1);
  t.execute('game.bots.forEach(p=>p.loc=2);expose(game.humans[0],\'prueba\');');
  const bite = t.value('({dead:game.humans[0].dead,biteResolving:game.biteResolving,pendingBite,side:game.turn})');
  assert.equal(bite.dead, true);
  assert.equal(bite.biteResolving, true);
  assert.equal(bite.pendingBite.target, 'h1'); // Leo tiene menor influencia que los restantes.
  assert.deepEqual(bite.pendingBite.victims, ['h2']);
});

test('mordedura: sacrificarse detiene el contagio después de la segunda muerte', () => {
  const t = fixture();
  t.die(1);
  t.execute('game.bots.forEach(p=>p.loc=2);expose(game.humans[0],\'prueba\');chooseBite(\'sacrifice\');');
  assert.deepEqual(t.value('({dead:all().filter(x=>x.dead).map(x=>x.id),pending:pendingBite,active:game.biteResolving,morale:game.morale})'), {
    dead: ['h0', 'h1'], pending: null, active: false, morale: 7,
  });
});

test('mordedura: arriesgar con resultado 4 corta la cadena sin nuevas muertes', () => {
  const t = fixture();
  t.die(1);
  t.execute('game.bots.forEach(p=>p.loc=2);expose(game.humans[0],\'prueba\');');
  t.die(4);
  t.execute('chooseBite(\'risk\');');
  assert.deepEqual(t.value('({dead:all().filter(x=>x.dead).map(x=>x.id),pending:pendingBite,morale:game.morale})'), {
    dead: ['h0'], pending: null, morale: 8,
  });
});

test('mordedura: arriesgar y fallar continúa hacia la siguiente víctima', () => {
  const t = fixture();
  t.die(1);
  t.execute('game.bots.forEach(p=>p.loc=2);expose(game.humans[0],\'prueba\');chooseBite(\'risk\');');
  assert.deepEqual(t.value('({dead:all().filter(x=>x.dead).map(x=>x.id),pending:pendingBite?.target,morale:game.morale})'), {
    dead: ['h0', 'h1'], pending: 'h2', morale: 7,
  });
});

test('mordedura mixta: la IA puede sacrificar automáticamente a Sol antes de consultar al humano', () => {
  const t = fixture();
  t.die(1);
  t.execute("expose(game.humans[0], 'prueba');");
  assert.deepEqual(t.value('({dead:all().filter(p=>p.dead).map(p=>p.id),morale:game.morale,pending:pendingBite})'), {
    dead: ['h0', 'a2'], morale: 7, pending: null,
  });
});

test('crisis exitosa: cumplir requisitos conserva moral y vacía aportes', () => {
  const t = fixture();
  t.execute('game.crisis={type:\'comida\',need:2,given:2,contributions:[\'comida\',\'comida\'],fail:\'moral\'};resolveCrisis();');
  assert.deepEqual(t.value('({morale:game.morale,given:game.crisis.given,items:game.crisis.contributions})'), { morale: 9, given: 0, items: [] });
});

test('crisis fallida de moral: reduce la moral en una unidad', () => {
  const t = fixture();
  t.execute('game.crisis={type:\'comida\',need:2,given:0,contributions:[],fail:\'moral\'};resolveCrisis();');
  assert.equal(t.value('game.morale'), 8);
});
