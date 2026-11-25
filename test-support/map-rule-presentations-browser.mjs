import assert from 'node:assert/strict';
// Se incorpora a la batería existente del D12; no recorre la preparación ?dev.
export async function checkRulePresentations(p,t){
 const timeout=15000;
 async function read(target,fn,arg){let timer;try{return await Promise.race([target.evaluate(fn,arg),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Tiempo agotado en presentación de reglas (15 s)')),timeout);})]);}finally{clearTimeout(timer);}}
 await read(t.host(p),()=>{window.h344RandomValue=.8;h344Test.dispatch('setTestRules',{laNoche:true,regreso:true});h344Test.dispatch('startGame','solo');});
 await p.waitForFunction(()=>h344Viewer.inspect().projection?.mode==='solo',undefined,{timeout});
 const g=await read(t.host(p),()=>h344Test.snapshot());
 g.crossPending=false;g.crossResolved=true;g.crossRemaining=Array(32).fill(0);g.food=40;g.waste=0;g.dice=[1];
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);g.crisis.given=g.crisis.need;
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});
 g.humans.forEach((h,i)=>{h.loc=i===2?5:2;h.wounds=0;h.frost=0;h.dead=false;h.moved=false;h.equipment=[];h.skill='';h.influence=[40,70,60][i];});
 await read(t.host(p),g=>h344Test.fixture(g),g);
 await p.waitForFunction(()=>h344Viewer.inspect().projection.characters.find(c=>c.id==='h0')?.locationId==='place-2',undefined,{timeout});
 if(!await p.locator('#panel-content').isVisible())await p.locator('#bar-portrait').click({timeout});
 await p.locator('#panel-content').waitFor({state:'visible',timeout});
 await p.selectOption('#survivor-select','h0',{timeout});
 const rng=await read(t.host(p),()=>window.h344RandomCalls);
 // Sesión 7 (informe 126): «Regresar a la colonia» vive en el abanico de «Más».
 if(!await p.locator('#bar-fan').isVisible())await p.locator('#bar-more').click({timeout});
 await p.locator('#return-home-action').click({timeout});
 await p.locator('#play-confirm').waitFor({state:'visible',timeout});
 await read(p.locator('#play-confirm'),b=>{b.click();b.click();});
 await p.waitForFunction(()=>h344Viewer.inspect().view?.presentation?.stage==='travel',undefined,{timeout});
 await read(p,()=>{const b=document.getElementById('return-home-action');b.click();b.click();});
 const travel=await read(p,()=>{const s=h344Viewer.inspect();return {actor:s.eventPresentations.active.actorId,position:s.view.layout.characters.find(c=>c.id==='h0').position};});
 await p.waitForFunction(start=>{const s=h344Viewer.inspect(),pos=s.view?.layout.characters.find(c=>c.id==='h0')?.position;return s.view?.presentation?.stage==='travel'&&pos&&(pos.x!==start.x||pos.y!==start.y);},travel.position,{timeout});
 const middle=await read(p,()=>h344Viewer.inspect().view.layout.characters.find(c=>c.id==='h0').position);
 assert.notDeepEqual(middle,travel.position,'la ficha viaja entre las localidades');
 await p.waitForFunction(()=>{const s=h344Viewer.inspect();return !s.eventPresentations.active&&s.movement.phase==='idle'&&!s.projection.play.receipt;},undefined,{timeout});
 const returned=await read(t.host(p),()=>({g:h344Test.snapshot(),rng:window.h344RandomCalls}));
 assert.equal(returned.g.humans[0].loc,0);assert.equal(returned.g.dice.length,0);assert.equal(returned.rng,rng,'Regresar y su animación no tiran');
 assert.equal(await read(p,()=>h344Viewer.inspect().projection.play.events.filter(e=>e.type==='move'&&e.reason==='return').length),1);

 // Dos localidades: una mordedura pausa la noche y la segunda tira tras decidir.
 returned.g.humans[0].loc=2;returned.g.humans[0].moved=false;
 await read(t.host(p),g=>{h344Test.fixture(g);window.h344RandomValue=.01;},returned.g);
 await read(p,()=>{
  window.ruleReveals=[];const seen=new Set();
  new MutationObserver(()=>{
   const s=h344Viewer.inspect(),f=s.eventPresentations.active;
   if(document.getElementById('move-sequence').dataset.stage!=='reveal'||f?.kind!=='exposure'||seen.has(f.id))return;
   seen.add(f.id);ruleReveals.push({actor:f.actorId,die:s.view.presentation.exposure.die,
    ficha:document.getElementById('character-state').textContent,biteVisible:!!document.getElementById('play-bite-sacrifice')?.getClientRects().length});
  }).observe(document.getElementById('move-sequence'),{attributes:true,attributeFilter:['data-stage']});
 });
 await p.locator('#finish-turn').click({timeout});await p.locator('#cycle-confirm').waitFor({state:'visible',timeout});
 await read(p.locator('#cycle-confirm'),b=>{b.click();b.click();});
 await p.waitForFunction(()=>ruleReveals.length===1,undefined,{timeout});
 await read(p,()=>{const b=document.getElementById('finish-turn');b.click();b.click();});
 const bite=await read(p,()=>ruleReveals[0]);assert.equal(bite.actor,'h0');assert.equal(bite.die.outcome,'bite');assert.equal(bite.biteVisible,false,'la decisión espera al D12');
 const firstRng=await read(t.host(p),()=>window.h344RandomCalls);
 await p.locator('#play-bite-sacrifice').waitFor({state:'visible',timeout});
 assert.equal(await read(t.host(p),()=>window.h344RandomCalls),firstRng,'la animación no vuelve a tirar');
 await read(t.host(p),()=>{window.h344RandomValue=.3;});
 await read(p.locator('#play-bite-sacrifice'),b=>{b.click();b.click();});
 await p.waitForFunction(()=>ruleReveals.length===2,undefined,{timeout});
 const wound=await read(p,()=>ruleReveals[1]);assert.equal(wound.actor,'h2');assert.equal(wound.die.outcome,'wound');
 assert.match(wound.ficha,/Heridas: 0/,'la herida espera al final de la revelación');
 assert.equal(await read(t.host(p),()=>window.h344RandomCalls),firstRng+1,'una única tirada en la localidad siguiente');
 await p.waitForFunction(()=>!h344Viewer.inspect().eventPresentations.active,undefined,{timeout});
 await p.locator('#play-ack').click({timeout});await p.locator('#cycle-death').click({timeout});
 await p.waitForFunction(()=>h344Viewer.inspect().projection.cycle.review,undefined,{timeout});
 const after=await read(t.host(p),()=>h344Test.snapshot()),events=await read(p,()=>h344Viewer.inspect().projection.play.events.filter(e=>e.type==='exposure'));
 assert.deepEqual(events.map(e=>e.die.face),[1,4]);assert.deepEqual(after.humans.map(h=>h.dead),[true,true,false]);assert.equal(after.humans[2].wounds,1);
 return {travel,intermediatePosition:middle,reveals:[bite,wound],exposureEvents:events.length};
}
