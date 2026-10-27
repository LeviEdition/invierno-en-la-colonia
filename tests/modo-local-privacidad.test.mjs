// A2-01: caracterización del modo local. Ejecuta el script original de la V9.9.
// DOM simulado: la privacidad *visual* y el uso táctil requieren una prueba manual posterior.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createContext,runInContext} from 'node:vm';

const html=readFileSync(join(dirname(fileURLToPath(import.meta.url)),'..','invierno_colonia_v9_9.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1);
const bootstrap=/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1],bootstrap);
const source=scripts[0][1].replace(bootstrap,'');

function fixture(){
 const random={value:0.55},math=Object.create(Math);math.random=()=>random.value;
 const elements=new Map();
 function element(id){
  if(!elements.has(id)){
   const classes=new Set();
   elements.set(id,{
    innerHTML:'',textContent:'',hidden:true,disabled:false,style:{},dataset:{},
    classList:{add(s){classes.add(s);},remove(s){classes.delete(s);},contains(s){return classes.has(s);}},
    setAttribute(){},focus(){},
   });
  }
  return elements.get(id);
 }
 const document={
  getElementById:element,
  querySelector(selector){return selector==='#fabMenu button'?element('menuActionsButton'):null;},
  addEventListener(){},
 };
 const ctx=createContext({document,Math:math,queueMicrotask(){}});
 runInContext(source,ctx,{filename:'invierno_colonia_v9_9.js',timeout:2000});
 // Anulamos únicamente animaciones y notificaciones; paint(), show(), hide(),
 // startGame(), finishTurn() y la lógica real de cambios de jugador permanecen activas.
 runInContext('toast=()=>{};toggleFab=()=>{};deathDirector.open=()=>{};gameMode="local";create();game.crossPending=false;game.crossResolved=true;',ctx);
 return {
  run(code){return runInContext(code,ctx,{timeout:2000});},
  state(expr){return JSON.parse(runInContext('JSON.stringify('+expr+')',ctx,{timeout:2000}));},
  node:element,
 };
}
function stableColony(t){
 t.run('game.food=30;game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});game.crisis={type:"comida",need:2,given:2,contributions:["comida","comida"],fail:"moral"};');
}
async function passToJ2(t){
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'ai');
 assert.equal(t.state('passScreenActive'),true);
 t.run('confirmPass()');
}

test('A2-01 | las manos y dados de J1 y J2 son reservas separadas',()=>{
 const t=fixture();
 t.run('game.items=[catalog.create("bandage")];game.botItems=[catalog.create("rifle")];game.dice=[6];game.botDice=[2,4];');
 assert.deepEqual(t.state('({hand:controls.hand().map(x=>x.cardId),dice:controls.dice(),otherHand:controls.hand("ai").map(x=>x.cardId)})'),
  {hand:['bandage'],dice:[6],otherHand:['rifle']});
});

test('A2-01 | al iniciar J1, inventario y dados representados pertenecen a J1',()=>{
 const t=fixture();
 t.run('game.items=[catalog.create("bandage")];game.botItems=[catalog.create("rifle")];game.dice=[6];game.botDice=[2,4];show("inventory");paint();');
 assert.match(t.node('modalContent').innerHTML,/Vendas/);
 assert.doesNotMatch(t.node('modalContent').innerHTML,/Rifle de precisión/);
 assert.match(t.node('floatingDice').innerHTML,/valor 6/);
 assert.doesNotMatch(t.node('floatingDice').innerHTML,/valor 2/);
});

test('A2-01 | fin de J1 activa pantalla de pase y bloquea comandos visuales',async()=>{
 const t=fixture();
 await t.run('finishTurn()');
 assert.deepEqual(t.state('({turn:game.turn,active:passScreenActive,enabled:playable()})'),{turn:'ai',active:true,enabled:false});
 assert.equal(t.node('passScreen').hidden,false);
 assert.match(t.node('passTitle').textContent,/Jugador 2/);
 assert.equal(t.node('fabEndTurn').disabled,true);
 assert.equal(t.node('menuActionsButton').disabled,true);
 assert.equal(t.node('floatingDice').innerHTML,'');
});

test('A2-01 | durante el pase no se puede seleccionar ni gastar dados o comida',async()=>{
 const t=fixture();
 t.run('game.botDice=[3];game.dice=[6];');
 await t.run('finishTurn()');
 const before=t.state('({dice:game.botDice.slice(),food:game.food,selected:selected})');
 t.run('select(2);pickFloatingDie(0);boostDie();');
 assert.deepEqual(t.state('({dice:game.botDice.slice(),food:game.food,selected:selected})'),before);
 assert.equal(t.state('playable()'),false);
});

test('A2-01 | confirmar pase habilita dados y acciones de J2',async()=>{
 const t=fixture();
 t.run('game.botDice=[3];game.dice=[6];');
 await passToJ2(t);
 assert.equal(t.node('passScreen').hidden,true);
 assert.equal(t.state('playable()'),true);
 assert.equal(t.node('fabEndTurn').disabled,false);
 assert.match(t.node('floatingDice').innerHTML,/valor 3/);
 assert.doesNotMatch(t.node('floatingDice').innerHTML,/valor 6/);
});

test('A2-01 | inventario de J2 muestra solo mano propia tras confirmar',async()=>{
 const t=fixture();
 t.run('game.items=[catalog.create("bandage")];game.botItems=[catalog.create("rifle")];');
 await passToJ2(t);
 t.run('show("inventory");');
 assert.match(t.node('modalContent').innerHTML,/Rifle de precisión/);
 assert.doesNotMatch(t.node('modalContent').innerHTML,/Vendas/);
});

test('A2-01 | consumir dado de J2 no cambia reserva de J1',async()=>{
 const t=fixture();
 t.run('game.botDice=[3,5];game.dice=[6];');
 await passToJ2(t);
 t.run('consume(1);');
 assert.deepEqual(t.state('({human:game.dice,bot:game.botDice})'),{human:[6],bot:[5]});
});

test('C3 #3 | J2 puede mejorar su propio dado aunque J1 no tenga ninguno',async()=>{
 const t=fixture();
 t.run('game.dice=[];game.botDice=[3];game.food=7;');
 await passToJ2(t);
 assert.equal(t.state('playable()'),true);
 t.run('boostDie();');
 assert.deepEqual(t.state('({human:game.dice,bot:game.botDice,food:game.food})'),{human:[],bot:[4],food:6});
});

test('A2-01 | una encrucijada de ronda del J2 permanece pendiente bajo el pase',async()=>{
 const t=fixture();
 t.run('crossDraw=function(side){game.crossCard=crossroadsDeck.findIndex(c=>c.title==="La señal del mando");game.crossOwner=side;game.crossActorId=null;game.crossPending=false;game.crossResolved=false;};');
 await t.run('finishTurn()');
 assert.deepEqual(t.state('({pending:game.crossPending,owner:game.crossOwner,pass:passScreenActive})'),
 {pending:true,owner:'ai',pass:true});
 t.run('crossChoose(1);');
 assert.equal(t.state('game.crossPending'),true);
 t.run('confirmPass();');
 assert.equal(t.state('opened'),'crossroads');
 assert.match(t.node('modalContent').innerHTML,/La señal del mando/);
 t.run('crossChoose(1);');
 assert.deepEqual(t.state('({pending:game.crossPending,done:game.crossResolved})'),{pending:false,done:true});
});

test('A2-01 | el fin de turno queda bloqueado por una búsqueda pendiente',async()=>{
 const t=fixture();
 t.run('pendingLoot={actorId:"h0",loc:1,items:[catalog.create("bandage")]};');
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('opened'),'lootChoice');
 assert.match(t.node('modalContent').innerHTML,/Vendas/);
});

test('A2-01 | una transferencia pendiente impide pasar de jugador',async()=>{
 const t=fixture();
 t.run('game.humans[0].equipment=[catalog.create("pistol")];profileId="h0";startTransfer(0);');
 assert.equal(t.state('!!pendingTransfer'),true);
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('opened'),'transferTarget');
});

test('A2-01 | se conserva la selección de cada grupo entre rondas',async()=>{
 const t=fixture();stableColony(t);
 t.run('select(2);');
 assert.equal(t.state('person().name'),'Iris');
 await passToJ2(t);
 t.run('select(2);game.crossPending=false;game.crossResolved=true;');
 assert.equal(t.state('person().name'),'Sol');
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('passScreenActive'),true);
 t.run('confirmPass();');
 assert.deepEqual(t.state('({name:person().name,round:game.round,selected:selected,sides:selectionBySide})'),{
  name:'Iris',round:2,selected:2,sides:{human:2,ai:2}
 });
});

test('A2-01 | la colonia se procesa solo después de los dos turnos locales',async()=>{
 const t=fixture();stableColony(t);
 const food=t.state('game.food');
 await t.run('finishTurn()');
 assert.equal(t.state('game.round'),1);
 assert.equal(t.state('game.food'),food);
 t.run('confirmPass();game.crossPending=false;game.crossResolved=true;');
 await t.run('finishTurn()');
 assert.equal(t.state('game.round'),2);
 assert.equal(t.state('game.food'),food-3);
 assert.equal(t.state('passScreenActive'),true);
});

test('A2-01 | la pantalla vuelve a proteger el pase al comenzar ronda nueva',async()=>{
 const t=fixture();stableColony(t);
 await passToJ2(t);
 t.run('game.crossPending=false;game.crossResolved=true;');
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('passScreenActive'),true);
 assert.equal(t.node('passScreen').hidden,false);
 assert.match(t.node('passTitle').textContent,/Jugador 1/);
 assert.equal(t.node('floatingDice').innerHTML,'');
});

test('A2-01 | debilidad reproducible: finishTurn permite avanzar con pantalla de pase activa',async()=>{
 const t=fixture();stableColony(t);
 await t.run('finishTurn()');
 assert.equal(t.state('passScreenActive'),true);
 assert.equal(t.state('game.turn'),'ai');
 // Invocación directa de la función original, no interacción real con la pantalla.
 await t.run('finishTurn()');
 assert.equal(t.state('game.round'),2);
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('passScreenActive'),true);
});

test('A2-01 | nueva partida reinicia selección y bloqueo de manos sin mezclar los grupos',async()=>{
 const t=fixture();
 await passToJ2(t);
 t.run('game.botItems=[];game.items=[];selectionBySide.ai=2;startGame("local");');
 assert.deepEqual(t.state('({turn:game.turn,hands:[game.items.length,game.botItems.length],select:selectionBySide,pass:passScreenActive})'),
 {turn:'human',hands:[7,7],select:{human:0,ai:0},pass:false});
});

test('A2-01 | una curación pendiente impide terminar J1',async()=>{
 const t=fixture();
 t.run('game.humans[1].wounds=1;pendingHeal={actor:"h0",targets:["h1"]};');
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('opened'),'healTarget');
 assert.match(t.node('modalContent').innerHTML,/Elegí a quién atender/);
});

test('A2-01 | sucesión pendiente impide cerrar el turno',async()=>{
 const t=fixture();
 t.run('pendingLeader=true;pendingLeaderSide="human";');
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('opened'),'leaderChoice');
 assert.match(t.node('modalContent').innerHTML,/Elegí el líder del Jugador 1/);
});

test('A2-01 | una mordedura pendiente impide cerrar el turno',async()=>{
 const t=fixture();
 t.run('pendingBite={target:"h1",victims:[]};');
 await t.run('finishTurn()');
 assert.equal(t.state('game.turn'),'human');
 assert.equal(t.state('opened'),'biteChoice');
 assert.match(t.node('modalContent').innerHTML,/Propagación de mordedura|mordedura/);
});

test('A2-01 | confirmar pase de J2 reabre correctamente selección de líder pendiente',()=>{
 const t=fixture();
 t.run('game.turn="ai";passScreenActive=true;showPass("ai");pendingLeader=true;pendingLeaderSide="ai";');
 t.run('confirmPass();');
 assert.equal(t.state('opened'),'leaderChoice');
 assert.match(t.node('modalContent').innerHTML,/Elegí el líder del Jugador 2/);
 assert.equal(t.state('passScreenActive'),false);
});

test('C3 #3 | J2 sin dados no puede consumir comida aunque J1 tenga dados',async()=>{
 const t=fixture();t.run('game.dice=[5];game.botDice=[];game.food=7;');
 await passToJ2(t);t.run('boostDie();');
 assert.deepEqual(t.state('({human:game.dice,bot:game.botDice,food:game.food})'),{human:[5],bot:[],food:7});
});
test('C3 #3 | mejora del J2 respeta el límite de valor 6 y comida disponible',async()=>{
 const t=fixture();t.run('game.dice=[];game.botDice=[6];game.food=7;');
 await passToJ2(t);t.run('boostDie();');
 assert.deepEqual(t.state('({bot:game.botDice,food:game.food})'),{bot:[6],food:7});
 t.run('game.botDice=[5];game.food=0;boostDie();');
 assert.deepEqual(t.state('({bot:game.botDice,food:game.food})'),{bot:[5],food:0});
});
