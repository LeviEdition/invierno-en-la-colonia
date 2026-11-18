import assert from 'node:assert/strict';
import test from 'node:test';
import {once} from 'node:events';
import {isMainThread, parentPort, Worker} from 'node:worker_threads';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {TEST_RULE_DEFAULTS} from '../src/domain/test-rules.mjs';
import {semillaC14} from '../lab/sp04/azar.mjs';
import {horizontalRulesPlugin} from '../scripts/build-mapa.mjs';
import {controllerSource} from '../test-support/autoplay-controller.mjs';
import {prepare, setDie} from '../test-support/game-fixture.mjs';
import {createPlayBroker} from '../app/mapa/juego/broker.mjs';
import {projectVisibleState} from '../app/mapa/estado/projection.mjs';

const maxSteps = 2500;
const timeoutMs = 8000;

function checkRound(c) {
  const g = c.game;
  for (const value of [g.food, g.morale]) assert.ok(Number.isSafeInteger(value) && value >= 0);
  for (const z of g.zones) assert.ok(Number.isInteger(z.noise) && z.noise >= 0 && z.noise <= 4);
  for (const p of c.alive()) assert.ok(p.wounds + p.frost < 3, p.name + ' sigue vivo con tres daños');
}

async function play({mode, seed, rules}, program) {
  const t = prepare(rules, {mode, seed, natural: true, program});
  const c = t.run('globalThis');
  // El observador histórico de crisis envuelve la función y pierde su callback del mapa.
  const resolveCrisis = c.resolveCrisis;
  t.run(controllerSource);
  c.resolveCrisis = resolveCrisis;
  const g = c.game;
  assert.equal(g.food, rules?.comidaInicial ?? 6);
  assert.equal(g.mode, mode);
  assert.deepEqual(t.state('game.testRules'), rules ?? TEST_RULE_DEFAULTS);
  checkRound(c);

  let draws = 0, returns = 0, lastReturn = 0, partialCrises = 0;
  const random = c.Math.random;
  c.Math.random = () => { draws++; return random(); };

  const nights = new Set();
  let nightLocation = null;
  c.mapCycle.api.subscribeCycle(change => {
    if (change?.step?.kind === 'night') {
      nightLocation = change.phase === 'before' ? change.step.meta.location : null;
      if (change.phase === 'after') assert.ok(nights.has(g.round + '/' + change.step.meta.location));
    }
    if (change?.phase === 'after' && change.step.kind === 'crisis' && change.step.meta.partial) {
      assert.ok(rules?.crisisParcial);
      partialCrises++;
    }
  });
  const event = c.mapPlay.event;
  c.mapPlay.event = (type, data, ...rest) => {
    if (type === 'exposure' && (nightLocation !== null || data.reason.startsWith('la noche en '))) {
      const actor = g.humans.find(p => p.id === data.actor && !p.dead);
      assert.ok(rules?.laNoche && actor && actor.loc > 0, 'tirada nocturna fuera de regla');
      assert.equal(actor.loc, nightLocation);
      assert.equal(data.die.sides, 12);
      const key = g.round + '/' + actor.loc;
      assert.ok(!nights.has(key), 'segunda exposición nocturna en ' + key);
      nights.add(key);
    }
    return event(type, data, ...rest);
  };
  const newRound = c.newRound;
  c.newRound = () => {
    assert.ok(!c.pendingBite && !g.biteResolving && !c.nightUnfinished(), 'ronda abierta con una decisión pendiente');
    checkRound(c);
    newRound();
    checkRound(c);
  };

  let closing = false, closeError, lastAction;
  for (let step = 0; step < maxSteps; step++) {
    await Promise.resolve(); // deja avanzar IA, decisiones, muertes y fase de colonia
    if (closeError) throw closeError;
    const decision = c.testController.decision();
    if (decision) { lastAction = decision; continue; }
    if (closing) continue;
    if (g.ended) {
      checkRound(c);
      const outcome = c.gameOutcome(g) || (g.round > g.max && 'time');
      assert.ok(['morale','survivors','time','victory'].includes(outcome), 'cierre sin desenlace');
      return {game: t.state('game'), draws, nights: [...nights], returns, partialCrises};
    }
    // Un explorador regresa por ronda si el motor ofrece dados y lugar en casa.
    const outside = g.humans.find(p => !p.dead && p.loc > 0);
    if (rules?.regreso && c.playable() && outside && lastReturn !== g.round && g.dice.length && c.accessible(0)) {
      const origin = outside.loc, before = draws, dice = g.dice.length;
      c.selected = g.humans.indexOf(outside);
      c.returnHome();
      assert.equal(outside.loc, 0);
      assert.equal(outside.moved, true);
      assert.equal(g.dice.length, dice - 1);
      c.destination(origin);
      c.doMove();
      assert.equal(outside.loc, 0, 'se movió después de Regresar');
      assert.equal(g.dice.length, dice - 1);
      assert.equal(draws, before, 'Regresar o el movimiento rechazado tiraron exposición');
      lastReturn = g.round;
      returns++;
      lastAction = 'regresar';
      continue;
    }
    lastAction = c.testController.normal();
    if (lastAction === 'terminar-turno') {
      closing = true;
      c.finishTurn().then(() => { closing = false; }, error => { closeError = error; });
    }
  }
  assert.fail('Tope de ' + maxSteps + ' pasos. Ronda ' + g.round + ', última acción ' + lastAction);
}

if (!isMainThread) {
  // La misma entrada de pruebas, con las capacidades y el D12 del build del mapa.
  const root = fileURLToPath(new URL('../', import.meta.url));
  const bundle = await build({absWorkingDir: root, entryPoints: ['test-support/reference-test-entry.mjs'],
    bundle: true, format: 'iife', write: false, plugins: [horizontalRulesPlugin(root)],
    define: {__GAME_TEST__: 'true', __MAP_EXTENSION__: 'true'}});
  const program = {runtimeSource: bundle.outputFiles[0].text};
  parentPort.on('message', async config => {
    try { parentPort.postMessage({result: await play(config, program)}); }
    catch (error) { parentPort.postMessage({error: error.stack}); }
  });
} else {
  test('resistencia | partidas completas, invariantes y repetición determinista', async context => {
    const worker = new Worker(new URL(import.meta.url));
    async function run(config) {
      const timer = AbortSignal.timeout(timeoutMs);
      try {
        const reply = once(worker, 'message', {signal: timer});
        worker.postMessage(config);
        const [{result, error}] = await reply;
        if (error) throw new Error(error);
        return result;
      } catch (cause) {
        throw new Error(JSON.stringify(config) + ' · ' + (timer.aborted ? 'superó ' + timeoutMs + ' ms' : cause.message), {cause});
      }
    }
    try {
      for (const mode of ['solo','ai']) {
        let nights = 0, returns = 0, partialCrises = 0;
        for (let mask = 0; mask < 8; mask++) {
          for (const [i, comidaInicial] of [6,8,10].entries()) {
            const rules = {laNoche: !!(mask & 1), regreso: !!(mask & 2), crisisParcial: !!(mask & 4), comidaInicial};
            const config = {mode, seed: semillaC14(1 + 3 * mask + i), rules};
            const first = await run(config);
            const second = await run(config);
            assert.deepEqual(second, first, JSON.stringify(config));
            if (!mask && comidaInicial === 6) {
              assert.deepEqual(await run({...config, rules: null}), first, 'preparación por defecto ' + mode);
            }
            nights += first.nights.length;
            returns += first.returns;
            partialCrises += first.partialCrises;
          }
        }
        context.diagnostic(mode + ' (24 partidas distintas): ' + nights + ' D12 nocturnos, ' + returns + ' regresos y ' + partialCrises + ' crisis parciales');
        assert.ok(nights > 0 && returns > 0 && partialCrises > 0, 'faltó ejercer una regla en ' + mode);
      }
    } finally { await worker.terminate(); }
  });
}

// Reintentos del protocolo que usa el mapa, incluyendo una respuesta recuperada
// cuando ya abrió la ronda siguiente. Los únicos valores dirigidos son los dados.
async function nightWithBite(retry) {
  const {createEngine} = await import('../test-support/horizontal-engine.mjs');
  let draws = 0;
  const dieSource = Object.create(Math);
  setDie(dieSource, .8);
  const math = Object.assign(Object.create(Math), {random() { draws++; return dieSource.random(); }});
  const e = createEngine({Math: math});
  e.initialize();
  for (const rule of ['laNoche','regreso']) {
    assert.ok(e.playExecute({kind: 'test-rules', rule, value: 'true'}).ok);
  }
  assert.ok(e.playExecute({kind: 'start', mode: 'solo', confirmed: false}).ok);
  const c = e.testBindings;
  const readPublic = () => projectVisibleState(c, {renderedPlayable: true, epoch: 1});
  const broker = createPlayBroker(e, {session: 'resistencia', readPublic});
  broker.project(readPublic());
  e.subscribeCycle(change => {
    if (change?.step?.kind === 'night') setDie(dieSource, change.phase === 'before' && change.step.meta.location === 2 ? .01 : .8);
    broker.capturePresentation(change);
  });

  let serial = 0;
  function send(type, fields = {}) {
    const request = {type, ...fields, session: 'resistencia', revision: broker.snapshot().play.revision,
      requestId: 'entrada_' + (++serial)};
    const result = broker.handle(request);
    assert.ok(result.ok, JSON.stringify([type, fields, result.reason]));
    return request;
  }
  function replay(request) {
    if (!retry) return;
    const before = e.snapshot(), count = draws, events = e.playSnapshot().events;
    broker.snapshot();
    const recovered = broker.handle(request);
    assert.ok(recovered.ok || recovered.reason === 'stale');
    const doubleTap = broker.handle({...request, requestId: 'otro_' + (++serial)});
    assert.ok(!doubleTap.ok);
    assert.deepEqual(e.snapshot(), before);
    assert.deepEqual(e.playSnapshot().events, events);
    assert.equal(draws, count);
  }

  function walk(id, destination) {
    if (c.game.crossPending) c.crossChoose(c.chooseCrossOption(c.crossroadsDeck[c.game.crossCard], 'human'));
    const moved = e.moveById({...e.movementOptions(id), destination});
    assert.ok(moved.ok, moved.reason);
    if (c.game.crossPending) c.crossChoose(c.chooseCrossOption(c.crossroadsDeck[c.game.crossCard], 'human'));
  }
  async function waitClose() {
    for (let step = 0; step < 60 && e.cycleSnapshot().processing; step++) await Promise.resolve();
    assert.equal(e.cycleSnapshot().operation.status, 'resolved');
  }
  walk('h2', 5);
  const die = e.playSnapshot().options.h2['return-home'].dice[0];
  const beforeReturn = draws;
  const back = send('play-command', {kind: 'return-home', actorId: 'h2', dieIndex: die.index, dieValue: die.value, dieId: die.id});
  assert.equal(draws, beforeReturn);
  assert.equal(c.game.humans[2].loc, 0);
  assert.equal(e.playSnapshot().events.findLast(event => event.type === 'move').exposure.rolled, false);
  replay(back);
  send('play-command', {kind: 'ack', receiptId: e.playSnapshot().receipt.id});

  send('cycle-finish');
  await waitClose();
  send('cycle-ack', {operationId: e.cycleSnapshot().operation.id});
  walk('h0', 2);
  walk('h1', 2);
  walk('h2', 5);
  const finish = send('cycle-finish');
  replay(finish);
  assert.ok(c.pendingBite);
  assert.deepEqual(c.game.nightRemaining, [5]);
  const paused = e.snapshot(), pausedDraws = draws;
  const retries = retry ? [c.finishNight(), c.finishNight()] : [];
  if (retry) assert.deepEqual(c.continueNight(), []);
  assert.deepEqual(e.snapshot(), paused);
  assert.equal(draws, pausedDraws);
  const riskDraws = draws;
  const bite = send('play-command', {kind: 'bite', option: 'risk'});
  assert.equal(draws, riskDraws + 1);
  replay(bite);
  c.deathContinue();
  await waitClose();
  await Promise.all(retries);
  assert.equal(c.game.round, 3);
  assert.equal(c.pendingBite, null);
  assert.equal(c.nightUnfinished(), false);
  const night = e.playSnapshot().events.filter(event => event.type === 'exposure' && event.reason.startsWith('la noche'));
  assert.deepEqual(night.map(event => [event.actor, event.die.face]), [['h1', 1], ['h2', 10]]);
  const completedDraws = draws;
  if (retry) {
    await c.finishNight();
    assert.deepEqual(c.continueNight(), []);
  }
  assert.equal(draws, completedDraws);
  for (const request of [back, bite, finish]) replay(request);
  return {game: e.snapshot(), events: e.playSnapshot().events, draws};
}

if (isMainThread) test('resistencia | doble toque y recuperación durante una mordedura nocturna',
  {timeout: timeoutMs}, async () => {
    assert.deepEqual(await nightWithBite(true), await nightWithBite(false));
  });
