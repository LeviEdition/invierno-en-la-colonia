import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {createAgent} from '../src/agents/reference-agent.mjs';
import {projectVisibleState} from '../app/mapa/estado/projection.mjs';
import {COMIDA_INICIAL,TEST_RULE_DEFAULTS} from '../src/domain/test-rules.mjs';

// Las reglas de prueba y el modo «un grupo» en el mapa (docs/117 §Informe). El
// mapa pregunta al motor y presenta: acá se comprueba lo que el motor le ofrece.

function make(random=.8){
 let rng=0;
 const e=createEngine({queueMicrotask(){},setTimeout:f=>{f();return 0;},
  Math:Object.assign(Object.create(Math),{random:()=>{rng++;return random;}})});
 e.connectAutomation(c=>createAgent(c));e.initialize();
 return {e,c:e.testBindings,rng:()=>rng};
}
const project=t=>projectVisibleState(t.c,{gate:{},renderedPlayable:true,epoch:1});

// ─── Preparación ────────────────────────────────────────────────────────────

test('mapa | la preparación ofrece «un grupo» y las cuatro reglas apagadas',()=>{
 const t=make(),p=t.e.playSnapshot().preparation;
 assert.deepEqual(p.modes,['local','ai','solo']);
 assert.deepEqual(p.testRules,{...TEST_RULE_DEFAULTS});
 assert.deepEqual(p.testRuleOptions.comidaInicial,[...COMIDA_INICIAL]);
 assert.deepEqual(p.testRuleOptions.flags,['laNoche','regreso','crisisParcial']);
});

test('mapa | elegir una regla desde la preparación llega al motor',()=>{
 const t=make();
 assert.equal(t.e.playExecute({kind:'test-rules',rule:'laNoche',value:'true'}).ok,true);
 assert.equal(t.e.playExecute({kind:'test-rules',rule:'comidaInicial',value:'8'}).ok,true);
 assert.deepEqual(t.e.playSnapshot().preparation.testRules,{comidaInicial:8,laNoche:true,regreso:false,crisisParcial:false});
 t.e.playExecute({kind:'start',mode:'ai',confirmed:false});
 assert.equal(t.c.game.food,8,'la comida elegida llega al tablero');
 assert.equal(t.c.game.testRules.laNoche,true);
});

test('mapa | una regla o un valor inválidos se rechazan sin tocar nada',()=>{
 const t=make();
 for(const bad of [{rule:'inventada',value:'true'},{rule:'comidaInicial',value:'7'},{rule:'laNoche',value:'quizas'},{rule:'comidaInicial',value:'8.5'}]){
  assert.equal(t.e.playExecute({kind:'test-rules',...bad}).ok,false,JSON.stringify(bad));
 }
 assert.deepEqual(t.e.playSnapshot().preparation.testRules,{...TEST_RULE_DEFAULTS});
});

test('mapa | empezar en «un grupo» no deja grupo de la IA ni rótulos suyos',()=>{
 const t=make();
 assert.equal(t.e.playExecute({kind:'start',mode:'solo',confirmed:false}).ok,true);
 const p=project(t);
 assert.equal(p.mode,'solo');
 assert.deepEqual(p.players.map(x=>x.id),['human'],'no se proyecta el bando vacío');
 assert.equal(p.players[0].label,'Tu grupo');
 assert.deepEqual([...new Set(p.characters.map(c=>c.playerId))],['human']);
 assert.deepEqual(t.e.playSnapshot().groups.map(g=>g.side),['human']);
});

test('mapa | los modos actuales siguen igual',()=>{
 for(const mode of ['ai','local']){
  const t=make();
  t.e.playExecute({kind:'start',mode,confirmed:false});
  const p=project(t);
  assert.deepEqual(p.players.map(x=>x.id),['human','ai'],mode);
  assert.equal(p.characters.length,6,mode);
  assert.equal(p.characters.every(c=>c.night===null),true,'sin La noche no hay dato nocturno');
 }
});

// ─── La noche en la ficha ───────────────────────────────────────────────────

test('mapa | la ficha recibe «dormirá afuera» y «hace guardia» del motor',()=>{
 const t=make();
 t.e.playExecute({kind:'test-rules',rule:'laNoche',value:'true'});
 t.e.playExecute({kind:'start',mode:'ai',confirmed:false});
 // Dos humanos a la misma localidad exterior: uno solo recibe la tirada.
 const g=t.c.game,[a,b,home]=g.humans;
 a.loc=2;b.loc=2;home.loc=0;a.influence=40;b.influence=70;
 const chars=project(t).characters;
 const of=id=>chars.find(c=>c.id===id).night;
 assert.deepEqual(of(a.id),{outside:true,watch:true},'el de menor influencia hace guardia');
 assert.deepEqual(of(b.id),{outside:true,watch:false},'el acompañante solo duerme afuera');
 assert.deepEqual(of(home.id),{outside:false,watch:false},'en la colonia no hay rótulo');
 assert.equal(chars.filter(c=>c.playerId==='ai').every(c=>!c.night.outside),true,'el grupo de la IA no duerme afuera');
});

// ─── Regresar a la colonia ──────────────────────────────────────────────────

test('mapa | con la regla apagada, regresar no se ofrece',()=>{
 const t=make();
 t.e.playExecute({kind:'start',mode:'ai',confirmed:false});
 t.c.game.humans[0].loc=2;
 const q=t.e.playSnapshot().options[t.c.game.humans[0].id]['return-home'];
 assert.equal(q.allowed,false);
 assert.equal(q.reason,'rule','el mapa oculta el botón con este motivo');
});

test('mapa | regresar consume un dado de cualquier valor y cuenta como movimiento',()=>{
 const t=make();
 t.e.playExecute({kind:'test-rules',rule:'regreso',value:'true'});
 t.e.playExecute({kind:'start',mode:'ai',confirmed:false});
 const g=t.c.game,p=g.humans[0];
 p.loc=2;p.moved=false;g.crossPending=false;g.crossResolved=true;
 g.dice=[1,5];
 const before=t.e.playSnapshot().options[p.id]['return-home'];
 assert.equal(before.allowed,true);
 assert.match(before.summary,/cualquier valor/);
 const die=before.dice.find(d=>d.value===1);
 assert.equal(die.allowed,true,'un 1 alcanza');
 const rngBefore=t.rng();
 const r=t.e.playExecute({kind:'return-home',actorId:p.id,dieId:die.id,dieIndex:die.index,dieValue:die.value});
 assert.equal(r.ok,true,r.reason);
 assert.equal(p.loc,0,'volvió a la colonia');
 assert.equal(p.moved,true,'cuenta como movimiento');
 assert.deepEqual(g.dice,[5],'gastó el dado de valor 1');
 assert.equal(t.rng(),rngBefore,'no tira exposición ni consume azar');
 // Como toda acción con dado, deja un acuse que el mapa muestra y confirma.
 const receipt=t.e.playSnapshot().receipt;
 assert.equal(receipt.type,'return-home');
 assert.deepEqual({from:receipt.result.from,returned:receipt.result.returned,die:receipt.result.die},{from:2,returned:true,die:1});
 assert.equal(t.e.playExecute({kind:'ack',receiptId:receipt.id}).ok,true);
 // Ya en la colonia, la acción deja de ofrecerse.
 assert.equal(t.e.playSnapshot().options[p.id]['return-home'].reason,'home');
});

test('mapa | regresar también funciona en «un grupo»',()=>{
 const t=make();
 t.e.playExecute({kind:'test-rules',rule:'regreso',value:'true'});
 t.e.playExecute({kind:'start',mode:'solo',confirmed:false});
 const g=t.c.game,p=g.humans[0];
 p.loc=2;g.crossPending=false;g.crossResolved=true;g.dice=[3];
 const q=t.e.playSnapshot().options[p.id]['return-home'],die=q.dice[0];
 assert.equal(q.allowed,true);
 assert.equal(t.e.playExecute({kind:'return-home',actorId:p.id,dieId:die.id,dieIndex:die.index,dieValue:die.value}).ok,true);
 assert.equal(p.loc,0);
 assert.equal(p.moved,true);
});
