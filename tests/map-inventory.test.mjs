import test from 'node:test';import assert from 'node:assert/strict';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {createInventoryBroker} from '../prototypes/inventory-map/broker.mjs';
import {createInventoryController} from '../prototypes/inventory-map/controller.mjs';
import {projectVisibleState} from '../prototypes/state-map/projection.mjs';
function session(ids=['bandage','bandage','rifle','crowbar','gascan']){let calls=0;const math=Object.create(Math);math.random=()=>{calls++;return .8;};const e=createEngine({Math:math,queueMicrotask(){}});e.start('local');const c=e.testBindings;c.game.crossResolved=true;c.game.items=ids.map(id=>c.catalog.create(id));c.game.humans[0].wounds=1;c.game.humans[0].frost=1;c.game.waste=3;return {e,c,calls:()=>calls};}
const req=(t,index=0,extra={})=>({mode:'use',cardId:t.e.inventorySnapshot().hand[index].uid,actorId:'h0',targetId:null,destination:null,...extra});
function broker(t){const b=createInventoryBroker(t.e,{session:'test',readPublic:()=>projectVisibleState(t.c,{renderedPlayable:true,epoch:1})});b.project(projectVisibleState(t.c,{renderedPlayable:true,epoch:1}));return b;}
const request=(b,intent,id='request_1')=>({type:'inventory-use',session:'test',revision:b.snapshot().inventory.revision,requestId:id,...intent});
test('Inventario: equivalencia de todos los usos manuales y equipamiento con V9.9, estado y azar',()=>{
 for(const id of ['ration','canned','bandage','medkit','antifrost','manual','notes','sample','rescue','rifle','crowbar','gascan']){
  const a=session([id]),b=session([id]);a.c.game.humans[0].skill=b.c.game.humans[0].skill='paramedic';const r=req(a,0,{actorId:['ration','canned','rescue'].includes(id)?null:'h0',destination:id==='gascan'?2:null});
  const before=a.e.snapshot(),rng=a.calls();a.e.inventorySnapshot();assert.deepEqual(a.e.snapshot(),before);assert.equal(a.calls(),rng);
  assert.equal(a.e.inventoryExecute(r).ok,true,id);if(id==='gascan')b.c.target=2;
  if(['rifle','crowbar'].includes(id)){b.c.profileId='h0';b.e.dispatch('equipItem',0);}else b.e.dispatch('playItem',0);
  assert.deepEqual(a.e.snapshot(),b.e.snapshot(),id);assert.equal(a.calls(),b.calls(),id+' RNG');
 }
});
test('Inventario: objetivos inválidos, otro grupo, muerto, curación innecesaria y cancelación no consumen',()=>{
 const t=session();for(const patch of [{actorId:'a0'},{actorId:'ausente'},{actorId:null},{cardId:'missing'}]){const before=t.e.snapshot(),rng=t.calls();assert.equal(t.e.inventoryExecute({...req(t),...patch}).ok,false);assert.deepEqual(t.e.snapshot(),before);assert.equal(t.calls(),rng);}
 t.c.game.humans[0].wounds=t.c.game.humans[0].frost=0;assert.equal(t.e.inventoryExecute(req(t)).reason,'treatment');t.c.game.humans[0].dead=true;assert.equal(t.e.inventoryExecute(req(t)).reason,'dead');
 const u=session(),b=broker(u),sent=[],controller=createInventoryController({send:r=>sent.push(r)});controller.update(b.snapshot());controller.open('h0');controller.chooseCard(req(u).cardId);const before=u.e.snapshot();controller.cancel();controller.close();assert.deepEqual(u.e.snapshot(),before);assert.equal(sent.length,0);
});
test('Inventario: copias iguales identificadas; solo se descarta la copia confirmada, sin dados',()=>{
 const t=session(),s=t.e.inventorySnapshot();assert.notEqual(s.hand[0].uid,s.hand[1].uid);const dice=t.e.snapshot().dice,waste=t.e.snapshot().waste;
 assert.equal(t.e.inventoryExecute(req(t,1)).ok,true);assert.deepEqual(t.e.snapshot().dice,dice);assert.equal(t.e.snapshot().waste,waste+1);assert.equal(t.e.inventorySnapshot().hand[0].uid,s.hand[0].uid);assert.equal(t.e.inventorySnapshot().hand.some(c=>c.uid===s.hand[1].uid),false);
});
test('Inventario: equipo efectivo, límites originales por tipo y transferencia equivalentes',()=>{
 const a=session(['rifle','crowbar','pistol']),b=session(['rifle','crowbar','pistol']);for(let i=0;i<2;i++){assert.equal(a.e.inventoryExecute(req(a)).ok,true);b.c.profileId='h0';b.e.dispatch('equipItem',0);}
 assert.deepEqual(a.e.snapshot(),b.e.snapshot());assert.equal(a.e.actionOptions('h0','attack').requirement,3);assert.equal(a.e.searchOptions('h0').requirement,2);
 assert.equal(a.e.inventoryExecute(req(a)).reason,'equipment-kind');const it=a.e.inventorySnapshot().equipment[0],intent={mode:'use',cardId:it.uid,actorId:'h0',targetId:'h1',destination:null};assert.equal(a.e.inventoryExecute(intent).ok,true);
 b.c.profileId='h0';b.e.dispatch('startTransfer',0);b.e.dispatch('chooseTransfer','h1');assert.deepEqual(a.e.snapshot(),b.e.snapshot());assert.equal(a.e.inventoryExecute({...intent,targetId:'a0'}).ok,false);
});
test('Inventario: manual lleno sin residuos y combustible no disponible respetan reglas',()=>{
 const t=session(['manual','gascan']);t.c.game.waste=0;t.c.game.zones[0].z=12;const before=t.e.snapshot();assert.equal(t.e.inventoryExecute(req(t)).reason,'manual');assert.deepEqual(t.e.snapshot(),before);
 t.c.game.humans[0].moved=true;assert.equal(t.e.inventoryExecute(req(t,1,{destination:2})).reason,'already-moved');assert.deepEqual(t.e.snapshot().items,before.items);
});
test('Inventario protocolo: duplicación, obsolescencia, carta sustituida y consulta de respuesta perdida',()=>{
 const t=session(),b=broker(t),r=request(b,req(t));const out=b.handle(r);assert.equal(out.ok,true);const after=t.e.snapshot(),rng=t.calls();assert.equal(b.handle(r).ok,true);assert.deepEqual(t.e.snapshot(),after);assert.equal(t.calls(),rng);assert.equal(b.handle({...r,actorId:'h1'}).reason,'request-reused');
 const receipt=b.snapshot().inventory.receipt;assert.equal(b.handle({type:'inventory-dismiss',session:'test',revision:b.snapshot().inventory.revision,requestId:'dismiss_1',receiptId:receipt.id}).ok,true);
 const stale=request(b,req(t),'stale_request');t.c.game.humans[0].wounds++;assert.equal(b.handle(stale).reason,'stale');
 const fresh=request(b,req(t),'new_request'),sends=[],controller=createInventoryController({send:r=>sends.push(r),requestId:()=>fresh.requestId});controller.update(b.snapshot());controller.open('h0');controller.chooseCard(fresh.cardId);assert.equal(controller.confirm(),true);assert.equal(controller.confirm(),false);assert.equal(b.handle(sends[0]).ok,true);const afterLost=t.e.snapshot();controller.disconnect();controller.update(b.snapshot());assert.equal(controller.inspect().phase,'result');assert.equal(sends.length,1);assert.deepEqual(t.e.snapshot(),afterLost);
});
test('Inventario privacidad: pase, turno y partida nuevos borran mano, intenciones y resultados privados',async()=>{
 const t=session(['rifle']),b=broker(t),old=request(b,req(t));const controller=createInventoryController({send(){}});controller.update(b.snapshot());controller.open('h0');controller.chooseCard(old.cardId);await t.e.dispatch('finishTurn');
 b.project(projectVisibleState(t.c,{gate:{pass:true}}));controller.update(b.snapshot());assert.equal(t.e.inventorySnapshot(),null);assert.equal(b.snapshot().inventory.private,null);assert.equal(controller.inspect().phase,'closed');assert.equal(b.handle(old).reason,'stale');
 t.e.dispatch('confirmPass');b.project(projectVisibleState(t.c,{renderedPlayable:true}));assert.equal(b.snapshot().inventory.private.ownerId,'ai');assert.equal(JSON.stringify(b.snapshot().inventory).includes('Rifle de precisión'),false);
 t.e.start('local');b.project(projectVisibleState(t.c,{renderedPlayable:true}));controller.update(b.snapshot());assert.equal(controller.inspect().intent,null);
});

test('Inventario: aportar desde mano/equipo usa CrisisManager original sin residuos ni dados',()=>{
 for(const equipment of [false,true]){const a=session(['rifle']),b=session(['rifle']);for(const t of [a,b]){t.c.game.crisis.type='arma';if(equipment){t.c.profileId='h0';t.e.dispatch('equipItem',0);}}
 const card=equipment?a.e.inventorySnapshot().equipment[0]:a.e.inventorySnapshot().hand[0],r={mode:'contribute',cardId:card.uid,actorId:equipment?'h0':null,targetId:null,destination:null};assert.equal(a.e.inventoryExecute(r).ok,true);if(equipment)b.e.dispatch('contributeEquipment','h0',0);else b.e.dispatch('contribute',0);assert.deepEqual(a.e.snapshot(),b.e.snapshot());assert.equal(a.calls(),b.calls());}
});
test('Inventario protocolo: reemplazar una carta por otra igual invalida su identidad; campos ajenos rechazados',()=>{
 const t=session(),b=broker(t),old=req(t);t.c.game.items[0]=t.c.catalog.create('bandage');const before=t.e.snapshot(),rng=t.calls();assert.equal(b.handle(request(b,old,'replaced')).reason,'card');assert.deepEqual(t.e.snapshot(),before);assert.equal(t.calls(),rng);const r=request(b,req(t),'forged');assert.equal(b.handle({...r,dispatch:'finishTurn'}).reason,'invalid');assert.deepEqual(t.e.snapshot(),before);
});

test('Inventario: objeto que gana la partida conserva resultado y exige continuar la decisión en V9.9',()=>{
 const a=session(['notes']),b=session(['notes']);a.c.game.samples=b.c.game.samples=a.c.game.goal-1;const r=req(a);assert.equal(a.e.inventoryExecute(r).ok,true);b.e.dispatch('playItem',0);assert.deepEqual(a.e.snapshot(),b.e.snapshot());assert.equal(a.e.snapshot().ended,true);assert.equal(a.e.inventorySnapshot().receipt.generalDecision,true);assert.equal(a.e.inventoryExecute(r).ok,false);
});

test('Inventario: publicar el recibo no vuelve a procesar la cola de rescates del motor',()=>{
 const a=session(['ration']),b=session(['ration']);for(const t of [a,b])t.c.game.rescueQueue=[{side:'human'},{side:'ai'}];assert.equal(a.e.inventoryExecute(req(a,0,{actorId:null})).ok,true);b.e.dispatch('playItem',0);assert.deepEqual(a.e.snapshot(),b.e.snapshot());assert.equal(a.e.snapshot().rescueQueue.length,1);assert.equal(a.calls(),b.calls());
});
