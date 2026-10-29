import {readTestProgram} from '../test-support/game-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

// Las reglas V9.9 se ejecutan intactas. Solo se simula el DOM y se anulan efectos visuales.
const source=readTestProgram().runtimeSource+'\npause=async()=>{};';

function fixture({ mode = 'ai' } = {}) {
  const random = { value: 0.6 };
  const math = Object.create(Math);
  math.random = () => random.value;
  const elements = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        innerHTML: '', textContent: '', hidden: true, disabled: false, dataset: {},
        classList: { add() {}, remove() {} },
      });
      return elements.get(id);
    },
  };
  const context = createContext({ Math: math, document, queueMicrotask() {} });
  runInContext(source, context, { filename: 'invierno_colonia_v9_9.js', timeout: 2000 });
  runInContext('paint=()=>{};toast=()=>{};show=()=>{};hide=()=>{};toggleFab=()=>{};deathDirector.open=()=>{};', context);
  runInContext('gameMode=' + JSON.stringify(mode) + ';create();game.crossPending=false;game.crossResolved=true;', context);
  return {
    run(code) { return runInContext(code, context, { timeout: 2000 }); },
    state(expr) { return JSON.parse(runInContext('JSON.stringify(' + expr + ')', context)); },
    die(face) { assert.ok(Number.isInteger(face) && face >= 1 && face <= 6); random.value = (face - 0.5) / 6; },
  };
}

function passCrisis(t) {
  t.run('game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
}

test('colonia: alimenta a seis habitantes con tres comidas, sin alterar moral', () => {
  const t = fixture(); passCrisis(t);
  t.run('colony();');
  assert.deepEqual(t.state('({food:game.food,morale:game.morale,hunger:game.hunger,round:game.round})'), {
    food: 3, morale: 9, hunger: 0, round: 1,
  });
});

test('colonia: cinco habitantes necesitan tres comidas (redondeo hacia arriba)', () => {
  const t = fixture(); passCrisis(t);
  t.run('game.bots[0].loc=1;colony();');
  assert.deepEqual(t.state('({food:game.food,z0:game.zones[0].z,z1:game.zones[1].z})'), { food: 3, z0: 6, z1: 2 });
});

test('colonia: la habilidad de cocinero reduce en uno la comida requerida', () => {
  const t = fixture(); passCrisis(t);
  t.run('game.humans[0].skill="cook";colony();');
  assert.deepEqual(t.state('({food:game.food,morale:game.morale})'), { food: 4, morale: 9 });
});

test('colonia: con comida insuficiente no consume sobrantes y acumula hambre', () => {
  const t = fixture(); passCrisis(t);
  t.run('game.food=2;colony();');
  assert.deepEqual(t.state('({food:game.food,hunger:game.hunger,morale:game.morale})'), { food: 2, hunger: 1, morale: 8 });
});

test('colonia: dos rondas de hambre penalizan uno y luego dos de moral', () => {
  const t = fixture(); passCrisis(t);
  t.run('game.food=0;colony();');
  passCrisis(t);
  t.run('colony();');
  assert.deepEqual(t.state('({food:game.food,hunger:game.hunger,morale:game.morale})'), { food: 0, hunger: 2, morale: 6 });
});

test('colonia: nueve residuos no penalizan; diez quitan uno de moral', () => {
  const t = fixture(); passCrisis(t);
  t.run('game.waste=9;colony();');
  assert.equal(t.state('game.morale'), 9);
  passCrisis(t);
  t.run('game.waste=10;colony();');
  assert.equal(t.state('game.morale'), 8);
});

test('colonia: veinte residuos quitan dos de moral', () => {
  const t = fixture();passCrisis(t);
  t.run('game.waste=20;colony();');
  assert.equal(t.state('game.morale'), 7);
});

test('crisis fallida de alimentos: consume hasta dos comidas sin permitir negativos', () => {
  const t = fixture();
  t.run('game.food=1;game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"food"};resolveCrisis();');
  assert.deepEqual(t.state('({food:game.food,given:game.crisis.given})'), { food: 0, given: 0 });
});

test('crisis fallida de zombis: agrega dos zombis en la colonia', () => {
  const t = fixture();
  t.run('game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"zombie"};resolveCrisis();');
  assert.equal(t.state('game.zones[0].z'), 5);
});

test('crisis fallida de herida: afecta al superviviente de menor influencia en colonia', () => {
  const t = fixture();
  t.run('game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"wound"};resolveCrisis();');
  assert.deepEqual(t.state('({name:game.bots[2].name,wounds:game.bots[2].wounds})'), { name: 'Sol', wounds: 1 });
});

test('zombis: una barricada bloquea la entrada cuando no hay accesos libres', () => {
  const t = fixture();
  t.run('game.zones[0].z=11;game.zones[0].b=1;addZombie(0);');
  assert.deepEqual(t.state('({z:game.zones[0].z,b:game.zones[0].b,morale:game.morale})'), { z: 11,b: 0,morale: 9 });
});

test('zombis: el desbordamiento sin barricadas mata al habitante de menor influencia', () => {
  const t = fixture();
  t.run('game.zones[0].z=12;addZombie(0);');
  assert.deepEqual(t.state('({name:game.bots[2].name,dead:game.bots[2].dead,morale:game.morale,z:game.zones[0].z})'), {
    name:'Sol',dead:true,morale:8,z:12,
  });
});

test('zombis: localidad exterior llena y sin habitantes no reduce moral', () => {
  const t = fixture();
  t.run('game.zones[1].z=4;addZombie(1);');
  assert.deepEqual(t.state('({z:game.zones[1].z,morale:game.morale})'), { z:4,morale:9 });
});

test('colonia: indefensos aumentan el consumo y atraen oleadas según habitantes', () => {
  const t = fixture(); passCrisis(t);
  t.run('game.helpless=2;colony();');
  assert.deepEqual(t.state('({food:game.food,z:game.zones[0].z,helpless:game.helpless})'), {
    food:2,z:7,helpless:2,
  });
});

test('limpiar: elimina hasta tres residuos consumiendo un dado', () => {
  const t = fixture();
  t.run('game.waste=5;game.dice=[1];clean();');
  assert.deepEqual(t.state('({waste:game.waste,dice:game.dice})'), {waste:2,dice:[]});
});

test('limpiar: sin residuos o fuera de colonia no consume dados', () => {
  const t = fixture();
  t.run('game.waste=0;game.dice=[1];clean();');
  assert.equal(t.state('game.dice.length'),1);
  t.run('game.waste=4;game.humans[0].loc=1;clean();');
  assert.deepEqual(t.state('({waste:game.waste,dice:game.dice})'), { waste:4,dice:[1] });
});

test('atraer: mueve hasta dos zombis desde otras localidades, gastando un dado', () => {
  const t = fixture();
  t.run('game.zones[1].z=2;game.zones[2].z=1;game.dice=[1];attract();chooseAttract(1);chooseAttract(2);');
  assert.deepEqual(t.state('({local:game.zones[0].z,one:game.zones[1].z,two:game.zones[2].z,dice:game.dice,pending:pendingAttract})'), {
    local:5,one:1,two:0,dice:[],pending:null,
  });
});

test('atraer: no permite elegir la misma localidad ni una sin zombis', () => {
  const t = fixture();
  t.run('game.zones[3].z=0;game.dice=[1];attract();chooseAttract(0);chooseAttract(3);');
  assert.deepEqual(t.state('({local:game.zones[0].z,dice:game.dice,pending:pendingAttract?.left})'), {
    local:3,dice:[],pending:2,
  });
});

test('atraer: sin origen válido no consume dado', () => {
  const t = fixture();
  t.run('game.zones.slice(1).forEach(z=>z.z=0);game.dice=[1];attract();');
  assert.deepEqual(t.state('({dice:game.dice,pending:pendingAttract})'), { dice:[1],pending:null });
});

test('turnos locales: pasar de J1 a J2 no resuelve la fase de colonia ni cambia de ronda', async () => {
  const t = fixture({mode:'local'});
  t.run('game.crossPending=false;game.crossResolved=true;');
  await t.run('finishTurn()');
  assert.deepEqual(t.state('({turn:game.turn,round:game.round,food:game.food,pass:passScreenActive})'), {
    turn:'ai',round:1,food:6,pass:true,
  });
});

test('turnos locales: terminar J2 resuelve colonia e inicia la segunda ronda', async () => {
  const t = fixture({mode:'local'});
  await t.run('finishTurn()');
  passCrisis(t);
  t.run('passScreenActive=false;game.crossPending=false;game.crossResolved=true;');
  await t.run('finishTurn()');
  assert.deepEqual(t.state('({turn:game.turn,round:game.round,food:game.food,pass:passScreenActive,ai:aiRunning})'), {
    turn:'human',round:2,food:3,pass:true,ai:false,
  });
});

test('turnos: una búsqueda pendiente impide cerrar el turno', async () => {
  const t = fixture({mode:'local'});
  t.run('pendingLoot={loc:1,actorId:"h0",items:[]};');
  await t.run('finishTurn()');
  assert.deepEqual(t.state('({turn:game.turn,round:game.round,food:game.food})'), { turn:'human',round:1,food:6 });
});

test('turnos: una encrucijada pendiente impide cerrar el turno', async () => {
  const t = fixture({mode:'local'});
  t.run('game.crossPending=true;');
  await t.run('finishTurn()');
  assert.deepEqual(t.state('({turn:game.turn,round:game.round,food:game.food})'), { turn:'human',round:1,food:6 });
});

test('fin de partida: cuando se agotan las rondas, declara derrota por tiempo', async () => {
  const t = fixture({mode:'local'});
  t.run('game.max=1;');
  await t.run('finishTurn()');
  passCrisis(t);
  t.run('passScreenActive=false;game.crossPending=false;game.crossResolved=true;');
  await t.run('finishTurn()');
  assert.deepEqual(t.state('({round:game.round,ended:game.ended,turn:game.turn})'), {round:2,ended:true,turn:'end'});
});

test('turnos locales: el comienzo de J2 aplica su congelación', async () => {
  const t = fixture({mode:'local'});
  t.run('game.bots[0].frost=1;');
  await t.run('finishTurn()');
  assert.deepEqual(t.state('({turn:game.turn,wounds:game.bots[0].wounds,frost:game.bots[0].frost})'), {
    turn:'ai',wounds:1,frost:1,
  });
});

test('turnos: una transferencia pendiente impide terminar la acción', async () => {
  const t = fixture({mode:'local'});
  t.run('pendingTransfer={fromId:"h0",itemIndex:0,targets:["h1"]};');
  await t.run('finishTurn()');
  assert.equal(t.state('game.turn'), 'human');
});

test('pantalla de pase: confirmar muestra el turno del siguiente jugador', async () => {
  const t = fixture({mode:'local'});
  await t.run('finishTurn()');
  assert.equal(t.state('passScreenActive'), true);
  t.run('confirmPass();');
  assert.deepEqual(t.state('({turn:game.turn,hidden:passScreenActive})'), { turn:'ai', hidden:false });
});

test('colonia: si no hay supervivientes en la colonia, el desbordamiento puede matar indefensos', () => {
  const t = fixture();
  t.run('all().forEach(p=>p.loc=1);game.helpless=2;game.zones[0].z=12;addZombie(0);');
  assert.deepEqual(t.state('({helpless:game.helpless,morale:game.morale,z:game.zones[0].z})'), {
    helpless:1,morale:8,z:12,
  });
});
