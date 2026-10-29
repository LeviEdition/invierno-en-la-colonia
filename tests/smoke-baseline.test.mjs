import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Script } from 'node:vm';
import {fixture} from '../test-support/game-fixture.mjs';
import {programFromHtml} from '../test-support/game-source.mjs';
import {assertGameRuntimeContract} from '../test-support/game-runtime-contract.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'invierno_colonia_v9_9.html'), 'utf8');

test('la versión estable contiene una página HTML completa', () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<title>Invierno en la Colonia · V9\.9<\/title>/);
  assert.match(html, /<style>[\s\S]*?<\/style>/);
  assert.match(html, /<\/html>\s*$/);
});

test('el JavaScript embebido se puede analizar sin errores de sintaxis', () => {
  const program=programFromHtml(html);
  assert.doesNotThrow(() => new Script(program.script, { filename: 'invierno_colonia_v9_9.js' }));
});

test('la base conserva las cinco clases principales y los puntos de entrada', () => {
  // D1.2b: comprueba interfaces y comportamiento reales, sin exigir sintaxis de clase.
  // Se conserva paint real: un stub de presentación ocultaría un punto de entrada ausente.
  assertGameRuntimeContract(fixture({render:true}));
});

test('la interfaz incluye sus elementos principales', () => {
  for (const id of ['setupScreen', 'board', 'goalCard', 'crisisCard', 'status', 'toastStack']) {
    assert.ok(html.includes('id="' + id + '"'), 'Falta el elemento #' + id);
  }
});
