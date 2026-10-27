import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { createContext, runInContext } from 'node:vm';
const html=readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'invierno_colonia_v9_9.html'), 'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1);
const bootstrap=/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
assert.match(scripts[0][1],bootstrap);
const source=scripts[0][1].replace(bootstrap,'');
function fixture({mode='ai'}={}){
 const random={value:0.45};const math=Object.create(Math);math.random=()=>random.value;
 const elements=new Map();const document={addEventListener(){},getElementById(id){if(!elements.has(id))elements.set(id,{hidden:true,textContent:'',innerHTML:'',dataset:{},classList:{add(){},remove(){}}});return elements.get(id)}};
 const ctx=createContext({document,Math:math,queueMicrotask(){}});
 runInContext(source,ctx,{timeout:2000});
 runInContext('paint=()=>{};toast=()=>{};show=()=>{};hide=()=>{};deathDirector.open=()=>{};',ctx);
 runInContext('gameMode='+JSON.stringify(mode)+';create();passScreenActive=false;game.crossPending=false;game.crossResolved=true;',ctx);
 return {run(code){return runInContext(code,ctx,{timeout:2000})},val(expr){return JSON.parse(runInContext('JSON.stringify('+expr+')',ctx))}, set(title,side='human'){
    runInContext('game.crossCard=crossroadsDeck.findIndex(c=>c.title==='+JSON.stringify(title)+');if(game.crossCard<0)throw Error("No such narrative card");game.crossOwner='+JSON.stringify(side)+';game.turn='+JSON.stringify(side)+';game.crossPending=false;game.crossResolved=false;game.crossActorId=null;',ctx);
 }};
}
function trigger(t,when='round',actor='null'){t.run('crossTrigger('+JSON.stringify(when)+','+actor+');');}

test('el catálogo narrativo tiene cartas con título, disparador e historias y dos elecciones',()=>{
 const t=fixture();const c=t.val('crossroadsDeck.map(c=>({title:c.title,when:c.when,text:c.story,n:c.choices.length}))');
 assert.ok(c.length>=20);
 assert.ok(c.every(x=>x.title&&x.text&&x.n===2&&['round','move','search','attack'].includes(x.when)));
});
test('una carta se extrae sin repetir antes de agotar el mazo',()=>{
 const t=fixture();const n=t.val('crossroadsDeck.length');const start=t.val('game.crossCard');
 t.run('game.crossRemaining=crossroadsDeck.map((_,i)=>i).filter(i=>i!==game.crossCard);');
 const cards=[start];for(let i=0;i<n-1;i++){t.run('crossDraw();');cards.push(t.val('game.crossCard'));}
 assert.equal(new Set(cards).size,n);
 assert.equal(t.val('game.crossRemaining.length'),0);
 t.run('crossDraw()');assert.equal(t.val('game.crossRemaining.length'),n-1);
});
test('desencadenante distinto no revela la encrucijada',()=>{
 const t=fixture();t.set('Golpes en la puerta');trigger(t,'search','game.humans[0]');assert.equal(t.val('game.crossPending'),false);
});
test('encrucijadas pendientes no se activan dos veces',()=>{
 const t=fixture();t.set('Golpes en la puerta');trigger(t,'move','game.humans[0]');assert.equal(t.val('game.crossPending'),true);
 t.run('game.crossCard=crossroadsDeck.findIndex(c=>c.title==="La radio encendida");');trigger(t,'search','game.humans[0]');
 assert.equal(t.val('game.crossPending'),true);assert.equal(t.val('game.crossActorId'),'h0');
});
test('una historia resuelta no reaparece al repetir su disparador',()=>{
 const t=fixture();t.set('Golpes en la puerta');trigger(t,'move','game.humans[0]');assert.equal(t.run('resolveCross(0)'),true);
 trigger(t,'move','game.humans[0]');assert.equal(t.val('game.crossPending'),false);
});
test('la activación guarda al superviviente que provocó el evento',()=>{
 const t=fixture();t.set('Golpes en la puerta');trigger(t,'move','game.humans[2]');
 assert.equal(t.val('game.crossActorId'),'h2');
});
test('si no es el turno del propietario, no se activa',()=>{
 const t=fixture();t.set('Golpes en la puerta');t.run('game.crossOwner="ai";game.turn="human";');trigger(t,'move','game.humans[0]');assert.equal(t.val('game.crossPending'),false);
});
test('las partidas terminadas no activan eventos',()=>{
 const t=fixture();t.set('Golpes en la puerta');t.run('game.ended=true;');trigger(t,'move','game.humans[0]');assert.equal(t.val('game.crossPending'),false);
});
test('un requisito de influencia impide la activación con actor débil',()=>{
 const t=fixture();t.set('El aviso del centinela');trigger(t,'attack','game.humans[1]');assert.equal(t.val('game.crossPending'),false);
 trigger(t,'attack','game.humans[0]');assert.equal(t.val('game.crossPending'),true);
});
test('requisito de localidad limita una historia de búsqueda',()=>{
 const t=fixture();t.set('Un almacén bajo el hielo');trigger(t,'search','game.humans[0]');assert.equal(t.val('game.crossPending'),false);
 t.run('game.humans[0].loc=4;');trigger(t,'search','game.humans[0]');assert.equal(t.val('game.crossPending'),true);
});
test('cartas de ronda usan al líder aunque no haya actor concreto',()=>{
 const t=fixture();t.set('La señal del mando');trigger(t);assert.equal(t.val('game.crossPending'),true);
});
test('elección humana modifica moral e indefensos y marca resuelta',()=>{
 const t=fixture();t.set('Golpes en la puerta');trigger(t,'move','game.humans[0]');t.run('crossChoose(0);');
 assert.deepEqual(t.val('({morale:game.morale,helpless:game.helpless,resolved:game.crossResolved,pending:game.crossPending})'),{morale:10,helpless:2,resolved:true,pending:false});
});
test('rechazo de una decisión duplicada evita cobrar beneficios dos veces',()=>{
 const t=fixture();t.set('Golpes en la puerta');trigger(t,'move','game.humans[0]');t.run('crossChoose(0);crossChoose(0);');
 assert.deepEqual(t.val('({helpless:game.helpless,morale:game.morale})'),{helpless:2,morale:10});
});
test('no se puede elegir índice de opción inexistente',()=>{
 const t=fixture();t.set('Golpes en la puerta');trigger(t,'move','game.humans[0]');assert.equal(t.run('resolveCross(99)'),false);
 assert.equal(t.val('game.crossPending'),true);
});
test('sin alimentos no se puede elegir una alternativa que los gasta',()=>{
 const t=fixture();t.set('Disparos a lo lejos');t.run('game.food=0;');trigger(t,'attack','game.humans[0]');
 assert.equal(t.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"human")'),false);
 assert.equal(t.run('resolveCross(0)'),false);
});
test('una alternativa de negociar gasta comida y elimina zombis cuando es posible',()=>{
 const t=fixture();t.set('Disparos a lo lejos');t.run('game.zones[0].z=3;');trigger(t,'attack','game.humans[0]');
 assert.equal(t.run('resolveCross(0)'),true);assert.deepEqual(t.val('({food:game.food,z:game.zones[0].z})'),{food:5,z:1});
});
test('ayudar a familiares consume plazas disponibles de colonia',()=>{
 const t=fixture();t.set('Golpes en la puerta');t.run('game.helpless=6;');trigger(t,'move','game.humans[0]');
 assert.equal(t.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"human")'),false);
 assert.equal(t.run('resolveCross(0)'),false);
});
test('buscar una medicina en hospital permite curar familias con un costo demográfico',()=>{
 const t=fixture();t.set('El último botiquín');t.run('game.humans[0].loc=2;');trigger(t,'search','game.humans[0]');t.run('resolveCross(1);');
 assert.deepEqual(t.val('({morale:game.morale,helpless:game.helpless})'),{morale:10,helpless:2});
});
test('al ganar objetos, algunas historias devuelven representaciones de texto de la V9.9',()=>{
 const t=fixture();t.set('La farmacia saqueada');trigger(t,'search','game.humans[0]');t.run('resolveCross(0);');
 assert.deepEqual(t.val('game.items.slice(-2)'),['medicina','medicina']);
});
test('C2 #2 | medicina estructurada habilita opción de fiebre',()=>{
 const t=fixture();t.set('Fiebre en el refugio');
 assert.equal(t.val('game.items.some(it=>it.kind==="medicina")'),true);
 assert.equal(t.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"human")'),true);
});
test('C2 #2 | combustible estructurado habilita opción de generador',()=>{
 const t=fixture();t.set('El generador averiado');
 assert.equal(t.val('game.items.some(it=>it.kind==="combustible")'),true);
 assert.equal(t.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"human")'),true);
});
test('la IA elige opción por heurística de los textos y aplica efecto',()=>{
 const t=fixture();t.set('Golpes en la puerta','ai');t.run('game.mode="ai";');trigger(t,'move','game.bots[0]');
 assert.equal(t.val('aiCrossChoice'),0);t.run('crossAiContinue();');
 assert.deepEqual(t.val('({helpless:game.helpless,done:game.crossResolved,pending:game.crossPending})'),{helpless:2,done:true,pending:false});
});
test('IA elige riesgosamente la señal de radio porque interpreta palabras y no consecuencias',()=>{
 const t=fixture();t.set('La radio encendida','ai');trigger(t,'search','game.bots[0]');
 assert.equal(t.val('aiCrossChoice'),0);t.run('crossAiContinue();');assert.deepEqual(t.val('({food:game.food,z:game.zones[1].z,morale:game.morale})'),{food:8,z:3,morale:9});
});
test('en modo local J2 decide su propia carta y no hay resolución automática',()=>{
 const t=fixture({mode:'local'});t.set('Golpes en la puerta','ai');trigger(t,'move','game.bots[0]');
 assert.equal(t.val('game.crossPending'),true);assert.equal(t.val('aiCrossChoice'),null);
 t.run('crossChoose(1);');assert.deepEqual(t.val('({food:game.food,morale:game.morale,done:game.crossResolved})'),{food:4,morale:10,done:true});
});
test('el dueño de la carta determina en qué mano se depositan las recompensas',()=>{
 const t=fixture({mode:'local'});t.set('El último botiquín','ai');t.run('game.bots[0].loc=2;');trigger(t,'search','game.bots[0]');t.run('crossChoose(0);');
 assert.deepEqual(t.val('({human:game.items.length,bot:game.botItems.length,last:game.botItems.at(-1).cardId})'),{human:7,bot:8,last:'medkit'});
});
test('no existe por ahora registro persistente de elección en el estado inicial',()=>{
 const t=fixture();assert.equal(t.val('Object.hasOwn(game,"storyHistory")'),false);
 assert.equal(t.val('Object.hasOwn(game,"storyFlags")'),false);
});

test('C2 #2 | tres encrucijadas consumen un único recurso de su tipo sin eliminar los demás',()=>{
 for(const [title,kindName] of [['Fiebre en el refugio','medicina'],['El generador averiado','combustible'],['La guardia nocturna','herramienta']]){
  const t=fixture();t.set(title);
  t.run('game.items=[catalog.create("bandage"),catalog.create("medkit"),catalog.create("gascan"),catalog.create("crowbar"),catalog.create("ration")];');
  const before=t.val('({count:game.items.filter(it=>kind(it)==='+JSON.stringify(kindName)+').length,morale:game.morale,b:game.zones[0].b})');
  assert.equal(t.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"human")'),true);
  t.run('game.crossPending=true;resolveCross(0);');
  assert.equal(t.val('game.items.filter(it=>kind(it)==='+JSON.stringify(kindName)+').length'),before.count-1);
  assert.equal(t.val('game.items.length'),4);
  assert.equal(t.val('game.crossResolved'),true);
  assert.equal(t.val('game.morale')>=before.morale,true);
  if(kindName==='herramienta')assert.equal(t.val('game.zones[0].b'),before.b+2);
 }
});
test('C2 #2 | sin recurso la opción costosa permanece deshabilitada y no altera el juego',()=>{
 for(const title of ['Fiebre en el refugio','El generador averiado','La guardia nocturna']){
  const t=fixture();t.set(title);
  t.run('game.items=[catalog.create("ration")];game.crossPending=true;');
  assert.equal(t.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"human")'),false);
  assert.equal(t.val('resolveCross(0)'),false);
  assert.deepEqual(t.val('({items:game.items.length,pending:game.crossPending})'),{items:1,pending:true});
 }
});
test('C2 #2 | J2 local usa su propia medicina, no la de J1',()=>{
 const t=fixture({mode:'local'});t.set('Fiebre en el refugio','ai');
 t.run('game.items=[catalog.create("bandage")];game.botItems=[catalog.create("medkit")];game.crossPending=true;');
 const morale=t.val('game.morale');
 t.run('crossChoose(0);');
 assert.deepEqual(t.val('({j1:game.items.length,j2:game.botItems.length,morale:game.morale,done:game.crossResolved})'),{j1:1,j2:0,morale:morale+1,done:true});
});
test('C2 #2 | cartas antiguas representadas por cadenas también se reconocen y consumen',()=>{
 const t=fixture();t.set('Fiebre en el refugio');
 t.run('game.items=["medicina"];game.crossPending=true;');
 assert.equal(t.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"human")'),true);
 t.run('resolveCross(0);');
 assert.equal(t.val('game.items.length'),0);
 assert.equal(t.val('game.crossResolved'),true);
});
