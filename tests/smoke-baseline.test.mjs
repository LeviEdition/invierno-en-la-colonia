import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Script } from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'invierno_colonia_v9_9.html'), 'utf8');

test('la versión estable contiene una página HTML completa', () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<title>Invierno en la Colonia · V9\.9<\/title>/);
  assert.match(html, /<style>[\s\S]*?<\/style>/);
  assert.match(html, /<\/html>\s*$/);
});

test('el JavaScript embebido se puede analizar sin errores de sintaxis', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, 'V9.9 debe tener un único script embebido');
  assert.doesNotThrow(() => new Script(scripts[0][1], { filename: 'invierno_colonia_v9_9.js' }));
});

test('la base conserva las cinco clases principales y los puntos de entrada', () => {
  for (const name of ['ItemCatalog', 'TurnController', 'ItemEngine', 'DeathDirector', 'CrisisManager']) {
    assert.match(html, new RegExp('\\bclass ' + name + '\\b'));
  }
  for (const name of ['create', 'paint', 'renderSite', 'colony', 'botTurn']) {
    assert.match(html, new RegExp('\\bfunction ' + name + '\\s*\\('));
  }
});

test('la interfaz incluye sus elementos principales', () => {
  for (const id of ['setupScreen', 'board', 'goalCard', 'crisisCard', 'status', 'toastStack']) {
    assert.ok(html.includes('id="' + id + '"'), 'Falta el elemento #' + id);
  }
});
