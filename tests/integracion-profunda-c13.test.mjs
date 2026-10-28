import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,silentCross} from '../test-support/game-fixture.mjs';
const mechanical=t=>{const g=t.state('game');delete g.log;delete g.last;return g;};
for(const kind of ['transferencia','atracción','muerte-encolada'])test('C13 | '+kind+' reserva acciones normales y permite terminar su resolución',async()=>{
 const t=fixture();t.run(silentCross+'game.items=[catalog.create("ration")];game.dice=[6,5];game.waste=6;game.humans[0].equipment=[catalog.create("pistol")];profileId="h0";');
 if(kind==='transferencia')t.run('startTransfer(0);');
 else if(kind==='atracción')t.run('game.zones[1].z=2;attract();');
 else t.run('kill(game.humans[1],"cola");');
 const before=mechanical(t);t.run('playItem(0);boostDie();clean();');
 assert.deepEqual(mechanical(t),before);
 await Promise.resolve();
 if(kind==='transferencia'){t.run('chooseTransfer("h2");chooseTransfer("h2");');assert.equal(t.state('game.humans[2].equipment.length'),1);}
 else if(kind==='atracción'){t.run('chooseAttract(1);chooseAttract(1);');assert.equal(t.state('pendingAttract'),null);}
 else t.run('deathDirector.continue();');
 t.run('playItem(0);');assert.equal(t.state('game.items.length'),0);
});
for(const kind of ['encrucijada','botín','sucesión'])test('C13 | mejorar dado no gasta comida durante '+kind,()=>{
 const t=fixture();t.run(silentCross+'game.dice=[2];');
 if(kind==='encrucijada')t.run('game.crossResolved=false;game.crossCard=0;crossTrigger("move",game.humans[0]);');
 if(kind==='botín')t.run('game.humans[0].loc=1;game.dice=[6];search();game.dice=[2];');
 if(kind==='sucesión')t.run('kill(game.humans[0],"líder");');
 const before=mechanical(t);t.run('boostDie();');assert.deepEqual(mechanical(t),before);
});
for(const kind of ['cross','bite'])test('C13 | reinicio libera todas las esperas de '+kind,async()=>{
 const t=fixture({mode:'ai'});t.run(silentCross);
 if(kind==='cross')t.run('game.turn="ai";game.crossOwner="ai";game.crossPending=true;done1=false;done2=false;waitForAiCross().then(()=>done1=true);waitForAiCross().then(()=>done2=true);');
 else t.run('pendingBite={target:"h1",victims:[]};done1=false;done2=false;waitForBite().then(()=>done1=true);waitForBite().then(()=>done2=true);');
 t.run('create();');await Promise.resolve();assert.equal(t.state('done1&&done2'),true);
});
test('C13 | IA invocada tras el final no aplica congelación ni otros efectos',async()=>{
 const t=fixture({mode:'ai'});t.run('game.morale=0;verify();game.bots[0].frost=1;');const before=mechanical(t);await t.run('botTurn()');assert.deepEqual(mechanical(t),before);
});
for(const moral of [2,3])test('C13 | encrucijada, ambas muertes, sucesiones y objetivo con moral'+moral,()=>{
 const t=fixture();t.run('game.humans[0].loc=2;game.bots[1].loc=2;game.humans.slice(1).forEach(p=>p.loc=0);game.bots.filter(p=>p.id!=="a1").forEach(p=>p.loc=0);game.zones[2].z=zcap[2];game.samples=game.goal-1;game.morale='+moral+';game.crossOwner="human";game.crossCard=crossroadsDeck.findIndex(c=>c.title==="Un mensaje en la pared");game.crossResolved=false;game.crossPending=true;crossChoose(0);');
 assert.equal(t.state('game.ended'),true);assert.equal(t.state('pendingLeader'),false);
 assert.equal(t.state('gameOutcome(game)'),moral===2?'morale':'victory');
 const before=mechanical(t);t.run('crossChoose(0);playItem(0);attack();');assert.deepEqual(mechanical(t),before);
});
test('C13 | mordedura del último humano descarta mano y recluta una sola vez',()=>{
 const t=fixture();t.run(silentCross+'game.humans.slice(1).forEach(p=>p.dead=true);game.bots.forEach(p=>p.loc=1);game.items=[catalog.create("notes")];');t.roll(1);t.run('expose(game.humans[0],"último");');
 assert.equal(t.state('game.humans.filter(p=>!p.dead).length'),1);assert.equal(t.state('game.items.length'),0);assert.equal(t.state('!!groupLeader("human")'),true);
 const count=t.state('game.humans.length');t.run('biteNext();replaceLastSurvivors();');assert.equal(t.state('game.humans.length'),count);
});
test('C13 | un dado no se reutiliza y un botín no duplica cartas por confirmación repetida',()=>{
 const t=fixture();t.run(silentCross+'game.humans[0].loc=1;game.dice=[6];game.decks[1]=[catalog.create("notes"),catalog.create("ration")];search();');
 const count=t.state('game.items.length');t.run('search();chooseLoot(0);chooseLoot(0);');
 assert.equal(t.state('game.dice.length'),0);assert.equal(t.state('game.items.length'),count+1);assert.equal(t.state('game.decks[1].length'),1);
});
test('C13 | receptor muerto invalida transferencia sin duplicar y cancelar libera acción',async()=>{
 const t=fixture();t.run(silentCross+'profileId="h0";game.humans[0].equipment=[catalog.create("pistol")];startTransfer(0);kill(game.humans[1],"receptor");');
 await Promise.resolve();t.run('deathDirector.continue();chooseTransfer("h1");');
 assert.equal(t.state('game.humans[0].equipment.length'),1);assert.equal(t.state('game.humans[1].equipment.length'),0);
 t.run('cancelTransfer();');assert.equal(t.state('pendingTransfer'),null);
});
test('C13 | evaluar efectos no modifica cola múltiple ni promesas',()=>{
 const t=fixture();t.run('kill(game.humans[0],"h");kill(game.bots[1],"a");game.crossOwner="ai";game.crossCard=crossroadsDeck.findIndex(c=>c.title==="La radio encendida");');
 const before=t.state('({game,pendingLeaderSides,pendingLeader,pendingLeaderSide,leaderWaiters:leaderWaiters.length,death:deathDirector.pending})');
 t.run('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai");');assert.deepEqual(t.state('({game,pendingLeaderSides,pendingLeader,pendingLeaderSide,leaderWaiters:leaderWaiters.length,death:deathDirector.pending})'),before);
});

test('C13 | terminal cancela decisiones y libera esperas sin permitir confirmación tardía',async()=>{
 const t=fixture();t.run('game.crossPending=true;game.crossOwner="ai";pendingBite={target:"h1",victims:[]};game.biteResolving=true;pendingTransfer={fromId:"h0",targets:["h1"]};pendingHeal={actor:"h0",targets:["h1"]};pendingAttract={loc:0,left:1};doneCross=false;doneBite=false;waitForAiCross().then(()=>doneCross=true);waitForBite().then(()=>doneBite=true);game.morale=0;verify();');
 await Promise.resolve();assert.equal(t.state('!game.crossPending&&!game.biteResolving&&!pendingHeal&&!pendingTransfer&&!pendingAttract&&doneCross&&doneBite'),true);
 const before=mechanical(t);t.run('crossAiContinue();chooseBite("risk");chooseHeal("h1");');assert.deepEqual(mechanical(t),before);
});

test('C13-R1 | movimiento, muerte, sucesión y encrucijada conservan visible la decisión siguiente',async()=>{
 const t=fixture({render:true,face:3});t.run('game.crossCard=0;game.crossOwner="human";game.crossResolved=false;game.crossPending=false;game.humans[0].wounds=2;target=1;doMove();');
 await Promise.resolve();assert.equal(t.state('deathDirector.active'),true);
 t.run('deathDirector.continue();chooseLeader("h1");');
 assert.equal(t.state('game.crossPending'),true);assert.equal(t.state('opened'),'crossroads');
 assert.equal(t.node('backdrop').classList.contains('open'),true);
 t.run('crossChoose(0);');assert.equal(t.state('game.crossPending'),false);
});
test('C13-R1 | la sucesión no se confirma mientras una mordedura tiene prioridad',()=>{
 const t=fixture();t.run('kill(game.humans[0],"líder");pendingBite={target:"h1",victims:[]};');const before=mechanical(t);t.run('chooseLeader("h2");');assert.deepEqual(mechanical(t),before);
});
for(const kind of ['Heal','Attract','Transfer'])test('C13-R1 | cancelar'+kind+' no borra decisiones detrás de una mordedura',()=>{
 const t=fixture();t.run('pending'+kind+'={audit:true};pendingBite={target:"h1",victims:[]};');t.run('cancel'+kind+'();');assert.deepEqual(t.state('pending'+kind),{audit:true});
});
