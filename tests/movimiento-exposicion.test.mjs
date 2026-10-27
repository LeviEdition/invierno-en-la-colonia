import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createContext, runInContext } from 'node:vm';

// Caracterización: se ejecutan las funciones originales de la V9.9.
// Las únicas sustituciones son la interfaz y una fuente de azar controlada.
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'invierno_colonia_v9_9.html');
const html = readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'Se espera un único script principal');
const bootstrap = /\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1], bootstrap, 'Revisar cómo arranca la V9.9');
const source = scripts[0][1].replace(bootstrap, '');

function prepare({ mode = 'ai', initialRandom = 0.5 } = {}) {
  const randomState = { value: initialRandom };
  const stubMath = Object.create(Math);
  stubMath.random = () => randomState.value;
  const elements = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        innerHTML: '', hidden: true, dataset: {},
        classList: { add() {}, remove() {} },
      });
      return elements.get(id);
    },
  };
  const ctx = createContext({ document, Math: stubMath, queueMicrotask() {} });
  runInContext(source, ctx, { filename: 'invierno_colonia_v9_9.js', timeout: 2000 });
  // Suprimimos solo la salida visual, sin cambiar el motor ni las reglas.
  runInContext('paint = () => {}; toast = () => {}; show = () => {}; deathDirector.open = () => {};', ctx);
  runInContext('gameMode = ' + JSON.stringify(mode) + '; create(); game.crossPending = false; game.crossResolved = true;', ctx, { timeout: 2000 });
  const evaluate = (expression) => JSON.parse(runInContext('JSON.stringify(' + expression + ')', ctx));
  const execute = (code) => runInContext(code, ctx, { timeout: 2000 });
  const roll = (face) => {
    assert.ok(Number.isInteger(face) && face >= 1 && face <= 6);
    randomState.value = (face - 0.5) / 6;
  };
  return { evaluate, execute, roll };
}

// En la V9.9 el movimiento normal no consume un dado.
test('mover: traslado válido cambia de localidad, marca movimiento y conserva dados', () => {
  const { evaluate, execute, roll } = prepare();
  roll(4); // Exposición: blanco.
  const before = evaluate('({ dice: [...game.dice], food: game.food, position: game.humans[0].loc })');
  execute('target = 1; doMove();');
  const after = evaluate('({ position: game.humans[0].loc, moved: game.humans[0].moved, dice: game.dice, food: game.food, wounds: game.humans[0].wounds, frost: game.humans[0].frost })');
  assert.equal(before.position, 0);
  assert.equal(after.position, 1);
  assert.equal(after.moved, true);
  assert.deepEqual(after.dice, before.dice);
  assert.equal(after.food, before.food);
  assert.equal(after.wounds, 0);
  assert.equal(after.frost, 0);
});

test('mover: elegir la misma localidad no produce cambios', () => {
  const { evaluate, execute } = prepare();
  const before = evaluate('({ character: game.humans[0], dice: game.dice, food: game.food })');
  execute('target = 0; doMove();');
  const after = evaluate('({ character: game.humans[0], dice: game.dice, food: game.food })');
  assert.deepEqual(after, before);
});

test('mover: un destino lleno no permite ingresar', () => {
  const { evaluate, execute } = prepare();
  execute('game.humans[1].loc=1; game.humans[2].loc=1; game.bots[0].loc=1; game.bots[1].loc=1;');
  execute('target = 1; doMove();');
  assert.deepEqual(evaluate('({ loc: game.humans[0].loc, moved: game.humans[0].moved, dice: game.dice.length })'), {
    loc: 0, moved: false, dice: 4,
  });
});

test('mover: un superviviente no puede moverse dos veces en el mismo turno', () => {
  const { evaluate, execute, roll } = prepare();
  roll(4);
  execute('target=1; doMove(); target=2; doMove();');
  assert.deepEqual(evaluate('({ loc: game.humans[0].loc, moved: game.humans[0].moved })'), { loc: 1, moved: true });
});

test('mover: no se puede mover un superviviente fallecido', () => {
  const { evaluate, execute } = prepare();
  execute('game.humans[0].dead=true; target=1; doMove();');
  assert.deepEqual(evaluate('({ loc: game.humans[0].loc, moved: game.humans[0].moved })'), { loc: 0, moved: false });
});

test('exposición: blanco (4, 5 o 6) no causa daños', () => {
  for (const face of [4, 5, 6]) {
    const { evaluate, execute, roll } = prepare();
    roll(face);
    execute("expose(game.humans[0], 'prueba');");
    const result = evaluate('({ wounds: game.humans[0].wounds, frost: game.humans[0].frost, dead: game.humans[0].dead })');
    assert.deepEqual(result, { wounds: 0, frost: 0, dead: false }, 'Resultado del dado ' + face);
  }
});

test('exposición: un 2 agrega congelación, un 3 agrega herida', () => {
  for (const [face, key] of [[2, 'frost'], [3, 'wounds']]) {
    const { evaluate, execute, roll } = prepare();
    roll(face);
    execute("expose(game.humans[0], 'prueba');");
    const result = evaluate('({ wounds: game.humans[0].wounds, frost: game.humans[0].frost, dead: game.humans[0].dead })');
    assert.equal(result[key], 1, 'Dado ' + face + ' debe modificar ' + key);
    assert.equal(result.dead, false);
    assert.equal(result[key === 'frost' ? 'wounds' : 'frost'], 0);
  }
});

test('exposición: un 1 provoca mordedura y muerte cuando el personaje está aislado', () => {
  const { evaluate, execute, roll } = prepare();
  roll(1);
  execute('selected=1; target=1; doMove();'); // Leo se aleja de todos antes de resultar mordido.
  const result = evaluate('({ loc: game.humans[1].loc, dead: game.humans[1].dead, morale: game.morale, biteResolving: game.biteResolving })');
  assert.deepEqual(result, { loc: 1, dead: true, morale: 8, biteResolving: false });
});

test('exposición: habilidad resistente evita el primer resultado perjudicial de la ronda', () => {
  const { evaluate, execute, roll } = prepare();
  roll(2);
  execute("expose(game.bots[2], 'prueba');"); // Sol: resistente.
  assert.deepEqual(evaluate('({ used: game.bots[2].skillUsed, frost: game.bots[2].frost })'), { used: true, frost: 0 });
  execute("expose(game.bots[2], 'prueba');");
  assert.deepEqual(evaluate('({ used: game.bots[2].skillUsed, frost: game.bots[2].frost })'), { used: true, frost: 1 });
});

test('movimiento con combustible: consume carta y crea residuo, evita exposición y no gasta dado', () => {
  const { evaluate, execute, roll } = prepare();
  roll(1); // Normalmente causaría mordedura; el combustible debe evitar la tirada.
  const before = evaluate('({ hand: game.items.length, dice: [...game.dice], waste: game.waste })');
  execute("itemEngine.moveWithFuel(game.humans[0], 1, 'human', 5);");
  const after = evaluate('({ loc: game.humans[0].loc, moved: game.humans[0].moved, dead: game.humans[0].dead, hand: game.items.length, dice: game.dice, waste: game.waste })');
  assert.deepEqual(after, { loc: 1, moved: true, dead: false, hand: before.hand - 1, dice: before.dice, waste: before.waste + 1 });
});
