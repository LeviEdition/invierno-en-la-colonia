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
test('la IA evalúa consecuencias y mantiene la confirmación antes de aplicar el efecto',()=>{
 const t=fixture();t.set('Golpes en la puerta','ai');t.run('game.mode="ai";');trigger(t,'move','game.bots[0]');
 assert.equal(t.val('aiCrossChoice'),0);t.run('crossAiContinue();');
 assert.deepEqual(t.val('({helpless:game.helpless,done:game.crossResolved,pending:game.crossPending})'),{helpless:2,done:true,pending:false});
});
test('IA con reservas suficientes evita el riesgo de la radio',()=>{
 const t=fixture();t.set('La radio encendida','ai');trigger(t,'search','game.bots[0]');
 assert.equal(t.val('aiCrossChoice'),1);t.run('crossAiContinue();');assert.deepEqual(t.val('({food:game.food,z:game.zones[1].z,morale:game.morale})'),{food:6,z:1,morale:10});
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

// C10/#7: estados de aceptación acordados en el informe42, sin excepciones por carta.
const decisionCases=[
 {id:'R1',title:'La radio encendida',when:'search',setup:'game.food=1;game.morale=8;game.bots[0].loc=1;',pick:0},
 {id:'R2',title:'La radio encendida',when:'search',setup:'game.food=8;game.morale=2;game.bots[0].loc=1;',pick:1},
 {id:'R3',title:'La radio encendida',when:'search',setup:'game.food=0;game.morale=2;game.bots[0].loc=1;',pick:1},
 {id:'M1',title:'Un mensaje en la pared',when:'search',setup:'game.food=8;game.morale=8;game.samples=4;game.goal=5;game.bots[0].loc=1;',pick:0},
 {id:'M2',title:'Un mensaje en la pared',when:'search',setup:'game.food=8;game.morale=1;game.samples=4;game.goal=5;game.bots[0].loc=1;game.humans[1].loc=2;game.zones[2].z=zcap[2];',pick:1},
 {id:'S1',title:'La señal del mando',when:'round',setup:'game.food=3;game.morale=5;game.zones[0].z=zcap[0];',pick:1},
];
function decisionFixture(c){
 const t=fixture();t.set(c.title,'ai');
 t.run('game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});'+c.setup);
 return t;
}
for(const c of decisionCases)test('C10 #7 | aceptación '+c.id,()=>{
 const t=decisionFixture(c);trigger(t,c.when,c.when==='round'?'null':'game.bots[0]');
 assert.equal(t.val('game.crossPending'),true);
 assert.equal(t.val('aiCrossChoice'),c.pick);
 // El efecto sigue pendiente hasta confirmar en la interfaz.
 assert.equal(t.val('game.crossResolved'),false);
 t.run('crossAiContinue();');assert.equal(t.val('game.crossResolved'),true);
 if(c.id==='M1')assert.equal(t.val('game.ended&&game.samples===game.goal&&game.morale>0'),true);
 if(c.id==='M2')assert.equal(t.val('!game.ended&&!game.humans[1].dead&&game.morale===1'),true);
});
test('C10 #7 | descripción, título y etiquetas no cambian decisiones ni elegibilidad',()=>{
 const t=decisionFixture(decisionCases[1]);
 t.run('const c=crossroadsDeck[game.crossCard];c.title="Otra historia";c.story="Historia reescrita";c.choices[0][0]="A";c.choices[0][1]="Un beneficio sin riesgos";c.choices[1][0]="B";c.choices[1][1]="-1 moral, +2 zombis, +1 zombi, -2 comida";');
 trigger(t,'search','game.bots[0]');assert.equal(t.val('aiCrossChoice'),1);
 const u=fixture();u.set('Fiebre en el refugio','ai');
 u.run('game.botItems=[];crossroadsDeck[game.crossCard].title="Título nuevo";');
 assert.equal(u.val('crossOptionAllowed(crossroadsDeck[game.crossCard],0,"ai")'),false);
 trigger(u);assert.equal(u.val('aiCrossChoice'),1);
});
test('C10 #7 | evalúa solo opciones legales, también con recursos antiguos',()=>{
 for(const hand of ['[]','["medicina"]','[catalog.create("medkit")]']){
  const t=fixture();t.set('Fiebre en el refugio','ai');t.run('game.botItems='+hand+';');
  assert.deepEqual(t.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai").map(x=>x.index)'),hand==='[]'?[1]:[0,1]);
 }
});
test('C10 #7 | no muta estado, referencias, pendientes, interfaz ni azar al evaluar muertes y reclutas',()=>{
 for(const title of ['Un mensaje en la pared','Una mano entre los escombros','La farmacia saqueada']){
  const t=fixture();t.set(title,'ai');
  t.run('game.bots[0].loc=2;game.crossActorId=game.bots[0].id;game.zones[2].z=zcap[2];game.humans[1].loc=2;game.humans[1].equipment=[catalog.create("pistol")];');
  const before=t.val('({game,pendingLeader,pendingLeaderSide,selected,target,picked,opened,pendingHeal,pendingLoot,pendingBite,pendingAttract,pendingTransfer,aiCrossChoice,death:deathDirector,toastQueue,toastBusy,selectionBySide})');
  t.run('const originalGame=game,originalActor=game.bots[0],originalHand=game.botItems;Math.random=()=>{throw Error("azar vivo consumido")};message=()=>{throw Error("mensaje vivo")};paint=()=>{throw Error("pintado vivo")};show=()=>{throw Error("modal vivo")};deathDirector.record=()=>{throw Error("muerte viva")};evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai");');
  assert.equal(t.val('game===originalGame&&game.bots[0]===originalActor&&game.botItems===originalHand'),true);
  assert.deepEqual(t.val('({game,pendingLeader,pendingLeaderSide,selected,target,picked,opened,pendingHeal,pendingLoot,pendingBite,pendingAttract,pendingTransfer,aiCrossChoice,death:deathDirector,toastQueue,toastBusy,selectionBySide})'),before);
 }
});
test('C10 #7 | menos muertes gana aunque la otra opción dé más comida',()=>{
 const t=fixture();t.set('El depósito bajo llave','ai');
 t.run('game.bots[0].loc=1;game.zones[1].z=zcap[1];game.food=0;');
 trigger(t,'search','game.bots[0]');assert.equal(t.val('aiCrossChoice'),1);
});
test('C10 #7 | empates mantienen orden estable sin usar azar',()=>{
 const t=fixture();t.set('El aviso del centinela','ai');
 t.run('game.zones[0].z=0;game.zones[0].b=zcap[0];Math.random=()=>{throw Error("azar")};');
 for(let i=0;i<5;i++)assert.equal(t.val('chooseCrossOption(crossroadsDeck[game.crossCard],"ai")'),0);
});
test('C10 #7 | alimentación usa cocinero y población posterior al efecto',()=>{
 const t=fixture();t.set('La radio encendida','ai');
 t.run('game.bots[0].loc=1;game.food=0;game.morale=2;game.zones[1].z=0;game.humans[0].skill="cook";');
 trigger(t,'search','game.bots[0]');assert.equal(t.val('aiCrossChoice'),0);
 const u=fixture();u.set('Golpes en la puerta','ai');u.run('game.food=3;game.morale=8;');
 const options=u.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai")');
 assert.equal(options[0].outcomes[0].need,4);assert.equal(options[0].outcomes[0].fed,false);
});
test('C10 #7 | desbordamiento consume barricada antes de matar y cuenta indefensos',()=>{
 const t=fixture();t.set('La radio encendida','ai');
 t.run('game.zones[1].z=zcap[1]-1;game.zones[1].b=1;');
 const o=t.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai")[0].outcomes[0]');
 assert.equal(o.deaths,0);assert.equal(o.state.zones[1].b,0);assert.equal(o.state.zones[1].z,4);
 const u=fixture();u.set('El autobús varado','ai');
 u.run('all().forEach(p=>p.loc=1);game.helpless=1;game.zones[0].z=zcap[0];');
 assert.equal(u.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai")[0].outcomes[0].deaths'),2);
});

function mechanicalState(state){
 const copy=JSON.parse(JSON.stringify(state));delete copy.log;delete copy.last;
 // La evaluación omite solo el orden aleatorio de los mazos al devolver equipo.
 for(const deck of Object.values(copy.decks))deck.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return copy;
}
for(const mode of ['ai','local'])for(const side of ['human','ai']){
 test('C10 #7 | conformidad de las 52 opciones y aislamiento: '+mode+'/'+side,()=>{
  const titles=fixture().val('crossroadsDeck.map(c=>c.title)');
  for(const title of titles)for(const setup of [
   '',
   'game.zones.forEach((z,i)=>{z.z=zcap[i];z.b=0;});all().forEach((p,i)=>{p.loc=i%3;p.equipment=[catalog.create("pistol")];});',
   'game.food=0;game.items=[];game.botItems=[];game.helpless=6;game.waste=12;',
  ])for(const index of [0,1]){
   const t=fixture({mode});t.set(title,side);
   t.run('game.crossPending=true;game.crossActorId=ownerGroup(game.crossOwner)[0].id;'+setup);
   const before=t.val('game');
   const options=t.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],game.crossOwner)');
   assert.deepEqual(t.val('game'),before,'aislamiento '+title);
   const preview=options.find(o=>o.index===index);
   const resolved=t.run('resolveCross('+index+')');
   assert.equal(resolved,!!preview,'elegibilidad '+title+'/'+index);
   if(!resolved){assert.deepEqual(t.val('game'),before);continue;}
   const real=mechanicalState(t.val('game'));
   assert.ok(preview.outcomes.some(o=>JSON.stringify(mechanicalState(o.state))===JSON.stringify(real)),
    'resolución real ausente de los resultados previstos: '+mode+'/'+side+'/'+title+'/'+index);
  }
 });
}
test('C10 #7 | reclutamiento explora todos los personajes disponibles, sin garantizar cocinero',()=>{
 const t=fixture();t.set('El rescate de la plaza','ai');
 const available=t.val('roster.filter(r=>!all().some(p=>p.name===r.name)).map(r=>r.name).sort()');
 const option=t.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai")[0]');
 assert.deepEqual(option.outcomes.map(o=>o.state.bots.at(-1).name).sort(),available);
 assert.ok(option.outcomes.some(o=>o.state.bots.at(-1).skill==='cook'));
 assert.ok(option.outcomes.some(o=>o.state.bots.at(-1).skill!=='cook'));
 assert.equal(option.rank[2],Math.min(...option.outcomes.map(o=>Number(o.fed))));
});
test('C10 #7 | morir último superviviente cuenta la muerte aun cuando llegue un reemplazo',()=>{
 const t=fixture();t.set('La radio encendida','ai');
 t.run('game.bots.slice(1).forEach(p=>p.dead=true);game.bots[0].loc=1;game.crossActorId="a0";game.zones[1].z=zcap[1];game.morale=8;');
 const option=t.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai")[0]');
 assert.ok(option.outcomes.length>1);
 assert.ok(option.outcomes.every(o=>o.deaths===1&&o.state.bots.some(p=>!p.dead)&&!o.state.botItems.length));
 const before=t.val('game');t.run('resolveCross(0);');
 assert.equal(t.val('game.bots[0].dead'),true);assert.equal(t.val('game.botItems.length'),0);
 assert.notDeepEqual(t.val('game'),before);
});
test('C10 #7 | ninguna opción permitida devuelve null y los empates no dependen del título',()=>{
 const t=fixture();t.set('Golpes en la puerta','ai');
 t.run('game.food=0;game.helpless=12;');
 assert.deepEqual(t.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai")'),[]);
 assert.equal(t.val('chooseCrossOption(crossroadsDeck[game.crossCard],"ai")'),null);
 trigger(t,'move','game.bots[0]');assert.equal(t.val('game.crossPending'),false);
});

test('C10 #7 | objetivo y falta de reemplazo simultáneos se clasifican como derrota',()=>{
 const t=fixture();t.set('Un mensaje en la pared','ai');
 t.run('game.samples=game.goal-1;game.morale=8;game.humans.slice(1).forEach(p=>p.dead=true);game.humans[0].loc=2;game.zones[2].z=zcap[2];game.bots[0].loc=1;game.crossActorId="a0";const reserved=roster.filter(r=>!all().some(p=>p.name===r.name)).map((r,i)=>addCharacter({id:"hreserve"+i,name:r.name,loc:0,dead:true,equipment:[]}));game.humans.push(...reserved);');
 const o=t.val('evaluateCrossOptions(crossroadsDeck[game.crossCard],"ai")[0].outcomes[0]');
 assert.equal(o.result,'survivors');assert.equal(o.state.samples,o.state.goal);
 trigger(t,'search','game.bots[0]');assert.equal(t.val('aiCrossChoice'),1);
});
test('C10 #7 | estado explícito funciona aunque toda lectura del game global esté prohibida',()=>{
 const titles=fixture().val('crossroadsDeck.map(c=>c.title)');
 for(const title of titles)for(const side of ['human','ai'])for(const mode of ['ai','local']){
  const t=fixture({mode});t.set(title,side);
  t.run('game.crossActorId=ownerGroup(game.crossOwner)[0].id;game.zones.forEach((z,i)=>z.z=zcap[i]);game.humans[1].loc=2;const detached=JSON.parse(JSON.stringify(game));game=new Proxy({}, {get(){throw Error("lectura global")},set(){throw Error("escritura global")}});Math.random=()=>{throw Error("azar global")};message=()=>{throw Error("mensaje global")};deathDirector.record=()=>{throw Error("muerte global")};evaluateCrossOptions(crossroadsDeck.find(c=>c.title==='+JSON.stringify(title)+'),'+JSON.stringify(side)+',detached);');
 }
});
