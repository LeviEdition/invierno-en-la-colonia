import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createContext, runInContext } from 'node:vm';

const ruta = join(dirname(fileURLToPath(import.meta.url)), '..', 'invierno_colonia_v9_9.html');
const html = readFileSync(ruta, 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'La prueba necesita un único script principal');

// Sólo evitamos la inicialización automática de la interfaz al cargar el archivo.
// Las funciones originales create(), newRound() y las reglas NO se reescriben.
const arranque = /\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1], arranque, 'Cambió el arranque: revisar el adaptador de pruebas');
const codigo = scripts[0][1].replace(arranque, '');

function partida({ azar = 0.25, modo = 'ai' } = {}) {
  const math = Object.create(Math);
  math.random = () => azar;
  const nodos = new Map();
  const documento = {
    addEventListener() {},
    getElementById(id) {
      if (!nodos.has(id)) nodos.set(id, {
        innerHTML: '', hidden: true, dataset: {},
        classList: { add() {}, remove() {} },
      });
      return nodos.get(id);
    },
  };
  const contexto = createContext({ document: documento, Math: math });
  runInContext(codigo, contexto, { filename: 'invierno_colonia_v9_9.js', timeout: 2000 });
  // Aislamos los efectos VISUALES. Ejecutamos el motor real de inicialización.
  runInContext('paint = () => {}; toast = () => {}; show = () => {};', contexto);
  assert.ok(['ai', 'local'].includes(modo));
  runInContext('gameMode = ' + JSON.stringify(modo) + '; create();', contexto, { timeout: 2000 });
  const consultar = expresion => JSON.parse(runInContext('JSON.stringify(' + expresion + ')', contexto));
  return { contexto, consultar };
}

test('inicio: recursos, ronda y personajes en la colonia', () => {
  const { consultar } = partida();
  const g = consultar('game');
  assert.equal(g.mode, 'ai');
  assert.equal(g.round, 1);
  assert.equal(g.turn, 'human');
  assert.equal(g.morale, 9);
  assert.equal(g.food, 6);
  assert.equal(g.hunger, 0);
  assert.equal(g.waste, 0);
  assert.equal(g.samples, 0);
  assert.equal(g.helpless, 0);
  assert.deepEqual(g.humans.map(p => p.name), ['Mara', 'Leo', 'Iris']);
  assert.deepEqual(g.bots.map(p => p.name), ['Ada', 'Bruno', 'Sol']);
  for (const p of [...g.humans, ...g.bots]) {
    assert.equal(p.loc, 0);
    assert.equal(p.dead, false);
    assert.equal(p.wounds, 0);
    assert.equal(p.frost, 0);
    assert.equal(p.equipment.length, 0);
    assert.ok(p.job && p.skill && p.influence > 0, p.name + ' debe tener atributos de personaje');
  }
});

test('inicio: siete localidades, zombis iniciales y mazos de veinte cartas', () => {
  const g = partida().consultar('game');
  assert.deepEqual(g.zones.map(z => z.name), [
    'Colonia', 'Supermercado', 'Hospital', 'Comisaría', 'Gasolinera', 'Escuela', 'Biblioteca',
  ]);
  assert.deepEqual(g.zones.map(z => z.z), [3, 1, 1, 1, 1, 1, 1]);
  assert.ok(g.zones.every(z => z.b === 0 && z.noise === 0));
  assert.deepEqual(Object.keys(g.decks).sort(), ['1', '2', '3', '4', '5', '6']);
  for (const mazo of Object.values(g.decks)) {
    assert.equal(mazo.length, 20);
    assert.ok(mazo.every(carta => carta.cardId && carta.kind));
  }
});

test('inicio: manos, dados y líderes de ambos grupos', () => {
  const g = partida().consultar('game');
  assert.equal(g.items.length, 7);
  assert.equal(g.botItems.length, 7);
  assert.ok(g.items.every(item => item.cardId));
  assert.ok(g.botItems.every(item => item.cardId));
  assert.equal(g.dice.length, 4);
  assert.equal(g.botDice.length, 4);
  assert.ok([...g.dice, ...g.botDice].every(d => Number.isInteger(d) && d >= 1 && d <= 6));
  assert.deepEqual(g.leaders, { human: 'h0', ai: 'a1' });
  assert.equal(g.crisis.need, 2);
  assert.equal(g.crisis.given, 0);
  assert.ok(['comida', 'medicina', 'herramienta', 'combustible'].includes(g.crisis.type));
});

test('inicio: las tres misiones originales se pueden seleccionar', () => {
  const resultados = [0, 0.5, 0.999999].map(azar => partida({ azar }).consultar('game'));
  assert.deepEqual(resultados.map(g => g.objective.name), [
    'Encontrar la cura', 'Operación antídoto', 'Última esperanza',
  ]);
  for (const g of resultados) {
    assert.equal(g.goal, g.objective.need);
    assert.equal(g.max, g.objective.rounds);
  }
});

test('modo local: se preparan ambos grupos sin ejecutar el turno de IA', () => {
  const g = partida({ modo: 'local' }).consultar('game');
  assert.equal(g.mode, 'local');
  assert.equal(g.turn, 'human');
  assert.equal(g.humans.length, 3);
  assert.equal(g.bots.length, 3);
  assert.equal(g.localLeaderChosen, false);
});

test('crear otra partida reinicia los recursos y el estado transitorio', () => {
  const { contexto, consultar } = partida();
  runInContext('game.food = 0; game.morale = 2; game.zones[1].z = 4; game.items.pop(); create();', contexto);
  const g = consultar('game');
  assert.equal(g.food, 6);
  assert.equal(g.morale, 9);
  assert.equal(g.items.length, 7);
  assert.equal(g.zones[1].z, 1);
  assert.equal(g.round, 1);
});
