import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

// Pruebas de caracterización: el código del juego se ejecuta sin modificarlo.
const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'invierno_colonia_v9_9.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const bootstrap = /\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1], bootstrap);
const source = scripts[0][1].replace(bootstrap, '');

function fixture({ mode = 'ai' } = {}) {
  const rng = { value: 0.6 };
  const math = Object.create(Math);
  math.random = () => rng.value;
  const nodes = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, {
        innerHTML: '', textContent: '', hidden: true, dataset: {},
        classList: { add() {}, remove() {} },
      });
      return nodes.get(id);
    },
  };
  const ctx = createContext({ document, Math: math, queueMicrotask() {} });
  runInContext(source, ctx, { timeout: 2000 });
  runInContext('paint = () => {}; toast = () => {}; show = () => {}; deathDirector.open = () => {};', ctx);
  runInContext('gameMode = ' + JSON.stringify(mode) + '; create(); game.crossPending=false; game.crossResolved=true;', ctx, { timeout: 2000 });
  return {
    exec: code => runInContext(code, ctx, { timeout: 2000 }),
    val: expr => JSON.parse(runInContext('JSON.stringify(' + expr + ')', ctx)),
    roll(face) { assert.ok(Number.isInteger(face) && face >= 1 && face <= 6); rng.value = (face - 0.5) / 6; },
  };
}

const outside = t => t.exec('game.humans[0].loc=1; game.dice=[6,5]; selected=0; picked=0;');

test('mazos: seis localidades con 20 cartas de categorías definidas', () => {
  const t = fixture();
  const result = t.val('({sizes:Object.values(game.decks).map(a=>a.length), cards:Object.values(game.decks).flat().every(it=>!!catalog.resolve(it))})');
  assert.deepEqual(result, { sizes: [20,20,20,20,20,20], cards: true });
});

test('buscar: no permite hacerlo en colonia ni consume dados', () => {
  const t = fixture();
  const before = t.val('({dice:game.dice,hand:game.items.length})');
  t.exec('search();');
  assert.deepEqual(t.val('({dice:game.dice,hand:game.items.length})'), before);
  assert.equal(t.val('pendingLoot'), null);
});

test('buscar: rechaza un dado insuficiente sin consumirlo', () => {
  const t = fixture(); outside(t);
  t.exec('game.dice=[1]; search();');
  assert.deepEqual(t.val('({dice:game.dice,deck:game.decks[1].length,pending:pendingLoot})'), { dice:[1],deck:20,pending:null });
});

test('buscar: consume un dado correcto y revela una carta sin entregarla aún', () => {
  const t = fixture(); outside(t);
  t.exec('search();');
  assert.deepEqual(t.val('({dice:game.dice,deck:game.decks[1].length,revealed:pendingLoot.items.length,actor:pendingLoot.actorId,hand:game.items.length})'), {
    dice:[5], deck:19, revealed:1, actor:'h0', hand:7,
  });
});

test('buscar: la elección entrega una carta y devuelve las restantes al fondo', () => {
  const t = fixture(); outside(t);
  t.exec("game.decks[1]=[catalog.create('ration'),catalog.create('medkit'),catalog.create('gascan')]; search(); addNoiseSearch(); chooseLoot(1);");
  assert.deepEqual(t.val('({cards:game.decks[1].map(it=>it.cardId),hand:game.items.at(-1).cardId,noise:game.zones[1].noise,pending:pendingLoot})'), {
    cards:['gascan','ration'], hand:'medkit',noise:1,pending:null,
  });
});

test('buscar: hasta cuatro ruidos revelan cartas extra; el quinto no cambia nada', () => {
  const t = fixture(); outside(t);
  t.exec('search(); for(let i=0;i<5;i++) addNoiseSearch();');
  assert.deepEqual(t.val('({revealed:pendingLoot.items.length,noise:game.zones[1].noise,remaining:game.decks[1].length})'), {
    revealed:5, noise:4, remaining:15,
  });
});

test('buscar: mazo agotado no gasta dados ni crea una búsqueda pendiente', () => {
  const t = fixture(); outside(t);
  t.exec('game.decks[1]=[];search();');
  assert.deepEqual(t.val('({dice:game.dice, pending:pendingLoot})'), { dice:[6,5], pending:null });
});

test('buscar: una búsqueda pendiente bloquea otra y conserva los dados restantes', () => {
  const t = fixture(); outside(t);
  t.exec('search();search();');
  assert.deepEqual(t.val('({dice:game.dice,loot:pendingLoot.items.length,deck:game.decks[1].length})'), {
    dice:[5],loot:1,deck:19,
  });
});

test('exploradora: Iris revela dos cartas y conserva sólo una', () => {
  const t = fixture();
  t.exec("selected=2;game.humans[2].loc=1;game.dice=[6];game.decks[1]=[catalog.create('ration'),catalog.create('medkit'),catalog.create('gascan')];search();");
  assert.deepEqual(t.val('({reveal:pendingLoot.items.map(x=>x.cardId),deck:game.decks[1].length})'), {
    reveal:['ration','medkit'],deck:1,
  });
  t.exec('chooseLoot(0);');
  assert.deepEqual(t.val('({last:game.items.at(-1).cardId,deck:game.decks[1].map(x=>x.cardId)})'), {
    last:'ration',deck:['gascan','medkit'],
  });
});

test('linterna equipada: revela una carta extra sin ruido, sólo una vez por ronda', () => {
  const t = fixture();outside(t);
  t.exec("game.humans[0].equipment=[catalog.create('flashlight')];search();");
  assert.deepEqual(t.val('({reveal:pendingLoot.items.length,noise:game.zones[1].noise,used:game.humans[0].equipment[0].usedRound})'), {
    reveal:2,noise:0,used:1,
  });
  t.exec('chooseLoot(0);game.dice=[6];search();');
  assert.equal(t.val('pendingLoot.items.length'),1);
});

test('buscar: una muestra conserva el identificador de quien la encontró', () => {
  const t = fixture();outside(t);
  t.exec("game.decks[1]=[catalog.create('sample')];search();chooseLoot(0);");
  assert.deepEqual(t.val('({card:game.items.at(-1).cardId,finder:game.items.at(-1).finderId})'), {
    card:'sample',finder:'h0',
  });
});

test('buscar: el rescate se incorpora a la colonia y no ocupa la mano', () => {
  const t=fixture();outside(t);
  t.exec("game.decks[1]=[catalog.create('rescue')];search();chooseLoot(0);");
  const after=t.val('({humans:game.humans.length,hand:game.items.length,loc:game.humans.at(-1).loc,queue:game.rescueQueue.length})');
  assert.deepEqual(after, { humans:4,hand:7,loc:0,queue:0 });
});

test('IA: prefiere muestra a comida y devuelve el descarte al mazo', () => {
  const t=fixture();
  t.exec("game.bots[0].loc=1; game.decks[1]=[catalog.create('ration'),catalog.create('sample')]; beginSearch(game.bots[0],'ai');");
  assert.deepEqual(t.val('({samples:game.samples,deck:game.decks[1].map(x=>x.cardId),hand:game.botItems.length})'), {
    samples:0,deck:['sample'],hand:8,
  });
});

test('colonia: cada ficha de ruido exterior puede agregar un zombi al obtener 1–3', () => {
  const t=fixture();
  t.exec("game.crisis={type:'comida',need:2,given:2,contributions:['comida','comida'],fail:'moral'};game.zones[2].noise=2;");
  t.roll(2);
  t.exec('colony();');
  assert.deepEqual(t.val('({z:game.zones[2].z,noise:game.zones[2].noise})'), { z:3,noise:0 });
});

test('objetos: comida y medicina se consumen, aplican efecto y generan residuos', () => {
  const t=fixture();
  t.exec("game.items=[catalog.create('canned'),catalog.create('bandage')];game.humans[0].wounds=1;itemEngine.use(0,game.humans[0],'human');itemEngine.use(0,game.humans[0],'human');");
  assert.deepEqual(t.val('({food:game.food,wounds:game.humans[0].wounds,hand:game.items.length,waste:game.waste})'), {
    food:8,wounds:0,hand:0,waste:2,
  });
});

test('objetos: dos herramientas no se equipan en un mismo personaje y el rechazo no consume la carta', () => {
  const t=fixture();
  t.exec("game.items=[catalog.create('crowbar'),catalog.create('flashlight')];itemEngine.use(0,game.humans[0],'human');const result=itemEngine.use(0,game.humans[0],'human');");
  assert.deepEqual(t.val('({hand:game.items.map(it=>it.cardId),equip:game.humans[0].equipment.map(it=>it.cardId),waste:game.waste})'), {
    hand:['flashlight'],equip:['crowbar'],waste:0,
  });
});

test('objetos: manual quita hasta dos residuos, coloca una barricada y genera un residuo nuevo', () => {
  const t=fixture();
  t.exec("game.waste=4;game.items=[catalog.create('manual')];itemEngine.use(0,game.humans[0],'human');");
  assert.deepEqual(t.val('({waste:game.waste,b:game.zones[0].b,hand:game.items.length})'), {
    waste:3,b:1,hand:0,
  });
});
