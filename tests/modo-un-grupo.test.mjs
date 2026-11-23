import test from 'node:test';import assert from 'node:assert/strict';
import {fixture,silentCross} from '../test-support/game-fixture.mjs';
import {soloMode} from '../src/domain/reference-state.mjs';

// Modo «un grupo» (docs/117): un solo grupo humano, sin bando de la IA. La ronda
// pasa del turno del jugador directo a la fase de colonia. Referencia de
// comportamiento: la variante «un-grupo» del laboratorio (docs/106).

const solo=({seed=20261118,face=6,rules={}}={})=>{
 const t=fixture({mode:'ai',seed,face});
 t.run('passScreenActive=true;setTestRules('+JSON.stringify(rules)+');passScreenActive=false;gameMode="solo";create();');
 t.run(silentCross);
 return t;
};

test('un grupo | soloMode reconoce el modo',()=>{
 assert.deepEqual(['solo','ai','local'].map(soloMode),[true,false,false]);
});

test('un grupo | la partida arranca sin bando de la IA',()=>{
 const t=solo();
 assert.equal(t.state('game.mode'),'solo');
 assert.deepEqual(t.state('game.bots'),[],'no hay supervivientes de la IA');
 assert.deepEqual(t.state('game.botItems'),[],'no hay mano de la IA');
 assert.deepEqual(t.state('game.botDice'),[],'no hay dados de la IA');
 assert.equal(t.state('game.leaders.ai'),null,'no hay líder de la IA');
});

test('un grupo | mismos supervivientes iniciales que el jugador en modo contra la IA',()=>{
 assert.deepEqual(solo().state('game.humans').map(p=>p.name),
  fixture({mode:'ai',seed:1}).state('game.humans').map(p=>p.name));
});

test('un grupo | mismo objetivo, crisis, comida y colonia',()=>{
 const t=solo();
 assert.equal(t.state('game.food'),6);
 assert.equal(t.state('game.morale'),9);
 assert.equal(t.state('game.crisis.need'),2);
 assert.ok(['comida','medicina','herramienta','combustible'].includes(t.state('game.crisis.type')));
 assert.equal(t.state('game.goal'),t.state('game.objective.need'));
 assert.deepEqual(t.state('game.zones').map(z=>z.z),[3,1,1,1,1,1,1],'el tablero sale igual');
 assert.deepEqual(Object.keys(t.state('game.decks')).sort(),['1','2','3','4','5','6']);
});

test('un grupo | los dados son 1 + supervivientes vivos del único grupo',()=>{
 const t=solo();
 assert.equal(t.state('game.dice').length,4,'tres vivos: cuatro dados');
 t.run('game.humans[2].dead=true;game.round++;newRound();');
 assert.equal(t.state('game.dice').length,3,'dos vivos: tres dados');
 assert.deepEqual(t.state('game.botDice'),[],'la IA nunca recibe dados');
});

test('un grupo | la ronda nueva no consume azar por la IA',()=>{
 // Sin bando de la IA se tiran cuatro dados en lugar de cuatro más cuatro.
 const draws=mode=>{
  const t=fixture({mode:'ai',seed:4242});
  t.run((mode==='solo'?'gameMode="solo";':'')+'create();'+silentCross);
  const antes=t.run('[Math.random(),Math.random()].join()');
  const u=fixture({mode:'ai',seed:4242});
  u.run((mode==='solo'?'gameMode="solo";':'')+'create();'+silentCross);
  u.run('game.round++;newRound();');
  return {antes,despues:u.run('[Math.random(),Math.random()].join()')};
 };
 const uno=draws('solo'),dos=draws('ai');
 assert.notEqual(uno.despues,dos.despues,'la IA consumiría tiradas extra por sus dados');
});

test('un grupo | sin la IA no se pierde por quedarse sin su grupo',()=>{
 const t=solo();
 assert.equal(t.state('gameOutcome(game)'),null,'el bando vacío de la IA no es una derrota');
 t.run('game.humans.forEach(p=>p.dead=true);');
 assert.equal(t.state('gameOutcome(game)'),'survivors','perder el grupo propio sí termina');
});

test('un grupo | perder al último superviviente no recluta para la IA',()=>{
 const t=solo();
 t.run('game.humans.forEach(p=>{p.dead=true;});replaceLastSurvivors();');
 assert.deepEqual(t.state('game.bots'),[],'la IA sigue sin grupo');
 assert.ok(t.state('game.humans').some(p=>!p.dead)||t.state('game.noReplacement'),
  'el reemplazo de emergencia solo mira al grupo propio');
});

test('un grupo | los rótulos no mencionan a la IA ni a un segundo jugador',()=>{
 const t=solo();
 assert.equal(t.state('controls.display("human")'),'Tu grupo');
 assert.equal(t.state('controls.display("ai")'),'Tu grupo');
 assert.equal(t.state('controls.solo'),true);
 assert.equal(t.state('game.turn'),'human');
});

test('un grupo | la encrucijada es siempre del jugador',()=>{
 const t=solo();
 assert.equal(t.state('game.crossOwner'),'human');
});

test('un grupo | dos rondas completas: el turno pasa directo a la colonia',async()=>{
 const t=solo({seed:777});
 t.run('game.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});game.food=40;game.waste=0;');
 const registro=[];
 for(const ronda of [1,2]){
  assert.equal(t.state('game.round'),ronda,'ronda '+ronda);
  assert.equal(t.state('game.turn'),'human','el turno siempre es del jugador');
  t.run('game.crisis.contributions=Array(game.crisis.need).fill(game.crisis.type);game.crisis.given=game.crisis.need;');
  t.run('finishTurn();');
  await new Promise(resolve=>setTimeout(resolve,0));
  registro.push({ronda,log:t.state('game.log')});
 }
 assert.equal(t.state('game.round'),3,'dos rondas completas sin turno de la IA');
 assert.equal(t.state('game.ended'),false);
 const todo=registro.flatMap(r=>r.log);
 assert.ok(todo.some(line=>/fase de colonia/.test(line)),'la colonia se resolvió');
 assert.ok(!todo.some(line=>/IA|Jugador 2/.test(line)),'ningún aviso menciona a la IA ni a un segundo jugador');
});

test('un grupo | las reglas de prueba también funcionan acá',()=>{
 const t=solo({rules:{comidaInicial:10,laNoche:true,crisisParcial:true,regreso:true},seed:55});
 assert.equal(t.state('game.food'),10);
 assert.equal(t.state('nightEnabled()'),true,'La noche se aplica en un grupo');
 // La noche tira por la única localidad exterior ocupada.
 t.run('game.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});game.waste=0;game.food=40;'+
  'game.crisis.contributions=Array(game.crisis.need).fill(game.crisis.type);game.crisis.given=game.crisis.need;'+
  'game.humans[0].loc=2;game.humans[1].loc=0;game.humans[2].loc=0;');
 t.run('Math.random=()=>0.60;game.log=[];colony();');
 assert.equal(t.state('game.log').filter(line=>/la noche en/.test(line)).length,1);
 // Regresar a la colonia también.
 t.run('game.humans[0].loc=2;game.dice=[1];selected=0;returnHome();');
 assert.equal(t.state('game.humans[0].loc'),0);
});

test('un grupo | los modos actuales no cambian',()=>{
 for(const mode of ['ai','local']){
  const t=fixture({mode,seed:31});
  assert.equal(t.state('game.mode'),mode);
  assert.equal(t.state('game.bots').length,3,'el bando de la IA sigue intacto');
  assert.equal(t.state('game.botItems').length,7);
  assert.equal(t.state('game.botDice').length,4);
  assert.equal(t.state('game.leaders.ai'),'a1');
  assert.equal(t.state('controls.solo'),false);
  assert.equal(t.state('controls.display("ai")'),mode==='local'?'Jugador 2':'IA');
 }
});

test('un grupo | una semilla fija da siempre la misma partida',()=>{
 const play=()=>{
  const t=solo({seed:9090});
  t.run('for(let r=0;r<3;r++){game.dice=[6,6,6,6];destination(2);doMove();colony();if(game.ended)break;game.round++;newRound();}');
  return t.state('game');
 };
 assert.deepEqual(play(),play());
});
