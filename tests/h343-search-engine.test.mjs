import test from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from '../src/application/reference-engine.mjs';
import {createReferenceState} from '../src/domain/reference-state.mjs';

function session({name='Mara',location=2,dead=false,equipment=[],initial=.8,cards,noise=0,helpless=0}={}){
 let value=initial,calls=0,context;
 const math=Object.create(Math);math.random=()=>{calls++;return value;};
 const engine=createEngine({Math:math,queueMicrotask(){},stateFactory:args=>{
  const g=createReferenceState(args);g.humans[0].name=name;g.humans[0].loc=location;g.humans[0].dead=dead;g.humans[0].equipment=equipment.map(id=>args.catalog.create(id));
  if(dead){g.leaders.human='h1';g.leaderChosen=true;}g.zones[location].noise=noise;g.helpless=helpless;
  if(cards){const assigned=new Set();g.decks=new Proxy({},{set(target,key,value){target[key]=Number(key)===location&&!assigned.has(key)?cards.map(id=>args.catalog.create(id)):value;assigned.add(key);return true;}});}return g;
 }});
 engine.connectPresentation(c=>{context=c;return {};});engine.start('local');
 return {engine,calls:()=>calls,setRandom:v=>value=v,context:()=>context};
}
const request=(e,dieIndex=0,id='h0')=>({...e.searchOptions(id),actorId:id,dieIndex,dieValue:e.searchOptions(id).dice[dieIndex]?.value});
test('H343: consulta pura y búsqueda por ID equivalentes al flujo original',()=>{
 const a=session(),b=session(),before=a.engine.snapshot(),rng=a.calls(),q=request(a.engine);assert.equal(q.allowed,true);
 assert.deepEqual(a.engine.snapshot(),before);assert.equal(a.calls(),rng);
 a.engine.dispatch('select',2);const result=a.engine.searchById(q);assert.equal(result.ok,true);
 b.engine.dispatch('pickActionDie',0);b.engine.dispatch('search');
 assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());assert.equal(a.calls(),b.calls());
 const own=a.engine.searchSnapshot();assert.equal(own.operation.status,'choice');assert.equal(own.operation.cards.length,1);assert.ok(own.operation.cards[0].name);assert.ok(own.operation.cards[0].description);
 assert.equal(a.engine.chooseSearchCard({...own.operation,index:0}).ok,true);b.engine.dispatch('chooseLoot',0);
 assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());assert.equal(a.calls(),b.calls());
});
test('H343: consume uno solo de dados repetidos y rechaza su referencia anterior',()=>{
 const t=session(),e=t.engine,before=e.snapshot(),q=request(e,1);assert.ok(before.dice.every(x=>x===q.dieValue));
 assert.equal(e.searchById(q).ok,true);assert.equal(t.context().picked,1);assert.equal(e.snapshot().dice.length,before.dice.length-1);
 const pending=e.searchSnapshot().operation;e.chooseSearchCard({...pending,index:0});e.dismissSearchResult(pending.operationId);
 const after=e.snapshot(),calls=t.calls();assert.equal(e.searchById(q).reason,'stale');assert.deepEqual(e.snapshot(),after);assert.equal(t.calls(),calls);
});
test('H343: dado ausente/insuficiente, rival, muerto y origen obsoleto no mutan',()=>{
 const t=session({initial:0}),e=t.engine;
 for(const q of [request(e),{...request(e),dieIndex:99},{...request(e),dieValue:6},request(e,0,'a0'),{...request(e),origin:4}]){
  const before=e.snapshot(),calls=t.calls();assert.equal(e.searchById(q).ok,false);assert.deepEqual(e.snapshot(),before);assert.equal(t.calls(),calls);
 }
 const d=session({dead:true});assert.equal(d.engine.searchOptions('h0').reason,'dead');assert.equal(session({location:0}).engine.searchOptions('h0').reason,'colony');
});
test('H343: explorador/linterna y modificadores conservan elecciones y ruido originales',()=>{
 for(const opts of [{name:'Iris'},{equipment:['flashlight']},{name:'Iris',equipment:['flashlight']},{name:'Clara',location:6,equipment:['crowbar']}]){
  const a=session(opts),b=session(opts);assert.equal(a.engine.searchOptions('h0').requirement,b.context().effectiveSearch(b.context().game.humans[0]));
  assert.equal(a.engine.searchById(request(a.engine)).ok,true);b.engine.dispatch('search');
  let p=a.engine.searchSnapshot().operation;assert.equal(p.cards.length,b.context().pendingLoot.items.length);
  const expected=(opts.name==='Iris'?2:1)+(opts.equipment?.includes('flashlight')?1:0);assert.equal(p.cards.length,expected);
  const noisy=a.engine.addSearchNoise(p);assert.equal(noisy.ok,true);b.engine.dispatch('addNoiseSearch');p=a.engine.searchSnapshot().operation;
  assert.equal(p.noise,1);assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());assert.equal(a.calls(),b.calls());
  a.engine.chooseSearchCard({...p,index:p.cards.length-1});b.engine.dispatch('chooseLoot',p.cards.length-1);
  assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());assert.equal(a.calls(),b.calls());
 }
});
test('H343: privacidad tras pase/partida nueva y recuperación sin nuevo robo',async()=>{
 const t=session(),e=t.engine;e.searchById(request(e));const own=e.searchSnapshot(),before=e.snapshot(),calls=t.calls();
 assert.equal(e.searchSnapshot().operation.operationId,own.operation.operationId);assert.deepEqual(e.snapshot(),before);assert.equal(t.calls(),calls);
 e.chooseSearchCard({...own.operation,index:0});const resolved=e.searchSnapshot();assert.equal(resolved.operation.status,'result');assert.equal(resolved.operation.result.handDelta,1);
 assert.ok(!JSON.stringify(resolved).includes('botItems'));assert.ok(!JSON.stringify(resolved).includes('decks'));
 e.dismissSearchResult(resolved.operation.operationId);await e.dispatch('finishTurn');assert.equal(e.searchSnapshot(),null);e.dispatch('confirmPass');
 const next=e.searchSnapshot();assert.equal(next.ownerId,'ai');assert.equal(next.operation,null);
 e.start('local');assert.equal(e.searchSnapshot().operation,null);
});

test('H343: límite de cuatro ruidos, mazo agotado y decisión obsoleta no roban de nuevo',()=>{
 const t=session({cards:Array(8).fill('ration')}),e=t.engine;e.searchById(request(e));let first=e.searchSnapshot().operation;
 assert.equal(e.addSearchNoise(first).ok,true);const changed=e.snapshot(),calls=t.calls();assert.equal(e.addSearchNoise(first).reason,'stale');assert.deepEqual(e.snapshot(),changed);assert.equal(t.calls(),calls);
 for(let i=1;i<4;i++)assert.equal(e.addSearchNoise(e.searchSnapshot().operation).ok,true);
 const limit=e.searchSnapshot().operation;assert.equal(limit.noise,4);assert.equal(limit.canNoise,false);const before=e.snapshot();assert.equal(e.addSearchNoise(limit).ok,false);assert.deepEqual(e.snapshot(),before);
 e.chooseSearchCard({...limit,index:2});assert.equal(e.searchSnapshot().operation.result.returned,4);assert.equal(e.snapshot().decks[2].length,7);
 const empty=session({cards:[]});assert.equal(empty.engine.searchOptions('h0').reason,'deck-empty');const snap=empty.engine.snapshot(),rng=empty.calls();assert.equal(empty.engine.searchById(request(empty.engine)).ok,false);assert.deepEqual(empty.engine.snapshot(),snap);assert.equal(empty.calls(),rng);
 const last=session({cards:['bandage']});last.engine.searchById(request(last.engine));assert.equal(last.engine.searchSnapshot().operation.canNoise,false);assert.equal(last.engine.searchSnapshot().operation.cards[0].id,'bandage');
});
test('H343: carta de rescate aplica reclutamiento/cola originales, nunca se inventa una carta de mano',()=>{
 for(const helpless of [0,7]){const a=session({cards:['rescue','ration'],helpless}),b=session({cards:['rescue','ration'],helpless});a.engine.searchById(request(a.engine));b.engine.dispatch('search');const op=a.engine.searchSnapshot().operation;a.engine.chooseSearchCard({...op,index:0});b.engine.dispatch('chooseLoot',0);assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());assert.equal(a.calls(),b.calls());const result=a.engine.searchSnapshot();assert.equal(result.operation.result.handDelta,0);assert.equal(result.operation.recruit.queued,helpless===7);assert.equal(result.operation.generalDecision,false);assert.equal(a.engine.dismissSearchResult(op.operationId).ok,true);b.engine.dispatch('dismissRecruit');assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());}
});
test('H343: agotar dados por acciones reales y modificar un DTO no permite cambiar el motor',()=>{
 const t=session({cards:Array(8).fill('ration')}),e=t.engine;const count=e.snapshot().dice.length;
 for(let i=0;i<count;i++){assert.equal(e.searchById(request(e)).ok,true);const data=e.searchSnapshot(),name=data.operation.cards[0].name;data.operation.cards[0].name='Falsa';data.hand.push({name:'No existe'});assert.equal(e.searchSnapshot().operation.cards[0].name,name);e.chooseSearchCard({...data.operation,index:0});e.dismissSearchResult(data.operation.operationId);}
 assert.equal(e.searchOptions('h0').reason,'no-dice');const before=e.snapshot();assert.equal(e.searchById(request(e)).ok,false);assert.deepEqual(e.snapshot(),before);
});
test('H343: linterna se usa una vez por ronda sin duplicar carta o ruido en la segunda búsqueda',()=>{const a=session({name:'Iris',equipment:['flashlight'],cards:Array(12).fill('ration')}),b=session({name:'Iris',equipment:['flashlight'],cards:Array(12).fill('ration')});for(const expected of [3,2]){a.engine.searchById(request(a.engine));b.engine.dispatch('search');const p=a.engine.searchSnapshot().operation;assert.equal(p.cards.length,expected);assert.equal(p.noise,0);a.engine.chooseSearchCard({...p,index:0});b.engine.dispatch('chooseLoot',0);a.engine.dismissSearchResult(p.operationId);assert.deepEqual(a.engine.snapshot(),b.engine.snapshot());assert.equal(a.calls(),b.calls());}});
