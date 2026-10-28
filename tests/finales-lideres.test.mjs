import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

// Caracterización de la V9.9 SIN cambiar las reglas originales.
// Solo se aísla el DOM y la presentación de mensajes/animaciones.
const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'invierno_colonia_v9_9.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const bootstrap = /\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1], bootstrap, 'Si cambia el arranque hay que revisar el adaptador de pruebas');
const source = scripts[0][1].replace(bootstrap, '');

function fixture({ mode = 'ai', face = 4 } = {}) {
  const random = { value: (face - 0.5) / 6 };
  const math = Object.create(Math);
  math.random = () => random.value;
  const nodes = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, {
        hidden: true, innerHTML: '', textContent: '', dataset: {},
        classList: { add() {}, remove() {} },
      });
      return nodes.get(id);
    },
  };
  const context = createContext({ Math: math, document, queueMicrotask() {} });
  runInContext(source, context, { filename: 'invierno_colonia_v9_9.js', timeout: 2000 });
  runInContext('paint=()=>{};toast=()=>{};show=()=>{};hide=()=>{};deathDirector.open=()=>{};', context);
  runInContext('gameMode=' + JSON.stringify(mode) + ';create();passScreenActive=false;game.crossPending=false;game.crossResolved=true;', context);
  return {
    run: code => runInContext(code, context, { timeout: 2000 }),
    state: expr => JSON.parse(runInContext('JSON.stringify(' + expr + ')', context)),
    roll(face) { assert.ok(Number.isInteger(face) && face >= 1 && face <= 6); random.value = (face - 0.5) / 6; },
  };
}

test('la partida sigue activa cuando no hay condición terminal', () => {
  const t = fixture(); t.run('verify();');
  assert.deepEqual(t.state('({end:game.ended,turn:game.turn,morale:game.morale})'), {end:false,turn:'human',morale:9});
});

test('objetivo alcanzado: victoria con exactamente las muestras requeridas', () => {
  const t=fixture();t.run('game.samples=game.goal;verify();');
  assert.deepEqual(t.state('({ended:game.ended,turn:game.turn,won:game.log.some(x=>x.includes("Victoria"))})'), {ended:true,turn:'end',won:true});
});

test('se declara victoria si la cantidad de muestras supera la meta', () => {
  const t=fixture();t.run('game.samples=game.goal+2;verify();');
  assert.equal(t.state('game.ended'), true);
});

test('moral cero provoca derrota inmediata', () => {
  const t=fixture();t.run('game.morale=0;verify();');
  assert.deepEqual(t.state('({ended:game.ended,turn:game.turn,loss:game.log.some(x=>x.includes("moral llegó a cero"))})'), {ended:true,turn:'end',loss:true});
});

test('moral por debajo de cero también produce derrota', () => {
  const t=fixture();t.run('game.morale=-2;verify();');
  assert.equal(t.state('game.ended'),true);
});

test('si se cumplen simultáneamente objetivo y moral cero, prevalece la derrota', () => {
  const t=fixture();t.run('game.samples=game.goal;game.morale=0;verify();');
  assert.deepEqual(t.state('({ended:game.ended,win:game.log.some(x=>x.includes("Victoria")),lose:game.log.some(x=>x.includes("moral llegó a cero"))})'),{ended:true,win:false,lose:true});
});

test('verificar una partida terminada no duplica el resultado', () => {
  const t=fixture();t.run('game.samples=game.goal;verify();');
  const n=t.state('game.log.length');t.run('verify();verify();');
  assert.equal(t.state('game.log.length'),n);
});

test('el investigador cuenta doble la primera muestra y normal las siguientes', () => {
  const t=fixture();t.run('game.humans[0].skill="researcher";gainSample(game.humans[0]);gainSample(game.humans[0]);');
  assert.deepEqual(t.state('({samples:game.samples,used:game.humans[0].bonusUsed})'),{samples:3,used:true});
});

test('sin habilidad de investigación, una muestra agrega una unidad', () => {
  const t=fixture();t.run('gainSample(game.humans[0]);');
  assert.equal(t.state('game.samples'),1);
});

test('el jugador 1 puede elegir su líder durante la primera ronda', () => {
  const t=fixture();
  assert.equal(t.state('canPickStartingLeader()'),true);
  t.run('chooseLeader("h2");');
  assert.deepEqual(t.state('({leader:game.leaders.human,chosen:game.leaderChosen,can:canPickStartingLeader()})'),{leader:'h2',chosen:true,can:false});
});

test('el jugador 2 puede elegir su líder inicial en modo local', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";selected=0;');
  assert.equal(t.state('canPickStartingLeader()'),true);
  t.run('chooseLeader("a0");');
  assert.deepEqual(t.state('({leader:game.leaders.ai,chosen:game.localLeaderChosen,can:canPickStartingLeader()})'),{leader:'a0',chosen:true,can:false});
});

test('no se puede elegir líder inicial después de la primera ronda', () => {
  const t=fixture();t.run('game.round=2;chooseLeader("h2");');
  assert.deepEqual(t.state('({leader:game.leaders.human,chosen:game.leaderChosen})'),{leader:'h0',chosen:false});
});

test('entregar la muestra que completa el objetivo termina inmediatamente la partida', () => {
  const t=fixture();t.run('game.samples=game.goal-1;game.items=[catalog.create("sample")];playItem(0);');
  assert.deepEqual(t.state('({ended:game.ended,turn:game.turn,hand:game.items.length,samples:game.samples,goal:game.goal})'),{
    ended:true,turn:'end',hand:0,samples:t.state('game.goal'),goal:t.state('game.goal'),
  });
});

test('no permite elegir líder dos veces durante la primera ronda', () => {
  const t=fixture();t.run('chooseLeader("h2");chooseLeader("h1");');
  assert.equal(t.state('game.leaders.human'),'h2');
});

test('no permite elegir como líder a un personaje del otro equipo ni fallecido', () => {
  const t=fixture();t.run('game.humans[2].dead=true;chooseLeader("a0");chooseLeader("h2");');
  assert.deepEqual(t.state('({leader:game.leaders.human,chosen:game.leaderChosen})'),{leader:'h0',chosen:false});
});

test('al morir el líder humano con dos miembros vivos queda selección de sucesor pendiente', () => {
  const t=fixture();t.run('kill(game.humans[0],"prueba");');
  assert.deepEqual(t.state('({pending:pendingLeader,side:pendingLeaderSide,leader:game.leaders.human})'),{pending:true,side:'human',leader:null});
});

test('el jugador humano elige un sucesor válido después de una muerte', () => {
  const t=fixture();t.run('kill(game.humans[0],"prueba");chooseLeader("h2");');
  assert.deepEqual(t.state('({leader:game.leaders.human,pending:pendingLeader,chosen:game.leaderChosen})'),{leader:'h2',pending:false,chosen:true});
});

test('con un único miembro vivo se designa líder automáticamente', () => {
  const t=fixture();t.run('game.humans[0].dead=true;game.humans[1].dead=true;game.leaders.human=null;reviewLeader("human");');
  assert.deepEqual(t.state('({leader:game.leaders.human,pending:pendingLeader})'),{leader:'h2',pending:false});
});

test('cuando muere Bruno, la IA elige automáticamente el superviviente más influyente', () => {
  const t=fixture();t.run('kill(game.bots[1],"prueba");');
  assert.deepEqual(t.state('({leader:game.leaders.ai,pending:pendingLeader,morale:game.morale})'),{leader:'a0',pending:false,morale:8});
});

test('en modo local el jugador 2 debe elegir al sucesor de su líder', () => {
  const t=fixture({mode:'local'});t.run('game.turn="ai";kill(game.bots[1],"prueba");');
  assert.deepEqual(t.state('({leader:game.leaders.ai,pending:pendingLeader,side:pendingLeaderSide})'),{leader:null,pending:true,side:'ai'});
});

test('en modo local el jugador 2 puede confirmar al sucesor', () => {
  const t=fixture({mode:'local'});t.run('game.turn="ai";kill(game.bots[1],"prueba");chooseLeader("a2");');
  assert.deepEqual(t.state('({leader:game.leaders.ai,pending:pendingLeader,chosen:game.localLeaderChosen})'),{leader:'a2',pending:false,chosen:true});
});

test('perder el último superviviente descarta la mano y recluta un reemplazo', () => {
  const t=fixture();t.run('game.humans.forEach(p=>p.dead=true);replaceLastSurvivors();');
  assert.deepEqual(t.state('({alive:game.humans.filter(p=>!p.dead).length,hand:game.items.length,noReplacement:game.noReplacement})'),{alive:1,hand:0,noReplacement:false});
});

test('un reclutamiento normal es rechazado si la colonia está llena', () => {
  const t=fixture();t.run('game.helpless=6;');
  assert.equal(t.state('accessible(0)'),false);
  assert.equal(t.run('recruit("human")'),false);
  assert.equal(t.state('game.humans.length'),3);
});

test('reemplazo de emergencia puede entrar en otra localidad si colonia está llena', () => {
  const t=fixture();t.run('game.helpless=9;game.humans.forEach(p=>p.dead=true);replaceLastSurvivors();');
  // En la colonia quedan tres bots y nueve indefensos: está llena.
  assert.deepEqual(t.state('({alive:game.humans.filter(p=>!p.dead).length,location:game.humans.find(p=>!p.dead)?.loc,noReplacement:game.noReplacement})'),{alive:1,location:1,noReplacement:false});
});

test('sin lugares libres el reemplazo de emergencia falla y termina la partida', () => {
  const t=fixture();
  t.run('game.helpless=9; for(let loc=1;loc<=6;loc++)for(let i=0;i<4;i++)game.bots.push({id:"aF"+loc+"_"+i,name:"Extra"+loc+"_"+i,loc,wounds:0,frost:0,dead:false,equipment:[],influence:10});game.humans.forEach(p=>p.dead=true);verify();');
  assert.deepEqual(t.state('({noReplacement:game.noReplacement,ended:game.ended,turn:game.turn,humanAlive:game.humans.some(p=>!p.dead)})'),{noReplacement:true,ended:true,turn:'end',humanAlive:false});
});

test('cuando se agota el roster, no hay reemplazo disponible y el grupo pierde', () => {
  const t=fixture();
  t.run('for(const r of roster)if(!all().some(p=>p.name===r.name))game.bots.push({id:"aD"+game.nextId++,name:r.name,loc:1,dead:true,equipment:[]});game.humans.forEach(p=>p.dead=true);verify();');
  assert.deepEqual(t.state('({ended:game.ended,noReplacement:game.noReplacement})'),{ended:true,noReplacement:true});
});

test('rescate en espera no se incorpora mientras la colonia permanece llena', () => {
  const t=fixture();t.run('game.helpless=6;game.rescueQueue.push({side:"human"});processRescueQueue();');
  assert.deepEqual(t.state('({queue:game.rescueQueue.length,humans:game.humans.length})'),{queue:1,humans:3});
});

test('rescate en espera se incorpora al liberar una plaza en la colonia', () => {
  const t=fixture();t.run('game.helpless=6;game.rescueQueue.push({side:"human"});game.helpless=5;processRescueQueue();');
  assert.deepEqual(t.state('({queue:game.rescueQueue.length,humans:game.humans.length,loc:game.humans.at(-1).loc,notice:pendingRecruitInfo?.queued})'),{queue:0,humans:4,loc:0,notice:false});
});

test('las derrotas desactivan las decisiones de líder pendientes', () => {
  const t=fixture();t.run('requestLeader("human");game.morale=0;verify();');
  assert.deepEqual(t.state('({ended:game.ended,pendingLeader})'),{ended:true,pendingLeader:false});
});

test('matar dos veces al mismo personaje no resta moral dos veces', () => {
  const t=fixture();t.run('kill(game.humans[2],"primera");kill(game.humans[2],"segunda");');
  assert.equal(t.state('game.morale'),8);
});

// C9/#6 — Política A aprobada: J1 y J2 pueden elegir líder inicial solo antes
// de gastar un dado, moverse o usar exitosamente una carta en ronda 1.
test('C9 J2: gastar un dado en ataque bloquea la elección inicial solo de J2', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";selected=0;game.botDice=[6];attack();');
  assert.deepEqual(t.state('({flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader(),dice:game.botDice.length})'),
    {flagJ1:false,flagJ2:true,can:false,dice:0});
  t.run('chooseLeader("a0");');
  assert.equal(t.state('game.leaders.ai'),'a1');
});
test('C9 J1: gastar un dado conserva el bloqueo que ya tenía J1', () => {
  const t=fixture({mode:'local'});
  t.run('game.dice=[6];attack();');
  assert.deepEqual(t.state('({flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {flagJ1:true,flagJ2:false,can:false});
  t.run('game.turn="ai";');
  assert.equal(t.state('canPickStartingLeader()'),true);
});
test('C9 J2: movimiento válido bloquea su líder, no el de J1', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";selected=0;target=1;doMove();');
  assert.deepEqual(t.state('({loc:game.bots[0].loc,flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {loc:1,flagJ1:false,flagJ2:true,can:false});
});
test('C9 J1: movimiento válido mantiene el mismo comportamiento inicial', () => {
  const t=fixture({mode:'local'});
  t.run('target=1;doMove();');
  assert.deepEqual(t.state('({flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {flagJ1:true,flagJ2:false,can:false});
});
test('C9 J2: jugar carta válida confirma solo su líder inicial', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";selected=0;game.botItems=[catalog.create("ration")];playItem(0);');
  assert.deepEqual(t.state('({hand:game.botItems.length,flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {hand:0,flagJ1:false,flagJ2:true,can:false});
});
test('C9 J1: usar carta válida sigue cerrando su propia elección', () => {
  const t=fixture({mode:'local'});
  t.run('game.items=[catalog.create("ration")];playItem(0);');
  assert.deepEqual(t.state('({flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {flagJ1:true,flagJ2:false,can:false});
});
test('C9: fallos por dado insuficiente no confirman el líder inicial J2', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";game.botDice=[1];attack();');
  assert.deepEqual(t.state('({dice:game.botDice,flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {dice:[1],flagJ1:false,flagJ2:false,can:true});
});
test('C9: movimiento inválido no confirma líder J2', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";target=0;doMove();');
  assert.deepEqual(t.state('({flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {flagJ1:false,flagJ2:false,can:true});
});
test('C9: carta rechazada (combustible con movimiento agotado) no confirma líder J2', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";game.bots[0].moved=true;game.botItems=[catalog.create("gascan")];target=1;playItem(0);');
  assert.deepEqual(t.state('({hand:game.botItems.length,flagJ1:game.leaderChosen,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {hand:1,flagJ1:false,flagJ2:false,can:true});
});
test('C9: elegir líder J2 antes de actuar lo mantiene y no permite volver a elegir', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";chooseLeader("a0");game.botDice=[6];attack();chooseLeader("a2");');
  assert.deepEqual(t.state('({leader:game.leaders.ai,flagJ2:game.localLeaderChosen,can:canPickStartingLeader()})'),
    {leader:'a0',flagJ2:true,can:false});
});
test('C9: no se reabre elección de líder de J2 al iniciar ronda 2', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";game.botDice=[6];attack();game.round=2;game.turn="ai";');
  assert.equal(t.state('canPickStartingLeader()'),false);
});
test('C9 interfaz: grupo informa a J1 y J2 que deben elegir líder antes de actuar', () => {
  const t=fixture({mode:'local'});
  t.run('opened="group";renderModal();');
  const j1=t.state('document.getElementById("modalContent").innerHTML');
  assert.match(j1,/antes de gastar un dado, moverte o usar una carta/i);
  t.run('game.turn="ai";renderModal();');
  const j2=t.state('document.getElementById("modalContent").innerHTML');
  assert.match(j2,/antes de gastar un dado, moverte o usar una carta/i);
});

test('C9-R1: J1 no puede elegir sucesor de J2 durante su propio turno', () => {
  const t=fixture({mode:'local'});
  t.run('kill(game.bots[1],"prueba cruzada");');
  assert.deepEqual(t.state('({side:pendingLeaderSide,pending:pendingLeader,turn:game.turn,leader:game.leaders.ai})'),
    {side:'ai',pending:true,turn:'human',leader:null});
  t.run('chooseLeader("a2");');
  assert.deepEqual(t.state('({pending:pendingLeader,leader:game.leaders.ai})'),{pending:true,leader:null});
  t.run('game.turn="ai";chooseLeader("a2");');
  assert.deepEqual(t.state('({pending:pendingLeader,leader:game.leaders.ai})'),{pending:false,leader:'a2'});
});
test('C9-R1: J1 puede seguir moviéndose cuando el sucesor pendiente pertenece a J2', () => {
  const t=fixture({mode:'local'});
  t.run('kill(game.bots[1],"prueba cruzada");target=1;doMove();');
  assert.deepEqual(t.state('({loc:game.humans[0].loc,moved:game.humans[0].moved,waiting:pendingLeader,side:pendingLeaderSide})'),
    {loc:1,moved:true,waiting:true,side:'ai'});
});
test('C9-R1: J1 aún puede elegir su líder inicial aunque J2 tenga un sucesor pendiente', () => {
  const t=fixture({mode:'local'});
  t.run('kill(game.bots[1],"prueba cruzada");chooseLeader("h2");');
  assert.deepEqual(t.state('({j1:game.leaders.human,j2:game.leaders.ai,chosenJ1:game.leaderChosen,waiting:pendingLeader,side:pendingLeaderSide})'),
    {j1:'h2',j2:null,chosenJ1:true,waiting:true,side:'ai'});
});
test('C9-R1: J2 no puede elegir sucesor de J1 antes de devolverle el turno', () => {
  const t=fixture({mode:'local'});
  t.run('game.turn="ai";kill(game.humans[0],"prueba cruzada");chooseLeader("h2");');
  assert.deepEqual(t.state('({j1:game.leaders.human,waiting:pendingLeader,side:pendingLeaderSide})'),
    {j1:null,waiting:true,side:'human'});
  t.run('game.turn="human";chooseLeader("h2");');
  assert.deepEqual(t.state('({j1:game.leaders.human,waiting:pendingLeader})'),{j1:'h2',waiting:false});
});
test('C9-R1: interfaz de J1 no debe mostrar modal de sucesión pendiente de J2', () => {
  const t=fixture({mode:'local'});
  t.run('kill(game.bots[1],"prueba cruzada");');
  assert.equal(t.state('leaderChoiceReady()'),false);
  t.run('game.turn="ai";');
  assert.equal(t.state('leaderChoiceReady()'),true);
});
