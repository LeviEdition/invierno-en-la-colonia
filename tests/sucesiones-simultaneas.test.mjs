import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,silentCross} from '../test-support/game-fixture.mjs';

function prepare(t){t.run(silentCross+'game.round=2;game.leaderChosen=true;game.localLeaderChosen=true;game.food=30;game.morale=9;game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});');}
for(const order of [['human','ai'],['ai','human']])test('C12 | ambos líderes: '+order.join('→')+', cada dueño conserva su sucesión',async()=>{
 const t=fixture();prepare(t);
 for(const side of order)t.run('kill(groupLeader('+JSON.stringify(side)+'),"regresión C12");');
 await Promise.resolve();t.run('deathDirector.continue();reviewLeader("human");reviewLeader("ai");');
 assert.equal(t.state('leaderChoiceReady()'),true);
 t.run('chooseLeader("a0");');assert.equal(t.state('game.leaders.ai'),null);
 t.run('chooseLeader("h1");');assert.equal(t.state('game.leaders.human'),'h1');
 assert.equal(t.state('pendingLeader'),true,'la solicitud J2 no se pierde al resolver J1');
 await t.run('finishTurn()');assert.equal(t.state('passScreenActive'),true);
 assert.equal(t.state('leaderChoiceReady()'),false);
 t.run('confirmPass();chooseLeader("a0");');
 assert.deepEqual(t.state('({leaders:game.leaders,pending:pendingLeader})'),{leaders:{human:'h1',ai:'a0'},pending:false});
});
test('C12 | crisis real mata ambos líderes, sobrevive el pendiente J2 hasta ronda siguiente',async()=>{
 const t=fixture();prepare(t);
 t.run('game.turn="ai";game.humans.forEach(p=>p.loc=p.id==="h0"?0:1);game.bots.forEach(p=>p.loc=p.id==="a1"?0:1);game.zones[0].z=zcap[0];game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"zombie"};transition=finishTurn();');
 await Promise.resolve();assert.equal(t.state('deathDirector.active'),true);
 assert.equal(t.state('game.humans[0].dead&&game.bots[1].dead'),true);
 t.run('deathDirector.continue();');await t.run('transition');
 t.run('confirmPass();chooseLeader("h1");');await t.run('finishTurn()');
 t.run('confirmPass();');assert.equal(t.state('leaderChoiceReady()'),true);
 t.run('chooseLeader("a0");');assert.equal(t.state('game.leaders.ai'),'a0');
});
test('C12 | muerte posterior y revisión duplicada no duplican ni descartan solicitudes',()=>{
 const t=fixture();prepare(t);t.run('kill(game.bots[1],"primero");reviewLeader("ai");kill(game.humans[0],"después");reviewLeader("human");chooseLeader("h1");');
 assert.equal(t.state('pendingLeader'),true);t.run('game.turn="ai";chooseLeader("a2");chooseLeader("a0");');
 assert.equal(t.state('game.leaders.ai'),'a2');assert.equal(t.state('pendingLeader'),false);
});
test('C12 | un único candidato de J2 no cancela la sucesión pendiente J1',()=>{
 const t=fixture();prepare(t);t.run('kill(game.humans[0],"líder J1");kill(game.bots[2],"segundo J2");kill(game.bots[1],"líder J2");');
 assert.equal(t.state('game.leaders.ai'),'a0');assert.equal(t.state('pendingLeader'),true);t.run('chooseLeader("h2");');assert.equal(t.state('game.leaders.human'),'h2');
});
test('C12 | IA automática y último superviviente con reemplazo no borran la solicitud humana',()=>{
 const t=fixture({mode:'ai'});prepare(t);t.run('kill(game.humans[0],"J1");kill(game.bots[1],"IA");kill(game.bots[2],"IA");kill(game.bots[0],"IA");');
 assert.equal(t.state('!!groupLeader("ai")'),true);assert.equal(t.state('pendingLeader'),true);t.run('chooseLeader("h2");');assert.equal(t.state('pendingLeader'),false);
});
test('C12 | mordedura pendiente no consume sucesiones y se resuelven después',()=>{
 const t=fixture();prepare(t);t.run('game.biteResolving=true;pendingBite={target:"h1",victims:[]};kill(game.humans[0],"J1");kill(game.bots[1],"J2");show("help");');
 assert.equal(t.state('opened'),'biteChoice');t.run('chooseBite("risk");deathDirector.continue();chooseLeader("h2");game.turn="ai";chooseLeader("a0");');
 assert.equal(t.state('game.leaders.ai'),'a0');
});
for(const terminal of ['moral','tiempo','reinicio'])test('C12 | '+terminal+' liquida pendientes y libera todas las esperas',async()=>{
 const t=fixture();prepare(t);t.run('kill(game.humans[0],"J1");'+(terminal==='tiempo'?'':'kill(game.bots[1],"J2");')+'done1=false;done2=false;waitForLeader().then(()=>done1=true);waitForLeader().then(()=>done2=true);');
 if(terminal==='moral')t.run('game.morale=0;verify();');
 else if(terminal==='reinicio')t.run('create();');
 else {
  await Promise.resolve();
  t.run('game.turn="ai";game.max=game.round;game.zones.forEach(z=>z.z=0);game.crisis={type:"comida",need:0,given:0,contributions:[],fail:"moral"};deathDirector.continue();');
  await t.run('finishTurn()');assert.equal(t.state('game.ended'),true);
 }
 await Promise.resolve();assert.equal(t.state('!pendingLeader&&done1&&done2'),true);
});

for(const ending of ['reinicio','victoria'])test('C12-R1 | IA suspendida por sucesión no actúa tras '+ending,async()=>{
 const t=fixture({mode:'ai'});prepare(t);
 t.run('kill(game.humans[0],"sucesión suspendida");game.turn="ai";aiRunning=true;skipAI=true;game.botItems=[catalog.create("pistol")];oldFlow=botTurn();');
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(t.state('leaderWaiters.length'),1);
 if(ending==='reinicio')t.run('create();game.crossPending=false;game.crossResolved=true;game.botItems=[catalog.create("notes")];game.botDice=[];game.bots.forEach(p=>p.moved=true);skipAI=true;');
 else t.run('game.samples=game.goal;verify();deathDirector.continue();');
 const before=t.state('({game,selected,aiRunning,passScreenActive})');
 await t.run('oldFlow');assert.deepEqual(t.state('({game,selected,aiRunning,passScreenActive})'),before);
});
test('C12-R1 | colonia suspendida por muerte no avanza ni abre pase en partida nueva',async()=>{
 const t=fixture();prepare(t);
 t.run('game.turn="ai";game.bots[2].wounds=2;game.crisis={type:"medicina",need:1,given:0,contributions:[],fail:"wound"};oldFlow=finishTurn();');
 await Promise.resolve();assert.equal(t.state('deathDirector.active'),true);
 t.run('create();');const before=t.state('({game,aiRunning,passScreenActive,opened})');
 await t.run('oldFlow');assert.deepEqual(t.state('({game,aiRunning,passScreenActive,opened})'),before);
});
