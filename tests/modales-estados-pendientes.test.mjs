// Auditoría A3: modales, decisiones pendientes y transiciones.
// Caracterización A3 y regresiones C5 de las transiciones de turno.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContext,runInContext} from 'node:vm';

const html=readFileSync(join(dirname(fileURLToPath(import.meta.url)),'..','invierno_colonia_v9_9.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1);
const bootstrap=/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1],bootstrap);
const source=scripts[0][1].replace(bootstrap,'');

function fixture({mode='local',face=6}={}){
 const random={value:(face-0.5)/6}; const math=Object.create(Math); math.random=()=>random.value;
 const nodes=new Map();
 function node(id){
  if(!nodes.has(id)){
   const classes=new Set();
   nodes.set(id,{
    hidden:true,textContent:'',innerHTML:'',disabled:false,style:{},dataset:{},
    classList:{add(s){classes.add(s);},remove(s){classes.delete(s);},contains(s){return classes.has(s);}},
    setAttribute(){},focus(){},contains(){return false;},appendChild(){},remove(){},
   });
  }
  return nodes.get(id);
 }
 const document={getElementById:node,addEventListener(){},querySelector(selector){
   return selector==='#fabMenu button'?node('fabMenuFirstAction'):selector==='.deathContinue'?node('deathContinue'):null;
 }};
 const context=createContext({document,Math:math,queueMicrotask(){},setTimeout(fn){fn();}});
 runInContext(source,context,{filename:'invierno_colonia_v9_9.js',timeout:2500});
 runInContext('toast=()=>{};toggleFab=()=>{};gameMode='+JSON.stringify(mode)+';create();passScreenActive=false;game.crossPending=false;game.crossResolved=true;',context);
 return {run(code){return runInContext(code,context,{timeout:2500})},
  state(expr){return JSON.parse(runInContext('JSON.stringify('+expr+')',context,{timeout:2500}))},
  node,roll(face){random.value=(face-0.5)/6;}};
}

test('A3-01 | modal normal se abre y cierra con el estado visual',()=>{
 const t=fixture();t.run('show("help");');
 assert.equal(t.state('opened'),'help');
 assert.equal(t.node('backdrop').classList.contains('open'),true);
 assert.match(t.node('modalContent').innerHTML,/Turnos y dados/);
 t.run('hide();');
 assert.equal(t.state('opened'),'');
 assert.equal(t.node('backdrop').classList.contains('open'),false);
});

test('A3-01 | cambiar modal normal actualiza título y contenido',()=>{
 const t=fixture();t.run('show("goal");');
 assert.match(t.node('modalTitle').textContent,/Objetivo general/);
 t.run('show("crisis");');
 assert.match(t.node('modalTitle').textContent,/Crisis actual/);
 assert.match(t.node('modalContent').innerHTML,/Crisis de la ronda/);
});

test('A3-01 | una búsqueda pendiente fuerza el modal y bloquea el cierre',()=>{
 const t=fixture();
 t.run('pendingLoot={actorId:"h0",loc:1,items:[catalog.create("bandage")]};show("help");hide();');
 assert.equal(t.state('opened'),'lootChoice');
 assert.equal(t.node('backdrop').classList.contains('open'),true);
 assert.match(t.node('modalContent').innerHTML,/Vendas/);
});

test('A3-01 | curación pendiente no se puede ocultar hasta decidir o cancelar',()=>{
 const t=fixture();
 t.run('game.humans[1].wounds=1;pendingHeal={actor:"h0",targets:["h1"]};show("inventory");hide();');
 assert.equal(t.state('opened'),'healTarget');
 t.run('cancelHeal();');
 assert.equal(t.state('pendingHeal'),null);
 assert.equal(t.state('opened'),'');
 assert.equal(t.state('game.humans[0].skillUsed'),false);
});

test('A3-01 | curación consumada modifica objetivo correcto una sola vez',()=>{
 const t=fixture();
 t.run('game.humans[1].wounds=2;pendingHeal={actor:"h0",targets:["h1"]};show("healTarget");chooseHeal("h1");chooseHeal("h1");');
 assert.deepEqual(t.state('({wounds:game.humans[1].wounds,skill:game.humans[0].skillUsed,pending:pendingHeal})'),
  {wounds:1,skill:true,pending:null});
});

test('A3-01 | transferencia cancelada mantiene equipamiento y libera el modal',()=>{
 const t=fixture();
 t.run('game.humans[0].equipment=[catalog.create("pistol")];profileId="h0";startTransfer(0);');
 assert.equal(t.state('opened'),'transferTarget');
 t.run('hide();');
 assert.equal(t.state('opened'),'transferTarget');
 t.run('cancelTransfer();');
 assert.equal(t.state('pendingTransfer'),null);
 assert.equal(t.state('game.humans[0].equipment.length'),1);
 assert.equal(t.state('opened'),'');
});

test('A3-01 | transferir equipamiento ejecuta una vez y no duplica por doble click',()=>{
 const t=fixture();
 t.run('game.humans[0].equipment=[catalog.create("pistol")];profileId="h0";startTransfer(0);chooseTransfer("h1");chooseTransfer("h1");');
 assert.deepEqual(t.state('({source:game.humans[0].equipment.length,dest:game.humans[1].equipment.length,pending:pendingTransfer})'),{
  source:0,dest:1,pending:null});
});

test('A3-01 | atraer zombis consume un dado y cancelar no devuelve el dado',()=>{
 const t=fixture();
 t.run('game.dice=[6,5];attract();');
 assert.equal(t.state('opened'),'attractTarget');
 assert.equal(t.state('game.dice.length'),1);
 t.run('cancelAttract();');
 assert.equal(t.state('pendingAttract'),null);
 assert.equal(t.state('game.dice.length'),1);
 assert.equal(t.state('opened'),'');
});

test('A3-01 | elección válida de atraer no permite decidir nuevamente tras finalizar',()=>{
 const t=fixture();
 t.run('pendingAttract={loc:0,left:1};show("attractTarget");');
 const before=t.state('game.zones[1].z');
 t.run('chooseAttract(1);chooseAttract(1);');
 assert.equal(t.state('game.zones[1].z'),before-1);
 assert.equal(t.state('pendingAttract'),null);
 assert.equal(t.state('opened'),'');
});

test('A3-01 | búsqueda permite ruido hasta límite y conserva el mismo modal',()=>{
 const t=fixture();
 t.run('game.decks[1]=Array.from({length:6},()=>catalog.create("ration"));pendingLoot={actorId:"h0",loc:1,items:[catalog.create("bandage")]};show("lootChoice");');
 t.run('for(let i=0;i<6;i++)addNoiseSearch();');
 assert.deepEqual(t.state('({noise:game.zones[1].noise,cards:pendingLoot.items.length,deck:game.decks[1].length})'),
 {noise:4,cards:5,deck:2});
 assert.equal(t.state('opened'),'lootChoice');
});

test('A3-01 | elección de botín devuelve las cartas no elegidas y resiste doble elección',()=>{
 const t=fixture();
 t.run('game.decks[1]=[];pendingLoot={actorId:"h0",loc:1,items:[catalog.create("bandage"),catalog.create("ration")]};show("lootChoice");');
 const before=t.state('game.items.length');
 t.run('chooseLoot(0);chooseLoot(1);');
 assert.deepEqual(t.state('({hand:game.items.length,deck:game.decks[1].map(c=>c.cardId),pending:pendingLoot})'),
 {hand:before+1,deck:['ration'],pending:null});
});

test('A3-01 | elección de botín inválida conserva estado y opciones',()=>{
 const t=fixture();
 t.run('pendingLoot={actorId:"h0",loc:1,items:[catalog.create("bandage")]};show("lootChoice");');
 t.run('chooseLoot(-1);chooseLoot(99);');
 assert.equal(t.state('!!pendingLoot'),true);
 assert.equal(t.state('opened'),'lootChoice');
});

test('A3-01 | la encrucijada bloquea cierre y no permite ejecutarse dos veces',()=>{
 const t=fixture();
 t.run('game.crossCard=crossroadsDeck.findIndex(c=>c.title==="Golpes en la puerta");game.crossOwner="human";game.crossPending=true;game.crossResolved=false;show("help");hide();');
 assert.equal(t.state('opened'),'crossroads');
 const m=t.state('game.morale');
 t.run('crossChoose(0);crossChoose(0);');
 assert.equal(t.state('game.morale'),m+1);
 assert.equal(t.state('game.crossPending'),false);
});

test('A3-01 | encrucijada deshabilitada no modifica el estado',()=>{
 const t=fixture();
 t.run('game.items=[catalog.create("ration")];game.crossCard=crossroadsDeck.findIndex(c=>c.title==="Fiebre en el refugio");game.crossOwner="human";game.crossPending=true;game.crossResolved=false;show("crossroads");');
 const before=t.state('game.morale');
 t.run('crossChoose(0);');
 assert.equal(t.state('game.crossPending'),true);
 assert.equal(t.state('game.morale'),before);
});

test('A3-01 | prioridades del modal respetan mordedura, liderazgo, búsqueda y curación',()=>{
 const t=fixture();
 t.run('pendingBite={target:"h1",victims:[]};pendingLeader=true;pendingLoot={actorId:"h0",loc:1,items:[]};pendingHeal={actor:"h0",targets:["h1"]};show("help");');
 assert.equal(t.state('opened'),'biteChoice');
 t.run('pendingBite=null;show("help");');
 assert.equal(t.state('opened'),'leaderChoice');
 t.run('pendingLeader=false;show("help");');
 assert.equal(t.state('opened'),'lootChoice');
 t.run('pendingLoot=null;show("help");');
 assert.equal(t.state('opened'),'healTarget');
});

test('A3-01 | mordedura pendiente no permite cerrar ni pasar turno',async()=>{
 const t=fixture();
 t.run('game.biteResolving=true;pendingBite={target:"h1",victims:[]};show("biteChoice");hide();');
 assert.equal(t.state('opened'),'biteChoice');
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 t.run('chooseBite("risk");');
 assert.equal(t.state('pendingBite'),null);
 assert.equal(t.state('game.humans[1].dead'),false);
});

test('A3-01 | elegir sucesor resuelve el modal, una segunda elección no altera líder',()=>{
 const t=fixture();
 t.run('game.humans[0].dead=true;game.leaders.human=null;pendingLeader=true;pendingLeaderSide="human";show("leaderChoice");chooseLeader("h2");chooseLeader("h1");');
 assert.deepEqual(t.state('({leader:game.leaders.human,pending:pendingLeader})'),{leader:'h2',pending:false});
});

test('A3-01 | fallecimiento abre diálogo y continúa sin mostrarlo dos veces',()=>{
 const t=fixture();
 t.run('kill(game.humans[1],"auditoria");deathDirector.open();');
 assert.equal(t.node('deathBackdrop').hidden,false);
 assert.equal(t.state('deathDirector.active'),true);
 assert.match(t.node('deathDetails').innerHTML,/Leo/);
 t.run('deathDirector.continue();');
 assert.equal(t.state('deathDirector.active'),false);
 assert.equal(t.node('deathBackdrop').hidden,true);
});

test('A3-01 | la pantalla de pase impide acciones normales aunque pueda abrirse modal informativo',()=>{
 const t=fixture();
 t.run('game.turn="ai";passScreenActive=true;showPass("ai");show("actions");');
 assert.equal(t.state('opened'),'');
 t.run('show("help");');
 assert.equal(t.state('opened'),'help');
 assert.equal(t.state('playable()'),false);
 assert.equal(t.node('passScreen').hidden,false);
});

for(const [mode,side] of [['local','human'],['local','ai'],['ai','human']]){
 function healingFixture(){
  const t=fixture({mode});
  t.run(`game.turn=${JSON.stringify(side)};controls.group()[1].wounds=2;controls.group()[1].frost=1;game.items=[catalog.create("ration"),catalog.create("pistol")];game.botItems=[catalog.create("ration"),catalog.create("pistol")];controls.group()[0].equipment=[catalog.create("crowbar")];profileId=controls.group()[0].id;game.crisis={type:"comida",need:2,given:0,contributions:[],fail:"moral"};special();`);
  assert.equal(t.state('!!pendingHeal'),true);
  assert.equal(t.state('opened'),'healTarget');
  return t;
 }
 for(const resolution of ['heal','cancel']){
  test(`C6-R1 | ${mode}/${side}: botín antes de curación, recuperación al ${resolution}`,()=>{
   const t=fixture({mode});
   t.run(`game.turn=${JSON.stringify(side)};selected=0;controls.group()[0].loc=1;controls.group()[1].loc=1;controls.group()[1].wounds=1;controls.group()[1].frost=1;game.dice=[6,5];game.botDice=[6,5];game.items=[catalog.create("pistol")];game.botItems=[catalog.create("crowbar")];game.decks[1]=[catalog.create("ration"),catalog.create("bandage"),catalog.create("gascan")];search();`);
   assert.equal(t.state('!!pendingLoot'),true);
   assert.equal(t.state('pendingHeal'),null);
   assert.equal(t.state('opened'),'lootChoice');
   const before=t.state('({game,pendingLoot,pendingHeal,selected,picked,target,opened})');
   t.run('special();special();');
   assert.deepEqual(t.state('({game,pendingLoot,pendingHeal,selected,picked,target,opened})'),before);
   assert.equal(t.node('backdrop').classList.contains('open'),true);
   // La búsqueda conserva sus comandos reales después de rechazar la habilidad.
   t.run('addNoiseSearch();');
   assert.equal(t.state('pendingLoot.items.length'),2);
   assert.equal(t.state('game.zones[1].noise'),1);
   const other=t.state('controls.hand(controls.side==="human"?"ai":"human")');
   const handSize=t.state('currentHand().length');
   t.run('chooseLoot(0);chooseLoot(0);');
   assert.equal(t.state('pendingLoot'),null);
   assert.equal(t.state('currentHand().length'),handSize+1);
   assert.equal(t.state('currentHand().at(-1).cardId'),'ration');
   assert.deepEqual(t.state('controls.hand(controls.side==="human"?"ai":"human")'),other);
   t.run('special();');
   assert.equal(t.state('!!pendingHeal'),true);
   assert.equal(t.state('opened'),'healTarget');
   const healing=t.state('({game,pendingLoot,pendingHeal,selected,picked,target,opened})');
   t.run('search();');
   assert.deepEqual(t.state('({game,pendingLoot,pendingHeal,selected,picked,target,opened})'),healing);
   if(resolution==='heal'){
    t.run('chooseHeal(controls.group()[1].id);chooseHeal(controls.group()[1].id);');
    assert.equal(t.state('controls.group()[0].skillUsed'),true);
    assert.deepEqual(t.state('({wounds:controls.group()[1].wounds,frost:controls.group()[1].frost})'),side==='human'?{wounds:0,frost:1}:{wounds:1,frost:0});
   }else{
    t.run('cancelHeal();');
    assert.equal(t.state('controls.group()[0].skillUsed'),false);
    assert.deepEqual(t.state('({wounds:controls.group()[1].wounds,frost:controls.group()[1].frost})'),{wounds:1,frost:1});
   }
   assert.equal(t.state('pendingHeal'),null);
   assert.equal(t.state('opened'),'');
   assert.equal(t.state('!!playable()'),true);
   t.run('search();');
   assert.equal(t.state('!!pendingLoot'),true);
   assert.equal(t.state('opened'),'lootChoice');
  });
 }
 for(const command of ['playItem(0)','equipItem(1)','contribute(0)','contributeEquipment(profileId,0)','startTransfer(0)']){
  test(`C6 #9 | ${mode}/${side}: ${command} no altera la partida durante curación`,()=>{
   const t=healingFixture();
   if(command.startsWith('contributeEquipment'))t.run('game.crisis.type="herramienta";');
   const before=t.state('({game,pendingHeal,pendingTransfer,selected,opened})');
   t.run(command);
   assert.deepEqual(t.state('({game,pendingHeal,pendingTransfer,selected,opened})'),before);
   assert.equal(t.node('backdrop').classList.contains('open'),true);
  });
 }
 test(`C6 #9 | ${mode}/${side}: elegir paciente cura una vez y libera el inventario`,()=>{
  const t=healingFixture();
  const field=side==='human'?'wounds':'frost';
  const before=t.state(`controls.group()[1].${field}`);
  t.run('chooseHeal(controls.group()[1].id);chooseHeal(controls.group()[1].id);');
  assert.equal(t.state(`controls.group()[1].${field}`),before-1);
  assert.equal(t.state('controls.group()[0].skillUsed'),true);
  assert.equal(t.state('pendingHeal'),null);
  assert.equal(t.state('opened'),'');
  const food=t.state('game.food');
  t.run('playItem(0);');
  assert.equal(t.state('game.food'),food+1);
  assert.equal(t.state('currentHand().length'),1);
 });
 test(`C6 #9 | ${mode}/${side}: cancelar conserva habilidad y permite equipar`,()=>{
  const t=healingFixture();
  t.run('cancelHeal();');
  assert.equal(t.state('pendingHeal'),null);
  assert.equal(t.state('controls.group()[0].skillUsed'),false);
  assert.equal(t.state('opened'),'');
  t.run('equipItem(1);');
  assert.deepEqual(t.state('controls.group()[0].equipment.map(x=>x.cardId)'),['crowbar','pistol']);
  assert.equal(t.state('currentHand().length'),1);
 });
}

for(const mode of ['local','ai']){
 test(`C5 #10 | ${mode}: fallecimiento bloquea fin de turno y Continuar permite reintentarlo`,{timeout:2000},async()=>{
  const t=fixture({mode});
  t.run('game.food=30;game.zones.forEach(z=>{z.z=0;z.noise=0});game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};game.bots.forEach(p=>p.moved=true);game.botItems=[];game.botDice=[];crossDraw=side=>{game.crossOwner=side;game.crossPending=false;game.crossResolved=true;};kill(game.humans[1],"regresion C5");deathDirector.open();');
  assert.equal(t.state('deathDirector.active'),true);
  const before=t.state('({game,selected,picked,target,selectionBySide,opened,passScreenActive})');
  await t.run('finishTurn()');
  await t.run('menuEndTurn()');
  assert.deepEqual(t.state('({game,selected,picked,target,selectionBySide,opened,passScreenActive})'),before);
  assert.equal(t.node('deathBackdrop').hidden,false);
  assert.equal(t.state('deathDirector.active'),true);
  t.run('deathDirector.continue();');
  assert.equal(t.state('deathDirector.active'),false);
  // Confirmar el fallecimiento no termina el turno automáticamente.
  assert.equal(t.state('game.turn'),'human');
  await t.run('finishTurn()');
  assert.equal(t.state('game.round'),mode==='local'?1:2);
  assert.equal(t.state('game.turn'),mode==='local'?'ai':'human');
  assert.equal(t.state('aiRunning'),false);
 });
}
